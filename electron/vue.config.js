module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  runtimeCompiler: true,
  configureWebpack: {
    externals: [
      "express", "cors", "pouchdb", "appdirs", "esm",
      "q2filter", "url-safe-string", "chinese-to-pinyin", "uuid", "express-fileupload"
    ]
  },
  publicPath: ""
}