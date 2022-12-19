import { serve, serveTls } from "https://deno.land/std@0.167.0/http/server.ts";
import {server} from './src/_server/index.js' 


const port = 8080
serve(server, { port });