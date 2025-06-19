// This function will be used by Netlify to handle server-side requests
const { createServer } = require('@netlify/functions')
const server = require('../../dist/server').default

exports.handler = createServer(server)
