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
  BRIDGE,
  DOCUMENTATION_FILE_NAME,
  DEFAULT_QUERY,
  DEFAULT_SOCKET
} = process.env

const getDatabaseConnection = () => new Promise(resolve => {
  MongoClient.connect(
    Buffer.from(MONGODB_READ_CREDS, 'base64').toString('utf8'),
    {
      serverSelectionTimeoutMS: 600000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1
    }, (err, mongoClient) => {
      if (err) {
        console.log('Error connecting to database, retrying in 3 seconds...')
        console.error(err)
        setTimeout(() => {
          resolve(getDatabaseConnection())
        }, 3000)
        return
      }
      const db = mongoClient.db(MONGODB_DATABASE)
      console.log('Successfully connected to database!')
      resolve(db)
    })
})

/**
 * Creates and returns an Express app bound to the given port. Values provided by the specified environmental variables override those provided here.
 *
 * @param {Object} [obj] All parameters are given in an object. All parameters are optional.
 * @param {String} [obj.documentationFileName] Path to a .md file containing bridge protocol documentation. Overriden if the `DOCUMENTATION_FILE_NAME` environmental variable is present.
 * @param {Object} [obj.bridge] The Bridgeport bridge object. Overriden if the `BRIDGE` environmental variable is present. Either the environmental variable or this parameter are required.
 * @param {String} [obj.defaultQuery] The default query for the web UI, given as a formatted JSON string. Overriden if the `DEFAULT_QUERY` environmental variable is present.
 * @param {String} [obj.defaultSocket] The default socket for the web UI, given as a formatted JSON string. Overriden if the `DEFAULT_SOCKET` environmental variable is present.
 *
 * @returns {Promise} A Promise for an Express app instance
 */
module.exports = async ({
  documentationFileName,
  bridge,
  defaultQuery,
  defaultSocket
} = {}) => {
  if (DOCUMENTATION_FILE_NAME) {
    documentationFileName = DOCUMENTATION_FILE_NAME
  }
  if (typeof documentationFileName !== 'string') {
    documentationFileName = path.join(__dirname, '../doc/PROTOCOL.md')
  }
  if (BRIDGE) {
    try {
      bridge = JSON.parse(Buffer.from(BRIDGE, 'base64').toString('utf8'))
    } catch (_) {
      const err = new Error(
        'The BRIDGE environment variable could not be parsed. It must be a base64-encoded JSON object.'
      )
      err.code = 'ERR_MALFORMED_BRIDGE_ENV'
      throw err
    }
  }
  if (typeof bridge !== 'object') {
    const e = new Error(
      'Either a BRIDGE environmental variable, or a bridge object must be provided for the Bitquery Mongo Reader.'
    )
    e.code = 'ERR_MISSING_BRIDGE_CONFIG'
    throw e
  }
  if (DEFAULT_QUERY) {
    defaults.query = DEFAULT_QUERY
  }
  if (DEFAULT_SOCKET) {
    defaults.socket = DEFAULT_SOCKET
  }

  // Express app is created and set up
  const app = express()
  app.set('view engine', 'ejs')
  app.set('views', path.join(__dirname, '../views'))
  app.use(`/${bridge.id}`, express.static(path.join(__dirname, '../public')))
  app.use(express.json())
  app.use(cors())

  console.log(
    `Bitquery Mongo Reader set up for bridge: ${bridge.id}\nOpening Mongo client with database connection string: ${Buffer.from(MONGODB_READ_CREDS, 'base64').toString('utf8')}`
  )
  const db = await getDatabaseConnection()

  // Bridge homepage is README.md of the reader, rendered as HTML
  app.get(`/${bridge.id}`, (req, res) => {
    res.render('readme', {
      markdown: require('fs').readFileSync(documentationFileName),
      bridge
    })
  })

  // Query frontend
  app.get(`/${bridge.id}/query`, (req, res) => {
    res.render('query', { bridge, defaultQuery: defaults.query })
  })
  app.get(`/${bridge.id}/query/:qs`, (req, res) => {
    res.render('query', { bridge, defaultQuery: defaults.query })
  })

  // Query backend
  app.get(`/${bridge.id}/q/:query`, (req, res) => {
    query({ db, req, res })
  })

  // Socket frontend
  app.get(`/${bridge.id}/socket`, (req, res) => {
    res.render('socket', { bridge, defaultSocket: defaults.socket })
  })
  app.get(`/${bridge.id}/socket/:qs`, (req, res) => {
    res.render('socket', { bridge, defaultSocket: defaults.socket })
  })

  // Socket backend
  app.get(`/${bridge.id}/s/:query`, (req, res) => {
    socket({ db, req, res })
  })

  // Listen
  app.listen(PORT, () => {
    console.log(`Bridge reader for ${bridge.id} listening for connections`)
  })

  return app
}
