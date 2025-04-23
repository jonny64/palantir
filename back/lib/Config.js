const moment  = require('moment');
const winston = require('winston');
require('winston-daily-rotate-file');

module.exports = class {

constructor () {

    const conf = require (process.argv [2] || '../conf/elud.json')

    for (let k in conf) this [k] = conf [k]

    this.init_logging ()

}

////////////////////////////////////////////////////////////////////////////////

init_logging () {

    if (!this.log) return

    BigInt.prototype.toJSON = function () { return '' + this }

    if (typeof JSON.decycle !== "function") {
        JSON.decycle = function decycle(object, replacer) {
            "use strict";

            var objects = new WeakMap();

            return (function derez(value, path) {

                var old_path;
                var nu;

                if (replacer !== undefined) {
                    value = replacer(value);
                }

                if (
                    typeof value === "object"
                    && value !== null
                    && !(value instanceof Boolean)
                    && !(value instanceof Date)
                    && !(value instanceof Number)
                    && !(value instanceof RegExp)
                    && !(value instanceof String)
                ) {

                    old_path = objects.get(value);
                    if (old_path !== undefined) {
                        return {$ref: old_path};
                    }

                    objects.set(value, path);

                    if (Array.isArray(value)) {
                        nu = [];
                        value.forEach(function (element, i) {
                            nu[i] = derez(element, [path, i].join ('.'));
                        });
                    } else {

                        nu = {};
                        Object.keys(value).forEach(function (name) {
                            nu[name] = derez(
                                value[name],
                                [path, '' + name].join ('.')
                            );
                        });
                    }
                    return nu;
                }
                return value;
            }(object, "$"));
        };
    }

    let log = this.log || {}

    let logger = this.logger = winston.createLogger({
        format: winston.format.printf ((e) => {

            if (!e.timestamp) e.timestamp = moment().format ('YYYY-MM-DD HH:mm:ss.SSS')

            let message = e.id ? ` ${e.id}` : ''

            switch (e.event) {

                case 'finish':
                    if ('elapsed' in e) message = message + ` < ${e.elapsed} ms`
                    break

                case 'start':
                case 'method':
                    message += ` >`
                    break
                default:
                    message += ` -`
                    break

            }

            message += ` ${e.message??e.event??''}`

            if ('details' in e) {
                try {
                    const d = JSON.stringify (e.details)
                    if (d != '{"params":[]}') message += ` ${d}`
                }
                catch (x) {
                    message += ' [CIRCULAR]'
                }
            }

            message = `${e.timestamp}${message}`

            return message

        }),
        transports: [
            new winston.transports.DailyRotateFile({
                dirname      : log.dirname     || '.',
                filename     : log.filename    || 'js-%DATE%.log',
                datePattern  : log.datePattern || 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize      : log.maxSize     || '100m',
                maxFiles     : log.maxFiles    || '7d',
                createSymlink: true,
                symlinkName  : log.symlinkName || 'js.log'
            })
        ],
    })

    global.darn = (o) => {

        let message = typeof o == 'object' ? JSON.stringify (JSON.decycle(o), null, 2) : o

        let timestamp = moment().format ('YYYY-MM-DD HH:mm:ss.SSS')

        logger.write ({
            id   : 'darn',
            level: 'info',
            timestamp,
            message,
        })

        console.log (timestamp, o)

        return (o)
    }
}

}