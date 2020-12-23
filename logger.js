const {createLogger, transports, format} = require('winston');
var winston = require('winston');
require('winston-daily-rotate-file');

var rotatetransport = new (winston.transports.DailyRotateFile)({
    filename: '../logs/fetchdata_%DATE%.log',
    prepend: true,
    level: 'info',
    zippedArchive: true,
    maxFiles: '10d'
});

const logger = createLogger({
    format: format.combine( format.json()),
    transports: [
        rotatetransport,
        new transports.Console({
            level: 'info',
            format: format.combine(format.json())
        }),
        new transports.Console({
            level: 'error',
            format: format.combine(format.json())
        }),
    ]
})

module.exports = logger;