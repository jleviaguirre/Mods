# Marimekko Chart
The Marimekko chart is a graphical representation that uses stacked bar graphs of varying widths to visualize categorical data. A Marimekko chart is also known as the  mosaic plot, or simply, Mekko chartsThey are ideal for representing categorical sample data.

## Data Requirements
To make the Marimekko Chart work properly, the underlying data must be formatted in a certain way.  It requires 3 columns; two categorical and one of continuous measure. The categorical data columns are used for the category and segments in which you would like to slice and dice the data. The continuous data will determine the width of the boxes.

## Marking
The marking on the Marimekko chart works by using a combination of clicks and keys.  Use the shift key to mark categories and Alt for segments:
Shift+click to mark categories
Alt+click to mark segments
Alt+Shift+Click to select categories and segments
Ctrl+click to toggle marking
Ctrl+Shift+Click to toggle segments to marking
Ctrl+Alt+Click to toggle  segments to marking
Ctrl+Alt+Shift+Click to toggle categories and segments to marking

# Source Code
All source code for the mod example can be found in the `src` folder.

## Prerequisites
These instructions assume that you have [Node.js](https://nodejs.org/en/) (which includes npm) installed.

## Get started with development
- Open a terminal at the location of this example.
- Run `npm install`. This will install necessary tools. Run this command only the first time you are building the mod and skip this step for any subsequent builds.
- Run `npm start` to monitor file changes and copy them to dist folder
- Run `npm run server`. This will start a development server.
- Start editing, for example `src/main.js`.
- In Spotfire, follow the steps of creating a new mod and connecting to the development server.

## Working without a development server
- In Spotfire, follow the steps of creating a new mod and then browse for, and point to, the _manifest_ in the `src` folder. 