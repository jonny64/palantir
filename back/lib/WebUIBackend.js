const {Job}                = require ('doix')
const {WebService}         = require ('doix-http')
const {HttpRequestContext} = require ('http-server-tools')
const createError          = require ('http-errors')

class UnauthorizedError extends Error {

	constructor () {
	
		super ('Unauthorized')
		
		this.code = 401
	
	}

}

module.exports = class extends WebService {

    constructor (app) {
        
        super (app, {

            name: 'WebUIBackend',

            location: '/v1',

            pathMapping : ([type, action]) => ({type, action}),

            methods: ['POST'],

            createError: (cause) => {

                console.log ({cause})
                const {field, message, code} = cause

                if (code == 401) return createError (code)

                const o = field ? {field, message} : {success: false, dt: new Date ()}

                const {INSTANCE} = Job; if (INSTANCE in cause) o.id = cause [INSTANCE].id

                const error = createError (field ? 422 : 500, JSON.stringify (o))

                error.expose = true

                error [HttpRequestContext.CONTENT_TYPE] = 'application/json'

                return error

            },

            on: {

				start: function () {

					if (!this.user && !this.module.allowAnonymous) this.fail (new UnauthorizedError ())

				},

                end: function () {

                    let content = this.result ?? null

                    this.result = content

                },

            },

        })

    }

}