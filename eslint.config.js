import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig(js.configs.recommended, [
  {
    files: ["src/**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      // Error Prevention
      "no-undef": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-unreachable": "error",
      "no-console": "off",
      "no-debugger": "warn",

      // Code Quality
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "default-case": "warn",
      "no-implicit-coercion": "warn",
      "no-multi-spaces": "error",

      // Readability & Maintainability
      "prefer-const": ["warn", { destructuring: "all" }],
      "no-var": "error",
      "object-shorthand": ["warn", "always"],
      "prefer-template": "warn",
      "consistent-return": "warn",

      // Functions & Style
      "arrow-body-style": ["warn", "as-needed"],
      "func-style": ["warn", "declaration", { allowArrowFunctions: true }],
      "no-nested-ternary": "warn",

      // Imports
      "no-duplicate-imports": "error",

      // DX Safety Nets
      "no-warning-comments": [
        "warn",
        { terms: ["todo", "fixme"], location: "start" },
      ],
    },
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["src/server.js"],
    rules: {
      "consistent-return": "off",
    },
  },
]);
