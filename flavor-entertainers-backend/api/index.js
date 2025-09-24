const { buildApp } = require('../apps/api/dist/index.js')

let app

module.exports = async (req, res) => {
  if (!app) {
    app = await buildApp()
    await app.ready()
  }

  // Handle Vercel serverless function
  try {
    await app.inject({
      method: req.method,
      url: req.url,
      headers: req.headers,
      payload: req.body || req
    }).then(response => {
      res.status(response.statusCode)
      Object.keys(response.headers).forEach(key => {
        res.setHeader(key, response.headers[key])
      })
      res.end(response.payload)
    })
  } catch (error) {
    console.error('Serverless function error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}