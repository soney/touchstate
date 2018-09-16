import { SDBServer } from 'sdb-ts';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as ip from 'ip';
import * as express from 'express';
import * as WebSocket from 'ws';
import { BehaviorDoc } from '../../interfaces';


const RECORDINGS_DIRECTORY = 'saved';
function writeBehavior(data: BehaviorDoc): Promise<void> {
    const timestamp = Math.round((new Date()).getTime()/1000);
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(RECORDINGS_DIRECTORY)) {
            fs.mkdirSync(RECORDINGS_DIRECTORY);
        }
        fs.writeFile(path.join(RECORDINGS_DIRECTORY, `beh_${timestamp}.json`), JSON.stringify(data), 'utf8', () => {
            resolve();
        });
    });
}

function loadBehavior(fname: string): Promise<BehaviorDoc> {
    return new Promise((resolve, reject) => {
        fs.readFile(fname, 'utf8', (err, data) => {
            if(err) { reject(err); }
            resolve(JSON.parse(data));
        });
    });
}
(async () => {
    const port = 3000;
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });
    const sdbServer = new SDBServer(wss);
    const doc = sdbServer.get<BehaviorDoc>('touchdoc', 'touchdoc');
    let initData: BehaviorDoc;
    if (process.argv.length > 2) {
        const fname = process.argv[2];
        initData = await loadBehavior(fname);
    } else {
        initData = { code: '', fsm: null, touchGroups: {}, paths: {}, codeErrors: [] };
    }
    wss.on('connection', (ws) => {
        ws.on('message', async (message) => {
            if(message === 'save') {
                await doc.fetch();
                writeBehavior(doc.getData());
            }
        });
    });
    doc.createIfEmpty(initData);
    app.use('/', express.static(path.join('.', 'static')));
    app.use('/editor', express.static(path.join('..', 'editor', 'build')));
    app.use('/code', express.static(path.join('..', 'editor', 'build')));
    app.use('/touchui', express.static(path.join('..', 'touchui', 'build')));

    server.listen(port); 
    console.log(`Listening at ${ip.address()}:${port}`);
})();