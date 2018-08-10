"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sdb_ts_1 = require("sdb-ts");
var http = require("http");
var express = require("express");
var WebSocket = require("ws");
var port = 3000;
var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server: server });
var sdbServer = new sdb_ts_1.SDBServer(wss);
var doc = sdbServer.get('touchdoc', 'touchdoc');
doc.createIfEmpty({ tg: {}, ps: {} });
app.use(express.static('../editor'));
server.listen(port);
console.log("Listening on port " + port);
//# sourceMappingURL=index.js.map