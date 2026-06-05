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

the probe tracks the following [winston](https://github.com/winstonjs/winston) logging methods

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

// root logger

const logger = pino();

logger.log(process.env);
logger.info("...");
logger.warn("...");
logger.error("...");
logger.debug("...");

// child logger

const childLogger = logger.child({method: "auth"});

childLogger.log(process.env);
childLogger.info("...");
childLogger.warn("...");
childLogger.error("...");
childLogger.debug("...");

// root logger with customLevels

const logger = pino({
  customLevels: {
    foo: 35,
    bar: 36
  }
});

logger.foo(process.env);
logger.bar("...");

// child logger with customLevels

const logger = pino({
  customLevels: {
    foo: 35,
    bar: 36
  }
});

const childLogger = logger.child({method: "auth"});

childLogger.foo(process.env);
childLogger.bar("...");
```



## Example winston

```js
// root loggers

import winston from winston;

winston.info(process.env);

import { createLogger } from winston;

const logger = createLogger();

logger.info(process.env);

// child loggers


import winston from winston;

const childLogger = winston.child({ requestId: 451 });

childLogger.info(process.env);

import { createLogger } from winston;

const logger = createLogger();

const childLogger = logger.child({ requestId: 451 });

childLogger.info(process.env);

// root logger with custom levels

import { createLogger } from winston;

const logger = createLogger({
  levels: {
    foo: 35,
    bar: 36
  }
});

logger.foo(process.env);
logger.bar("...");

// child logger with custom levels

import { createLogger } from winston;

const logger = createLogger({
  levels: {
    foo: 35,
    bar: 36
  }
});

childLogger = logger.child({ requestId: 451 });

childLogger.foo(process.env);
childLogger.bar(process.env);
```
