const fetch = require("node-fetch");
const path = require("path");

const credentialsHelpers = require("../helpers/credentials-helpers.js");
const fetchHelpers = require("../helpers/fetch-helpers.js");
const inputHelpers = require("../helpers/input-helpers.js")
const redHelpers = require("../helpers/red-helpers.js");
const typeHelpers = require("../helpers/type-helpers.js");

async function sendDataToApi(msg, node, config, done) {
    if (!(await credentialsHelpers.verifyAuthorizationTimeout(node.credentials, node.context()))) {
        done("Too many invalid login attempts");
        return;
    }

    const body = inputHelpers.payloadToBody(msg.payload, done, false, config.format);
    if (!body) {
        return;
    }

    if (!typeHelpers.isString(msg.payload.deviceId)) {
        done("Invalid device ID");
        return;
    }

    body.id = msg.payload.deviceId;
    body.connectivityType = config.connectivity;

    const result = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            Authorization: credentialsHelpers.getAuthorizationHeader(node.credentials),
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    await credentialsHelpers.updateAuthorizationTimeout(result.status !== 401, node.credentials, node.context());

    done(await fetchHelpers.handleHttpError(result));
}

module.exports = RED => {
    function SendDataNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.on("input", (msg, send, done) => {
            sendDataToApi(msg, node, config, redHelpers.getCompletionHandler(node, msg, done));
        });
    }

    RED.nodes.registerType("pilot-things-send-data", SendDataNode, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });

    // setup web
    RED.httpAdmin.get("/pilot-things.js", (req, res) => res.sendFile(path.join(__dirname, '..', 'web.js')));
}