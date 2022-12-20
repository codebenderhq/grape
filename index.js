import { serve, serveTls } from "https://deno.land/std@0.167.0/http/server.ts";
import {server} from './src/_server/index.js' 


const port = 8080
serve(server, { port });

 
  // console.log(`HTTP webserver running. Access it at: https://localhost:8080/`);
  // const options = {
  //   port,
  //   certFile: "../server.crt",
  //   keyFile: "../server.key",
  // };
  // await serveTls(handler,options);

 
// https://web.dev/custom-metrics/?utm_source=devtools#server-timing-api