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
        target: "http://localhost:24000"
      }
    }
  },
  publicPath: "",
  configureWebpack: {
    externals: ["electron"]
  }
}