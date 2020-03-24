const base64 = require("base-64");
const fetch = require("node-fetch");

const helpers = require("../helpers.js");

async function sendDataToApi(msg, node, config, done) {
    if (!helpers.isObject(msg.payload)) {
        done("Invalid payload");
        return;
    }

    if (!helpers.isString(msg.payload.deviceId)) {
        done("Invalid device ID");
        return;
    }

    const body = {
        id: msg.payload.deviceId,
        timestamp: new Date().getTime() / 1000,
        connectivityType: config.connectivity
    };

    if (msg.payload.data instanceof Buffer) {
        body.body = msg.payload.data.toString("hex");
    } else if (helpers.isString(msg.payload.data)) {
        body.body = msg.payload.data;
    } else if (msg.payload.data === undefined) {
        body.body = "";
    } else {
        done("Invalid data");
        return;
    }

    if (config.metadata) {
        const metadata = JSON.parse(config.metadata);
        if (metadata !== null) {
            body.metadata = metadata;
        }
    }

    const result = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            Authorization: "Basic " + base64.encode(`${node.credentials.username || ""}:${node.credentials.password || ""}`),
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    done(await helpers.handleHttpError(result));
}

module.exports = RED => {
    function SendDataNode(config) {
        RED.nodes.createNode(this, config);
    
        const node = this;
        node.on("input", (msg, send, done) => {
            sendDataToApi(msg, node, config, helpers.getCompletionHandler(node, msg, done));
        });
    }

    RED.nodes.registerType("send-data", SendDataNode, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });
}