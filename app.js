const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("port", process.env.PORT || 3000);

app.use("/public", express.static(path.join(__dirname, "public")));

app.use((req, res) => {
  res.render("index");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

wss.on("connection", (ws, req) => {
    ws.on("message", (data) => {
        data = JSON.parse(data);
    });

    send(ws, {data: "data"});
});

server.listen(app.get("port"));

function send(ws, obj) {
    ws.send(JSON.stringify(obj));
}
