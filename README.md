# node-red-contrib-pilot-things

![](res/pilot-things-logo.png)&nbsp;&nbsp;![](res/node-red-logo.png)

This project offers multiple nodes which integrate Pilot Things and Node-RED one another.

Currently, we offer nodes that allow Node-RED to submit data to the Pilot Things platform for storage or decoding (the decoded result can then be used in the flow for other purposes).

After installing this NPM package in `~/.node-red` and restarting your Node-RED instance, you should see the nodes appear under the category "pilot things".

## FAQ

### My data is in a non supported data format! How do I submit it to the Pilot Things nodes?

One can use a function node with 1 output containing the code to convert the input into a format that the Pilot Things nodes will understand. For example, if input is in ASCII, the following code will convert it into a NodeJS `Buffer`, which the Pilot Things nodes understand:

```js
msg.payload.data = Buffer.from(msg.payload.data, "ascii");
return msg;
```

### The decoder errors with "Too many invalid login attempts"!

Combining the frequent uplink nature of some devices with the auto locking of accounts in Pilot Things after too many unsuccessful attempts can result in your account being locked on the platform by the node. To mitigate this, the node will refuse to try again until one of the following occurs:

- The user credentials have been changed;
- 1 hour has passed since the last failed login;
- The node context has been cleared (this happens upon a restart of the Node-RED server unless it has been configured otherwise).