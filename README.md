# Arbot

Arweave Data Feed Archiving Bot

This is a general purpose bot that archives any data streams.

# Explanation

This bot takes json urls and registers them into arweave blockchain like this:

![archive url](https://i.imgur.com/gxQhy9U.png)

Anyone running this bot would be able to archive these data streams by fetching the endpoints permanently stored in arweave, querying them and storing their data into arweave further decentralizing the data points

![archive data](https://i.imgur.com/2NoGS2b.png)

## API 

#### /add

This registers a json endpoint to arweave blockchain.

```
curl -X POST \
    http://localhost:3001/add \
    -H 'Content-Type: application/json' \  
    -d '{
        "url": "https://jsonplaceholder.typicode.com/users"
    }'  
```
###### response
```
1Yux.....
```

#### /get_current_streams

This gets data streams that are registered on Arweave to be archived.

```
curl -X GET http://localhost:3001/get_current_streams

```
###### response
```
[
    {
        id: "1Yux..."
        url: "https://jsonplaceholder.typicode.com/users"
    }
]
```

## Internal API

Sometimes you want to modify the data returned from endpoints before archiving it to arweave. 

[`archiveApis`](https://github.com/imerkle/arbot/blob/92fe24a7dd2a483cb47947e61412cf34b0b280ce/src/arweave.ts#L58) function in [`ArweaveBot`](https://github.com/imerkle/arbot/blob/92fe24a7dd2a483cb47947e61412cf34b0b280ce/src/arweave.ts#L20) class accepts a second `internals` parameter which is an array of objects containing url(`url`) and a custom callback function(`fn`) which modifies the data returned from json endpoint before archiving it to arweave.

```
[{
    url: "https://jsonplaceholder.typicode.com/users",
    fn: function(data){
        //do something with data
        //return modified_data;
    }
}]
```


## Setup

* `git clone https://github.com/imerkle/arbot.git`
* `cd arbot`
* `yarn install`
* `yarn run build`

## Start Server
`PORT=3001 JWK=~/path/to/arweavekeyfile.json yarn run start`

You can create an also create an `.env` file in project root and specify all environment variables or use your cloud provider's environmental config panel.

Full list of default environmental configs
```
PORT=3001
JWK=secret.json

// When =true Arbot will not archive data endpoints registered on Arweave
// Useful when you dont want to waste your computing resources to archive other peoeple's data-stream
// Therefore only archiving your data-streams fed directly to bot via archiveApis function
NO_ARCHIVE=false

```

## Hackathon 

The bot is currently hosted @http://4db00386.ngrok.io 
with the wallet address [`xYI-CenXYvaDjgMXGR0Gcba_jXMwznuN2cNAGVmnjyE`](https://viewblock.io/arweave/address/xYI-CenXYvaDjgMXGR0Gcba_jXMwznuN2cNAGVmnjyE) as part of hackathon.

## Arbot UI

To easily intereact with the bot and see data feeds that are being archived by bot visit

https://github.com/imerkle/arbot-ui
