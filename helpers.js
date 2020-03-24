function getCompletionHandler(node, msg, done) {
    return done || (err => {
        if (err) {
            node.error(err, msg);
        }
    });
}

async function handleHttpError(result) {
    if (result.ok) {
        return undefined;
    } else {
        const basicErr = { status: result.status + " " + result.statusText, url: result.url };
        try {
            const err = await result.json();
            return Object.assign(err, basicErr);
        } catch (e) {
            return basicErr;
        }
    }
}

function isString(obj) {
    return typeof obj === "string" || obj instanceof String;
}

function isObject(obj) {
	return typeof obj === "object" && x !== null;
};

module.exports = { getCompletionHandler, handleHttpError, isString, isObject };