const winston = require("winston");
const { format, createLogger, transports } = winston;
const jsonStringify = require("fast-safe-stringify");

const myCustomLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    debug: "white",
    info: "green",
    warn: "yellow",
    error: "red",
  },
};

winston.addColors(myCustomLevels.colors);

// const colorizer = winston.format.colorize({ all: true });

const logLikeFormat = {
  transform(info) {
    const { timestamp, label, message } = info;
    const level = info["level"];
    const args = info[Symbol.for("splat")];
    let strArgs = args ? args.map(jsonStringify).join(" ") : "";
    info[
      Symbol.for("message")
    ] = `${timestamp} [${label}] ${level}: ${message} ${strArgs}`;
    return info;
  },
};

// const debugFormat = {
//   transform(info) {
//     console.log(info);
//     return info;
//   },
// };

const logger = createLogger({
  level: process.env.LOG_LEVEL,
  levels: myCustomLevels.levels,
  format: format.combine(
    format.timestamp(),
    format.label({ label: "myLabel" }),
    // format.splat(),
    // format.colorize(),
    format.prettyPrint(),
    logLikeFormat
    // debugFormat, // uncomment to see the internal log structure
  ),
  transports: [new transports.Console()],
});

if (process.env.NODE_ENV == "local") {
  logger.configure({
    level: process.env.LOG_LEVEL,
    levels: myCustomLevels.levels,
    format: format.combine(
      format.timestamp(),
      format.label({ label: "myLabel" }),
      // format.splat(),
      format.colorize(),
      format.prettyPrint(),
      logLikeFormat
      // debugFormat, // uncomment to see the internal log structure
    ),
    transports: [new transports.Console()],
  });
}

// let handler = () => {
//     logger.info('some debug level-ed message', '\nand second arg', "\nand third arg");
//     logger.debug('some debug level-ed message');
//     logger.info('some info level-ed message');
//     logger.warn('some warn level-ed message');
//     logger.error('some error level-ed message');

// }

// handler();

// exports.handler = handler;

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== 'production') {
//     logger.add(new winston.transports.Console({
//         format: winston.format.simple()
//     }));
// }

// logger.info("my message");

exports.logger = logger;
