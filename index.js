const express = require("express");
const app = express();

const server = require("http").Server(app);
const SocketServer = require("./lib/server");
SocketServer.bindSocketIO(server);

server.listen(8080);
app.use(express.static("./public"));
