// @ts-check

import fs from "node:fs/promises";
import path from "node:path";

import pkg from "../package.json" with { type: "json" };

/** @type {Record<string, string>} */
const targets = {
    VERSION: pkg.version,
};

const input = "README.md";
const template = path.join("templates", input);
let contents = await fs.readFile(template, "utf8");

for (const target in targets) {
    const regex = new RegExp(`{{\\s*${target}\\s*}}`, "ig");
    const value = targets[target];
    contents = contents.replaceAll(regex, value);
}

await fs.writeFile(input, contents);
