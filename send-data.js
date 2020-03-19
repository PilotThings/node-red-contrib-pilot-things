const base64 = require("base-64");
const fetch = require("node-fetch");

async function sendDataToApi(msg, node, config, done) {  
    const body = {
        id: config.deviceid,
        timestamp: new Date().getTime() / 1000,
        connectivityType: config.connectivity || "UNKNOWN"
    };

    if (msg.payload instanceof Buffer) {
        body.body = msg.payload.toString("hex");
    } else {
        body.body = msg.payload || "";
    }

    if (config.metadata) {
        const metadata = JSON.parse(config.metadata);
        if (metadata) {
            body.metadata = metadata;
        }
    }

    let endpoint = config.endpoint;
    if (endpoint.endsWith("/")) {
        endpoint = endpoint.slice(0, -1);
    }

    const result = await fetch(`${endpoint}/ipe-http/up-link`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + base64.encode(`${node.credentials.username || ""}:${node.credentials.password || ""}`),
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!result.ok) {
        const basicErr = { status: result.status + " " + result.statusText, url: result.url };
        try {
            const err = await result.json();
            node.error(Object.assign(err, basicErr), msg);
        } catch (e) {
            node.error(basicErr, msg);
        }
    }

    if (done) {
        done();
    }
}

module.exports = RED => {
    function SendDataNode(config) {
        RED.nodes.createNode(this, config);
    
        const node = this;
        node.on("input", (msg, send, done) => {
            sendDataToApi(msg, node, config, done);
        });
    }

    RED.nodes.registerType("send-data", SendDataNode, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });
}