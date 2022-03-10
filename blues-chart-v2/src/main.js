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
     * Clears the DOM.
     */
         function clear() {
            document.getElementById("mod-container").innerHTML="";      }

     /**
     * Function used in bailout clauses in main rendering function. Optionally shows message(s)
     * to the user.
     */function bailout(messages) {
        clear();
        if (messages) {
            mod.controls.errorOverlay.show(messages);
        } else {
            mod.controls.errorOverlay.hide();
        }
    }




    /**
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} windowSize
     * @param {Spotfire.ModProperty<string>} prop
     */
    async function render(dataView, windowSize, prop) {
        // Clear any open tooltips
        mod.controls.tooltip.hide();

        // Check for data view errors
        const errors = await dataView.getErrors();
        if (errors.length > 0) {
            bailout(errors);
            return;
        }
        
        const rowCount = await dataView.rowCount();

        // Bailout for empty visualization
        if (rowCount === 0) {
            bailout();
            return;
        }
    
        // Bailout if there is more data than we can gracefully render.
        const maxRowCount = 5000;
        if (rowCount > maxRowCount) {
            bailout(`Sorry. There is currently too much data. This visualization cannot handle more than ${maxRowCount} rows,
            and there are currently ${rowCount} of them. Try filtering or change the configuration.`);
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

        /**
         * @param {Spotfire.DataView} dataView
         * @param {string} category
         * @param {string} measure
         */
        async function logViaHierarchy(dataView,category,measure)
        {
            const xHierarchy = await dataView.hierarchy(category);
            const root = await xHierarchy.root()
            log(root, "");
        
            function log(node, indent) {
                console.log(indent + node.formattedValue());
                indent += "    ";
                if(node.children) {
                    node.children.forEach(node => log(node, indent));
                }
                else {
                    node.rows().forEach(row => console.log(indent + row.continuous(measure).formattedValue()))
                } 
            }
        } 
        console.log("///////////////////////////")

        //store width axis expression
        var colsByAxis = await (await mod.visualization.axis("Columns by"));
        var originalColsByAxisExpression =colsByAxis.expression;

        //remove axis expression
        //colsByAxis.setExpression("<>");
        //logViaHierarchy(dataView,"Rows by","Width by") ; 

        for (let row of await dataView.allRows()){
            console.log(row.categorical("Rows by").formattedValue(), row.continuous("Width by").formattedValue())
        } 

        //add axis expressionback
        //colsByAxis.setExpression(originalColsByAxisExpression);  

        //logViaHierarchy(dataView,"Columns by","Height by")
 
        return;  
         

//         console.log((await x).expression);


        return;


        var dataRows=[];
        var rowDict={}
        var colDict={}
        var cols=[]
        var dict={rows:[{cols:[{}]}]};

        //get colors 
        const rows = await dataView.allRows();
        let xValue; // ◄ ◄ ◄ TBD: swap xValue ←→ zValue (xValue for col width, yValue for row height, zValue for color)
        rows.forEach((r,i)=>{
            if(colorAxis.isCategorical){
                xValue = r.categorical("Color").value()[0].key;
            }else{ 
                xValue = r.continuous("Color").formattedValue();
            }
            const color = r.color().hexCode;
            const xVal = r.categorical("Width by").formattedValue();
            const yVal = r.continuous("Height by").value();
            const row = r.categorical("Rows by").formattedValue();
            const col = r.categorical("Columns by").formattedValue();
            //TBD: remove hardcode tooltip column names values
            const xtooltip =  "";
            const tooltip = `color\t ${color}\nxVal\t ${xVal}\nyVal\t ${yVal}\nrow\t ${row}\ncol\t ${col}`


            //dict={europe:{value:2,france:11,belgium:22},asia:{value:2,japan:1},africa:{value:3,algeria:1,nigeria:2}}
            dataRows.push({name:row,val:xVal,col:{name:col,val:yVal}})
            
            //console.log("▲ ",row,xVal,col,yVal) 
            
            //caca
            let aCol = `
            <div title='${tooltip}' class="row" style="flex-grow:${yVal}; background:${color}" ></div>
            `
            //dataRows.push(aCol)
        })
        console.log(dataRows)
        return;


        // create this
        //    <div class="row" style="flex-grow:1">
        //        <div class="row" style="flex-grow:2"></div>
        //        <div class="row"  style="flex-grow:2"></div>
        //        <div class="row"  style="flex-grow:2"></div>
        //    </div>
        //    <div class="row" style="flex-grow:1">
        //        <div class="row"  style="flex-grow:4"></div>
        //        <div class="row"  style="flex-grow:2"></div>
        //    </div>
        //dataRows=[]
        console.log(dict)
        //dict={europe:{value:2,france:11,belgium:22},asia:{value:2,japan:1},africa:{value:3,algeria:1,nigeria:2}}
        for (let i in dict){ console.log(i);
            dataRows.push(`<div title="${i}" class="row" style="flex-grow:${dict[i].value}">`)
              for (let j in dict[i]){if (j != "value"){  console.log(j);
                dataRows.push(`<div class="row" title="${j}"  style="flex-grow:${dict[i][j]}"></div>`)
                console.log(i,j)
            }}
            dataRows.push(`</div>`)

        }

        //final wrap
        let html = `<div class="col"> 
        ${dataRows.join("")}
        </div>
        `
        //console.log(dataRows.join(""))

        document.getElementById("mod-container").innerHTML=html
    }

//<div class="col">
//    <div class="row" style="flex-grow:1">
//        <div class="row" style="flex-grow:2"></div>
//        <div class="row"  style="flex-grow:2"></div>
//        <div class="row"  style="flex-grow:2"></div>
//    </div>
//    <div class="row" style="flex-grow:1">
//        <div class="row"  style="flex-grow:3"></div>
//        <div class="row"  style="flex-grow:4"></div>
//        <div class="row"  style="flex-grow:2"></div>
//    </div>
//</div>

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


