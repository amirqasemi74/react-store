import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'ou87tg',
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
