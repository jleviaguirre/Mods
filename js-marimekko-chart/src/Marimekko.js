// @ts-ignore

import * as d3 from "d3"; 


export async function Marimekko(mod, context, dataView, windowSize, showBorders, showLabels) {
    /**
 * Helper functions  
 */
    function invertHex(hex) {
        hex = hex.slice(1, hex.length)
        //return "#" + (Number(`0x1${hex}`) ^ 0xffffff).toString(16).substr(1).toUpperCase()
        return context.styling.scales.font.color
    }

    //hide icon button settings if in read only
    d3.select(".icon-button.settings").classed("visible", context.isEditing)


    //set popup
    //1 show a popup when clicked
    //1.1 create popup contents
    const popoutContent = () => [
        mod.controls.popout.section({
            heading: "Marimekko Chart Options",
            children: [
                mod.controls.popout.components.checkbox({
                    name: "chk_values",
                    text: "Show values",
                    checked: true,
                    enabled: true
                }),
                mod.controls.popout.components.checkbox({
                    name: "chk_borders",
                    text: "Show borders",
                    checked: showBorders.value(),
                    enabled: true
                })
            ]
        })
    ]; 


    //show a right click menu on mod
    document.querySelector(".settings").onclick = (e) => {
        mod.controls.contextMenu.show(
            e.clientX - 100, e.clientY, [
            { text: "Borders", enabled: true, checked: showBorders.value() },
            { text: "Labels", enabled: true, checked: showLabels.value() },
        ]
        ).then(clickedItem => {
            if (clickedItem.text == "Borders") showBorders.set(!showBorders.value())
            if (clickedItem.text == "Labels") showLabels.set(!showLabels.value())
            drawMekko();
        })
    }


    //recreate demo data with spotfire data     
    let spotfireData = [];
    try {
        (await dataView.allRows()).forEach((r, i) => {
            let jsonData = {};
            jsonData["market"] = r.categorical("Category").value()[0].key;;
            jsonData["segment"] = r.categorical("Segment").value()[0].key;
            jsonData["color"] = r.color().hexCode;
            jsonData["value"] = r.continuous("Value").value();
            jsonData["index"] = i;

            spotfireData.push(jsonData);
        })
    } catch (error) {
        mod.controls.errorOverlay.show(error);
    }

    const data = spotfireData

    //mark categories and segments with shift+click or alt+click
    async function markRow(d, e) {
        if (!e.ctrlKey) dataView.clearMarking();
        (await dataView.allRows()).forEach(r => {
            let aCategory = r.categorical("Category").value()[0].key
            let aSsegment = r.categorical("Segment").value()[0].key
            if (e.shiftKey && d.market == aCategory) { r.mark("Toggle") } else
                if (e.altKey && d.segment == aSsegment) { r.mark("Toggle") } else
                    if (d.market == aCategory && d.segment == aSsegment) r.mark("Toggle")
        })
    }


    async function drawMekko() {

        //clear mod container contents
        d3.select("#mod-container").html("");


        var width = windowSize.width,
            height = windowSize.height,
            margin = 20;

        var x = d3.scale.linear()
            .range([0, width - 3 * margin]);

        var y = d3.scale.linear()
            .range([0, height - 2 * margin]);

        // var z = d3.scale.category10();

        var n = d3.format("#,#"),
            p = d3.format("%");


        var svg = d3.select("#mod-container").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + 2 * margin + "," + margin + ")");

        var offset = 0;

        // Nest values by segment. We assume each segment+market is unique.
        var segments = d3.nest()
            .key(function (d) { return d.segment; })
            .entries(data);

        // Compute the total sum, the per-segment sum, and the per-market offset.
        // You can use reduce rather than reduceRight to reverse the ordering.
        // We also record a reference to the parent segment for each market.
        var sum = segments.reduce(function (v, p) {
            return (p.offset = v) + (p.sum = p.values.reduceRight(function (v, d) {
                d.parent = p;
                return (d.offset = v) + d.value;
            }, 0));
        }, 0);

        // Add x-axis ticks.
        var xtick = svg.selectAll(".x")
            .data(x.ticks(10))
            .enter().append("g")
            .attr("class", "x")
            .attr("transform", function (d) { return "translate(" + x(d) + "," + y(1) + ")"; });

        xtick.append("line")
            .attr("y2", 6)
            .style("stroke", context.styling.scales.font.color);

        xtick.append("text")
            .attr("y", 8)
            .attr("text-anchor", "middle")
            .attr("dy", ".71em")
            .text(p)
            .attr("fill", context.styling.scales.font.color)

        // Add y-axis ticks.
        var ytick = svg.selectAll(".y")
            .data(y.ticks(10))
            .enter().append("g")
            .attr("class", "y")
            .attr("transform", function (d) { return "translate(0," + y(1 - d) + ")"; });

        ytick.append("line")
            .attr("x1", -6)
            .style("stroke", context.styling.scales.font.color);

        ytick.append("text")
            .attr("x", -8)
            .attr("text-anchor", "end")
            .attr("dy", ".35em")
            .text(p)
            .attr("fill", context.styling.scales.font.color);

        // Add a group for each segment.
        var segments = svg.selectAll(".segment")
            .data(segments)
            .enter().append("g")
            .attr("class", "segment")
            .attr("transform", function (d) { return "translate(" + x(d.offset / sum) + ")"; })
            .attr("xlink:title", function (d) { return d.key; })
            .on("click", function (d) {
                // console.log("sclick",d) 
            });

        // Add a rect for each market.
        var markets = segments.selectAll(".market")
            .data(function (d) { return d.values; })
            .enter().append("a")
            .attr("class", "market")
            .append("rect")
            .attr("y", function (d) { return y(d.offset / d.parent.sum); })
            .attr("height", function (d) { return y(d.value / d.parent.sum); })
            .attr("width", function (d) { return x(d.parent.sum / sum); })
            .on("mousedown", function (d) {
                markRow(d, d3.event)
            })
            .on("mouseover", function (d) {
                mod.controls.tooltip.show(d.market + " " + d.parent.key + ": " + n(d.value));
            })
            .on("mouseout", mod.controls.tooltip.hide)
            .style("fill", function (d) { return d.color; });

        //show labels
        if (showLabels.value()) {
            d3.selectAll(".market").append("text")
                .attr("y", d => {return y(d.offset / d.parent.sum) + (y(d.value / d.parent.sum)) / 2 })
                .attr("x", d => { return (x(d.parent.sum / sum)) / 2 })
                .attr("dy", ".35em")
                .text(d => { return n(d.value) }) 
                .attr("fill", d => {
                    return context.styling.scales.font.color
                })
        }

        //show borders
        d3.selectAll(".market rect").attr("stroke", d => { return showBorders.value() ? invertHex(d.color) : "none" })

    }
    drawMekko();

} 