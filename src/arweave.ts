import { ApiConfig } from 'arweave/web/lib/api';
const fs = require('fs');
const Arweave = require('arweave/node');
const axios = require('axios')


type Kv = { [key: string]: string }

const APP_NAME_KEY = "App-Name";
const APP_NAME = "arbot";
const jwk = JSON.parse(fs.readFileSync(process.env.JWK || "secret.json", 'utf8'));

const APP_ARQL = {
    expr1: {
        op: "equals",
        expr1: APP_NAME_KEY,
        expr2: APP_NAME,
    }
};
export default class ArweaveBot {
    arweave: any
    address: string
    constructor(arweave_opts: ApiConfig = { host: 'arweave.net', port: 443, protocol: 'https', timeout: 100000 }) {
        this.arweave = Arweave.init(arweave_opts)
        this.setAddress();
    }
    setAddress = async () => {
        this.address = await this.arweave.wallets.jwkToAddress(jwk);
    }
    addApi = async (url: string) => {
        const data = (await axios.get(url)).data;
        if (data) {
            const x = await this.arweave.arql({
                op: "and",
                expr1: {
                    op: "equals",
                    expr1: "Content-Kind",
                    expr2: "Archive-Url"
                },
                expr2: {
                    op: "equals",
                    expr1: "Content-Url",
                    expr2: url,
                }
            });
            if (x.length == 0) {
                return await this.createTx({ url }, {
                    "Content-Kind": "Archive-Url",
                    "Content-Url": url,
                })
            } else {
                return x[0]
            }
        } else {
            return 0;
        }
    }
    archiveApis = async (archive: boolean = true, internals: Array<any> = []) => {
        let datas: Array<any> = [];
        if (archive) {
            //@ts-ignore
            datas = this.getArchiveUrls();
        }
        const internal_fns1 = new Array(uniq(datas, "url").length).fill(function (a: any) { return a });

        const internal_fns2 = internals.map(o => {
            return o.fn || function (a: any) { return a };
        });
        const internal_fns = internal_fns1.concat(internal_fns2);
        // @ts-ignore
        datas = uniq(datas.concat(internals), "url");
        return await Promise.all(datas.map(async (o: any, i: any) => {
            try {
                const data = internal_fns[i]((await axios.get(o.url)).data);
                return await this.createTx(data,
                    {
                        "Content-Kind": "Archive-Data",
                        "Archive-Id": o.id,
                        "from": this.address,
                    }
                )
            } catch (e) {
                return "Unknown Stream Error"
            }
        }));
    }
    createTx = async (data: any, tags: Kv): Promise<string> => {
        let transaction = await this.arweave.createTransaction({ data: JSON.stringify(data) }, jwk);
        transaction.addTag(APP_NAME_KEY, APP_NAME);
        for (const [key, value] of Object.entries(tags)) {
            transaction.addTag(key, value)
        }
        return await this.postTx(transaction);
    }
    postTx = async (transaction: any): Promise<any> => {
        //fast blocks hack
        const anchor_id = (await this.arweave.api.get('/tx_anchor')).data
        transaction.last_tx = anchor_id

        await this.arweave.transactions.sign(transaction, jwk)
        const response = await this.arweave.transactions.post(transaction)
        return transaction.id;
    }
    getArchiveUrls = async () => {
        let datas: Array<any> = [];
        const x = await this.arweave.arql({
            op: "and",
            ...APP_ARQL,
            expr2: {
                op: "equals",
                expr1: "Content-Kind",
                expr2: "Archive-Url"
            },
        });
        datas = await Promise.all(x.map(async (o: any) => {
            const tx = await this.arweave.transactions.get(o);
            return { id: tx.id, ...JSON.parse(tx.get('data', { decode: true, string: true })) }
        }));
        return datas;
    }
}
//@ts-ignore
function uniq(a, param) {
    //@ts-ignore
    return a.filter(function (item, pos, array) {
        //@ts-ignore
        return array.map(function (mapItem) { return mapItem[param]; }).indexOf(item[param]) === pos;
    })
}