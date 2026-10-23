// @ts-check

/**
 * References:
 *   - https://typedoc.org/
 *   - https://typedoc-plugin-markdown.org/docs
 */

import assert from "node:assert/strict";

import * as td from "typedoc";

/** @type {td.TypeDocOptions & import("typedoc-plugin-markdown").PluginOptions} */
const config = {
    // typedoc options
    plugin: ["typedoc-plugin-markdown"],
    compilerOptions: { allowJs: true },
    entryPoints: ["src/tune.js"],
    readme: "none",
    disableSources: true,
    out: "docs",
    router: "structure",
    categoryOrder: ["Control Methods", "Scope Methods", "Menu Methods", "State Methods"],
    excludeCategories: ["Class Properties"],
    sort: ["source-order"],

    // typedoc-plugin-markdown options
    hidePageHeader: true,
    hideBreadcrumbs: true,
    useCodeBlocks: true,
    expandObjects: true,
    expandParameters: true,
};

const app = await td.Application.bootstrapWithPlugins(config);

const project = await app.convert();
assert(project !== undefined);

await app.generateOutputs(project);
