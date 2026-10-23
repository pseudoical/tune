// @ts-check

/**
 * References:
 *   - https://terser.org/docs/api-reference/
 */

import fs from "node:fs/promises";
import path from "node:path";

import { minify } from "terser";

const file = "tune.js";
const input = path.join("src", file);
const code = await fs.readFile(input, "utf8");
const result = await minify(`(() => { ${code} })();`);
const min = file.replace(".", ".min.");
const output = path.join("dist", min);
await fs.writeFile(output, result.code ?? "");
