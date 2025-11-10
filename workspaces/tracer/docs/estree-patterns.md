# Patterns de déclarations et assignations ESTree

Ce document catalogue tous les patterns ESTree pour déclarer, assigner et manipuler des identifiants dans le code JavaScript. Il présente une vue d'ensemble complète des différentes manières dont les valeurs peuvent être créées et propagées à travers le code.

## Vue d'ensemble

L'analyse statique du code JavaScript nécessite de comprendre toutes les façons dont les valeurs peuvent être déclarées, assignées et propagées. Ce document explore :

- Les imports et exports de modules (ESM et CommonJS)
- Les déclarations de variables et leurs initialiseurs
- Les assignations et réassignations
- Les patterns de destructuration
- Les expressions logiques et conditionnelles
- Les appels de fonctions et leurs valeurs de retour
- Les accès aux objets globaux et leurs propriétés

---

## ImportDeclaration

ECMAScript 6 import declaration pour charger des modules de manière statique.

**Référence:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

```js
import defaultExport from "module-name";
import * as name from "module-name";
import { export1 } from "module-name";
import { export1 as alias1 } from "module-name";
import { default as alias } from "module-name";
import { export1, export2 } from "module-name";
import { export1, export2 as alias2, /* … */ } from "module-name";
import { "string name" as alias } from "module-name";
import defaultExport, { export1, /* … */ } from "module-name";
import defaultExport, * as name from "module-name";
import "module-name";
```

### Namespace imports

Capture l'objet complet du module dans un binding local. Toutes les propriétés exportées deviennent accessibles via l'alias.

```js
import * as cryptoNS from "crypto";
const hash = cryptoNS.createHash("sha256"); // tracé comme crypto.createHash

import * as fs from "node:fs";
fs.readFileSync("file.txt"); // tracé comme fs.readFileSync
```

### Named and aliased imports

Chaque specifier crée un binding local vers l'export correspondant.

```js
import { createHash } from "crypto";               // binding direct
import { createHash as makeHash } from "crypto";   // aliasing avec renommage
import { default as alias } from "module-name";    // default exporté avec alias
import { randomBytes, randomUUID as uuid } from "crypto"; // multiples imports
```

### Mixed imports

Combine default et named exports dans une seule déclaration.

```js
import crypto, { createHash, randomBytes } from "crypto";
import defaultExport, { export1, export2 as alias } from "module";
```

### Side-effect only imports

Import sans binding, utilisé pour charger des modules qui s'exécutent au chargement.

```js
import "module-name";
import "node:crypto";
```

---

## ImportExpression

Import dynamique permettant le chargement conditionnel ou lazy de modules.

**Référence:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import

### Import avec await

```js
const crypto = await import("crypto");
const { createHash } = await import("crypto");
```

### Import avec Promise

```js
import("crypto").then(mod => mod.createHash("sha256"));
import("fs").then(({ readFile }) => readFile("file.txt"));
```

### Import avec valeur dynamique

```js
const moduleName = "crypto";
const mod = await import(moduleName);

const modules = ["fs", "path", "crypto"];
const loaded = await Promise.all(modules.map(name => import(name)));
```

---

## AssignmentExpression

**Type ESTree:** `AssignmentExpression`  
**Opérateur:** `=`, `+=`, `-=`, `*=`, etc.

Couvre les réassignations en dehors des déclarations, y compris les assignations avec patterns de destructuration.

### Assignations simples

```js
foo = require("fs");                    // Assigne require à une variable existante
processAlias = process;                 // Alias d'un global
globalRef = Function("return this")(); // Capture du contexte global
```

### Assignations avec destructuration

Les patterns complexes sont résolus pour extraire les bindings individuels.

```js
({ createHash } = require("crypto"));           // ObjectPattern
({ process: globalProcess } = globalThis);      // Renommage dans ObjectPattern
[spawn, exec] = [cp.spawn, cp.exec];           // ArrayPattern
```

### Assignations en chaîne

Chaque assignation dans la chaîne propage le binding.

```js
const a = b = require("crypto"); // b et a pointent tous deux vers crypto
```

### Compound assignment operators

Les opérateurs d'assignation composés peuvent modifier des bindings existants.

```js
let req = null;
req ||= require;        // Logical OR assignment (req = req || require)
req ??= require;        // Nullish coalescing assignment
req &&= require("fs");  // Logical AND assignment
```

### Assignations par référence indirecte

Assignations via des propriétés d'objets ou des méthodes de réflexion.

```js
const obj = {};
obj["require"] = require;           // Bracket notation
obj.req = require;                  // Dot notation

Reflect.set(global, "myRequire", require);
Object.defineProperty(globalThis, "hiddenRequire", {
  value: require
});
```

### Assignations dans des contextes fonctionnels

