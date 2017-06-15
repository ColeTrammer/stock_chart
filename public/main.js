const socket = new WebSocket(`ws://${window.location.host}`);

let stocks = [];

socket.addEventListener("message", (e) => {
    const data = parse(e);
    if (data.type === "initial") {
        stocks = data.data;
    } else if (data.type === "add") {
        stocks.push(data);
    }
    console.log(stocks);
});

$(document).ready(() => {
    $("#submit").click((e) => {
        const symbol = $("#symbol").val();
        send({
            type: "add",
            symbol: symbol
        });
    });
});

function send(obj) {
    socket.send(JSON.stringify(obj));
}

function parse(e) {
    return JSON.parse(e.data);
}
