# About `catchment-area`
`catchment-area` is a node library for generating catchment areas based on a set of sources and associated destinations. A use case for this library is generating catchment areas where the sources are health facilities and destinations are settlements.

## Installation
This library has not yet been published to npm or yarnpkgs yet. Upon publication however it may be installed with npm or yarn using either `npm i catchment-area` or `yarn add catchment-area`

## Usage
```javascript
import CatchmentAreaGenerator from 'catchment-area'

const travelTime = 50 / 60 // 50 minutes === 50 / 60 hours
const generator = new CatchmentAreaGenerator(featureCollection)
const catchmentAreas = generator.run(travelTime)

console.log(catchmentAreas)
```