
export function fetchData() {
    return Promise.all([
        d3.csv("data/combined_temperature_with_delta.csv").then(data =>
            data.map(d => ({
                Country: d.Country,
                Year: +d.Year,
                Annual_Mean: d.Annual_Mean,
                delta: +d.delta,
            }))
        ),
        d3.csv("data/fossil-fuel-co2-emissions-by-nation.csv").then(data =>
            data.map(d => ({
                Country: d.Country.toUpperCase(),
                Year: +d.Year,
                Total: +d.Total,
            }))
        ),
    ]);
}

export function calcGlobalTemp(data) {
    const groupedByYear = d3.group(data, d => d.Year);
    return Array.from(groupedByYear, ([Year, records]) => ({
        Year,
        averageGlobalTemperature: d3.mean(records, d => d.delta),
    }));
}

export function calcGlobalEmission(data) {
    const groupedByYear = d3.group(data, d => d.Year);
    return Array.from(groupedByYear, ([Year, records]) => ({
        Year,
        averageGlobalEmission: d3.sum(records, d => d.Total),
    }));
}