```js
(function(r) { globalThis.req = r; })(require);
((r) => { global.req = r; })(require);
```

---

## SequenceExpression

**Type ESTree:** `SequenceExpression`

Une séquence d'expressions séparées par des virgules, évaluées de gauche à droite. Peut contenir plusieurs `AssignmentExpression` qui doivent toutes être traitées.

### Assignations multiples en séquence

```js
(a = 5, b = 10, c = a + b); // Trois expressions évaluées séquentiellement
```

### Séquences dans des paramètres

Utilisation dans des contextes de paramètres de fonctions.

```js
const fn = (cp = require("child_process"), cp.spawn);
// cp est assigné puis utilisé dans la même expression
```

### Séquences dans des CallExpression

```js
module.exports = (cache = require("module"), cache.init());
const socket = (factory(), require("net"));
```

### Séquences complexes

```js
const x = (a = 1, b = (c = require("fs"), c.readFileSync), b("file"));
if (x = require("crypto"), y = x.createHash, true) { /* ... */ }
```

---

## VariableDeclaration

**Type ESTree:** `VariableDeclaration`  
**Mots-clés:** `var`, `let`, `const`

VariableDeclaration node can have one or many `VariableDeclarator` nodes.

### Déclaration simple

```js
const a = 5;
```

### Déclarations multiples

```js
var a, b, c = 10;
let x = 1, y = 2, z;
```

### Hoisting avec var

```js
function outer() {
  if (false) {
    var hidden = require("fs"); // Hoisté au scope de la fonction
  }
  return hidden; // Accessible (undefined si le if n'est pas exécuté)
}
```

### VariableDeclarator

Un `VariableDeclarator` peut être initialisé à `null` ou avec différents types d'expressions.

```js
var foo; // no initialization 

const { foo } = {}; // ObjectPattern + ObjectExpression
const [A=5] = []; // ArrayPattern + ArrayExpression
```

#### Literal initializer

Stocke une valeur primitive.

```js
const a = "value";
const port = 8080;
const enabled = true;
```

**Utilisation en composition:**

```js
const moduleName = "crypto";
const hash = require(moduleName);
```

#### Identifier aliasing

Simple aliasing of another identifier (including globals).

```js
const cryptoAlias = crypto;
const root = globalThis;
```

#### MemberExpression aliasing

Tracks assignments that reference a property path or callable helper.

```js
const call = Function.prototype.call;
const mainRequire = process.mainModule.require;
```

#### CallExpression initializer

Records module bindings, return-value assignments and global exposure patterns.

**Require patterns** (famille `require`) :
```js
const crypto = require("crypto");                        // require standard
const path = require.resolve("./module");                // require.resolve
const main = require.main;                               // require.main
const http = process.mainModule.require("http");         // process.mainModule.require
const fs = process.getBuiltinModule("fs");               // process.getBuiltinModule (Node.js 22+)
```

**Destructuring from require** :
```js
const { createHash } = require("crypto");                // Extraction directe
const { randomBytes: getRandom } = require("crypto");    // Avec renommage
const { promises: { readFile } } = require("fs");        // Nested destructuring
```

**Unsafe global calls** (`eval`, `Function`) :
```js
const globalRef = eval("this");                          // eval exposing global
const getGlobal = Function("return this")();             // Function constructor
const g = (0, eval)("this");                             // Indirect eval
```

**Base64 decoding** (atob) :
```js
const decoded = atob("aGVsbG8=");                        // Decode et store dans literalIdentifiers
const secret = atob(encodedString);                      // Si encodedString est literal
```

**Neutral callable wrappers** (Function.prototype.call/apply/bind) :
```js
const http = Function.prototype.call.call(require, require, "http");
const crypto = Function.prototype.apply.call(require, null, ["crypto"]);
const bound = Function.prototype.bind.call(require, null, "fs");
```

**Return value assignments** (si `followReturnValueAssignement` activé) :
```js
// Si une fonction tracée retourne une valeur qui est assignée
const factory = createFactory();  // factory peut être tracé si createFactory est surveillé
```

#### LogicalExpression fallback chain

Each branch is inspected to find viable initializers.

```js
var root =
  freeGlobal ||
  freeSelf ||
  Function("return this")();
```

**Cas d'usage courant** : Détection d'environnement et fallback vers une valeur par défaut.

```js
// Pattern utilisé par lodash et d'autres libs
const root = 
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof self !== 'undefined' && self) ||
  (typeof window !== 'undefined' && window) ||
  Function('return this')();

// Pattern de détection de require
const req = typeof require !== 'undefined' ? require : null;
```

**Extraction logique** : Chaque branche (`||`, `&&`, `??`) est analysée séparément pour trouver les identifiants tracés.

```js
const crypto = needsCrypto && require("crypto");  // require tracé dans la branche droite
const fs = hasFS || require("fs");                // require tracé dans la branche droite
```

