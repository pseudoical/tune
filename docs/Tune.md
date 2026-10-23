# Class: Tune

## Constructors

### Constructor

```ts
new Tune(params: {
  storageVersion: string;
  title: string;
  scriptVersion: string;
  author: string;
  url: string;
  css?: Partial<CSSStyleDeclaration>;
}): Tune;
```

#### Parameters

##### params

###### storageVersion

`string`

Automatically resets stored data when a new version is detected.

###### title

`string`

Displays at the top of the menu (e.g., "My Menu").

###### scriptVersion

`string`

Displays next to the title with a "v" prefix (e.g., "My Menu v1.2.3").

###### author

`string`

Displays next to the title (e.g., "My Menu v1.2.3 by John Doe").

###### url

`string`

Links the author to the specified destination.

###### css?

`Partial`\<`CSSStyleDeclaration`\>

Defaults to `{}`. Overrides the menu's default CSS styles.

#### Returns

`Tune`

## Control Methods

### privateScope

```ts
privateScope: string = "_";
```

Storage keys whose scope starts with this prefix are excluded from [resetSettings()](#resetsettings).

***

### defaultUniform()

```ts
defaultUniform<T extends keyof TuneGLSLTypeMap>(value: TuneGLSLTypeMap[T], callback: (value: unknown) => void): void;
```

The default `uniform` callback for control methods.

#### Type Parameters

##### T

`T` *extends* keyof [`TuneGLSLTypeMap`](TuneGLSLTypeMap.md)

#### Parameters

##### value

[`TuneGLSLTypeMap`](TuneGLSLTypeMap.md)\[`T`\]

The value to assign to the uniform.

##### callback

(`value`: `unknown`) => `void`

Receives the value to assign to the uniform.

#### Returns

`void`

***

### button()

```ts
button(params: {
  label: string;
  value: string;
}): HTMLInputElement;
```

Creates a button control.

#### Parameters

##### params

###### label

`string`

The control's label name.

###### value

`string`

The button's displayed text.

#### Returns

`HTMLInputElement`

The input element.

***

### checkbox()

```ts
checkbox<T extends "none" | "bool">(params: {
  type: T;
  label: string;
  checked: boolean;
  scope: () => unknown;
  uniform?: (value: TuneGLSLTypeMap[Exclude<T, "none">], callback: (value: unknown) => void) => unknown;
  persist?: boolean;
}): HTMLInputElement;
```

Creates a checkbox control.

#### Type Parameters

##### T

`T` *extends* `"none"` \| `"bool"`

#### Parameters

##### params

###### type

`T`

The GLSL type. Set to `"none"` to omit uniform generation.

###### label

`string`

The control's label, storage, and uniform name.

###### checked

`boolean`

Whether the checkbox is checked by default.

###### scope

() => `unknown`

Returns the storage and uniform scope.

###### uniform?

(`value`: [`TuneGLSLTypeMap`](TuneGLSLTypeMap.md)\[`Exclude`\<`T`, `"none"`\>\], `callback`: (`value`: `unknown`) => `void`) => `unknown`

Defaults to [defaultUniform()](#defaultuniform).
Assigns the callback value to the uniform.

###### persist?

`boolean`

Defaults to `true`. Whether to save data to storage.

#### Returns

`HTMLInputElement`

The input element.

***

### color()

```ts
color<T extends "none" | "vec3">(params: {
  type: T;
  label: string;
  value: [number, number, number];
  scope: () => unknown;
  uniform?: (value: TuneGLSLTypeMap[Exclude<T, "none">], callback: (value: unknown) => void) => unknown;
  persist?: boolean;
}): HTMLInputElement;
```

Creates a color control.

#### Type Parameters

##### T

`T` *extends* `"none"` \| `"vec3"`

#### Parameters

##### params

###### type

`T`

The GLSL type. Set to `"none"` to omit uniform generation.

###### label

`string`

The control's label, storage, and uniform name.

###### value

\[`number`, `number`, `number`\]

The default color as `[r, g, b]`, each in the range `[0, 1]`.

###### scope

() => `unknown`

Returns the storage and uniform scope.

###### uniform?

(`value`: [`TuneGLSLTypeMap`](TuneGLSLTypeMap.md)\[`Exclude`\<`T`, `"none"`\>\], `callback`: (`value`: `unknown`) => `void`) => `unknown`

Defaults to [defaultUniform()](#defaultuniform).
Assigns the callback value to the uniform.

###### persist?

`boolean`

Defaults to `true`. Whether to save data to storage.

#### Returns

`HTMLInputElement`

The input element.

***

### range()

```ts
range<T extends "none" | "float" | "int">(params: {
  type: T;
  label: string;
  min: number;
  max: number;
  value: number;
  scope: () => unknown;
  uniform?: (value: TuneGLSLTypeMap[Exclude<T, "none">], callback: (value: unknown) => void) => unknown;
  persist?: boolean;
}): HTMLInputElement;
```

Creates a range control.

#### Type Parameters

##### T

`T` *extends* `"none"` \| `"float"` \| `"int"`

#### Parameters

##### params

###### type

`T`

The GLSL type. Set to `"none"` to omit uniform generation.

###### label

`string`

The control's label, storage, and uniform name.

###### min

`number`

The lowest range value.

###### max

`number`

The greatest range value.

###### value

`number`

The default value within `[min, max]`.

###### scope

() => `unknown`

Returns the storage and uniform scope.

###### uniform?

(`value`: [`TuneGLSLTypeMap`](TuneGLSLTypeMap.md)\[`Exclude`\<`T`, `"none"`\>\], `callback`: (`value`: `unknown`) => `void`) => `unknown`

Defaults to [defaultUniform()](#defaultuniform).
Assigns the callback value to the uniform.

###### persist?

`boolean`

Defaults to `true`. Whether to save data to storage.

#### Returns

`HTMLInputElement`

The input element.

***

### text()

```ts
text<T extends "none" | "sampler2D">(params: {
  type: T;
  label: string;
  value: string;
  scope: () => unknown;
  uniform?: (value: TuneGLSLTypeMap[Exclude<T, "none">], callback: (value: unknown) => void) => unknown;
  persist?: boolean;
}): HTMLInputElement;
```

Creates a text control.

#### Type Parameters

##### T

`T` *extends* `"none"` \| `"sampler2D"`

#### Parameters

##### params

###### type

`T`

The GLSL type. Set to `"none"` to omit uniform generation.

###### label

`string`

The control's label, storage, and uniform name.

###### value

`string`

The default text.

###### scope

() => `unknown`

Returns the storage and uniform scope.

###### uniform?

(`value`: [`TuneGLSLTypeMap`](TuneGLSLTypeMap.md)\[`Exclude`\<`T`, `"none"`\>\], `callback`: (`value`: `unknown`) => `void`) => `unknown`

Defaults to [defaultUniform()](#defaultuniform).
Assigns the callback value to the uniform.

###### persist?

`boolean`

Defaults to `true`. Whether to save data to storage.

#### Returns

`HTMLInputElement`

The input element.

***

### select()

```ts
select<T extends "none" | "int">(params: {
  type: T;
  label: string;
  options: string[];
  value: number;
  scope: () => unknown;
  uniform?: (value: TuneGLSLTypeMap[Exclude<T, "none">], callback: (value: unknown) => void) => unknown;
  persist?: boolean;
}): HTMLSelectElement;
```

Creates a select control.

#### Type Parameters

##### T

`T` *extends* `"none"` \| `"int"`

#### Parameters

##### params

###### type

`T`

The GLSL type. Set to `"none"` to omit uniform generation.

###### label

`string`

The control's label, storage, and uniform name.

###### options

`string`[]

The option values.

###### value

`number`

The default selected option's index.

###### scope

() => `unknown`

Returns the storage and uniform scope.

###### uniform?

(`value`: [`TuneGLSLTypeMap`](TuneGLSLTypeMap.md)\[`Exclude`\<`T`, `"none"`\>\], `callback`: (`value`: `unknown`) => `void`) => `unknown`

Defaults to [defaultUniform()](#defaultuniform).
Assigns the callback value to the uniform.

###### persist?

`boolean`

Defaults to `true`. Whether to save data to storage.

#### Returns

`HTMLSelectElement`

The select element.

***

### menuKey()

```ts
menuKey(params: {
  label: string;
  value: string;
}): HTMLInputElement;
```

Creates a text control. Configures the key that toggles the menu UI's visibility.

#### Parameters

##### params

###### label

`string`

The control's label and storage name.

###### value

`string`

The default keyboard key.

#### Returns

`HTMLInputElement`

The input element.

***

### exportSettings()

```ts
exportSettings(params: {
  label: string;
  value: string;
  filter?: (tokens: [scope: unknown, label: unknown], value: unknown) => boolean;
}): {
  button: HTMLInputElement;
  text: HTMLInputElement;
};
```

Creates a button control with the given arguments and a text control underneath it. Sets the text field value to
a JSON string containing the filtered public storage values.

#### Parameters

##### params

###### label

`string`

The control's label name.

###### value

`string`

The button's displayed text.

###### filter?

(`tokens`: \[`scope`: `unknown`, `label`: `unknown`\], `value`: `unknown`) => `boolean`

Defaults to
`undefined`. Filters storage entries based on their deserialized key tokens and corresponding values. Entries
whose keys cannot be deserialized are skipped.

#### Returns

```ts
{
  button: HTMLInputElement;
  text: HTMLInputElement;
}
```

The input elements.

##### button

```ts
button: HTMLInputElement;
```

##### text

```ts
text: HTMLInputElement;
```

***

### importSettings()

```ts
importSettings(params: {
  label: string;
  value: string;
}): {
  button: HTMLInputElement;
  text: HTMLInputElement;
};
```

Creates a button control with the given arguments and a text control underneath it. Parses the JSON string in
the text field and updates storage.

#### Parameters

##### params

###### label

`string`

The control's label name.

###### value

`string`

The button's displayed text.

#### Returns

```ts
{
  button: HTMLInputElement;
  text: HTMLInputElement;
}
```

The input elements.

##### button

```ts
button: HTMLInputElement;
```

##### text

```ts
text: HTMLInputElement;
```

***

### resetSettings()

```ts
resetSettings(params: {
  label: string;
  value: string;
  filter?: (tokens: [scope: unknown, label: unknown], value: unknown) => boolean;
}): HTMLInputElement;
```

Creates a button control. Recreates storage while preserving private data.

#### Parameters

##### params

###### label

`string`

The control's label name.

###### value

`string`

The button's displayed text.

###### filter?

(`tokens`: \[`scope`: `unknown`, `label`: `unknown`\], `value`: `unknown`) => `boolean`

Defaults to
`undefined`. Filters storage entries to delete based on their deserialized key tokens and corresponding values.
Entries whose keys cannot be deserialized are preserved.

#### Returns

`HTMLInputElement`

The input element.

## Menu Methods

### isMenuCreated

#### Get Signature

```ts
get isMenuCreated(): boolean;
```

Returns `true` if [menu()](#menu) has been called.

##### Returns

`boolean`

***

### menu()

```ts
menu(): HTMLFieldSetElement;
```

Creates a menu UI containing the created controls.

#### Returns

`HTMLFieldSetElement`

The menu element.

## State Methods

### generateUniforms()

```ts
generateUniforms(params?: {
  scopes?: unknown[];
  definitions?: Record<string, {
     type: "float" | "bool" | "int" | "vec3" | "sampler2D";
     value: unknown;
  }>;
}): Record<string, {
  type: "float" | "bool" | "int" | "vec3" | "sampler2D";
  value: unknown;
}>;
```

Generates uniform definitions.

#### Parameters

##### params?

###### scopes?

`unknown`[]

Defaults to `undefined`. Specifies which scope to use for each registered
control when generating uniform definitions.

###### definitions?

`Record`\<`string`, \{
  `type`: `"float"` \| `"bool"` \| `"int"` \| `"vec3"` \| `"sampler2D"`;
  `value`: `unknown`;
\}\>

Defaults
to `undefined`. Additional uniform definitions to include. Overrides existing definitions with matching keys.

#### Returns

`Record`\<`string`, \{
  `type`: `"float"` \| `"bool"` \| `"int"` \| `"vec3"` \| `"sampler2D"`;
  `value`: `unknown`;
\}\>

The generated uniform
definitions.

***

### glslUniforms()

```ts
glslUniforms(definitions: Record<string, {
  type: "float" | "bool" | "int" | "vec3" | "sampler2D";
  value: unknown;
}>): string;
```

Generates GLSL uniform declarations (e.g. `"uniform int foo;"`).

#### Parameters

##### definitions

`Record`\<`string`, \{
  `type`: `"float"` \| `"bool"` \| `"int"` \| `"vec3"` \| `"sampler2D"`;
  `value`: `unknown`;
\}\>

The uniform
definitions to generate GLSL declarations for.

#### Returns

`string`

The uniform declarations.

***

### resetState()

```ts
resetState(): void;
```

Loads and validates storage values, updates uniforms, and synchronizes control values.

#### Returns

`void`
