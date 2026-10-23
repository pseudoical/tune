// @ts-check

class Tune {
    /**
     * @public
     * @param {object} params
     * @param {string} params.storageVersion Automatically resets stored data when a new version is detected.
     * @param {string} params.title Displays at the top of the menu (e.g., "My Menu").
     * @param {string} params.scriptVersion Displays next to the title with a "v" prefix (e.g., "My Menu v1.2.3").
     * @param {string} params.author Displays next to the title (e.g., "My Menu v1.2.3 by John Doe").
     * @param {string} params.url Links the author to the specified destination.
     * @param {Partial<CSSStyleDeclaration>} [params.css] Defaults to `{}`. Overrides the menu's default CSS styles.
     */
    constructor(params) {
        /** @category Class Properties */
        this.storageVersion = params.storageVersion;
        /** @category Class Properties */
        this.title = params.title;
        /** @category Class Properties */
        this.scriptVersion = params.scriptVersion;
        /** @category Class Properties */
        this.author = params.author;
        /** @category Class Properties */
        this.url = params.url;
        /** @category Class Properties */
        this.css = params.css ?? {};
    }

    /**
     * @typedef {{
     *     "bool": boolean;
     *     "int": number;
     *     "float": number;
     *     "vec3": [number, number, number];
     *     "sampler2D": string;
     *     "none": never;
     * }} TuneGLSLTypeMap
     * See https://wikis.khronos.org/opengl/Data_Type_(GLSL)#Basic_types for more information.
     */

    /**
     * @typedef {keyof TuneGLSLTypeMap} TuneGLSLType
     */

    /** @namespace */
    static #Validate = class Validate {
        /**
         * @param {unknown} value
         * @returns {value is boolean}
         */
        static bool(value) {
            return typeof value === "boolean";
        }

        /**
         * @param {unknown} value
         * @returns {value is number}
         */
        static float(value) {
            return typeof value === "number" && Number.isFinite(value);
        }

        /**
         * @param {unknown} value
         * @returns {value is number}
         */
        static int(value) {
            return Validate.float(value) && Number.isInteger(value);
        }

        /**
         * @param {unknown} value
         * @returns {value is [number, number, number]}
         */
        static vec3(value) {
            return Array.isArray(value) && value.length === 3 && value.every(Validate.float);
        }

        /**
         * @param {unknown} value
         * @returns {value is string}
         */
        static sampler2D(value) {
            return typeof value === "string";
        }

        static map = Object.freeze({
            "bool": Validate.bool,
            "int": Validate.int,
            "float": Validate.float,
            "vec3": Validate.vec3,
            "sampler2D": Validate.sampler2D,
        });

