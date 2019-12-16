import express = require('express');
import { Request, Response } from 'express';
import ArweaveBot from './arweave';
import * as cors from 'cors';
const cron = require('node-cron');

const arBot = new ArweaveBot();
const app = express();
app.use(cors());
app.use(express.json())
app.post('/add', async (req: Request, res: Response) => {
    if (req.body.url) {
        try {
            const tx = await arBot.addApi(req.body.url)
            res.send(tx);
        } catch (e) {
            res.send({ error: e.message })
        }
    } else {
        res.send({ error: "Invalid query 'url' params not found" });
    }
});
app.get('/get_current_streams', async (req: Request, res: Response) => {
    try {
        const datas = await arBot.getArchiveUrls()
        res.send(datas);
    } catch (e) {
        res.send({ error: e.message })
    }
});


app.listen(process.env.PORT || 3001, () =>
    console.log(`Arbot listening on port ${process.env.PORT || 3001}!`),
);
//cron job
cron.schedule('0 * * * *', async () => {
    //'running a task every hour at 0th minute'
    const archive = process.env.NO_ARCHIVE ? false : true;
    await arBot.archiveApis(archive)
});
