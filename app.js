if (process.env.NODE_ENV !== "production") {
    require("dotenv").load();
}

const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("port", process.env.PORT || 3000);

app.use("/public", express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

let currentStocks = {data: [], type: "initial"};

wss.on("connection", (ws, req) => {
    ws.on("message", (request) => {
        request = JSON.parse(request);
        const symbol = request.symbol;
        if (request.type === "add") {
            getInfo(symbol, (data) => {
                currentStocks.data.push(data);
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        data.type = "add";
                        send(client, data);
                    }
                });
            });
        }
    });

    send(ws, currentStocks);
});

require("./routes.js")(app);

server.listen(app.get("port"));

function getInfo(symbol, cb) {
    http.request({
        host: "www.alphavantage.co",
        path: `/query?apikey=${process.env.ALPHA_VANTAGE_KEY}&function=TIME_SERIES_DAILY&symbol=${symbol}`
    }, (response) => {
        let data = "";
        response.on("data", (chunk) => {
            data += chunk;
        });
        response.on("end", () => {
            cb(JSON.parse(data));
        });
    }).end();
}

function send(ws, obj) {
    ws.send(JSON.stringify(obj));
}
