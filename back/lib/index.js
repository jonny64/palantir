const process      = require ('process')
const Config       = require ('./Config.js')
const Application  = require ('./Application.js')
const WebUIBackend = require ('./WebUIBackend.js')
const {HttpRouter} = require ('protocol-agnostic-router')

////////////////////////////////////////////////////////////////////////////////

async function main () {

    const conf = new Config ()
    darn ('Application is loading...')

    const app = new Application (conf)
    await app.init ()

    let webUIBackend = new WebUIBackend (app)

    let {listen} = conf

    let httpRouter = new HttpRouter ({name: 'http', listen, logger: conf.logger})
    // httpRouter.add (new webUIBackend (app, {name: 'http', location: '/v1/chat/completions', methods: ['POST']}))
    
    httpRouter.add (webUIBackend)

    httpRouter.listen ()

    darn ('Application is loaded.')
}

////////////////////////////////////////////////////////////////////////////////

main ()
