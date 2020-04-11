# node-red-contrib-pilot-things

![](res/pilot-things-logo.png)&nbsp;&nbsp;![](res/node-red-logo.png)

This project offers multiple nodes which integrate Pilot Things and Node-RED one another.

Currently, we offer nodes that allow Node-RED to submit data to the Pilot Things platform for storage or decoding (the decoded result can then be used in the flow for other purposes).

## Prerequisites

You need valid Pilot Things credentials to use these nodes.

Sign-up for free at https://www.pilot-things.com/sign-up

For support go to https://support.pilot-things.com/

## Installation

Either use the Menu - Manage palette option or run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install @pilot-things/node-red-contrib-pilot-things

## Send node usage

This node sends data to Pilot Things. Pilot Things will automatically create the sensors, and can decode the data after associating the sensor to a product.

This node can be used in a [Kerlink Gateway with SPN](https://www.kerlink.com/iot-portfolio-and-technologies/connectivity-management/wanesy-small-private-network/)

See node help for more details.

## Decode node usage

The decode node decodes sensor payload to convert it to measurements. You must use a product ID that is a sensor unique ID. For instance product `e6ae04f9-5f57-4992-8bda-41ae5ff0bf8d` is an [Adeunis LoRaWAN Field Test](https://www.adeunis.com/produit/ftd-testeur-de-reseau/).

If you do not have a real sensor you can use the inject node. For instance using the following JSON would decode sample data for a Field Test.

```json
{
    "data": "0F2E3CCD3338D23931F5",
    "metadata": {
        "FPort": 3
    },
    "productId": "e6ae04f9-5f57-4992-8bda-41ae5ff0bf8d"
}
```

See node help for more details.

## FAQ

#### My data is in a non supported data format! How do I submit it to the Pilot Things nodes?

One can use a function node with 1 output containing the code to convert the input into a format that the Pilot Things nodes will understand. For example, if the input is a byte array, the following code will convert it into a NodeJS `Buffer`, which the Pilot Things nodes understand:

```js
msg.payload.data = Buffer.from(msg.payload.data);
return msg;
```

#### The decoder errors with "Too many invalid login attempts"!

Combining the frequent uplink nature of some devices with the auto locking of accounts in Pilot Things after too many unsuccessful attempts can result in your account being locked on the platform by the node. To mitigate this, the node will stop trying after 5 failed logins in a row and will refuse to try again until one of the following occurs:

- The credentials used by the node to authenticate with Pilot Things have been changed;
- 1 hour has passed since the last failed login;
- The node context has been cleared (this happens upon a restart of the Node-RED server unless it has been configured otherwise).