"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sdb_ts_1 = require("sdb-ts");
var http = require("http");
var express = require("express");
var WebSocket = require("ws");
var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server;
var sdbServer = new sdb_ts_1.SDBServer(wss);
var doc = sdbServer.get('touchdoc', 'touchdoc');
doc.createIfEmpty({
    tg: {},
    ps: {}
});
app.use(express.static('../editor'));
server.listen(3000);
//# sourceMappingURL=index.js.map