const config = require("@in5net/xo-config");
module.exports = {
  ...config,
  rules: {
    ...config.rules,
    "import/order": "off",
  }
};
