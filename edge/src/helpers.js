import { Logger } from "fastly:logger";
const kinesisLogger = new Logger("kinesis-stream");
export const decodeEscapedString = (str) => {
    return str
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r")
        .replace(/\\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .replace(/\\u[\dA-F]{4}/gi, (match) => {
        return String.fromCharCode(parseInt(match.substring(2), 16));
    });
};
export const convertHeadersIntoObj = (headers) => {
    const obj = {};
    headers.forEach((v, k) => (obj[k] = v));
    return obj;
};
export const log = (title, data) => {
    const logMsg = {
        title,
        timestamp: new Date().toISOString(),
        ...(data && { data }),
    };
    kinesisLogger.log(JSON.stringify(logMsg));
    console.log(JSON.stringify(logMsg, null, 2));
};
export const logError = (title) => {
    const logMsg = {
        title,
        timestamp: new Date().toISOString(),
    };
    kinesisLogger.log(JSON.stringify(logMsg));
    console.log(JSON.stringify(logMsg, null, 2));
};
export const logWithColor = (title, data) => {
    console.log(`\n\n\x1b[1;33m${title}\x1b[0m`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
    console.log("\n\n");
};
//# sourceMappingURL=helpers.js.map