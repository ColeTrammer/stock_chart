$(document).ready(() => {
    /*d3 code to graph the stocks*/
    function graph(stocks) {
        const width = 1000;
        const height = 400;

        const margin = {
            top: 30,
            bottom: 30,
            right: 30,
            left: 60
        };

        const svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g")
            .attr("transform", `translate(${[margin.left, margin.right]})`)
            .attr("id", "lines");

        const x = d3.scaleTime()
            .range([0, width])
            .domain([new Date(), new Date()]);

        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([10000, 0]);

        const line = d3.line()
            .x((d) => x(d.time))
            .y((d) => y(d.price));


        for (let i = 0; i < stocks.length; i++) {
            const stock = stocks[i];
            stock.data.forEach((d) => {
                if (typeof d.time === "string") {
                    d.time = new Date(...d.time.split("-").map((d, i) => i === 1 ? d - 1 : +d));
                }
                d.price = +d.price;
            });

            const newXExtent = d3.extent(stock.data, (d) => d.time);
            newXExtent[0] = Math.min(x.domain()[0], newXExtent[0]);
            newXExtent[1] = Math.max(x.domain()[1], newXExtent[1]);

            const newYExtent = d3.extent(stock.data, (d) => d.price);
            newYExtent[0] = Math.min(y.domain()[0], newYExtent[0]);
            newYExtent[1] = Math.max(y.domain()[1], newYExtent[1]);

            x.domain(newXExtent);
            y.domain(newYExtent);
        }

        stocks.forEach((stock) => {
            g.append("path")
                .datum(stock.data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("id", `${sym(stock)}-path`)
                .attr("class", "line")
                .attr("d", line);
        });

        g.append("g")
            .attr("transform", `translate(${[0, height]})`)
            .call(d3.axisBottom(x).ticks(7, d3.timeFormat("%b %Y")));

        g.append("g")
            .call(d3.axisLeft(y).tickFormat(d3.format("$.4")))
          .append("text")
            .attr("fill", "#FFF")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .text("Price");
    }
    /*Web Socket code to interact with the server*/
    const socket = new WebSocket(`ws://${window.location.host}`);

    let stocks = [];

    /*use json to communicate with the websocket server
    update the client model based on the type of message recieved
    then update the display to match the model
    ui sends messages to the server, which then are rebounded to this handler
    that updates the model and display*/
    socket.addEventListener("message", (e) => {
        const data = parse(e);
        if (data.type === "initial") {
            stocks = data.data;
            initDisplay(stocks);
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

    $("#submit").click((e) => {
        const symbol = $("#symbol").val();
        send({
            type: "add",
            symbol: symbol
        });
        e.preventDefault();
    });

    function removeStock(stock) {
        $(`#${sym(stock)}`).remove();
        $("#lines").remove();
        graph(stocks);
    }

    function addStock(stock, initialRender) {
        const s = sym(stock);
        $("#display").append(`<div class="stock col-md-4" id="${s}"><h3>${s} <small><a id="${s}-b">Remove</a></small></h3></div>`);
        $(`#${s}-b`).click((e) => {
            send({
                type: "remove",
                symbol: s
            });
        });
        if (!initialRender) {
            $("#lines").remove();
            graph(stocks);
        }
    }

    function initDisplay(stocks) {
        stocks.forEach((stock) => {
            addStock(stock, true);
        });
        graph(stocks);
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
});
