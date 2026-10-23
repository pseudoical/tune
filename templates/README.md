# Tune <!-- omit in toc -->

**T**hree.js **Un**iform **E**ditor (**Tune**) is a JavaScript UI kit for configuring Three.js shader uniforms through a graphical interface.

![Menu UI](assets/menu-ui.png)

# Table of Contents <!-- omit in toc -->

- [API reference](#api-reference)
- [Quick start](#quick-start)
  - [Userscript usage](#userscript-usage)
  - [Version control](#version-control)
- [Full example](#full-example)
  - [Generate uniforms](#generate-uniforms)
  - [GLSL uniforms](#glsl-uniforms)
  - [Export settings](#export-settings)
  - [Storage format](#storage-format)

# API reference

A complete overview of the public API, including the constructor signature, control methods, menu methods, and state management:

- [docs/Tune.md](docs/Tune.md)

# Quick start

```js
const script = document.head.appendChild(document.createElement("script"));

script.src = "https://cdn.jsdelivr.net/gh/pseudoical/tune@{{ VERSION }}/dist/tune.min.js";

script.onload = () => {
    const gui = new window.Tune({
        storageVersion: "1",
        title: "My Menu",
        scriptVersion: "1.2.3",
        author: "John Doe",
        url: "https://example.com",
    });

    gui.menu();
};
```

## Userscript usage

Import the library using `@require` in the userscript header:

```js
// ==UserScript==
// @name         My Menu
// @namespace    http://tampermonkey.net/
// @version      1.2.3
// @description  try to take over the world!
// @author       John Doe
// @match        https://*/*
// @icon         https://www.tampermonkey.net/favicon.ico
// @grant        none
// @require      https://cdn.jsdelivr.net/gh/pseudoical/tune@{{ VERSION }}/dist/tune.min.js
// ==/UserScript==

(function () {
    const gui = new window.Tune({
        storageVersion: "1",
        title: "My Menu",
        scriptVersion: "1.2.3",
        author: "John Doe",
        url: "https://example.com",
    });

    gui.menu();
})();
```

## Version control

View available versions in https://github.com/pseudoical/tune/tags.

To use a specific version, replace `{{ VERSION }}` in the CDN URL with the desired version tag. Pinning a version helps prevent unexpected changes when new releases are published.

For example, version `1.0.0`:

```text
https://cdn.jsdelivr.net/gh/pseudoical/tune@{{ VERSION }}/dist/tune.min.js
```

# Full example

```js
const gui = new window.Tune({
    storageVersion: "1",
    title: "My Menu",
    scriptVersion: "1.2.3",
    author: "John Doe",
    url: "https://example.com",
    // Optional menu CSS overrides:
    // css: {
    //     background: "white",
    //     color: "black",
    // },
});

let count = 0;

const button = gui.button({
    label: "Count",
    value: count.toString(),
    // Cannot persist data.
});

button.addEventListener("click", () => {
    count++;
    button.value = count.toString();
});

gui.checkbox({
    type: "bool",
    label: "Outline",
    checked: true,
    scope: () => "",
    // Does not persist data in `localStorage`.
    persist: false,
});

gui.color({
    type: "vec3",
    label: "Color",
    // Sets the default color to green.
    value: [0, 1, 0],
    scope: () => "",
});

gui.range({
    type: "float",
    // Causes a GLSL syntax error.
    label: "Color Alpha",
    min: 0,
    max: 100,
    value: 25,
    // The scope may be of any type.
    scope: () => 123,
    // Called on every input change.
    uniform: (value, callback) => {
        // Adds 1 to the value before assigning it to the uniform.
        callback(value + 1);
    },
});

gui.text({
    type: "none",
    label: "Sketch Name",
    value: "The Meadow",
    // Uses the default private scope, `"_"`.
    scope: () => gui.privateScope,
    // Never called because type is `"none"`.
    uniform: () => {
        console.log("Hello, Meadow!");
    },
});

gui.select({
    type: "int",
    label: "Brush",
    options: ["Pen", "Pencil", "Marker"],
    // The default selected option's index.
    value: 1,
    scope: () => "",
});

gui.menuKey({
    label: "MenuKey",
    value: "m",
    // Automatically persists the value with a private scope.
});

gui.exportSettings({
    label: "ExportSettings",
    value: "Export",
    // Storage entries with private scopes will not export automatically.
    filter: (tokens, _value) => {
        const [scope, _label] = tokens;
        return typeof scope !== "number";
    },
    // Cannot persist data.
});

gui.importSettings({
    label: "ImportSettings",
    value: "Import",
    // Cannot persist data.
});

gui.resetSettings({
    label: "ResetSettings",
    value: "Reset",
    // Cannot persist data.
});

// Renders the menu UI.
gui.menu();
```

## Generate uniforms

```js
const uniforms = gui.generateUniforms({
    definitions: {
        u_time: {
            type: "float",
            get value() { return performance.now() / 1000; },
        },
    },
});

console.log(uniforms);
```

Running the snippet generates uniform definitions and adds the additional definitions to the resulting `uniforms` object:

| Key             | Value                                  |
| --------------- | -------------------------------------- |
| `"Outline"`     | `{ type: "bool", value: true }`        |
| `"Color"`       | `{ type: "vec3", value: [ 0, 1, 0 ] }` |
| `"Color Alpha"` | `{ type: "float", value: 26 }`         |
| `"Brush"`       | `{ type: "int", value: 1 }`            |
| `"u_time"`      | `{ type: "float", value: 123.45 }`     |

## GLSL uniforms

```js
const glsl = gui.glslUniforms(uniforms);

console.log(glsl);
```

Running the snippet produces the following string output:

```glsl
uniform bool Outline;
uniform vec3 Color;
uniform float Color Alpha;
uniform int Brush;
uniform float u_time;
```

> [!NOTE]
> The `Color Alpha` uniform will cause a syntax error if injected into a shader because GLSL identifiers cannot contain spaces. Use `"Color_Alpha"` or `"ColorAlpha"` as the label to avoid this issue.

## Export settings

Clicking the button created by `gui.exportSettings()` produces a JSON string in the text field.

When parsed, it has the following structure:

| Key              | Value       |
| ---------------- | ----------- |
| `"["","Color"]"` | `[0, 1, 0]` |
| `"["","Brush"]"` | `1`         |

## Storage format

Settings are stored in `localStorage` using the author and menu title as the entry key. The value is a JSON string containing the individual settings.

Storage entry:

| Key                        | Value             |
| -------------------------- | ----------------- |
| `"["John Doe","My Menu"]"` | `"<JSON string>"` |

JSON string:

| Key                            | Value          |
| ------------------------------ | -------------- |
| `"["_","TuneStorageVersion"]"` | `"1"`          |
| `"["_","TuneMenuHidden"]"`     | `false`        |
| `"["","Color"]"`               | `[0, 1, 0]`    |
| `"[123,"Color Alpha"]"`        | `25`           |
| `"["_","Sketch Name"]"`        | `"The Meadow"` |
| `"["","Brush"]"`               | `1`            |
| `"["_","MenuKey"]"`            | `"m"`          |

> [!NOTE]
> The `TuneStorageVersion` and `TuneMenuHidden` entries are automatically generated by the library.

---

<p align="center">This project is licensed under the <a href="LICENSE">MIT License</a>.</p>
