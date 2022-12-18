 import html from "./html.js";
//  import { log } from "../../sdk/utils/index.js";


// const addCorsIfNeeded = (response) => {
//   const headers = new Headers(response.headers);

//   if (!headers.has("access-control-allow-origin")) {
//     headers.set("access-control-allow-origin", "*");
//   }

//   return headers;
// };

 

// a rudimentary domain specifier
const set_domain = (request) => {


  const ref =request.headers.get("referer")
  const tlc = ref ? ref.split('.').pop() : 'localhost'

  if (request.headers.get("domain")){
    window.domain = request.headers.get("domain")
  }else if (tlc.includes('.xyz') || tlc.includes('.co.za')){
    window.domain = 'live'
  }else{
    window.domain = 'dev'
  }

}



const valid_domain = (referer) => {
  console.log(referer)
  // need to handle valid domain better as a person could just read the code and figure out what refer to use
  return ['sauveur.xyz','http://localhost:8080/','mmereko.co.za'].includes(referer)
}

const is_authenticated = (auth) => {
  return [Deno.env.get('SERVER_KEY') ].includes(auth)
}


const handler = (value) => {
  
  // figure out arguments
  return new Function(value)
}

const api_middleware =  async (sitemap, pathname, request) => {
  let response;
  try {
    const auth = request.headers.get("authorization");
    
    const referer = request.headers.get("referer");
 

    // added server cors
 
    if(!is_authenticated(auth) && !valid_domain(request.headers.get("referer")) && !referer){
      throw new Error('Unotharized')
    }

    // for adding support for authorization

    const isFormReq =
      request.headers.get("content-type") ===
        "application/x-www-form-urlencoded" 
    //  console.log(await request.arrayBuffer())
    //need to add support for being able to handle the base path
    // const corsHeaders = addCorsIfNeeded(new Response());

    if (request.method === "GET") {
      const func = handler(`
      const request = ${JSON.stringify({
        method: request.method
      })}
      ${sitemap[pathname]}`)
 
      const json =  await func()
 
      response = Response.json(json,{
        status: json.status
      });
  
    } else if (request.method === "POST") {
      let data ={};
      // if (request.headers.get("domain") === "test"){
      // create a test path, to make sure test data does not effect live data
      //   data = await request.json()
      // }else{
      //   const _data = await request.arrayBuffer();
      //   data = await decryptMessage(_data);
      // } 
      if (isFormReq && referer) {
        let referer = new URL(request.headers.get("referer"));
        let _data = new URLSearchParams(await request.text());

        for (const key of _data.keys()) {
          const value = _data.get(key)
          if(value !== ""){
            data[key] = value
          }
        }
       

        for (var key of referer.searchParams.keys()) {
          _data.set(key, referer.searchParams.get(key));
        }
      } 
      else if(isFormReq && !referer){
        throw new Error('Form request require referer')
      }
      else {
        data = await request.json();
      }

      const func = handler(`
      const request = ${JSON.stringify({
        method: request.method
      })}
      const body = ${JSON.stringify(data)}
      ${sitemap[pathname]}`)

      const json = await func()
 

      //CTA work in progress
      if (isFormReq && json) {

        let page = '/status'
        let replace = [{
            name: "msg",
            value: json.msg,
          }, 
          { name: "uri", value: json.uri ? json.uri: '/'},
          {name: "cta", value: json.cta}];

        if(json.custom){
          page = json.custom
          replace = json.replace
        }
  
        const urlPath = page.split('/')
        urlPath.shift()

        return await html(app,page,urlPath,request,replace)
      }

      response = Response.json(json,{
        status: json.status
      });

    } else if (request.method == "PUT") {
      let data = await request.blob();
      const func = handler(`
      const request = ${JSON.stringify({
        method: request.method
      })}
      const body = ${JSON.stringify(data)}
      ${sitemap[pathname]}`)

      const _response = await func()

      response = new Response(JSON.stringify(_response), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      });
    }
  } catch (err) {
    // log();
    globalThis.errorObject = {
       title: `SERVER:API:ERROR:${request.url}`,
      msg: err.message,
    }
 

    // TODO: Figire out who broke it 
    // return html page instead
    console.log(globalThis.errorObject)
    return await html(sitemap, '/error')


    // response = Response.json({status:500, msg: 'api does not exist'},{
    //   status: 500,
    //   statusText: 'ERROR'
    // })
    // throw new Error(err.message)
  }
 
  //   // add cors support to api
  // if (!response.headers.has("access-control-allow-origin")) {
  //   response.headers.set("access-control-allow-origin", "*");
  //   response.headers.set(
  //     "Access-Control-Allow-Headers",
  //     "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
  //   );
  // }

 
  return response;
};


export default api_middleware