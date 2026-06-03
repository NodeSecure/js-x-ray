// Import Node.js Dependencies
import assert from "node:assert";
import { readFileSync, promises as fs } from "node:fs";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

// CONSTANTS
const kFixtureURL = new URL("fixtures/logUsage/", import.meta.url);

describe("log-usage probe", () => {
  it("should detect log methods", async() => {
    const fixtureFiles = await fs.readdir(kFixtureURL);
    for (const fixtureFile of fixtureFiles) {
      const fixture = readFileSync(new URL(fixtureFile, kFixtureURL), "utf-8");
      const { warnings } = new AstAnalyser(
        {
          optionalWarnings: true
        }
      ).analyse(fixture);
      const [firstWarning] = warnings;
      assert.strictEqual(firstWarning.kind, "log-usage");
      assert.strictEqual(firstWarning.severity, "Information");
      assert.strictEqual(firstWarning.value, `${fixtureFile.split(".").slice(0, 2).join(".")}`);
    }
  });

  it("should not generate any warning", () => {
    const code = "console.log(token);";
    const { warnings } = new AstAnalyser().analyse(code);
    assert.strictEqual(warnings.length, 0);
  });

  it("should detect re-assigned console.log", () => {
    const code = `const log = console.log;
                log(token);`;

    const { warnings } = new AstAnalyser({
      optionalWarnings: true
    }).analyse(code);
    const [firstWarning] = warnings;
    assert.strictEqual(firstWarning.kind, "log-usage");
    assert.strictEqual(firstWarning.severity, "Information");
    assert.strictEqual(firstWarning.value, "console.log");
  });

  it("should be able to detect multiple console.log in one warning", () => {
    const code = `console.log(token);
                  console.log(secret)
                  console.log(password);
                  console.debug(password);
  `;
    const { warnings } = new AstAnalyser({
      optionalWarnings: true
    }).analyse(code);
    const [firstWarning] = warnings;
    assert.strictEqual(warnings.length, 1);
    assert.deepEqual(firstWarning.kind, "log-usage");
    assert.strictEqual(firstWarning.value, "console.log, console.debug");
    assert.strictEqual(firstWarning.location?.length, 4);
    assert.ok(Array.isArray(firstWarning.location![0]));
  });

  describe("pino", () => {
    it("should detect log usage", () => {
      const code = `import pino from "pino";
                    const logger = pino();
                    logger.info("hello");
                    logger.warn("hello");
                    logger.error("hello");
                    logger.fatal("hello");
                    logger.debug("hello");
                    logger.trace("hello");
                    `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: true
      }).analyse(code);

      const [firstWarning] = warnings;

      assert.strictEqual(firstWarning.kind, "log-usage");
      assert.strictEqual(firstWarning.severity, "Information");
      assert.strictEqual(firstWarning.value, "logger.info, logger.warn, logger.error, logger.fatal, logger.debug, logger.trace");
    });

    it("should follow the asssignement of pino", () => {
      const code = `import pino from "pino";
                    const pinoBis = pino;
                    const logger = pinoBis();
                    logger.info("hello");
                    `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: true
      }).analyse(code);

      const [firstWarning] = warnings;

      assert.strictEqual(firstWarning.kind, "log-usage");
      assert.strictEqual(firstWarning.severity, "Information");
      assert.strictEqual(firstWarning.value, "logger.info");
    });

    it("should follow the assignement of a pino logger", () => {
      const code = `import pino from "pino";
                    const logger = pino();
                    const loggerBis = logger;
                    loggerBis.info("hello");
                    `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: true
      }).analyse(code);

      const [firstWarning] = warnings;

      assert.strictEqual(firstWarning.kind, "log-usage");
      assert.strictEqual(firstWarning.severity, "Information");
      assert.strictEqual(firstWarning.value, "logger.info");
    });

    it("should follow the assignment of a pino logger function", () => {
      const code = `import pino from "pino";
                    const pinoBis = pino;
                    const logger = pinoBis();
                    const info = logger.info;
                    const infoBis = info;
                    infoBis("hello");
                    `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: true
      }).analyse(code);

      const [firstWarning] = warnings;

      assert.strictEqual(firstWarning.kind, "log-usage");
      assert.strictEqual(firstWarning.severity, "Information");
      assert.strictEqual(firstWarning.value, "logger.info");
    });

    it("should not emit a warning when pino is not imported", () => {
      const code = `const pino = ()=> ({
                    info: () => {
                      }
                    });
                    const logger = pino();
                    logger.info("hello");
                    `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: true
      }).analyse(code);

      assert.strictEqual(warnings.length, 0);
    });

    it("should not conflict with other traced return values", () => {
      const code = `import vm from "node:vm";
                    import pino from "pino";
                    const logger = pino();
                    (new vm.Script(code)).info("hello");
                    `;
      const { warnings } = new AstAnalyser({
        optionalWarnings: true
      }).analyse(code);

      assert.strictEqual(warnings.length, 0);
    });

    describe("logger.child", () => {
      it("should emit a warning when a one level logger child log something", () => {
        const code = `import pino from "pino";
                    const logger = pino();
                    const childLogger = logger.child({module: "auth"});
                    childLogger.info("hello");
                    childLogger.warn("hello");
                    childLogger.error("hello");
                    childLogger.fatal("hello");
                    childLogger.debug("hello");
                    childLogger.trace("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "childLogger.info, childLogger.warn, "
        + "childLogger.error, childLogger.fatal, childLogger.debug, childLogger.trace");
      });

      it("should follow the consecutive assignment of the child logger", () => {
        const code = `import pino from "pino";
                    const logger = pino();
                    const childLogger = logger.child({module: "auth"});
                    const childLoggerBis = childLogger;
                    childLoggerBis.info("hello");
                    childLoggerBis.warn("hello");
                    childLoggerBis.error("hello");
                    childLoggerBis.fatal("hello");
                    childLoggerBis.debug("hello");
                    childLoggerBis.trace("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "childLogger.info, childLogger.warn, "
        + "childLogger.error, childLogger.fatal, childLogger.debug, childLogger.trace");
      });

      it("should follow the consecutive assignment of the child logger function", () => {
        const code = `import pino from "pino";
                    const logger = pino();
                    const childLogger = logger.child({module: "auth"});
                    const childLoggerBis = childLogger;
                    const info = childLoggerBis.info;
                    info("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "childLogger.info");
      });

      it("should be able to trace nested child logger", () => {
        const code = `import pino from "pino";
                    const logger = pino();
                    const childLogger = logger.child({module: "auth"});
                    const childLogger2 = childLogger.child({ module: "something"});
                    const childLogger3 = childLogger2.child({ module: "something2"});
                    const info = childLogger3.info;
                    info("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "childLogger3.info");
      });

      it("should follow the assignment of a nested logger", () => {
        const code = `import pino from "pino";
                    const logger = pino();
                    const childLogger = logger.child({module: "auth"});
                    const childLoggerBis = childLogger;
                    const childLogger2 = childLoggerBis.child({ module: "something"});
                    const childLogger3 = childLogger2.child({ module: "something2"});
                    const info = childLogger3.info;
                    info("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "childLogger3.info");
      });
    });

    describe("custom loggers", () => {
      it("should emit a warning when a custom level method is called", () => {
        const code = `import pino from "pino";
                    const logger = pino({
                    customLevels:{
                      foo: 35,
                      bar: 36
                      }
                    });
                    logger.info("hello");
                    logger.warn("hello");
                    logger.error("hello");
                    logger.fatal("hello");
                    logger.debug("hello");
                    logger.trace("hello");
                    logger.foo("hello");
                    logger.bar("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "logger.info, logger.warn, logger.error, " +
        "logger.fatal, logger.debug, logger.trace, logger.foo, logger.bar"
        );
      });

      it("should only trace customLevels methods", () => {
        const code = `import pino from "pino";
                    const logger = pino({
                    customLevels:{
                      foo: 35,
                      bar: 36
                      },
                    useOnlyCustomLevels: true,
                    });
                    logger.info("hello");
                    logger.warn("hello");
                    logger.error("hello");
                    logger.fatal("hello");
                    logger.debug("hello");
                    logger.trace("hello");
                    logger.foo("hello");
                    logger.bar("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "logger.foo, logger.bar");
      });

      it("should resolve useOnlyCustomLevels as an identifier", () => {
        const code = `import pino from "pino";

                    const useOnlyCustomLevels = true;
                    const logger = pino({
                    customLevels:{
                      foo: 35,
                      bar: 36
                      },
                    useOnlyCustomLevels,
                    });
                    logger.info("hello");
                    logger.warn("hello");
                    logger.error("hello");
                    logger.fatal("hello");
                    logger.debug("hello");
                    logger.trace("hello");
                    logger.foo("hello");
                    logger.bar("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "logger.foo, logger.bar");
      });

      it("should trace default methods as well when useOnlyCustomLevels is false", () => {
        const code = `import pino from "pino";
                    const logger = pino({
                    customLevels:{
                      foo: 35,
                      bar: 36
                      },
                    useOnlyCustomLevels: false,
                    });
                    logger.info("hello");
                    logger.warn("hello");
                    logger.error("hello");
                    logger.fatal("hello");
                    logger.debug("hello");
                    logger.trace("hello");
                    logger.foo("hello");
                    logger.bar("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "logger.info, logger.warn, logger.error, " +
        "logger.fatal, logger.debug, logger.trace, logger.foo, logger.bar"
        );
      });

      it("should not conflict with other pino loggers methods", () => {
        const code = `import pino from "pino";
                    const logger1 = pino({
                    customLevels:{
                      foo: 35,
                      bar: 36
                      },
                    useOnlyCustomLevels: false
                    });

                    const logger2 = pino();
                    logger2.foo("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        assert.strictEqual(warnings.length, 0);
      });

      it("should have a child logger who inherit the custom levels from its parent logger", () => {
        const code = `import pino from "pino";
                    const logger = pino({
                    customLevels:{
                      foo: 35,
                      bar: 36
                      },
                    useOnlyCustomLevels: true
                    });
                    const childLogger = logger.child({component: "database"});
                    childLogger.foo("hello");
                    childLogger.bar("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "childLogger.foo, childLogger.bar"
        );
      });

      it("each child loggers must have their own customLevels", () => {
        const code = `import pino from "pino";
                    const logger1 = pino({
                    customLevels:{
                      foo: 35,
                      },
                    useOnlyCustomLevels: true
                    });
                    const logger2 = pino({
                    customLevels:{
                      bar: 36,
                      },
                    useOnlyCustomLevels: true
                    });
                    const childLogger1 = logger1.child({component: "database"});
                    const childLogger2 = logger2.child({component: "database"});
                    childLogger1.foo("hello");
                    childLogger1.bar("hello");
                    childLogger2.bar("hello");
                    childLogger2.foo("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "childLogger1.foo, childLogger2.bar"
        );
      });

      it("should have a nested child logger who inherit the custom levels from its root parent logger", () => {
        const code = `import pino from "pino";
                    const logger = pino({
                    customLevels:{
                      foo: 35,
                      bar: 36
                      },
                    useOnlyCustomLevels: true
                    });
                    const childLogger1 = logger.child({component: "database"});
                    const childLogger1Bis = childLogger1;
                    const childLogger2 = childLogger1Bis.child({module: "auth"});
                    childLogger2.foo("hello");
                    childLogger2.bar("hello");
                    `;
        const { warnings } = new AstAnalyser({
          optionalWarnings: true
        }).analyse(code);

        const [firstWarning] = warnings;

        assert.strictEqual(firstWarning.kind, "log-usage");
        assert.strictEqual(firstWarning.severity, "Information");
        assert.strictEqual(firstWarning.value, "childLogger2.foo, childLogger2.bar"
        );
      });
    });
  });
});
