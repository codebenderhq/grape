//import { serve, serveTls } from "https://deno.land/std@0.167.0/http/server.ts";
import middleware from './.middleware/index.js'
import "https://deno.land/std@0.167.0/dotenv/load.ts";
// will be used
// const isDev = env.DENO_ENV === "DEV"
const port = 8080;


export const server = async (request,info) => {
 
  return middleware(request,info)
};



//console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);
//await serve(server, { port });
 
// if(isDev || isDenoDeploy){
//   console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);
// await serve(handler, { port });
// }else{
  // console.log(`HTTP webserver running. Access it at: https://localhost:8080/`);
  // const options = {
  //   port,
  //   certFile: "../server.crt",
  //   keyFile: "../server.key",
  // };
  // await serveTls(handler,options);

// }
// https://web.dev/custom-metrics/?utm_source=devtools#server-timing-api