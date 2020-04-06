"use strict";

// CONSTANTS
const kSymTry = Symbol("kSymTry");

class ASTDeps {
    constructor() {
        Object.defineProperty(this, kSymTry, { value: false, writable: true });
        this.dependencies = Object.create(null);
    }

    get isInTryStmt() {
        return this[kSymTry];
    }

    set isInTryStmt(value) {
        if (typeof value !== "boolean") {
            throw new TypeError("value must be a boolean!");
        }

        this[kSymTry] = value;
    }

    removeByName(name) {
        if (Reflect.has(this.dependencies, name)) {
            delete this.dependencies[name];
        }
    }

    add(depName, location = null, unsafe = false) {
        if (depName.trim() === "") {
            return;
        }
        const dep = {
            unsafe,
            inTry: this.isInTryStmt
        };
        if (location !== null) {
            dep.location = location;
        }
        this.dependencies[depName] = dep;
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

module.exports = ASTDeps;