        /**
         * @template {Exclude<TuneGLSLType, "none">} T
         * @param {unknown} value
         * @param {T} type
         * @returns {value is T}
         */
        static type(value, type) {
            const validate = Validate.map[type];
            return validate(value);
        }
    };

    /**
     * @template {TuneGLSLType} T
     * @template V
     * @typedef {{
     *     type: T;
     *     label: string;
     *     value: V;
     *     scope: () => unknown;
     *     uniform: (
     *         value: TuneGLSLTypeMap[Exclude<T, "none">],
     *         callback: (value: unknown) => void
     *     ) => unknown;
     *     syncInput: (value: V) => void;
     *     persist: boolean;
     * }} TuneControl
     */

    /**
     * @param {unknown[]} tokens
     * @returns {string}
     */
    static #serializeKey(tokens) {
        return JSON.stringify(tokens);
    }

    /**
     * @param {string} key
     * @returns {unknown[]?}
     */
    static #deserializeKey(key) {
        try {
            const parsed = JSON.parse(key);
            return Array.isArray(parsed) ? parsed : null;
        } catch {
            return null;
        }
    }

    /**
     * Storage keys whose scope starts with this prefix are excluded from {@link resetSettings resetSettings()}.
     * @public
     * @category Control Methods
     */
    privateScope = "_";

    /** @type {TuneControl<TuneGLSLType, unknown>[]} */
    #controls = [];

    /**
     * @template {TuneGLSLType} T
     * @template V
     * @param {TuneControl<T, V>} control
     * @returns {TuneControl<T, V>}
     */
    #addControl(control) {
        const typed = /** @type {TuneControl<any, any>} */ (control);
        this.#controls.push(typed);
        return control;
    }

    /** @type {Record<string, unknown>} */
    #storage = {};

    /**
     * @returns {string}
     */
    get #storageMasterKey() {
        return Tune.#serializeKey([this.author, this.title]);
    }

    /**
     * @param {object} params
     * @param {NonNullable<TuneControl<any, any>["scope"]>} params.scope
     * @param {string} params.label
     * @returns {string}
     */
    #storageKey(params) {
        const { scope, label } = params;
        return Tune.#serializeKey([scope(), label]);
    }

    /**
     * @param {string} label
     * @returns {string}
     */
    #privateStorageKey(label) {
        return this.#storageKey({ scope: () => this.privateScope, label });
    }

    /**
     * @returns {string}
     */
    get #versionKey() {
        return this.#privateStorageKey("TuneStorageVersion");
    }
    /**
     * @returns {string}
     */
    get #hiddenKey() {
        return this.#privateStorageKey("TuneMenuHidden");
    }

    /**
     * @returns {Record<string, unknown>}
     */
    #defaultStorage() {
        return {
            [this.#versionKey]: this.storageVersion,
            [this.#hiddenKey]: false,
        };
    }

    /**
     * @param {Record<string, unknown>} [storage] Defaults to {@link #defaultStorage #defaultStorage()}.
     * @returns {void}
     */
    #createStorage(storage = this.#defaultStorage()) {
        this.#storage = storage;
        const value = JSON.stringify(this.#storage);
        localStorage.setItem(this.#storageMasterKey, value);
    }

    /**
     * @returns {void}
     */
    #loadStorage() {
        const text = localStorage.getItem(this.#storageMasterKey);

        if (text === null) {
            this.#createStorage();
            return;
        }

        try {
            /** @type {unknown} */
            const parsed = JSON.parse(text);

            if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
                throw new Error(`Unexpected storage format: ${parsed}`);
            }

            const typed = /** @type {Record<string, unknown>} */ (parsed);

            if (typed[this.#versionKey] !== this.storageVersion) {
                console.info("Resetting storage for new version");
                this.#createStorage();
                return;
            }

            this.#storage = typed;
        } catch (err) {
            console.error(err);
            console.warn("Resetting corrupted storage");
            this.#createStorage();
        }
    }

    /**
     * @returns {void}
     */
    #saveStorage() {
        const value = JSON.stringify(this.#storage);
        localStorage.setItem(this.#storageMasterKey, value);
    }

    /**
     * @param {object} params
     * @param {boolean} params.isPrivate
     * @param {Record<string, unknown>} params.storage
     * @returns {Record<string, unknown>}
     */
    #scopedStorage(params) {
        const { isPrivate, storage } = params;

        /** @type {Record<string, unknown>} */
        const filtered = {};

        for (const key in storage) {
            const tokens = Tune.#deserializeKey(key);
            const scope = tokens?.[0];

            if (typeof scope === "string" && isPrivate === scope.startsWith(this.privateScope)) {
                filtered[key] = storage[key];
            }
        }

        return filtered;
    }

    /**
     * @param {Record<string, unknown>} [storage] Defaults to {@link #storage}.
     * @returns {Record<string, unknown>}
     */
    #privateStorage(storage = this.#storage) {
        return this.#scopedStorage({ isPrivate: true, storage });
    }

    /**
     * @param {Record<string, unknown>} [storage] Defaults to {@link #storage}.
     * @returns {Record<string, unknown>}
     */
    #publicStorage(storage = this.#storage) {
        return this.#scopedStorage({ isPrivate: false, storage });
    }

    /**
     * This object holds internal state. Do not replace it or expose it publicly. Once an entry is assigned, do not
     * replace that entry object. Instead, modify its properties directly when necessary.
     * @type {Record<string, { type: Exclude<TuneGLSLType, "none">; value: unknown; }>}
     */
    #uniforms = {};

    /**
     * @template {TuneGLSLType} T
     * @param {TuneControl<T, any>} control
     * @param {unknown} value
     * @returns {void}
     */
    #updateUniforms(control, value) {
        const { type, label, uniform } = control;

        if (type === "none") {
            return;
        }

        const key = this.#storageKey(control);

        if (!Object.hasOwn(this.#uniforms, label)) {
            this.#uniforms[key] = { type, value: null };
        }

        const typed = /** @type {TuneGLSLTypeMap[Exclude<T, "none">]} */ (value);

        uniform(typed, (value) => {
            this.#uniforms[key].value = value;
        });
    }

    /**
     * Generates uniform definitions.
     * @public
     * @category State Methods
     * @param {object} [params]
     * @param {unknown[]} [params.scopes] Defaults to `undefined`. Specifies which scope to use for each registered
     * control when generating uniform definitions.
     * @param {Record<string, { type: Exclude<TuneGLSLType, "none">; value: unknown; }>} [params.definitions] Defaults
     * to `undefined`. Additional uniform definitions to include. Overrides existing definitions with matching keys.
     * @returns {Record<string, { type: Exclude<TuneGLSLType, "none">; value: unknown; }>} The generated uniform
     * definitions.
     */
    generateUniforms(params) {
        const { scopes, definitions } = params ?? {};

        /** @type {Record<string, { type: Exclude<TuneGLSLType, "none">; value: unknown; }>} */
        const filtered = {};

        if (scopes === undefined) {
            const uniforms = this.#uniforms;

            for (const key in uniforms) {
                const tokens = /** @type {[unknown, string]?} */ (Tune.#deserializeKey(key));

                /**
                 * NOTE: This should never happen; kept for type safety.
                 */
                if (tokens === null) {
                    continue;
                }

                const [_, label] = tokens;

                filtered[label] = {
                    type: uniforms[key].type,
                    get value() { return uniforms[key].value; },
                };
            }

            return Object.assign(filtered, definitions);
        }

        for (const { type, label, uniform, value } of this.#controls) {
            if (type === "none") {
                continue;
            }

            for (const target of scopes) {
                const uniforms = this.#uniforms;
                const key = Tune.#serializeKey([target, label]);

                /** @type {unknown?} */
                let fallback = null;

                if (!Object.hasOwn(uniforms, key)) {
                    const typed = /** @type {TuneGLSLTypeMap[Exclude<TuneGLSLType, "none">]} */ (value);
                    uniform(typed, (value) => { fallback = value; });
                }

                filtered[label] = {
                    type, get value() {
                        return Object.hasOwn(uniforms, key) ? uniforms[key].value : fallback;
                    },
                };
            }
        }

        return Object.assign(filtered, definitions);
    }

    /**
     * Generates GLSL uniform declarations (e.g. `"uniform int foo;"`).
     * @public
     * @category State Methods
     * @param {Record<string, { type: Exclude<TuneGLSLType, "none">; value: unknown; }>} definitions The uniform
     * definitions to generate GLSL declarations for.
     * @returns {string} The uniform declarations.
     */
    glslUniforms(definitions) {
        return Object.entries(definitions)
            .map(([label, { type }]) => `uniform ${type} ${label};`)
            .join("\n");
    }

    /**
     * @template {TuneGLSLType} T
     * @template V
     * @param {TuneControl<T, V>} control
     * @param {NoInfer<V>} value
     * @returns {void}
     */
    #updateState(control, value) {
        if (control.persist) {
            const key = this.#storageKey(control);
            this.#storage[key] = value;
            this.#saveStorage();
        }

        this.#updateUniforms(control, value);
    }

    /**
     * Loads and validates storage values, updates uniforms, and synchronizes control values.
     * @public
     * @category State Methods
     * @returns {void}
     */
    resetState() {
        this.#loadStorage();

        for (const control of this.#controls) {
            const { value, persist, type, syncInput } = control;

            let stored = value;

            if (persist) {
                const key = this.#storageKey(control);
                const hasKey = Object.hasOwn(this.#storage, key);
                stored = this.#storage[key];

                if (!hasKey || (type !== "none" && !Tune.#Validate.type(stored, type))) {
                    if (hasKey) {
                        console.warn(`Resetting invalid type for ${key} from ${stored} to ${value}`);
                    }

                    stored = this.#storage[key] = value;
                }
            }

            syncInput(stored);

            this.#updateUniforms(control, stored);
        }

        this.#saveStorage();
    }

    /** @type {[HTMLInputElement | HTMLSelectElement, HTMLLabelElement][]} */
    #inputs = [];

    /**
     * @template {"input" | "select"} T
     * @param {T} tag
     * @param {string} label
     * @returns {HTMLElementTagNameMap[T]}
     */
    #createInput(tag, label) {
        const input = document.createElement(tag);
        input.id = Tune.#serializeKey([this.author, label]);

        const labelEl = document.createElement("label");
        labelEl.htmlFor = input.id;
        labelEl.textContent = label;

        this.#inputs.push([input, labelEl]);

        return input;
    }

    /**
     * NOTE: The following methods duplicate documentation to ensure TypeDoc
     * generates explicit API signatures in `docs/Tune.md`. Attempts to reduce
     * duplication caused JSDoc linting or TypeDoc generation issues.
     */

    /**
     * The default `uniform` callback for control methods.
     * @public
     * @category Control Methods
     * @expandType TuneGLSLType
     * @template {TuneGLSLType} T
     * @param {TuneGLSLTypeMap[T]} value The value to assign to the uniform.
     * @param {(value: unknown) => void} callback Receives the value to assign to the uniform.
     * @returns {void}
     */
    defaultUniform = (value, callback) => {
        callback(value);
    };

    /**
     * Creates a button control.
     * @public
     * @category Control Methods
     * @param {object} params
     * @param {string} params.label The control's label name.
     * @param {string} params.value The button's displayed text.
     * @returns {HTMLInputElement} The input element.
     */
    button(params) {
        const { label, value } = params;

        const input = this.#createInput("input", label);
        input.type = "button";
        input.value = value;

        this.#addControl({
            type: "none", label, value,
            scope: () => "", // Unused when `type` is `"none"` and `persist` is `false`.
            uniform: () => { }, // Unused when `type` is `"none"`.
            syncInput: () => { }, // No-op.
            persist: false,
        });

        return input;
    }

    /**
     * Creates a checkbox control.
     * @public
     * @category Control Methods
     * @template {"bool" | "none"} T
     * @param {object} params
     * @param {T} params.type The GLSL type. Set to `"none"` to omit uniform generation.
     * @param {string} params.label The control's label, storage, and uniform name.
     * @param {boolean} params.checked Whether the checkbox is checked by default.
     * @param {TuneControl<any, any>["scope"]} params.scope Returns the storage and uniform scope.
     * @param {TuneControl<T, any>["uniform"]} [params.uniform] Defaults to {@link defaultUniform defaultUniform()}.
     * Assigns the callback value to the uniform.
     * @param {boolean} [params.persist] Defaults to `true`. Whether to save data to storage.
     * @returns {HTMLInputElement} The input element.
     */
    checkbox(params) {
        params.uniform ??= this.defaultUniform;
        params.persist ??= true;

        const { type, label, checked: value, scope, uniform, persist } = params;

        const input = this.#createInput("input", label);
        input.type = "checkbox";

        const control = this.#addControl({
            type, label, value, scope, uniform, syncInput: (value) => {
                input.checked = value;
            }, persist,
        });

        input.addEventListener("change", () => {
            this.#updateState(control, input.checked);
        });

        return input;
    }

    /**
     * Creates a color control.
     * @public
     * @category Control Methods
     * @template {"vec3" | "none"} T
     * @param {object} params
     * @param {T} params.type The GLSL type. Set to `"none"` to omit uniform generation.
     * @param {string} params.label The control's label, storage, and uniform name.
     * @param {[number, number, number]} params.value The default color as `[r, g, b]`, each in the range `[0, 1]`.
     * @param {TuneControl<any, any>["scope"]} params.scope Returns the storage and uniform scope.
     * @param {TuneControl<T, any>["uniform"]} [params.uniform] Defaults to {@link defaultUniform defaultUniform()}.
     * Assigns the callback value to the uniform.
     * @param {boolean} [params.persist] Defaults to `true`. Whether to save data to storage.
     * @returns {HTMLInputElement} The input element.
     */
    color(params) {
        params.uniform ??= this.defaultUniform;
        params.persist ??= true;

        const { type, label, value, scope, uniform, persist } = params;

        const input = this.#createInput("input", label);
        input.type = "color";

        const control = this.#addControl({
            type, label, value, scope, uniform, syncInput: (value) => {
                input.value = "#" + value
                    .map((color) => Math.round(color * 255).toString(16).padStart(2, "0"))
                    .join("");
            }, persist,
        });

        input.addEventListener("change", () => {
            const value = Number.parseInt(input.value.slice(1), 16);
            const r = ((value >> 16) & 0xff) / 255;
            const g = ((value >> 8) & 0xff) / 255;
            const b = (value & 0xff) / 255;
            this.#updateState(control, [r, g, b]);
        });

        return input;
    }

    /**
     * Creates a range control.
     * @public
     * @category Control Methods
     * @template {"int" | "float" | "none"} T
     * @param {object} params
     * @param {T} params.type The GLSL type. Set to `"none"` to omit uniform generation.
     * @param {string} params.label The control's label, storage, and uniform name.
     * @param {number} params.min The lowest range value.
     * @param {number} params.max The greatest range value.
     * @param {number} params.value The default value within `[min, max]`.
     * @param {TuneControl<any, any>["scope"]} params.scope Returns the storage and uniform scope.
     * @param {TuneControl<T, any>["uniform"]} [params.uniform] Defaults to {@link defaultUniform defaultUniform()}.
     * Assigns the callback value to the uniform.
     * @param {boolean} [params.persist] Defaults to `true`. Whether to save data to storage.
     * @returns {HTMLInputElement} The input element.
     */
    range(params) {
        params.uniform ??= this.defaultUniform;
        params.persist ??= true;

        const { type, label, min, max, value, scope, uniform, persist } = params;

        const input = this.#createInput("input", label);
        input.type = "range";
        input.min = min.toString();
        input.max = max.toString();
        input.step = "any";

        const control = this.#addControl({
            type, label, value, scope, uniform, syncInput: (value) => {
                input.value = value.toString();
            }, persist,
        });

        input.addEventListener("input", () => {
            const value = Number(input.value);
            this.#updateState(control, type === "int" ? Math.trunc(value) : value);
        });

        return input;
    }

    /**
     * Creates a text control.
     * @public
     * @category Control Methods
     * @template {"sampler2D" | "none"} T
     * @param {object} params
     * @param {T} params.type The GLSL type. Set to `"none"` to omit uniform generation.
     * @param {string} params.label The control's label, storage, and uniform name.
     * @param {string} params.value The default text.
     * @param {TuneControl<any, any>["scope"]} params.scope Returns the storage and uniform scope.
     * @param {TuneControl<T, any>["uniform"]} [params.uniform] Defaults to {@link defaultUniform defaultUniform()}.
     * Assigns the callback value to the uniform.
     * @param {boolean} [params.persist] Defaults to `true`. Whether to save data to storage.
     * @returns {HTMLInputElement} The input element.
     */
    text(params) {
        params.uniform ??= this.defaultUniform;
        params.persist ??= true;

        const { type, label, value, scope, uniform, persist } = params;

        const input = this.#createInput("input", label);
        input.type = "text";

        const control = this.#addControl({
            type, label, value, scope, uniform, syncInput: (value) => {
                input.value = value;
            }, persist,
        });

        input.addEventListener("input", () => {
            this.#updateState(control, input.value);
        });

        return input;
    }

    /**
     * Creates a select control.
     * @public
     * @category Control Methods
     * @template {"int" | "none"} T
     * @param {object} params
     * @param {T} params.type The GLSL type. Set to `"none"` to omit uniform generation.
     * @param {string} params.label The control's label, storage, and uniform name.
     * @param {string[]} params.options The option values.
     * @param {number} params.value The default selected option's index.
     * @param {TuneControl<any, any>["scope"]} params.scope Returns the storage and uniform scope.
     * @param {TuneControl<T, any>["uniform"]} [params.uniform] Defaults to {@link defaultUniform defaultUniform()}.
     * Assigns the callback value to the uniform.
     * @param {boolean} [params.persist] Defaults to `true`. Whether to save data to storage.
     * @returns {HTMLSelectElement} The select element.
     */
    select(params) {
        params.uniform ??= this.defaultUniform;
        params.persist ??= true;

        const { options, type, label, value, scope, uniform, persist } = params;

        const select = this.#createInput("select", label);

        for (const value of options) {
            const option = document.createElement("option");
            option.value = option.textContent = value;
            select.appendChild(option);
        }

        const control = this.#addControl({
            type, label, value, scope, uniform, syncInput: (value) => {
                select.value = options.at(value) ?? options[0];
            }, persist,
        });

        select.addEventListener("change", () => {
            const value = Math.max(0, options.indexOf(select.value));
            this.#updateState(control, value);
        });

        return select;
    }

    /** @type {string?} */
    #menuKeyKey = null;

    /**
     * Creates a text control. Configures the key that toggles the menu UI's visibility.
     * @public
     * @category Control Methods
     * @param {object} params
     * @param {string} params.label The control's label and storage name.
     * @param {string} params.value The default keyboard key.
     * @returns {HTMLInputElement} The input element.
     */
    menuKey(params) {
        const { label, value } = params;

        const control = /** @type {const} */ ({ type: "none", label, value, scope: () => this.privateScope });
        const input = this.text(control);

        const property = "value";
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), property);

        if (descriptor === undefined) {
            throw new Error(`Property descriptor does not exist for the given property: ${property}`);
        }

        Object.defineProperty(input, property, {
            ...descriptor,
            set(value) {
                descriptor.set?.call(this, `KEY ${String(value).toUpperCase()}`);
            },
        });

        const key = this.#menuKeyKey = this.#storageKey(control);

        input.addEventListener("click", () => {
            input.value = "Press any key...";
            input.style.caretColor = "transparent";
        });

        input.addEventListener("blur", () => {
            input.value = String(this.#storage[key]);
        });

        input.addEventListener("keydown", (event) => {
            event.preventDefault();
            event.stopPropagation();

            this.#storage[key] = event.key;
            this.#saveStorage();

            input.blur();
        });

        return input;
    }

    /**
     * Creates a button control with the given arguments and a text control underneath it. Sets the text field value to
     * a JSON string containing the filtered public storage values.
     * @public
     * @category Control Methods
     * @param {object} params
     * @param {string} params.label The control's label name.
     * @param {string} params.value The button's displayed text.
     * @param {(tokens: [scope: unknown, label: unknown], value: unknown) => boolean} [params.filter] Defaults to
     * `undefined`. Filters storage entries based on their deserialized key tokens and corresponding values. Entries
     * whose keys cannot be deserialized are skipped.
     * @returns {{ button: HTMLInputElement; text: HTMLInputElement; }} The input elements.
     */
    exportSettings(params) {
        const { label, value, filter } = params;

        const button = this.button({ label, value });
        const text = this.text({ type: "none", label: "", value: "", scope: () => "", persist: false });

        button.addEventListener("click", () => {
            let storage = this.#publicStorage();

            if (filter !== undefined) {
                /** @type {Record<string, unknown>} */
                const filtered = {};

                for (const key in storage) {
                    const tokens = /** @type {[unknown, unknown]?} */ (Tune.#deserializeKey(key));

                    if (tokens === null) {
                        continue;
                    }

                    const value = storage[key];

                    if (filter(tokens, value)) {
                        filtered[key] = value;
                    }
                }

                storage = filtered;
            }

            text.value = JSON.stringify(storage);
            text.focus();
            text.select();
        });

        return { button, text };
    }

    /**
     * Creates a button control with the given arguments and a text control underneath it. Parses the JSON string in
     * the text field and updates storage.
     * @public
     * @category Control Methods
     * @param {object} params
     * @param {string} params.label The control's label name.
     * @param {string} params.value The button's displayed text.
     * @returns {{ button: HTMLInputElement; text: HTMLInputElement; }} The input elements.
     */
    importSettings(params) {
        const { label, value } = params;

        const button = this.button({ label, value });
        const text = this.text({ type: "none", label: "", value: "", scope: () => "", persist: false });

        button.addEventListener("click", () => {
            const value = text.value.trim();

            if (value === "") {
                return;
            }

            try {
                /** @type {unknown} */
                const parsed = JSON.parse(text.value);

                if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
                    throw new Error(`Unexpected storage format: ${parsed}`);
                }

                const typed = /** @type {Record<string, unknown>} */ (parsed);
                const publicStorage = this.#publicStorage(typed);
                Object.assign(this.#storage, publicStorage);

                this.#saveStorage();
                this.resetState();

                text.style.removeProperty("accent-color");
            } catch (err) {
                console.error(err);

                text.style.setProperty("accent-color", "red");

                text.focus();
                text.select();
            }
        });

        return { button, text };
    }

    /**
     * Creates a button control. Recreates storage while preserving private data.
     * @public
     * @category Control Methods
     * @param {object} params
     * @param {string} params.label The control's label name.
     * @param {string} params.value The button's displayed text.
     * @param {(tokens: [scope: unknown, label: unknown], value: unknown) => boolean} [params.filter] Defaults to
     * `undefined`. Filters storage entries to delete based on their deserialized key tokens and corresponding values.
     * Entries whose keys cannot be deserialized are preserved.
     * @returns {HTMLInputElement} The input element.
     */
    resetSettings(params) {
        const { label, value, filter } = params;

        const input = this.button({ label, value });

        input.addEventListener("click", () => {
            const privateStorage = this.#privateStorage();

            if (filter === undefined) {
                this.#createStorage(privateStorage);
                this.resetState();
                return;
            }

            for (const key in this.#storage) {
                const tokens = /** @type {[unknown, unknown]?} */ (Tune.#deserializeKey(key));
                const value = this.#storage[key];

                if (tokens === null) {
                    continue;
                }

                if (!Object.hasOwn(privateStorage, key) && filter(tokens, value)) {
                    delete this.#storage[key];
                }
            }

            this.#saveStorage();
            this.resetState();
        });

        return input;
    }

    #isMenuCreated = false;

    /**
     * Returns `true` if {@link menu menu()} has been called.
     * @public
     * @category Menu Methods
     * @returns {boolean}
     */
    get isMenuCreated() {
        return this.#isMenuCreated;
    }

    /**
     * Creates a menu UI containing the created controls.
     * @public
     * @category Menu Methods
     * @returns {HTMLFieldSetElement} The menu element.
     */
    menu() {
        this.#isMenuCreated = true;

        this.resetState();

        const menu = document.body.appendChild(document.createElement("fieldset"));
        menu.hidden = Object.hasOwn(this.#storage, this.#hiddenKey) && Boolean(this.#storage[this.#hiddenKey]);
        menu.style.position = "fixed";
        menu.style.zIndex = "9999";
        menu.style.top = "50%";
        menu.style.left = "50%";
        menu.style.transform = "translate(-50%, -50%)";
        menu.style.maxHeight = "80vh";
        menu.style.overflowY = "auto";
        menu.style.padding = "10px";
        menu.style.display = menu.hidden ? "none" : "flex";
        menu.style.flexDirection = "column";
        menu.style.gap = "6px";
        menu.style.background = "#1f1f1f";
        menu.style.border = "1px solid #5a5a5a";
        menu.style.color = "#ffffff";
        menu.style.fontFamily = "sans-serif";
        menu.style.fontSize = "14px";
        menu.style.borderRadius = "4px";
        menu.style.whiteSpace = "nowrap";
        Object.assign(menu.style, this.css);

        document.addEventListener("keydown", (event) => {
            const menuKey = this.#menuKeyKey;

            if (menuKey === null) {
                return;
            }

            if (event.key.toLowerCase() === String(this.#storage[menuKey]).toLowerCase()) {
                event.preventDefault();

                this.#storage[this.#hiddenKey] = menu.hidden = !menu.hidden;
                menu.style.display = menu.hidden ? "none" : "flex";
                this.#saveStorage();
            }
        });

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        menu.addEventListener("mousedown", (event) => {
            if (!(event.target instanceof HTMLInputElement)) {
                isDragging = true;
                offsetX = event.clientX - menu.offsetLeft;
                offsetY = event.clientY - menu.offsetTop;
            }
        });

        document.addEventListener("mousemove", (event) => {
            if (isDragging) {
                menu.style.left = `${event.clientX - offsetX}px`;
                menu.style.top = `${event.clientY - offsetY}px`;
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });

        const div = menu.appendChild(document.createElement("div"));
        div.style.display = "flex";
        div.style.alignItems = "flex-start";
        div.style.justifyContent = "space-between";
        div.style.width = "100%";
        div.style.gap = "10px";

        const title = div.appendChild(document.createElement("span"));
        title.textContent = this.title;
        title.style.fontSize = "16px";
        title.style.color = "yellow";
        title.style.display = "flex";
        title.style.gap = "4px";

        const version = title.appendChild(document.createElement("span"));
        version.textContent = `v${this.scriptVersion}`;
        version.style.color = "magenta";

        const author = title.appendChild(document.createElement("a"));
        author.textContent = this.author;
        author.href = this.url;
        author.target = "_blank";
        author.rel = "noopener noreferrer";
        author.style.color = "cyan";

        const close = div.appendChild(document.createElement("button"));
        close.type = "button";
        close.innerHTML = "&times;";

        close.addEventListener("click", () => {
            menu.style.display = "none";
            this.#storage[this.#hiddenKey] = menu.hidden = true;
            this.#saveStorage();
        });

        for (const [input, label] of this.#inputs) {
            const div = menu.appendChild(document.createElement("div"));
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.gap = "6px";
            div.append(input, label);
        }

        console.log(
            `%c${this.title} %cv${this.scriptVersion} %c${this.author}\n%c${this.url}`,
            "color: yellow;", "color: magenta;", "color: cyan;", "color: auto;"
        );

        return menu;
    }

    static #_ = (() => {
        Object.assign(window, { "Tune": this });
    })();
}
