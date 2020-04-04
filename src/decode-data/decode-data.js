const fetch = require("node-fetch");

const credentialsHelpers = require("../helpers/credentials-helpers.js");
const fetchHelpers = require("../helpers/fetch-helpers.js");
const inputHelpers = require("../helpers/input-helpers.js")
const redHelpers = require("../helpers/red-helpers.js");
const typeHelpers = require("../helpers/type-helpers.js");

const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function decodeDataWithApi(msg, node, config, send, done) {
    if (!(await credentialsHelpers.verifyAuthorizationTimeout(node.credentials, node.context()))) {
        done("Too many invalid login attempts");
        return;
    }

    const body = inputHelpers.payloadToBody(msg.payload, done, true, config.format);
    if (!body) {
        return;
    }

    if (!typeHelpers.isString(msg.payload.productId) || !guidRegex.test(msg.payload.productId)) {
        done("Invalid product ID");
        return;
    }

    let endpoint = config.endpoint;
    if (endpoint.endsWith("/")) {
        endpoint = endpoint.slice(0, -1);
    }

    const result = await fetch(`${endpoint}/api/products/${msg.payload.productId}/decoder/execute`, {
        method: "POST",
        headers: {
            Authorization: credentialsHelpers.getAuthorizationHeader(node.credentials),
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    await credentialsHelpers.updateAuthorizationTimeout(result.status !== 401, node.credentials, node.context());

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
    function DecodeDataNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.on("input", (msg, send, done) => {
            decodeDataWithApi(msg, node, config, redHelpers.getSendHandler(node, send), redHelpers.getCompletionHandler(node, msg, done));
        });
    }

    RED.nodes.registerType("pilot-things-decode-data", DecodeDataNode, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });
}