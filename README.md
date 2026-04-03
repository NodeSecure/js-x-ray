<p align="center">
  <img src="https://user-images.githubusercontent.com/4438263/213887379-c873eb89-8786-4b5c-8a59-dcca49e01cb8.jpg" alt="@nodesecure/js-x-ray">
</p>

<p align="center">
  <a href="https://github.com/NodeSecure/js-x-ray">
    <img src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/NodeSecure/js-x-ray/refs/heads/master/workspaces/js-x-ray/package.json&query=$.version&label=Version" alt="npm version">
  </a>
  <a href="https://github.com/NodeSecure/js-x-ray/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/NodeSecure/js-x-ray.svg?style=for-the-badge" alt="license">
  </a>
  <a href="https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray">
    <img src="https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray/badge?style=for-the-badge" alt="ossf scorecard">
  </a>
  <a href="https://slsa.dev/spec/v1.0/levels#build-l3">
    <img src="https://img.shields.io/badge/SLSA-level%203-green?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABMlBMVEXvMQDvMADwMQDwMADwMADvMADvMADwMADwMQDvMQDvMQDwMADwMADvMADwMADwMADwMQDvMQDvMQDwMQDvMQDwMQDwMADwMADwMQDwMADwMADvMADvMQDvMQDwMADwMQDwMADvMQDwMADwMQDwMADwMADwMADwMADwMADwMADvMQDvMQDwMADwMQDwMADvMQDvMQDwMADvMQDvMQDwMADwMQDwMQDwMQDvMQDwMADvMADwMADwMQDvMQDwMADwMQDwMQDwMQDwMQDvMQDvMQDvMADwMADvMADvMADvMADwMQDwMQDvMADvMQDvMQDvMADvMADvMQDwMQDvMQDvMADvMADvMADvMQDwMQDvMQDvMQDvMADvMADwMADvMQDvMQDvMQDvMADwMADwMQDwMAAAAAA/HoSwAAAAY3RSTlMpsvneQlQrU/LQSWzvM5DzmzeF9Pi+N6vvrk9HuP3asTaPgkVFmO3rUrMjqvL6d0LLTVjI/PuMQNSGOWa/6YU8zNuDLihJ0e6aMGzl8s2IT7b6lIFkRj1mtvQ0eJW95rG0+Sid59x/AAAAAWJLR0Rltd2InwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB+YHGg0tGLrTaD4AAACqSURBVAjXY2BgZEqGAGYWVjYGdg4oj5OLm4eRgZcvBcThFxAUEk4WYRAVE09OlpCUkpaRTU6WY0iWV1BUUlZRVQMqUddgSE7W1NLS1gFp0NXTB3KTDQyNjE2Sk03NzC1A3GR1SytrG1s7e4dkBogtjk7OLq5uyTCuu4enl3cyhOvj66fvHxAIEmYICg4JDQuPiAQrEmGIio6JjZOFOjSegSHBBMpOToxPAgCJfDZC/m2KHgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0wNy0yNlQxMzo0NToyNCswMDowMC8AywoAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMDctMjZUMTM6NDU6MjQrMDA6MDBeXXO2AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg==" alt="slsa level3">
  </a>
  <a href="https://github.com/NodeSecure/js-x-ray/actions?query=workflow%3A%22Node.js+CI%22">
    <img src="https://img.shields.io/github/actions/workflow/status/NodeSecure/js-x-ray/node.js.yml?style=for-the-badge" alt="github ci workflow">
  </a>
</p>

