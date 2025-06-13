// Import Third-party Dependencies
import { ESLintConfig } from "@openally/config.eslint";

export default [
  {
    ignores: [
      "**/test/fixtures/**/*",
      "**/test/probes/fixtures/**/*.js",
      "**/examples/*.js"
    ]
  },
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
