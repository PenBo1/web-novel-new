import antfu from "@antfu/eslint-config";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default antfu(
  {
    stylistic: {
      quotes: "double",
    },
    formatters: {
      css: true,
      html: true,
      markdown: "prettier",
    },
    ignores: ["demo/**"],
    rules: {
      "unused-imports/no-unused-imports": "error",
      "no-inner-declarations": "error",
      "antfu/consistent-list-newline": "off",
    },
    react: {
      overrides: {
        // Not useful in React 19 — key is no longer part of props
        "react/no-implicit-key": "off",
      },
    },
  },
  [
    {
      files: ["**/*.ts", "**/*.tsx"],
      languageOptions: {
        parserOptions: {
          project: "./tsconfig.json",
        },
      },
      rules: {
        "@typescript-eslint/no-floating-promises": "error",
      },
    },
  ],
  [
    {
      ignores: ["**/*.md/**", ".agents/**/*"],
    },
  ],
).append({
  plugins: {
    "@tanstack/query": pluginQuery,
  },
  rules: {
    "react-refresh/only-export-components": "off",
    "@tanstack/query/exhaustive-deps": "error",
    "@tanstack/query/stable-query-client": "error",
    "test/consistent-test-it": "error",
    "test/no-identical-title": "error",
    "test/prefer-hooks-on-top": "error",
  },
});
