const base64 = require("base-64");
const crypto = require("crypto");

function getAuthorizationHeader(credentials) {
    return "Basic " + base64.encode(`${credentials.username || ""}:${credentials.password || ""}`);
}

function hashCredentials(credentials) {
    const hasher = crypto.createHash("sha256");
    hasher.update(credentials.username || "");
    hasher.update(credentials.password || "");
    return hasher.digest();
}

async function updateAuthorizationTimeout(success, credentials, context) {
    if (success) {
        await context.set(["last-credentials", "last-login-attempt", "number-of-attempts"], [undefined, undefined, undefined]);
    } else {
        const credHash = hashCredentials(credentials).toString("hex");
        const time = new Date().getTime();

        let numberOfAttempts = await context.get("number-of-attempts") || 0;
        ++numberOfAttempts;

        await context.set(["last-credentials", "last-login-attempt", "number-of-attempts"], [credHash, time, numberOfAttempts]);
    }
}

async function verifyAuthorizationTimeout(credentials, context) {
    // check if credentials have changed
    const lastCredentials = await context.get("last-credentials") || "";
    if (lastCredentials !== hashCredentials(credentials).toString("hex")) {
        return true;
    }

    // check if last attempt was more than 1 hour ago
    const lastAttempt = await context.get("last-login-attempt") || 0;
    if (lastAttempt < new Date().getTime() - (1000 * 60 * 60)) {
        return true;
    }

    // check how many attempts there have been so far
    const numberOfAttempts = await context.get("number-of-attempts") || 0;
    if (numberOfAttempts < 5) {
        return true;
    }

    // uh oh, hit rate limit
    return false;
}

module.exports = { getAuthorizationHeader, updateAuthorizationTimeout, verifyAuthorizationTimeout };