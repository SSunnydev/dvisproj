
(function () {
    //iife - this wraps the code in a function so it isn't accidentally exposed 

    var width = 800, height = 600

    //read in our json file
    Promise.all([
        d3.json("./topo.json"),
        d3.csv("./fivemonth.csv")]).then((data) => { //topojson file
 
            //declare data   
            const width = 750;
            const height = 750;
            const topology = data[0];
            const months = data[1];

            const stateDictionary = new Map();
            months.forEach((state) => {
                stateDictionary.set(state.state_name, +state.total_population) 
            })

            var reds = d3.scaleSequential()
                .domain(d3.extent(stateDictionary.values()))
                .range(["white", "pink"]);

            var projection = d3.geoAlbersUsa().scale(700).translate([width / 2, height / 2])

            var path = d3.geoPath(projection);

            const topo = topojson.feature(topology, topology.objects.states)

             // Join the data to the GeoJSON features
            topology.objects.states.geometries.forEach((state) => {
            const stateName = state.properties.name;
            const stateData = months.find((d) => d.state_name === stateName);
            state.properties.data = stateData;
            })

            const svg = d3.select("#geomap").append('svg').attr("width", width).attr("height", height).attr('transform', 'translate(50,50)');

            //tooltip
            const Tooltip = d3.select("#geomap")
                .append("div")
                .style("position", "absolute")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("background-color", "grey")
                .style("color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("padding", "5px")

            //tooltip hover actions
            const mouseover = function () {
                Tooltip.style("opacity", 1)
            }
            var mousemove = function (event, d) {
                Tooltip
                    .html("State: " + d.properties.data.state_name + "<br>" + "Total Elderly Deaths: " + d.properties.data.total_population + "<br>" + "2021-09: " + d.properties.data.Sep_21 + "<br>" + "2021-10: " + d.properties.data.Oct_21 + "<br>" + "2021-11: " + d.properties.data.Nov_21 + "<br>" + "2021-12: " + d.properties.data.Dec_21) 
                    .style("left", (event.x) - 0 + "px") //ink
                    .style("top", (event.y) - 70 + "px")
                    console.log(d.properties)
            }
            var mouseleave = function () {
                Tooltip.style("opacity", 0)
            }

            svg.append("g")
                .selectAll("path")
                .data(topo.features)
                .join("path")
                .attr("class", "state")
                .attr("d", path)
                .attr("fill", function (d) {
                    return reds(stateDictionary.get(d.properties.name));
                })
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);
        })

})();
