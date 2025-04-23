const {Application, JobSource, NamingConventions} = require ('doix')

module.exports = class extends Application {

////////////////////////////////////////////////////////////////////////////////

constructor (conf) {

    super ({
        
        logger: conf.logger,
    
        globals: {
            conf,
        },

        pools: {
        },

        modules: {
            dir: {
                root: [__dirname],
                filter: (_, arr) => arr.at (-1) === 'Content',
            },
            watch: true,
        },

        handlers: {

            error : function (error) {

                if (typeof error === 'string') error = Error (error)
                
                while (error.cause) error = error.cause

                const m = /^#(.*?)#:(.*)/.exec (error.message); if (m) {
                    error.field   = m [1]
                    error.message = m [2].trim ()
                }
                
                this.error = error

            },

        },

        namingConventions: new NamingConventions ({
            types: {
                module: { case: 'none' },
            },
        })

    })

}

////////////////////////////////////////////////////////////////////////////////

async init () {

    let initJobSource = new JobSource (this, {name: 'application'})

    // await initJobSource.createJob ({type: 'application', action: 'update_model'}).outcome ()

}

}