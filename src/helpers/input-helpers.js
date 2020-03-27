const typeHelpers = require("./type-helpers.js");

function payloadToBody(payload, done, stringifyMetadata) {
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
        body.body = payload.data;
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