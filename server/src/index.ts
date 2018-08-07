import { SDBServer } from 'sdb-ts';
import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';

const port = 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sdbServer = new SDBServer(wss);
const doc = sdbServer.get('touchdoc', 'touchdoc');
doc.createIfEmpty({ tg: {}, ps: {} });
app.use(express.static('../editor'));

server.listen(port); 
console.log(`Listening on port ${port}`)