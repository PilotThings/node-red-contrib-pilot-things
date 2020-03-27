function isNumber(obj) {
    return (typeof obj === "number" || obj instanceof Number) && !isNaN(obj) && isFinite(obj);
};

function isObject(obj) {
    return typeof obj === "object" && obj !== null && !(obj instanceof String);
};

function isString(obj) {
    return typeof obj === "string" || obj instanceof String;
}

module.exports = { isNumber, isObject, isString };