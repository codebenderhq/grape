import middleware from './.middleware/index.js'
import "https://deno.land/std@0.167.0/dotenv/load.ts";
 

export const server = async (request,info) => {
 
  return middleware(request,info)
};
 