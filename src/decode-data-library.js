const fetch = require("node-fetch");

const credentialsHelpers = require("./helpers/credentials-helpers.js");
const fetchHelpers = require("./helpers/fetch-helpers.js");
const inputHelpers = require("./helpers/input-helpers.js")
const redHelpers = require("./helpers/red-helpers.js");
const typeHelpers = require("./helpers/type-helpers.js");

const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function decodeDataWithLibrary(msg, node, config, send, done) {
    if (!(await credentialsHelpers.verifyAuthorizationTimeout(node.credentials, node.context()))) {
        done("Too many failed API call attempts. Make sure your API key is correct.");
        return;
    }

    const payload = inputHelpers.dataInputToString(msg.payload.data, config.format, done);
    if (payload === undefined) {
        return;
    }

    if (!typeHelpers.isString(msg.payload.productId) || !guidRegex.test(msg.payload.productId)) {
        done("Invalid product ID");
        return;
    }

    const result = await fetch("https://sensor-library.pilot-things.net/decode", {
        method: "POST",
        headers: {
            "x-api-key": node.credentials.apikey,
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            productId: msg.payload.productId,
            payload: payload
        })
    });

    await credentialsHelpers.updateAuthorizationTimeout(result.status !== 403, node.credentials, node.context());

    const err = await fetchHelpers.handleHttpError(result);
    if (err) {
        done(err);
        return;
    }

    msg.payload = await result.json();
    send(msg);
    done();
}

module.exports = RED => {
    function DecodeDataLibraryNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.on("input", (msg, send, done) => {
            decodeDataWithLibrary(msg, node, config, redHelpers.getSendHandler(node, send), redHelpers.getCompletionHandler(node, msg, done));
        });
    }

    RED.nodes.registerType("pilot-things-decode-data-library", DecodeDataLibraryNode, {
        credentials: {
            apikey: { type: "text" }
        }
    });
}