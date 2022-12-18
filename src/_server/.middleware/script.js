const script_middleware  = async (sitemap, pathname, req) => {
  

    const referer = req.headers.get('referer')
    const activeSite = sitemap[pathname];
    const res = activeSite ? activeSite : sitemap['/error']
    let prop = JSON.parse(res.onBuildResult)

    if(res.onServer){

      const param = referer.split('/').pop()
      const serverProps = {param}
      // update to use new Function
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
      const serverSideScript = eval(`(${res.onServer})(${JSON.stringify(serverProps)})`)
       
      prop = {...prop, onServerResult:await serverSideScript}
    }
 
    return new Response(`(${res.script})(${JSON.stringify(prop)})`, {
      headers: {
        "content-type": "text/javascript",
      },
    });
  }

  export default script_middleware