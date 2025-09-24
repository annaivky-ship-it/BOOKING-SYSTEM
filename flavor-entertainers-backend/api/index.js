const { buildApp } = require('../apps/api/dist/index.js')

let app

module.exports = async (req, res) => {
  if (!app) {
    app = await buildApp()
    await app.ready()
  }

  app.server.emit('request', req, res)
}