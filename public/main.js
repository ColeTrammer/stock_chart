const socket = new WebSocket(`ws://${window.location.host}`);

// Connection opened
socket.addEventListener('open', function (event) {
    send({data: "data"});
});

// Listen for messages
socket.addEventListener('message', function (e) {
    const data = parse(e);
});

function parse(e) {
    return JSON.parse(e.data);
}

function send(obj) {
    socket.send(JSON.stringify(obj));
}
