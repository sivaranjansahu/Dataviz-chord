
var width = 960,
    height = 900,
    radius = 240;

var angle = d3.scale.ordinal()
    .rangePoints([0, 360], 1);

var colorscale = d3.scale.category20();


var svg = d3.select("#viz").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");



d3.json("network.json", function (error, nodes) {
    if (error) throw error;

    var nodeByName = d3.map(),
        links = [];

    nodes.forEach(function (d) { nodeByName.set(d.name, d); });

    nodes.forEach(function (source) {
        source.connections.forEach(function (target) {
            links.push({ source: source, target: nodeByName.get(target.key) });
        });
    });

    angle.domain(nodes.map(function (d) { return d.name; }));

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(links)
        .enter().append("path")
        .attr("d", curve)
        .attr("source", function (d) {
            return d.source.name
        })
        .attr("target", function (d) {
            return d.target.name
        })
        .attr('parentselected', false)
        .attr("class", "curve")
        .on("click", function (d) {
            $('.databox').removeClass('visible');
            d3.selectAll('.selectedPathInner').each(function (d) {
                d3.select(this).classed('selectedPathInner', false);
                d3.select(this).style('opacity',0.4)
            })
            d3.select(this).classed("selectedPathInner", true);
            populateData(d);
        })
    var parentSelected = false;
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")
        .attr("transform", function (d) { return "rotate(" + angle(d.name) + ")translate(" + radius + ",0)"; })
        .attr('class','node')
        .style("fill", function (d, i) { return colorscale(i) })
        .attr('color', function (d, i) { return colorscale(i) })
        .on("click", function (d, i) {
            $('.databox').removeClass('visible');
            d3.selectAll('.curve , .selectedPathInner').style('stroke', 'rgb(51, 51, 51)')
            var selectedNode = this;
            d3.selectAll('.selectedPathInner').each(function (d) {
                d3.select(this).classed('selectedPathInner', false);

            })
            d3.selectAll("[source=" + d.name + "] , [target=" + d.name + "] ")
                .each(function (d, i) {

                    d3.select(this).style("stroke", d3.select(selectedNode).attr("color"))

                })
        })

    node.append("circle")
        .attr("r", 10)
        .style('fill', function (d, i) { return colorscale(i) })

    node.append("text")
        .attr("dy", ".35em")
        .attr("x", 15)
        .text(function (d) { return d.name; })
        .filter(function (d) { return (angle(d.name) + 90) % 360 > 180; }) // flipped
        .attr("x", -15)
        .attr("transform", "rotate(-180)")
        .style("text-anchor", "end");
});

function populateData(data) {

    $('.databox').addClass('visible');
    console.log(data);
    document.getElementById('sourcetext').innerHTML = data.source.name;
    document.getElementById('targettext').innerHTML = data.target.name;
    var descObj = data.source.connections.find(function (item) {
        return item.key === data.target.name
    });
    document.getElementById('interactiontext').innerHTML = descObj.interaction
}

function curve(link) {
    var a0 = angle(link.source.name) / 180 * Math.PI,
        a1 = angle(link.target.name) / 180 * Math.PI,
        x0 = Math.cos(a0) * radius, y0 = Math.sin(a0) * radius,
        x1 = Math.cos(a1) * radius, y1 = Math.sin(a1) * radius,
        dx = x0 - x1,
        dy = y0 - y1,
        l = Math.sqrt(dx * dx + dy * dy);
    return "M" + x0 + "," + y0
        + "A" + l * 2 + "," + l * 2 + " 0 0 1 "
        + x1 + "," + y1;
}