**JS-X-Ray** is a JavaScript & TypeScript [SAST](https://github.com/resources/articles/what-is-sast) for identifying malicious patterns, security vulnerabilities, and code anomalies. Think of it as ESLint, but dedicated to security analysis. Originally created for [NodeSecure CLI](https://github.com/NodeSecure/cli), JS-X-Ray has become an independent and serious option for supply chain protection.

## 🔎 How It Works

JS-X-Ray parses JS or TS code into an **Abstract Syntax Tree (AST)** with no extensive usage of RegEx or Semgrep rules. This enables variable tracing, dynamic import resolution, and detection of sophisticated obfuscation that pattern-matching tools miss. The tradeoff is that JS-X-Ray is purely dedicated to the JavaScript/TypeScript ecosystem.

## 💡 Features

- Track `require()`, `import`, and dynamic imports with full variable tracing
- Detect obfuscated code and identify the tool used (jsfuck, jjencode, obfuscator.io, and more)
- Flag malicious patterns: data exfiltration, `process.env` serialization, unsafe shell commands
- Detect vulnerable code: `eval()`, `Function()` constructor, ReDoS-prone regexes, SQL injection
- Flag weak cryptographic algorithms (MD5, SHA1, etc.)
- Extract infrastructure indicators: URLs, IPs, hostnames, emails
- Configurable sensitivity modes (conservative/aggressive) and extensible probe system
- Supports both JavaScript and TypeScript

## 💃 Getting Started

These packages are available in the Node package repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/js-x-ray
# or
$ yarn add @nodesecure/js-x-ray
```

## 👀 Usage

```js
import { AstAnalyser } from "@nodesecure/js-x-ray";

const scanner = new AstAnalyser();

const { warnings, dependencies } = await scanner.analyseFile("./file.js");

console.log(dependencies);
console.dir(warnings, { depth: null });
```

For the full API documentation, warning catalog, and advanced usage, see the [@nodesecure/js-x-ray package README](./workspaces/js-x-ray/README.md).

## Workspaces

- [@nodesecure/js-x-ray](./workspaces/js-x-ray)
- [@nodesecure/js-x-ray-ai](./workspaces/js-x-ray-ai)

## 🐥 Contributors guide

If you are a developer **looking to contribute** to the project, you must first read the [CONTRIBUTING](./CONTRIBUTING.md) guide.

Once you have finished your development, check that the tests (and linter) are still good by running the following script:

```bash
$ npm run check
```

> [!CAUTION]
> In case you introduce a new feature or fix a bug, make sure to include tests for it as well.

### Internal APIs

For contributors working on the JS-X-Ray internals, the following resources document low-level utilities and AST manipulation patterns:

- [ESTree utilities](./workspaces/js-x-ray/src/estree/README.md) - Low-level helpers to manipulate ESTree AST nodes
- [ESTree assignment and declaration patterns (french)](./workspaces/js-x-ray/docs/estree/patterns-french.md) - Reference guide for JavaScript assignment and declaration patterns in AST form

### Benchmarks

The performance of js-x-ray is measured and tracked using [mitata](https://github.com/evanwashere/mitata).

To run the benchmarks:
1. Navigate to `workspaces/js-x-ray`.
2. Run `npm run bench`.

The benchmark results are stored in workspaces/js-x-ray/benchmark/report.json. Do not edit this file manually; it is automatically updated on every pull request.

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-25-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=fraxken" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/js-x-ray/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/NodeSecure/js-x-ray/issues?q=author%3Afraxken" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Rossb0b"><img src="https://avatars.githubusercontent.com/u/39910164?v=4?s=100" width="100px;" alt="Nicolas Hallaert"/><br /><sub><b>Nicolas Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Rossb0b" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/antoine-coulon"><img src="https://avatars.githubusercontent.com/u/43391199?v=4?s=100" width="100px;" alt="Antoine"/><br /><sub><b>Antoine</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=antoine-coulon" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Mathieuka"><img src="https://avatars.githubusercontent.com/u/34446722?v=4?s=100" width="100px;" alt="Mathieu"/><br /><sub><b>Mathieu</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Mathieuka" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Kawacrepe"><img src="https://avatars.githubusercontent.com/u/40260517?v=4?s=100" width="100px;" alt="Vincent Dhennin"/><br /><sub><b>Vincent Dhennin</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Kawacrepe" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=Kawacrepe" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://tonygo.dev"><img src="https://avatars.githubusercontent.com/u/22824417?v=4?s=100" width="100px;" alt="Tony Gorez"/><br /><sub><b>Tony Gorez</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=tony-go" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=tony-go" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=tony-go" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PierreDemailly"><img src="https://avatars.githubusercontent.com/u/39910767?v=4?s=100" width="100px;" alt="PierreD"/><br /><sub><b>PierreD</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=PierreDemailly" title="Tests">⚠️</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=PierreDemailly" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/franck-hallaert/"><img src="https://avatars.githubusercontent.com/u/110826655?v=4?s=100" width="100px;" alt="Franck Hallaert"/><br /><sub><b>Franck Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Aekk0" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://maji.kiwi"><img src="https://avatars.githubusercontent.com/u/33150916?v=4?s=100" width="100px;" alt="Maji"/><br /><sub><b>Maji</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=M4gie" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/targos"><img src="https://avatars.githubusercontent.com/u/2352663?v=4?s=100" width="100px;" alt="Michaël Zasso"/><br /><sub><b>Michaël Zasso</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=targos" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/issues?q=author%3Atargos" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fabnguess"><img src="https://avatars.githubusercontent.com/u/72697416?v=4?s=100" width="100px;" alt="Kouadio Fabrice Nguessan"/><br /><sub><b>Kouadio Fabrice Nguessan</b></sub></a><br /><a href="#maintenance-fabnguess" title="Maintenance">🚧</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=fabnguess" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jean-michelet"><img src="https://avatars.githubusercontent.com/u/110341611?v=4?s=100" width="100px;" alt="Jean"/><br /><sub><b>Jean</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=jean-michelet" title="Tests">⚠️</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=jean-michelet" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=jean-michelet" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tchapacan"><img src="https://avatars.githubusercontent.com/u/28821702?v=4?s=100" width="100px;" alt="tchapacan"/><br /><sub><b>tchapacan</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=tchapacan" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=tchapacan" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://miikkak.dev"><img src="https://avatars.githubusercontent.com/u/65869801?v=4?s=100" width="100px;" alt="mkarkkainen"/><br /><sub><b>mkarkkainen</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=mkarkkainen" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/FredGuiou"><img src="https://avatars.githubusercontent.com/u/99122562?v=4?s=100" width="100px;" alt="FredGuiou"/><br /><sub><b>FredGuiou</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=FredGuiou" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=FredGuiou" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/madina0801"><img src="https://avatars.githubusercontent.com/u/101329759?v=4?s=100" width="100px;" alt="Madina"/><br /><sub><b>Madina</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=madina0801" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sairuss7"><img src="https://avatars.githubusercontent.com/u/87803528?v=4?s=100" width="100px;" alt="SairussDev"/><br /><sub><b>SairussDev</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=sairuss7" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fless-lab"><img src="https://avatars.githubusercontent.com/u/71844440?v=4?s=100" width="100px;" alt="Abdou-Raouf ATARMLA"/><br /><sub><b>Abdou-Raouf ATARMLA</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=fless-lab" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://clementgombauld.netlify.app/"><img src="https://avatars.githubusercontent.com/u/91478082?v=4?s=100" width="100px;" alt="Clement Gombauld"/><br /><sub><b>Clement Gombauld</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=clemgbld" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=clemgbld" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/intincrab"><img src="https://avatars.githubusercontent.com/u/93028153?v=4?s=100" width="100px;" alt="Ajāy "/><br /><sub><b>Ajāy </b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=intincrab" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://michael.mior.ca"><img src="https://avatars.githubusercontent.com/u/82501?v=4?s=100" width="100px;" alt="Michael Mior"/><br /><sub><b>Michael Mior</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=michaelmior" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/7amed3li"><img src="https://avatars.githubusercontent.com/u/190534558?v=4?s=100" width="100px;" alt="Hamed Mohamed"/><br /><sub><b>Hamed Mohamed</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=7amed3li" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bashlor"><img src="https://avatars.githubusercontent.com/u/39790502?v=4?s=100" width="100px;" alt="Elie Patrice"/><br /><sub><b>Elie Patrice</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=bashlor" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://securityinit.tistory.com/"><img src="https://avatars.githubusercontent.com/u/78394999?v=4?s=100" width="100px;" alt="HoyeongJeon"/><br /><sub><b>HoyeongJeon</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=HoyeongJeon" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Anne-Flower"><img src="https://avatars.githubusercontent.com/u/139115974?v=4?s=100" width="100px;" alt="Anne-Flore"/><br /><sub><b>Anne-Flore</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Anne-Flower" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
