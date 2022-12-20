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
      const appSrc = localDev ? localDev : domain === Deno.env.get('QA_ENV_DOMAIN')  ? `${serverSrc}/d/${pathname}` :  `${serverSrc}/p/${domain}`;

      const isFormType = request.headers.get("content-type") === 'application/x-www-form-urlencoded' 
      const isApiCall =  pathname.includes('api') || request.headers.get("host").includes('api')
      const isFileRequest = pathname.includes('.')
      const isScriptRequest = pathname.includes('.js')

      if (pathname == '/socket') {
        return await websocket_middleware(pathname, request)
      }


      if(isScriptRequest){
      const path = pathname.split('.').shift()
 
      return script_middleware(path,request)
      }
      else if(isFileRequest){
          return assets_middleware(pathname,request,appSrc)
      }

      if (isApiCall || isFormType ) {
        return api_middleware(pathname,request)
      } else {
        return  html_middleware(pathname,request)
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