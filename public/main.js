const socket = new WebSocket(`ws://${window.location.host}`);

let stocks = [];

socket.addEventListener("message", (e) => {
    const data = parse(e);
    if (data.type === "initial") {
        stocks = data.data;
        setDisplay(stocks);
    } else if (data.type === "add") {
        stocks.push(data);
        addStock(data);
    } else if (data.type === "remove") {
        stocks.forEach((stock, i) => {
            if (sym(stock) === data.symbol) {
                stocks.splice(i, 1);
                removeStock(stock);
            }
        });
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

function removeStock(stock) {
    $(`#${sym(stock)}`).remove();
}

function addStock(stock) {
    const s = sym(stock);
    $("#display").append(`<div id="${s}"><button id="${s}-b" class="btn btn-info">${s}</button></div>`);
    $(`#${s}-b`).click((e) => {
        send({
            type: "remove",
            symbol: s
        })
    });
}

function setDisplay(stocks) {
    stocks.forEach((stock) => {
        addStock(stock);
    });
}

function send(obj) {
    socket.send(JSON.stringify(obj));
}

function parse(e) {
    return JSON.parse(e.data);
}

function sym(stock) {
    return stock["Meta Data"]["2. Symbol"];
}
