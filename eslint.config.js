import { iz7n } from "@iz7n/eslint-config";

export default iz7n(
  {
    typescript: {
      tsconfigPath: "tsconfig.json",
    },
    svelte: {
      overrides: {
        "import/no-rename-default": "off",
      },
    },
  },
  {
    // Destructuring things like the `parent` function in a svelte-kit load function seem to trigger this
    files: ["**/+page.ts", "**/+layout.ts"],
    rules: {
      "ts/unbound-method": "off",
    },
  },
);
