import { assertEquals, assertThrows } from "https://deno.land/std@0.133.0/testing/asserts.ts";
import html from '../../src/server/.middleware/html.js'
import * as app from "../../src/server/static/index.js";
const dir = `./src/server/static`


Deno.test("html middleware get", async () => {

        // Deno.cwd('./src')
        // const req = new Request("https://example.com", {
        //         method: "GET",
        // });

//      will shall figure out directory change
        
         
        // const res = await html(app,'',[],req)
        // console.log(res)
        // assertEquals(res.status, 200);
});