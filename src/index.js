module.exports = (index) => {
  /**
   * Returns an implementation of addHeader with the given Storage Engine
   *
   * @param {Object} params.index a copy of this function object to enable recursive calling
   *
   * @returns null
   */
  require('dotenv').config()
  const express = require('express')
  const cors = require('cors')
  const path = require('path')
  const query = require('./query')
  const socket = require('./socket')
  const defaults = require('./defaults')
  const { MongoClient, ServerApiVersion } = require('mongodb')
  const {
    PORT,
    MONGODB_READ_CREDS,
    MONGODB_DATABASE,
    BRIDGE
  } = process.env

  const bridge = JSON.parse(Buffer.from(BRIDGE, 'base64').toString('utf8'))
  const app = express()

  app.set('view engine', 'ejs')
  app.set('views', path.join(__dirname, '../views'))
  app.use(`/${bridge.id}`, express.static(path.join(__dirname, '../public')))
  app.use(express.json())
  app.use(cors())

  // Initialise Mongo Client before call to connect to the MongoDB
  const mongoClient = null
  try {
    console.log(`Bridge reader ${bridge.id} \nopening Mongo client:`,
      '\nbuffer:', Buffer.from(MONGODB_READ_CREDS, 'base64').toString('utf8'),
      '\n{serverSelectionTimeoutMS: 600000,',
      'useNewUrlParser: true,',
      'useUnifiedTopology: true,',
      'serverApi: ServerApiVersion.v1}'
    )
    // Added serverSelectionTimeoutMS argument to give 10 minute timeout for Mongo connection call
    // Factored connect call to implement recursive Mongo connection call
    MongoClient.connect(
      Buffer.from(MONGODB_READ_CREDS, 'base64').toString('utf8'),
      {
        // *** Testing ***: Set to 6 secs to demonstrate recusive conection call
        serverSelectionTimeoutMS: 6000,
        // serverSelectionTimeoutMS: 600000,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1
      }, (err, mongoClient) => {
        if (err) {
          console.log('Error:mongo client connection err:', err)
          setTimeout(() => {
            console.log('recursive call to index()')
            index(index)
          }, 1000)
          return
        }
        const db = mongoClient.db(MONGODB_DATABASE)
        console.log('db:', db)
        if (db) {
          // Bridge homepage is README.md of the reader, rendered as HTML
          app.get(`/${bridge.id}`, (req, res) => {
            console.log('render ../doc/PROTOCOL.md')
            res.render('readme', {
              markdown: require('fs').readFileSync(path.join(__dirname, '../doc/PROTOCOL.md')),
              bridge
            })
          })
          // Query frontend
          app.get(`/${bridge.id}/query`, (req, res) => {
            console.log(`frontend ${bridge.id}/query req:`, req)
            // Check if environment DEFAULT_QUERY is set, if so update normal defaults.query
            console.log('frontend process.env.DEFAULT_QUERY:', process.env.DEFAULT_QUERY)
            if (process.env.DEFAULT_QUERY) {
              defaults.query = eval(JSON.stringify(process.env.DEFAULT_QUERY, null, 2))
              console.log('frontend defaults.query:eval(JSON(q))', defaults.query)
            }
            console.log('frontend defaults.query:', defaults.query)
            console.log(`frontend ${bridge.id}/query res:`, res)
            res.render('query', { bridge, defaultQuery: defaults.query })
          })
          app.get(`/${bridge.id}/query/:qs`, (req, res) => {
            console.log(`${bridge.id}/query/:qs req:`, req)
            res.render('query', { bridge, defaultQuery: defaults.query })
            console.log(`${bridge.id}/query/:qs res:`, res)
          })
          // Query backend
          app.get(`/${bridge.id}/q/:query`, (req, res) => {
            console.log(`backend ${bridge.id}/q/query req:`, req)
            query({ db, req, res })
            console.log(`backend ${bridge.id}/q/query res:`, res)
          })
          // Socket frontend
          app.get(`/${bridge.id}/socket`, (req, res) => {
            console.log(`frontend ${bridge.id}/socket req:`, req)
            // Check if environment DEFAULT_SOCKET is set, if so update normal defaults.socket
            console.log('frontend process.env.DEFAULT_SOCKET:', process.env.DEFAULT_SOCKET)
            if (process.env.DEFAULT_SOCKET) {
              defaults.socket = eval(JSON.stringify(process.env.DEFAULT_SOCKET, null, 2))
              console.log('defaults.socket:eval(JSON(s))', defaults.socket)
            }
            console.log('defaults.socket:', defaults.socket)
            console.log(`frontend ${bridge.id}/socket res:`, res)
            res.render('socket', { bridge, defaultSocket: defaults.socket })
          })
          app.get(`/${bridge.id}/socket/:qs`, (req, res) => {
            console.log(`frontend ${bridge.id}/socket:qs req:`, req)
            res.render('socket', { bridge, defaultSocket: defaults.socket })
            console.log(`frontend ${bridge.id}/socket:qs res:`, res)
          })
          // Socket backend
          // *** this sould be socket *** ?
          // app.get(`/${bridge.id}/s/:socket`, (req, res) => {
          app.get(`/${bridge.id}/s/:query`, (req, res) => {
            console.log(`${bridge.id}/s/query socket req:`, req)
            socket({ db, req, res })
            console.log(`${bridge.id}/s/query socket res:`, res)
          })
          // Listen
          app.listen(PORT, () => {
            console.log(`Bridge reader for ${bridge.id} listening on port ${PORT}`)
          })
        } else {
          console.log('Error:undefined db')
          setTimeout(() => {
            console.error('close mongoClient connection and recursive call to index()')
            mongoClient.close()
            index(index)
          }, 1000)
        }
      }
    )
  } catch (err) {
    console.error('Error:catch:err:', err)
    setTimeout(() => {
      console.log('close mongoClient connection and recursive call to index()')
      mongoClient.close()
      index(index)
    }, 1000)
  }
}
