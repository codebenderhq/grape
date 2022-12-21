import { serveFile } from "https://deno.land/std@0.170.0/http/file_server.ts";


const asset_middlware  = async (pathname,request, path) => {
    try{
        const type = pathname.split('.').pop()
        const content_type = `text/${type}`
        const file_path = `${path}/assets${pathname}`

//        find out if there is a leak here
        const file = await Deno.open(file_path, { read: true });
        const content = file.readable;
        if(type === 'css'){
          return new Response(content, {
            headers: {
              "content-type": content_type,
              "access-control-allow-origin": "*",
              "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
            },
          });
        }else{
          // return new Response(content,{
          //   headers:{
          //     "content-type": request.headers.get('accept').split(',')[0],
          //     "access-control-allow-origin": "*",
          //     "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
          //   }
          // });

          return await serveFile(request, file_path);
        }

      }catch(err){
          console.log(err.message)
      }
} 

export default asset_middlware