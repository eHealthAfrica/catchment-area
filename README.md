# `catchment-area`
`catchment-area` is a node library for generating catchment areas based on a set of sources and associated destinations. A use case for this library is generating catchment areas where the sources are health facilities and destinations are settlements.

## Installation
`npm i catchment-area` or `yarn add catchment-area`

## Usage
```javascript
import CatchmentAreaGenerator from 'catchment-area'
// const { CatchmentAreaGenerator } = require('catchment-area')

const configObject = {
  "sources": [0, 1],
  "destinations": [2, 3, 4, 5, 6],
  "coordinates": [
    [8.521614074707031, 12.041335177559377],
    [8.546504974365234, 11.986935141127049],
    [8.402481079101562, 11.965776606631184],
    [8.450889587402344, 12.078938641761814],
    [8.558778762817383, 11.999024987663574],
    [8.549938201904297, 12.007420395469195],
    [8.554229736328125, 11.956876093184725]
  ],
  "profile":"car",
  "drivetimes": [10]                          // in Minutes
}
const travelSpeed = 80                        // in Kilometers per hour (km/hr)

const generator = new CatchmentAreaGenerator(configObject, travelSpeed)
const catchmentAreas = generator.run()

console.log(catchmentAreas)
```