#### ObjectExpression / ArrayExpression traversal

Nested properties and spread elements are recursively analysed to catch embedded calls or literals.

```js
const config = {
  host: os.hostname(),
  ...defaults,
  hash: require("crypto").createHash("sha1")
};

const modules = [
  require("fs"),
  ...builtins
];
```

### Destructuring patterns

#### ObjectPattern from call expressions

```js
const { createHash, randomUUID: uuid } = require("crypto");
const {
  mainModule: { require: mainRequire }
} = process;
```

#### ObjectPattern from global aliases

```js
const { process, Buffer } = globalThis;
const { process: procAlias } = global;
```

#### ArrayPattern destructuring

Supports default values and nested patterns.

```js
const [hashFn = require("crypto").createHash] = factories;
const [{ require: callRequire }] = [process.mainModule];
```

### Nested initializer traversal

Lorsqu'un initialiseur est une object/array expression, l'analyse parcourt récursivement chaque nœud imbriqué (properties, spreads, call expressions).

### Computed property names

Propriétés calculées dynamiquement dans les destructurations.

```js
const key = "crypto";
const { [key]: hiddenCrypto } = { crypto: require("crypto") };
```

### Template literals et concaténation

```js
const mod = `cry` + `pto`;
const crypto = require(mod);

const prefix = "child_";
const { spawn } = require(prefix + "process");
```

### Générateurs et async patterns

```js
function* loader() {
  const crypto = yield require("crypto");
  return crypto;
}

async function asyncLoader() {
  const fs = await Promise.resolve(require("fs"));
}
```

### Setters et getters

```js
const obj = {
  set crypto(val) { this._c = val; },
  get crypto() { return this._c; }
};
obj.crypto = require("crypto");
```

---

## Global identifier tracking

Les identifiants globaux comme `globalThis`, `global`, `root`, `GLOBAL` et `window` peuvent être utilisés de manière interchangeable pour accéder au contexte global.

### Résolution d'alias globaux

```js
const test = globalThis;
const foo = test.require; // résolu comme globalThis.require → require

const { process: aName } = globalThis;
const boo = aName.mainModule.require; // résolu comme process.mainModule.require
```

### Accès indirect aux globaux

```js
const getGlobal = Function("return this");
const g = getGlobal();
const req = g.require;
```

---

### ConditionalExpression (ternaire)

Expressions conditionnelles pour sélectionner des valeurs.

```js
const req = Math.random() > 0.5 ? require : require;
const fs = true ? require("fs") : null;
const crypto = condition ? require("crypto") : alternative;
```

### NewExpression

Les constructeurs appelés avec `new` ne sont pas tous tracés.

```js
const Fn = Function;
const globalRef = new Fn("return this")();
```

### TaggedTemplateExpression

Les template tags peuvent exécuter du code arbitraire.

```js
function evil(strings, ...values) {
  return require(values[0]);
}
const crypto = evil`${"crypto"}`;
```

### WithStatement (deprecated mais possible)

```js
with (globalThis) {
  const req = require; // Peut échapper à la détection
}
```

### TryStatement avec catch binding

```js
try {
  throw require;
} catch (req) {
  req("fs"); // req contient require
}
```

### ForOfStatement et ForInStatement

Assignations dans les boucles.

```js
for (const module of [require("fs"), require("crypto")]) {
  // module contient alternativement fs puis crypto
}

const modules = { fs: require("fs") };
for (const key in modules) {
  const mod = modules[key]; // Non tracé
}
```

### UpdateExpression

Incrémentation/décrémentation peuvent modifier des références.

```js
let idx = 0;
const modules = [require, otherFunc];
const req = modules[idx++]; // Non tracé
```

### ClassDeclaration avec propriétés statiques

```js
class Loader {
  static require = require;
  static fs = require("fs");
}

const fs = Loader.fs; // Peut échapper
```

### ObjectMethod et ClassMethod

```js
const obj = {
  getRequire() {
    return require;
  }
};

const req = obj.getRequire(); // Retour de fonction non tracé
```

### ArrowFunctionExpression retournant directement

```js
const getRequire = () => require;
const req = getRequire(); // Non tracé comme return value
```

### YieldExpression dans les générateurs

```js
function* moduleLoader() {
  yield require("fs");
  yield require("crypto");
}

const gen = moduleLoader();
const fs = gen.next().value; // Non tracé
```

### AwaitExpression avec dynamic imports

```js
const crypto = await import("crypto");
// Dynamic import échappe à ImportDeclaration
```

### MetaProperty

```js
// import.meta peut contenir des informations contextuelles
if (import.meta.url.includes("file://")) {
  const fs = require("fs");
}
```

---

## Techniques de manipulation avancées

### Segments de MemberExpression

