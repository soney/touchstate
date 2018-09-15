import { SDBServer } from 'sdb-ts';
import * as path from 'path';
import * as http from 'http';
import * as ip from 'ip';
import * as express from 'express';
import * as WebSocket from 'ws';
import { BehaviorDoc } from '../../interfaces';

const port = 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sdbServer = new SDBServer(wss);
const doc = sdbServer.get<BehaviorDoc>('touchdoc', 'touchdoc');
doc.createIfEmpty({ code: '', fsm: null, touchGroups: {}, paths: {}, codeErrors: [] });
app.use('/', express.static(path.join('.', 'static')));
app.use('/editor', express.static(path.join('..', 'editor', 'build')));
app.use('/code', express.static(path.join('..', 'editor', 'build')));
app.use('/touchui', express.static(path.join('..', 'touchui', 'build')));

server.listen(port); 
console.log(`Listening at ${ip.address()}:${port}`);