import js from "@eslint/js";

export default [
  {
    ignores: [
      "testers/**",
      "node_modules/**",
      ".runtime/**",
      "resume/output/**",
      "coverage/**",
      "build/**",
      "dist/**",
      "out/**"
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        setInterval: "readonly"
      }
    }
  }
];
