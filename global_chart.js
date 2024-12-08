import { fetchData, calcGlobalTemp, calcGlobalEmission } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    fetchData()
        .then(([temperatureData, emissionsData]) => {
            const globalTemp = calcGlobalTemp(temperatureData);
            const globalEmissions = calcGlobalEmission(emissionsData);
            console.log("temperature data: ",temperatureData);

            createGraph(globalTemp, globalEmissions);
        })
        .catch(error => console.error("Error fetching data:", error));
});

function createGraph(globalTemp, globalEmissions) {
    const years = d3.range(1865, 2015);
    const temperatures = years.map(year => {
        const record = globalTemp.find(d => d.Year === year);
        return record ? record.averageGlobalTemperature : null;
    });
    const co2Values = years.map(year => {
        const record = globalEmissions.find(d => d.Year === year);
        return record ? record.averageGlobalEmission : null;
    });

    const ctx = document.getElementById('temperatureCO2Chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temperatures,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y',
                },
                {
                    label: 'CO2 Emissions (Mt)',
                    data: co2Values,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    yAxisID: 'y1',
                },
            ],
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            stacked: false,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Global Mean Temperature (°C)' },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Global CO2 Emissions (Mt)' },
                    grid: { drawOnChartArea: false },
                },
            },
        },
    });
}

// Year slider interaction
d3.select("#year-slider").on("input", function() {
    const year = this.value;
    updateMapColors(year);
});

// Update map colors based on selected year
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

// Open the selected panel
function openPanel(panel_id) {
    const sidePanel = document.getElementById(panel_id);
    if(panel_id=="side-panel-right"){
        sidePanel.style.right = "0";
    }else{
        sidePanel.style.left = "0"; 
    }
    sidePanel.style.visibility = "visible";
}

// Close the selected panel
function closePanel(panel_id) {
        const sidePanel = document.getElementById(panel_id);
        sidePanel.style.right = "-300px";  // Move it off-screen
        setTimeout(() => {
            sidePanel.style.visibility = "hidden";
        }, 300);
}