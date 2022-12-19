import { exists } from "https://deno.land/std/fs/mod.ts";


const html_middleware = async (pathname, req, path = './src/_app') => {
  

  let pageSrc = `${path}/index.html`
  let paramPage = null
  
  if(pathname.split('/').length === 2 && pathname !== '/'){
    console.log('htllo')
    pageSrc = `${path}/${pathname}/pages/index.html`
  } else if(pathname !== '/'){ 
    pageSrc = `${path}/${pathname.split('/')[1]}/pages/${pathname.split('/')[2]}.html` 
    paramPage = `${path}/${pathname.split('/')[1]}/pages/@.html`;
  }
  
 
  if(!await exists(pageSrc) && !await exists(paramPage)){
    pageSrc = `${path}/error/pages/index.html`
  } 
 
  console.log(Deno.cwd())
  console.log(pageSrc)
 
  const page = await Deno.readFile(pageSrc);
  const res = page ? page : paramPage ? paramPage : errorPage

  if(await exists(`../../_app/${pathname}.jsx`)){
     
    const jsxResponse =  await import(`../src/_server/public/${res.page}`) 
    return jsxResponse.default()
 
  }

  return new Response(res, {
    headers: {
      "content-type": "text/html",
    },
  });
}



export default html_middleware