module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  pages: {
    index: "src/main.ts",
    reveal: "src/reveal.ts"
  },
  devServer: {
    proxy: {
      "^/api": {
        target: "http://localhost:24000"
      }
    }
  }
}