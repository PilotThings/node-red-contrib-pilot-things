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

module.exports = { handleHttpError };