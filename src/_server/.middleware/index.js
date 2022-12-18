import html_middleware from "./html.js";
import assets_middleware from './asset.js';
import script_middleware from "./script.js";
import api_middleware from "./api.js";
import websocket_middleware from "./websocket.js";
// import * as availibleServices from 'https://sauveur.xyz/api/blacklabel/services'
// import * as envVariables from 'https://sauveur.xyz/api/blacklabel/env-set' assert { type: 'json' };


// a rudimentary deomin specifier
const set_domain = (request) => {


  const ref = request.headers.get("referer")
  const tlc = ref ? ref.split('.').pop() : 'localhost'
 
  if (request.headers.get("domain")){
    window.domain = request.headers.get("domain")
  }else if (!tlc.includes('localhost')){
    window.domain = 'live'
  }else{
    window.domain = 'dev'
  }

}
 
const middleware = async (request, info) => {

    try {
      set_domain(request)   
      const { pathname } = new URL(request.url);
      const domain = request.headers.get('host').split(':')[0];
      const localDev = Deno.env.get('LOCAL')
      const serverSrc = Deno.env.get('REMOTE');
      const sitemapSrc = localDev ? localDev : domain === Deno.env.get('QA_ENV_DOMAIN')  ? `${serverSrc}/d/${pathname}` :  `${serverSrc}/p/${domain}`;
      const sitemap = await import(`.${sitemapSrc}/sitemap.json`,{ assert: { type: "json" } });
      
      const isFormType = request.headers.get("content-type") === 'application/x-www-form-urlencoded' 
      const isApiCall =  pathname.includes('api') || request.headers.get("host").includes('api')
      const isFileRequest = pathname.includes('.')
      const isScriptRequest = pathname.includes('.js')

      if (pathname == '/socket') {
        return await websocket_middleware(pathname, request)
      }


      if(isScriptRequest){
          // Headers {
      //   accept: "*/*",
      //   "accept-encoding": "gzip, deflate, br",
      //   "accept-language": "en-US,en;q=0.5",
      //   connection: "keep-alive",
      //   dnt: "1",
      //   host: "localhost:8080",
      //   referer: "http://localhost:8080/test",
      //   "sec-fetch-dest": "script",
      //   "sec-fetch-mode": "cors",
      //   "sec-fetch-site": "same-origin",
      //   "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:106.0) Gecko/20100101 Firefox/106.0"
      // }
      // figure out how to access sec-fetch-dest
      const path = pathname.split('.').shift()
 
      return script_middleware(sitemap.default,path,request)
      }
      else if(isFileRequest){
        console.log(sitemapSrc)
          return assets_middleware(pathname,request,sitemapSrc)
      }

      if (isApiCall || isFormType ) {
        return api_middleware(sitemap.default,pathname,request)
      } else {
        return  html_middleware(sitemap.default,pathname,request)
      }
    } catch (err) {
        // look into support for logging service or build own
        // we will send it from here to our custom logger
        let msg = "Internal server error";
    
        // if (err.message.includes("Cannot read properties of undefined ")) {
        //   msg = err.message;
        // }
    
        return Response.json({msg, trace:err.message},{status:500})
    }
}

export default middleware