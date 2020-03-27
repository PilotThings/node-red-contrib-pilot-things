function getCompletionHandler(node, msg, done) {
    return done || (err => {
        if (err) {
            node.error(err, msg);
        }
    });
}

function getSendHandler(node, send) {
    return send || (() => node.send.apply(node, arguments));
}

module.exports = { getCompletionHandler, getSendHandler };