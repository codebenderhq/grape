const script_middleware  = async (pathname, req) => {
   
  let onBuildResult;
  let onServerResult;
  let prop

  const res =  await import(`${Deno.cwd()}/src/_app/${pathname}.js`)
 
  if(res.onBuild){
    onBuildResult = await res.onBuild()
  }

  if(res.onServer){
     onServerResult = await res.onServer(pathname, req)
  }

  prop = {onBuildResult, onServerResult}
  
  return new Response(`(${res.default})(${JSON.stringify(prop)})`, {
        headers: {
        "content-type": "text/javascript",
      },
    });
  }

  export default script_middleware