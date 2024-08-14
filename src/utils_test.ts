import { assertEquals } from "@std/assert";
import { getFilename } from "./utils.ts";

Deno.test("getFilename()", () => {
  assertEquals(getFilename("README.md"), "README");
  assertEquals(getFilename("/README.md"), "README");
  assertEquals(getFilename("./README.md"), "README");
  assertEquals(getFilename("../README.md"), "README");
  assertEquals(getFilename("README.2.md"), "README.2");
});
