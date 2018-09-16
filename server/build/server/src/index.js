"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var sdb_ts_1 = require("sdb-ts");
var fs = require("fs");
var path = require("path");
var http = require("http");
var ip = require("ip");
var express = require("express");
var WebSocket = require("ws");
var RECORDINGS_DIRECTORY = 'saved';
function writeBehavior(data) {
    var timestamp = Math.round((new Date()).getTime() / 1000);
    return new Promise(function (resolve, reject) {
        if (!fs.existsSync(RECORDINGS_DIRECTORY)) {
            fs.mkdirSync(RECORDINGS_DIRECTORY);
        }
        fs.writeFile(path.join(RECORDINGS_DIRECTORY, "beh_" + timestamp + ".json"), JSON.stringify(data), 'utf8', function () {
            resolve();
        });
    });
}
function loadBehavior(fname) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fname, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
}
(function () { return __awaiter(_this, void 0, void 0, function () {
    var port, app, server, wss, sdbServer, doc, initData, fname;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                port = 3000;
                app = express();
                server = http.createServer(app);
                wss = new WebSocket.Server({ server: server });
                sdbServer = new sdb_ts_1.SDBServer(wss);
                doc = sdbServer.get('touchdoc', 'touchdoc');
                if (!(process.argv.length > 2)) return [3 /*break*/, 2];
                fname = process.argv[2];
                return [4 /*yield*/, loadBehavior(fname)];
            case 1:
                initData = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                initData = { code: '', fsm: null, touchGroups: {}, paths: {}, codeErrors: [] };
                _a.label = 3;
            case 3:
                wss.on('connection', function (ws) {
                    ws.on('message', function (message) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(message === 'save')) return [3 /*break*/, 2];
                                    return [4 /*yield*/, doc.fetch()];
                                case 1:
                                    _a.sent();
                                    writeBehavior(doc.getData());
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); });
                });
                doc.createIfEmpty(initData);
                app.use('/', express.static(path.join('.', 'static')));
                app.use('/editor', express.static(path.join('..', 'editor', 'build')));
                app.use('/code', express.static(path.join('..', 'editor', 'build')));
                app.use('/touchui', express.static(path.join('..', 'touchui', 'build')));
                server.listen(port);
                console.log("Listening at " + ip.address() + ":" + port);
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=index.js.map