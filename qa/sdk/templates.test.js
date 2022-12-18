import { assertEquals, assertThrows } from "https://deno.land/std@0.133.0/testing/asserts.ts";
import * as sdk from '../../src/server/static/index.js'
 


Deno.test("templates load properly", async () => {
    // this is a rudimentary test but it is just to confirm that 
    // the templates get loaded properly into the js file
    assertEquals(sdk.blackLabel.js.includes('sign-in'), true);
    assertEquals(sdk.blackLabel.js.includes('project-card'), true);
    assertEquals(sdk.blackLabel.js.includes('round-btn'), true);
});