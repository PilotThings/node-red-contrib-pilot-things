const typeHelpers = require("./type-helpers.js");

function dataStringToBuffer(data, format, done) {
    if (data === "") {
        return Buffer.alloc(0);
    }

    let regex = undefined;
    if (format === "hex") {
        regex = /^([A-F0-9]{2})+$/i;
        if (data.startsWith("0x") || data.startsWith("0X")) {
            data = data.substring(2);
        }
    } else if (format === "base64") {
        regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    } else if (format === "ascii") {
        regex = /^[\x00-\x7F]+$/;
    } else {
        done("Invalid data format");
        return undefined;
    }

    if (!regex.test(data)) {
        done(`Invalid ${format} string`);
        return undefined;
    }

    return Buffer.from(data, format);
}

function payloadToBody(payload, done, stringifyMetadata, dataStringFormat) {
    if (!typeHelpers.isObject(payload)) {
        done("Invalid payload");
        return undefined;
    }

    const body = {};

    if (payload.timestamp !== undefined) {
        if (typeHelpers.isNumber(payload.timestamp)) {
            body.timestamp = payload.timestamp;
        } else {
            done("Invalid timestamp");
            return undefined;
        }
    } else {
        body.timestamp = new Date().getTime() / 1000;
    }

    if (payload.data instanceof Buffer) {
        body.body = payload.data.toString("hex");
    } else if (typeHelpers.isString(payload.data)) {
        const dataBuf = dataStringToBuffer(payload.data, dataStringFormat, done);
        if (dataBuf) {
            body.body = dataBuf.toString("hex");
        } else {
            return undefined;
        }
    } else if (payload.data === undefined) {
        body.body = "";
    } else {
        done("Invalid data");
        return undefined;
    }

    if (payload.metadata !== undefined) {
        if (typeHelpers.isObject(payload.metadata)) {
            body.metadata = stringifyMetadata ? JSON.stringify(payload.metadata) : payload.metadata;
        } else {
            done("Invalid metadata");
            return undefined;
        }
    }

    return body;
}

module.exports = { payloadToBody };