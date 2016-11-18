var userIds = [];
for (var i = 0; i < 300; i++) {
    userIds.push(Math.floor(Math.random() * 1000000));
}

var userData = userIds.map(function (id) {
    return {
        userId: id,
        score: 2 * Math.random() * Math.random() - 1,
        confidence: 10 * Math.random() + 1,
        frequency: Math.floor(Math.random() * 10),
    };
});

var margin = {
        top: 20,
        right: 15,
        bottom: 60,
        left: 60
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .domain([-1, 1])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0, d3.max(userData, function (d) {
        return d.frequency;
    })])
    .range([0, height]);

var y2 = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

var simulation = d3.forceSimulation(userData)
    .force("x", d3.forceX(function (d) {
        return x(d.score);
    }).strength(1))
    .force("y", d3.forceY(0))
    .force("collide", d3.forceCollide(4))
    .stop();

for (var i = 0; i < 3000; ++i) simulation.tick();

var chart = d3.select('body')
    .append('svg:svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'chart')

var main = chart.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main')

// draw the x axis
var xAxis = d3.axisBottom()
    .scale(x);

main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis date')
    .call(xAxis);

// draw the y axis
var yAxis = d3.axisLeft()
    .scale(y);

main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis date')
    .call(yAxis);

var g = main.append("svg:g");

g.selectAll("scatter-dots")
    .data(userData)
    .enter().append("svg:circle")
    .attr("cx", function (d, i) {
        return d.x;
    })
    .attr("cy", function (d) {
        return d.y;
    })
    .attr("r", 3);

var numHistBins = Math.ceil(Math.sqrt(userData.length));
var bandwith = 1;

function kernelDensityEstimator(kernel, xs) {
    return function (sample) {
        return xs.map(function (x) {
            return [x, d3.mean(sample, function (v) {
                return kernel(x - v.score);
            })];
        });
    };
}

function epanechnikovKernel(bandwith) {
    return function (u) {
        if (Math.abs(u = u / bandwith) <= 1) {
            return 0.75 * (1 - u * u) / bandwith;
        } else return 0;
    };
}

var kde = kernelDensityEstimator(epanechnikovKernel(bandwith), x.ticks(100));
console.log(kde(userData));

main.append("path")
    .datum(kde(userData))
    .attr("class", "line")
    .attr("d", d3.line()
        .x(function (d) {
            return x(d[0]);
        })
        .y(function (d) {
            return y2(d[1]);
        })
    );