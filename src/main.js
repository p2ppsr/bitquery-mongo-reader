const index = require('./index')
// This additional main.js file is required to enable recursive calling of index.js  to make the reader function robust
// to any errors that may occur during database connection or the subsequent processing of query or socket calls
index(index)
