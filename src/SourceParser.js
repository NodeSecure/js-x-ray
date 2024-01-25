export class SourceParser {
  /**
   * @param {!string} source
   * @param {object} options
   * @param {boolean} [options.removeHTMLComments=false]
   */
  constructor(source, options = {}) {
    if (typeof source !== "string") {
      throw new TypeError("source must be a string");
    }
    const { removeHTMLComments = false } = options;

    this.raw = source;

    /**
     * if the file start with a shebang then we remove it because meriyah.parseScript fail to parse it.
     * @example
     * #!/usr/bin/env node
     */
    const rawNoShebang = source.charAt(0) === "#" ?
      source.slice(source.indexOf("\n") + 1) : source;

    this.source = removeHTMLComments ?
      this.#removeHTMLComment(rawNoShebang) : rawNoShebang;
  }

  /**
   * @param {!string} str
   * @returns {string}
   */
  #removeHTMLComment(str) {
    return str.replaceAll(/<!--[\s\S]*?(?:-->)/g, "");
  }
}
