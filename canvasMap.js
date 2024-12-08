// Plot constants
const WIDTH = 1400;
const HEIGHT = 800;

let svg, g, path, projection, colorScale, title, tooltip, tipCountry, tipData;
let hovered = false;
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function initChart(canvasElement) {
  // Visualization canvas
  svg = d3
    .select(canvasElement)
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  g = svg.append("g");

  // Labels
  title = g
    .append("text")
    .attr("class", "x-label")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT - 100)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle");

  // Map and projection
  path = d3.geoPath();
  projection = d3
    .geoEqualEarth()
    .scale(250)
    .center([0, 0])
    .translate([WIDTH / 2, HEIGHT / 2]);

  colorScale = d3
    .scaleLinear()
    .domain([-30, 0, 40])
    .range(["#00dfff", "#bbe9ff", "#ff0000"]);
    // .range(["#1788de", "#3C81B7", "#dc2f02"]);

  // Tooltip placeholder
  tooltip = d3.select(".tooltip");
}

function updateChart(topo, data, month) {
  const trans = d3.transition().duration(100);
  const currentYear = data.values().next().value[0].Year;
  title.text(`${monthNames[month]}, ${currentYear}`);

  // Draw map
  // Join
  const choroMap = g.selectAll("path").data(topo.features);

  // Exit
  choroMap.exit().remove();

  // Update
  choroMap
    .enter()
    .append("path")
    .merge(choroMap)
    .attr("class", "Country")
    .transition(trans)
    // draw each country
    .attr("d", path.projection(projection))
    // set the color of each country
    .attr("fill", function (d) {
      d.total = data.get(d.properties["iso_a3"]);

      return d.total ? colorScale(d.total[month].Temperature) : 30;
    });

  // Interactivity
  choroMap
    .on("pointermove", function (event, d) {
      hovered = true;
      tipCountry = d.total ? d.total[0].ISO3 : null;
      tipData = tipCountry
        ? data.get(tipCountry)[month]
        : {Country: "No available data", Temperature: ""};
      tooltip.html(tipData.Country + "<br/>" + tipData.Temperature + "℃");
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .transition()
        .duration(100)
        .style("opacity", 0.9)
        .style("font-size", "10px");
      d3.selectAll(".Country").transition().duration(50).style("opacity", 0.5);
      d3.select(this)
        .transition()
        .duration(50)
        .style("opacity", 1)
        .style("stroke", "#0A0A0A")
        .style("stroke-width", "0.5px");
    })
    .on("pointerleave", function (event) {
      hovered = false;
      // Country highlighting
      d3.selectAll(".Country").transition().duration(50).style("opacity", 1);
      d3.select(this).transition().duration(50).style("stroke", "none");
      // Tooltip
      tooltip.transition().duration(100).style("opacity", 0);
    });
  // Update tooltip data
  if (hovered) {
    tipData = tipCountry
      ? data.get(tipCountry)[month]
      : {Country: "No available data", Temperature: ""};
    tooltip.html(tipData.Country + "<br/>" + tipData.Temperature + "℃");
  }
}

export {initChart, updateChart};