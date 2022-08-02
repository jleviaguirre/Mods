/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

import {Marimekko} from "./Marimekko"

//@ts-check - Get type warnings from the TypeScript language server. Remove if not wanted.

/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
 Spotfire.initialize(async (mod) => {

    const reader = mod.createReader(mod.visualization.data(), mod.windowSize(), mod.property("showBorders"), mod.property("showLabels"));
    const context = mod.getRenderContext();
    reader.subscribe(render);

    async function render(dataView, windowSize, showBorders, showLabels) {
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

        Marimekko(mod,context, dataView, windowSize, showBorders, showLabels)
        /**
         * Signal that the mod is ready for export.
         */
        context.signalRenderComplete();
    }
});
 