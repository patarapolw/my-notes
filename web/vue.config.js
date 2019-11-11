const dotenv = require("dotenv-extended");
const env = dotenv.load({
  path: "../.env",
  assignToProcessEnv: false
});

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  runtimeCompiler: true,
  pages: {
    index: "src/main.ts",
    reveal: "src/reveal.ts"
  },
  outputDir: "../electron/public",
  devServer: {
    proxy: {
      "^/api": {
        target: `http://localhost:${env.PORT || 24000}`
      }
    },
    port: env.DEV_SERVER_PORT || 8000
  },
  publicPath: "",
  configureWebpack: {
    externals: ["electron"]
  }
}