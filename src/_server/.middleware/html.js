import html_jsx from './html.jsx'
import { h } from "https://deno.land/x/nano_jsx@v0.0.20/mod.ts";


const html_middleware = async (sitemap, pathname, req) => {
  

  const activeSite = sitemap[pathname]; 
  // console.log(sitemap['/@'])
  const res = activeSite ? activeSite : sitemap['/@'] ? sitemap['/@'] : sitemap['/error']

  if(res.isJSX){
     
    const jsxResponse =  await import(`../src/_server/public/${res.page}`) 
    return jsxResponse.default()
 
  }

  return new Response(res.page, {
    headers: {
      "content-type": "text/html",
    },
  });
}



export default html_middleware