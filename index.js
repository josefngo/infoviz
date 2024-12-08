import * as canvasMap from "./canvasMap.js";
import * as radiusChart from "./radiusChart.js";

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

const start = 1901;
const end = 2020;
let country = "RUS";  
let year = start;
let month = 0;

// Init slider variables
//const slider = document.getElementById("yearSlider");
const slider = document.getElementById("year-slider");
slider.min = start;
slider.max = end;

// Init charts
radiusChart.initChart("#radiusChart");
canvasMap.initChart("#canvasMap");

// Datasets to load
const dataPromises = [
  d3.csv("data/temp-1901-2020-all.csv"),
  d3.csv("data/HadCRUT4.csv"),
  d3.json("data/world.geo.json"),
];

function updateMapColors(year) {
  d3.select("#year-label").text(year);

  svg.selectAll(".country").style("fill", function(d) {
      const countryData = temperatureData.find(row => row.Country === d.properties.name && row.Year == year);
      if (countryData) {
          // Scale temperature to color
          const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([-0.5, 1.5]);
          return colorScale(countryData.delta);
      }
      return "lightblue";  // Default color if no data
  });
}

// Load datasets and start visualization
Promise.all(dataPromises).then(function (data) {
  const topoData = data[2];
  // Group data per country and per year
  const tempData = d3.group(
    data[0],
    (d) => d.Year,
    (d) => d.ISO3
  );
  const anomalyData = d3.group(
    data[1],
    (d) => d.Year
  );

  function updateCharts() {
    const yearData = tempData.get(String(year));
    const countryData = yearData.get(country);
    radiusChart.updateChart(anomalyData, year);
    canvasMap.updateChart(topoData, yearData, month);
    console.log("year:",year);
    updateMapColors(year);
  }
  updateCharts();

  let interval = d3.interval(() => {
    year = year < end ? year + 1 : start;
    slider.value = year;
    updateCharts();
  }, 400);

  // UI
  // Slider
  let moving = true;
  slider.addEventListener("input", (event) => {
    if (moving) {
      interval.stop();
    }
    year = +slider.value;
    updateCharts();
  });
  slider.addEventListener("pointerup", (event) => {
    if (moving) {
      interval = d3.interval(() => {
        year = year < end ? year + 1 : start;
        slider.value = year;
        updateCharts();
      }, 400);
    }
  });
  // Play/pause button
  const playButton = d3.select("#play-button");
  playButton.on("click", function () {
    const button = d3.select(this);
    if (button.text() == "Pause") {
      moving = false;
      interval.stop();
      button.text("Play");
    } else {
      moving = false;
      interval = d3.interval(() => {
        year = year < end ? year + 1 : start;
        slider.value = year;
        updateCharts();
      }, 400);
      button.text("Pause");
    }
  });

  // Add years to years drop down menu
  for (let year of tempData.keys()) {
    document.getElementById(
      "year-list"
    ).innerHTML += `<li><a class="dropdown-item">${year}</a></li>`;
  }
  // Change year according to year menu
  document.querySelectorAll("#year-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      year = +event.target.innerHTML;
      slider.value = year;
      updateCharts();
    })
  );

  // Add countries to countries drop down menu
  for (let [iso, isoData] of tempData.get(String(start))) {
    const countryName = isoData[0].Country;
    document.getElementById(
      "country-list"
    ).innerHTML += `<li><a class="dropdown-item" value=${iso}>${countryName}</a></li>`;
  }
  // Change country according to country menu
  document.querySelectorAll("#country-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      country = event.target.getAttribute("value");
      updateCharts();
    })
  );


});


