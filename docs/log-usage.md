# Log Usage

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| log-usage | `Information` | `sast_warnings.log_usage` | ❌ | 

## Introduction

Detects usage of console logging methods in the code. This warning helps identify logging statements that may expose sensitive information in production environments or clutter the console output.

The probe tracks the following console methods:
- `console.log()`
- `console.info()`
- `console.warn()`
- `console.error()`
- `console.debug()`

The probe tracks the following [pino](https://github.com/pinojs/pino) logging methods:
- `logger.info()`
- `logger.warn()`
- `logger.error()`
- `logger.fatal()`
- `logger.debug()`
- `logger.trace()`

## Example console

```js
console.log(process.env);
console.info("...");
console.warn("...");
console.error("...");
console.debug("...");
```

## Example pino

```js
import pino from "pino"

const logger = pino();

logger.log(process.env);
logger.info("...");
logger.warn("...");
logger.error("...");
logger.debug("...");

const childLogger = logger.child({method: "auth"});

childLogger.log(process.env);
childLogger.info("...");
childLogger.warn("...");
childLogger.error("...");
childLogger.debug("...");
```

