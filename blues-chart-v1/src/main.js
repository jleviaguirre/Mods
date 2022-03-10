/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

//@ts-check - Get type warnings from the TypeScript language server. Remove if not wanted.

/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
Spotfire.initialize(async (mod) => {
    /**
     * Create the read function.
     */
    const reader = mod.createReader(mod.visualization.data(), mod.windowSize(), mod.property("myProperty"));

    /**
     * Store the context.
     */
    const context = mod.getRenderContext();

    /**
     * Initiate the read loop
     */
    reader.subscribe(render);

    /**
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} windowSize
     * @param {Spotfire.ModProperty<string>} prop
     */
    async function render(dataView, windowSize, prop) {
        /**
         * Check the data view for errors
         */
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Showing an error overlay will hide the mod iframe.
            // Clear the mod content here to avoid flickering effect of
            // an old configuration when next valid data view is received.
            mod.controls.errorOverlay.show(errors);
            return;
        }
        mod.controls.errorOverlay.hide();

        /**
         * Get the hierarchy of the categorical X-axis.
         */
        const xHierarchy = await dataView.hierarchy("X");
        const xRoot = await xHierarchy.root();

        if (xRoot == null) {
            // User interaction caused the data view to expire.
            // Don't clear the mod content here to avoid flickering.
            return;
        }

        /**
         * Print out to document
         */
        // const container = document.querySelector("#mod-container");
        // container.textContent = `windowSize: ${windowSize.width}x${windowSize.height}\r\n`;
        // container.textContent += `should render: ${xRoot.rows().length} rows\r\n`;
        // container.textContent += `${prop.name}: ${prop.value()}`;

        /**
         * Signal that the mod is ready for export.
         */
        // context.signalRenderComplete();
        
        //

        //color: getColor(node, tasksRootNode, colorAxis.isCategorical)
        const axes = await dataView.axes();
        const colorAxis = axes.filter(e=>{return e.name=="Color"})[0]

        var colorHierarchy;
        if(colorAxis.isCategorical){
            colorHierarchy = await dataView.hierarchy("Color");
        
        }else{
            colorHierarchy = await dataView.continuousAxis("Color");
        }
        
        //const colorValue = node.rows()[0].categorical("Color").value()[0].key;
        //const colorValue = node.rows()[0].continuous("Color").value();
        
        var dataRows=[];

        //get colors
        const rows = await dataView.allRows()
        let xValue
        rows.forEach(r=>{
            if(colorAxis.isCategorical){
                xValue = r.categorical("Color").value()[0].key;
            }else{ 
                xValue = r.continuous("Color").formattedValue();
            }
            const name = r.categorical("X").formattedValue();
            const yValue = r.continuous("Y").value();
            const color = r.color().hexCode;
            const tooltip = `${name}\nPopulation Growth: ${Math.floor((xValue * 100).toFixed(2)) + '%'
        }\nPopulation: ${yValue}`

            let aCol = `
            <div title='${tooltip}' style="flex-grow:${yValue}; background:${color}" class='column'></div>
            `
            dataRows.push(aCol)


        })
        let html = `<div class='wraper row'><div class='center row'>
        ${dataRows.join("")}
        </div></div>
        <style>
         .wraper{
          height: ${windowSize.height}px;
          justify-content: space-between;
        }
        </style>    
       `

        document.getElementById("mod-container").innerHTML=html
    }

 
    //     return
    //     const colorLeafNodes = (await colorHierarchy.root()).leaves();
    //     const colorDomain = colorHierarchy.isEmpty ? ["All Values"] : colorLeafNodes.map((node) => node.formattedPath());
        
        
    //     const xLeafNodes = (await xHierarchy.root()).leaves();
    //     const xDomain = xLeafNodes.map(node => node.formattedValue());
        
    //     const dataColumns = ["Columns"]; 
    //     colorDomain.forEach(value => dataColumns.push(value, { role: "style" }));
        
    //     dataRows = [];
    //     xLeafNodes.forEach(  
    //         (node) => {
    //         let valueAndColorPairs = new Array(colorLeafNodes.length).fill([0, ""]).flat()
    //         node.rows().forEach((r) => {
    //             let colorIndex = !colorHierarchy.isEmpty ? r.categorical("Color").leafIndex : 0;
    //             let yValue = r.continuous("Y").value();
    //             valueAndColorPairs[colorIndex * 2] = yValue;
    //             valueAndColorPairs[colorIndex * 2 + 1] = r.color().hexCode;
    //             let color = r.color().hexCode;
    //             let value = yValue;
    //             let name="";  
    //             let aCol = `
    //             <div title='${value}' style="flex-grow:${value}; background:${color}" class='column'>${name}</div>
    //             `
    //             dataRows.push(aCol)
    //         });
    //         //const dataRow = [node.formattedPath(), valueAndColorPairs].flat();
    //     }
    // );

    //     let html = `<div class='wraper row'><div class='center row'>
    //     ${dataRows.join("")}
    //     </div></div>
    //     <style>
    //      .wraper{
    //       height: ${windowSize.height}px;
    //       justify-content: space-between;
    //     }
    //     </style>    
    //    `

    //     document.getElementById("mod-container").innerHTML=html
    // }


    // function getColor(node: DataViewHierarchyNode, root: DataViewHierarchyNode, isCategorical: boolean) {
    //     let color;


    //     if (node.leafIndex === undefined) {

    //         if (isCategorical) {
    //             const colorValue = node.rows()[0].categorical("Color").value()[0].key;
    //             const differentElements = node.rows().filter((r) => {
    //                 return r.categorical("Color").value()[0].key !== colorValue;
    //             }).length;
    //             if (differentElements > 0) {
    //                 color = config.defaultBarColor;
    //             }
    //         } else {
    //             const colorValue = node.rows()[0].continuous("Color").value();
    //             const differentElements = node.rows().filter((r) => {
    //                 return r.continuous("Color").value() !== colorValue;
    //             }).length;
    //             if (differentElements > 0) {
    //                 color = config.defaultBarColor;
    //             }
    //         }
    //     } else {
    //         color = node.rows()[0].color().hexCode;
    //     }

    //     return color;
    // }

});


