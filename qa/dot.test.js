import { assertEquals, assertThrows } from "https://deno.land/std@0.133.0/testing/asserts.ts";
import html from '../src/server/.middleware/html.js'

const dir = `./src/server/static`


Deno.test("dot on mount", async () => {

        const req = new Request("https://example.com", {
                method: "GET",
        });
        

        // console.log(html(dir,'/bye',[],req))
        assertEquals('hello', "hello");
});