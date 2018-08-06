import { SDBServer } from 'sdb-ts';
import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server

const sdbServer = new SDBServer(wss);
const doc = sdbServer.get('touchdoc', 'touchdoc');
doc.createIfEmpty({
    tg: {},
    ps: {}
});

app.use(express.static('../editor'));

server.listen(3000); 