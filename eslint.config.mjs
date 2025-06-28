// Import Third-party Dependencies
import { ESLintConfig, typescriptConfig } from "@openally/config.eslint";

export default [
  {
    ignores: [
      "**/test/fixtures/**/*",
      "**/test/probes/fixtures/**/*.js",
      "**/examples/*.js"
    ]
  },
  ...typescriptConfig(),
  ...ESLintConfig,
  {
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        requireConfigFile: false
      }
    }
  }
];
