function pilotThingsItalicIfName() {
    return this.name ? "node_label_italic" : "";
}

function pilotThingsValidateURL(url) {
    // make sure URL is absolute before trying to parse URL
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
}

var pilotThingsNodeCategory = "pilot things";
var pilotThingsNodeColor = "#f7a84d";