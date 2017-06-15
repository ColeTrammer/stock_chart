const socket = new WebSocket(`ws://${window.location.host}`);

let stocks = [];

socket.addEventListener("message", (e) => {
    const data = parse(e);
    if (data.type === "initial") {
        stocks = data.data;
    } else {
        stocks.push(data);
    }
    console.log(stocks);
});

$(document).ready(() => {
    $("#submit").click((e) => {
        socket.send($("#symbol").val());
    });
});

function parse(e) {
    return JSON.parse(e.data);
}
