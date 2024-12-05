import { iz7n } from "@iz7n/eslint-config";

export default iz7n({
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  svelte: {
    overrides: {
      "import/no-rename-default": "off",
    },
  },
});
