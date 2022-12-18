import { assertEquals, assertThrows } from "https://deno.land/std@0.133.0/testing/asserts.ts";
// import {handler} from '../src/server/index.js'

const dir = `./src/server/static`


Deno.test("serve handler", async () => {

        const req = new Request("https://example.com", {
                method: "GET",
        });
        

        console.log(req)
        // const res = await handler(req)
        // // console.log(res)
        // assertEquals(res.status, 200);
});