Décomposition des MemberExpression complexes pour identifier les chemins d'accès.

```js
const crypto = require("crypto");
const createHash = crypto.createHash;

// Plus tard
createHash("sha256");
```

### Bracket notation avec valeurs dynamiques

```js
const prop = "main" + "Module";
const req = process[prop].require;

const key = Math.random() > 0.5 ? "require" : "resolve";
const fn = require[key];
```

### Proxies et interception

```js
const proxyProcess = new Proxy(process, {
  get(target, prop) {
    return target[prop];
  }
});
const req = proxyProcess.mainModule.require;
```

### Obfuscation par concaténation

Construction dynamique de chaînes.

```js
const mod = "cry" + "pto";
const crypto = require(mod);

const prop1 = "main", prop2 = "Module";
const req = process[prop1 + prop2].require;
```

### Méthodes de Array.prototype

```js
const [req] = [require];
const crypto = req("crypto");

const modules = ["fs", "crypto"].map(require);
```

### Fonction constructors et eval indirects

```js
// Indirect eval
const indirectEval = eval;
const global = indirectEval("this");

// Constructor dynamique
const Ctor = globalThis["Func" + "tion"];
const getGlobal = new Ctor("return this");
```

### Object.defineProperty

```js
Object.defineProperty(globalThis, "hiddenRequire", {
  get() { return require; },
  value: require,
  writable: true
});

const fs = hiddenRequire("fs");
```

### Collections pour stocker des références

```js
const secret = new WeakMap();
const key = {};
secret.set(key, require);

const cache = new Map();
cache.set("req", require);

const symbols = new Set([require, eval]);
```

### Symbol comme clés

```js
const sym = Symbol.for("__require__");
globalThis[sym] = require;
const req = globalThis[sym];
```

### Reflect API

```js
const req = Reflect.get(globalThis, "require");
Reflect.set(exports, "dangerous", require("child_process"));
Reflect.defineProperty(global, "hidden", { value: require });
```

### IIFE (Immediately Invoked Function Expression)

```js
const req = (function(r) { return r; })(require);
const crypto = ((r) => r("crypto"))(require);
const mod = (r => r)("crypto", require);
```

### Module.prototype

```js
const Module = require("module");
const req = Module.prototype.require;
const createRequire = Module.createRequire || Module.createRequireFromPath;
```

### Process bindings

```js
const binding = process.binding("fs");
const natives = process.binding("natives");
```

### Object composition

```js
const hiddenExports = Object.assign({}, { require });
const proto = Object.create(null, {
  req: { value: require }
});
const merged = { ...globalThis, custom: require };
```

### Return values et closures

```js
const factory = () => {
  const crypto = require("crypto");
  return crypto.createHash;
};

const hash = factory()("sha256");

function makeRequire() {
  return require;
}
```

### Nested object access

```js
const chain = { nested: { deep: { require } } };
const req = chain.nested.deep.require;

const config = { modules: { fs: require("fs") } };
```

### Rest operator et spreading

```js
const [, , req] = [null, null, require];
const [...reqs] = [require, require.resolve];
const { require: r, ...rest } = globalThis;
```

### Conditional assignments

```js
let req;
(Math.random() > 0.5) && (req = require);

const crypto = (req = require, req)("crypto");
```

### Object shorthand

```js
const r = require;
const modules = { r };
const crypto = modules.r("crypto");
```

### Comma operator

```js
function getRequire() {
  return globalThis, require;
}

const result = (console.log("loading"), require("crypto"));
```

### Logical operators

```js
const req = false || require;
const crypto = null ?? require("crypto");
const fs = undefined || require("fs");
const mod = value && require("module");
```

---

## Catalogue des nodes ESTree

**Déclarations et imports:**
- `ImportDeclaration` (static imports)
- `ImportExpression` (dynamic imports)
- `VariableDeclaration` / `VariableDeclarator`

**Assignations:**
- `AssignmentExpression` (=, +=, -=, etc.)
- `SequenceExpression` (expressions multiples)

**Initialiseurs:**
- `Literal` (valeurs primitives)
- `Identifier` (aliasing)
- `MemberExpression` (accès aux propriétés)
- `CallExpression` (require, eval, Function, etc.)
- `LogicalExpression` (||, &&, ??)
- `ConditionalExpression` (?:)

**Structures de données:**
- `ObjectExpression` / `ArrayExpression`
- `ObjectPattern` / `ArrayPattern` (destructuring)

**Autres patterns:**
- `NewExpression` (constructeurs)
- `TaggedTemplateExpression`
- `TryStatement` (catch bindings)
- `ForOfStatement` / `ForInStatement`
- `UpdateExpression` (++/--)
- `ClassDeclaration` (propriétés statiques)
- `ArrowFunctionExpression` / `FunctionExpression`
- `YieldExpression` / `AwaitExpression`
