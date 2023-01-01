
export default class ASTDeps {
  #inTry = false;
  dependencies = Object.create(null);

  get isInTryStmt() {
    return this.#inTry;
  }

  set isInTryStmt(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("value must be a boolean!");
    }

    this.#inTry = value;
  }

  removeByName(name) {
    if (Reflect.has(this.dependencies, name)) {
      delete this.dependencies[name];
    }
  }

  add(depName, location = null, unsafe = false) {
    if (typeof depName !== "string" || depName.trim() === "") {
      return;
    }

    const cleanDepName = depName.charAt(depName.length - 1) === "/" ? depName.slice(0, -1) : depName;
    const dep = {
      unsafe,
      inTry: this.isInTryStmt
    };
    if (location !== null) {
      dep.location = location;
    }
    this.dependencies[cleanDepName] = dep;
  }

  has(depName) {
    if (depName.trim() === "") {
      return false;
    }

    return Reflect.has(this.dependencies, depName);
  }

  get size() {
    return Object.keys(this.dependencies).length;
  }

  * getDependenciesInTryStatement() {
    for (const [depName, props] of Object.entries(this.dependencies)) {
      if (props.inTry === true && props.unsafe === false) {
        yield depName;
      }
    }
  }

  * [Symbol.iterator]() {
    yield* Object.keys(this.dependencies);
  }
}
