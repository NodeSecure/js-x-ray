// Import Third-party Dependencies
import { typescriptConfig } from "@openally/config.eslint";

export default [
  {
    ignores: [
      "**/test/fixtures/**/*",
      "**/test/probes/fixtures/**/*.js",
      "**/examples/*.js",
      "**/temp/**"
    ]
  },
  ...typescriptConfig(),
  {
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        requireConfigFile: false
      }
    }
  }
];
