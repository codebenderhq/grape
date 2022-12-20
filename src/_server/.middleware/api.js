 import html from "./html.js";

const valid_domain = (referer) => {
  console.log(referer)
  // need to handle valid domain better as a person could just read the code and figure out what refer to use
  return ['sauveur.xyz','http://localhost:8080/','mmereko.co.za'].includes(referer)
}

const is_authenticated = (auth) => {
  return [Deno.env.get('SERVER_KEY') ].includes(auth)
}

const get_data = async (request) => {
  let _data
  let type = 'json'
  const referer = request.headers.get("referer");
  const isFormReq =
  request.headers.get("content-type") ===
    "application/x-www-form-urlencoded" 
  const isBlob = request.headers.get("content-type") === "application/octet-stream"


  if (isFormReq && referer) {
    let referer = new URL(request.headers.get("referer"));
     _data = new URLSearchParams(await request.text());

    for (const key of _data.keys()) {
      const value = _data.get(key)
      if(value !== ""){
        data[key] = value
      }
    }
   

    for (var key of referer.searchParams.keys()) {
      _data.set(key, referer.searchParams.get(key));
    }
    type='form'
  } 
  else if(isFormReq && !referer){
    throw new Error('Form request require referer')
  }else if(isBlob){
    _data = await request.blob()
    type = 'blob'
  }else{
    _data = await request.json()
  }

  return {result:_data, type}


}

const api_middleware =  async (pathname, request) => {
  let response;
  try {
    let data ={};
    const apiSrc = `${Deno.cwd()}/src/_app`
    const auth = request.headers.get("authorization");
    const referer = request.headers.get("referer");
    const paths = pathname.split('/')
    let subPath=''
    if(paths.length > 3){
      paths.pop()
    }
  
   
    const apiPath = `${paths.reverse().join('/')}${subPath}`
  
    // added server cors
 
    if(!is_authenticated(auth) && !valid_domain(request.headers.get("referer")) && !referer){
      throw new Error('Unotharized')
    }

    if(request.method !== "GET"){
      data = await get_data(request) 
    }

    const {default: apiMethod} = await import(`${Deno.cwd()}/src/_app/${apiPath}/${request.method.toLowerCase()}.js`)
    const json = await apiMethod(request,data.result)

    if (data.result === 'form') {

      let page = '/status'
      // convert this to jsx for customizability
      return await html('/status')
    }


    response = Response.json(json,{
      status: json.status
    });

    
  } catch (err) {
    // log();
    globalThis.errorObject = {
       title: `SERVER:API:ERROR:${request.url}`,
      msg: err.message,
    }
 
    // TODO: Figire out who broke it 
    // return html page instead
    console.log(globalThis.errorObject)
    return await html('/error')
  }
 
  return response;
};


export default api_middleware