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

    add(depName) {
        this.dependencies[depName] = {
            inTry: this.isInTryStmt
        };
    }

    get size() {
        return Object.keys(this.dependencies).length;
    }

    * getDependenciesInTryStatement() {
        for (const [depName, props] of Object.entries(this.dependencies)) {
            if (props.inTry === true) {
                yield depName;
            }
        }
    }

    * [Symbol.iterator]() {
        yield* Object.keys(this.dependencies);
    }
}

module.exports = ASTDeps;
