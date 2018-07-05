import kdbush from 'kdbush'
import * as geokdbush from 'geokdbush'
import * as R from 'ramda'
import { ROAD_TYPE, TRANSIT_MODE, TRAVEL_MODE } from './constants.js'
import * as Util from './util.js'

export class CatchmentAreaGenerator {
  constructor (configObject) {
    this.config = configObject
    this.run = this.run.bind(this)
    this.generate = this.generate.bind(this)
  }

  /**
   * Get coordinates of source points
   *
   * @return {Array<turf.Coord>} an array of coordinates eg [[lon, lat],...]
   **/
  get sources () {
    Util.validateOptions(this.config)
    return this.config.sources.map(source => this.config.coordinates[source])
  }

  /**
   * Get coordinates of destination points
   *
   * @return {Array<turf.Coord>} an array of coordinates eg [[lon, lat],...]
   **/
  get destinations () {
    Util.validateOptions(this.config)
    return this.config.destinations.map(destination => this.config.coordinates[destination])
  }

  /**
   * Get drive times for which catchment areas are to be computed
   *
   * @return {Array<Number>} a list of drive times in minutes
   **/
  get driveTimes () {
    Util.validateOptions(this.config)
    return this.config.drivetimes
  }

  /**
   * Get all points for which the catchment area have been computed
   *
   * @param {Array<Object>} catchmentAreas an array of catchment areas
   * @return {Array<turf.Coord>}
   **/
  getCatchedPoints (catchmentAreas) {
    return catchmentAreas.reduce(
      (catchedPoints, catchmentArea) => catchedPoints.concat(catchmentArea.destinations),
      []
    )
  }

  /**
   * Given two arrays of points return an array of points belonging to the first array
   * but not in the second array
   *
   * @param {Array<turf.Coord>} allPoints
   * @param {Array<turf.Coord>} catchedPoints
   * @return {Array<turf.Coord>}
   **/
  getUncatchedPoints (allPoints, catchedPoints) {
    return R.differenceWith((allPointsPoint, catchedPointsPoint) => {
      const [long1, lat1] = allPointsPoint
      const [long2, lat2] = catchedPointsPoint

      return long1 === long2 && lat1 === lat2
    }, allPoints, catchedPoints)
  }

  /**
   * Generate catchment area for a given source from an array of available destination points
   *
   * @param {Number} distance the maximum distance allowed for points within a given source's catchment area
   * @param {Array} source a pair [longitude, lattitude] specifying the coordinate of the source
   * @param {Array<Array>} destinations an array of coordinates of points from which catched points will be derived
   * @param {Number} clusterSize an integer specifying the number of points which a source may serve
   * @return {Object} the catchment area object having keys `source` and `destinations` @see `CatchmentAreaGenerator.run`
   **/
  generate (distance, source, destinations, clusterSize) {
    // If there are fewer possible destinations than cluster size just assign them to the source.
    // This ignores the max distance so some destinations may be farther away than expected but avoids
    // leaving any destination uncatched.
    if (destinations.length <= clusterSize) {
      return destinations
    }

    const [long, lat] = source
    const tree = kdbush(destinations)
    const nearest = geokdbush.around(tree, long, lat, clusterSize, distance)

    return nearest
  }

  /**
   * Run the CatchmentAreaGenerator
   *
   * @param {String} travelMode the mode of transport, possible values are defined in `TRAVEL_MODE` enum
   * @param {String} roadType the type of road travelled, possible values are defined in `ROAD_TYPE` enum
   * @param {String} transitMode used when travelMode is `TRAVEL_MODE.TRANSIT`, possible values are defined in `TRANSIT_MODE` enum
   * @return {Array<Object>} an array of objects with each object having the keys `source` and `destinations`,
   *                         `source` is the coordinate of the source while destinations is a list of coordinates of points
   *                         in the `source`'s catchment area
   **/
  run (travelMode = TRAVEL_MODE.DRIVING, roadType = ROAD_TYPE.SECONDARY, transitMode = TRANSIT_MODE.BUS) {
    const [sources, destinations, driveTimes] = [this.sources, this.destinations, this.driveTimes]

    if (!sources.length) {
      throw new Error('The catchment area generator config object must contain at least one source!')
    }

    const catchmentAreas = []
    const clusterSize = Math.floor(destinations.length / sources.length)
    const travelOpts = {...Util.defaultTravelOpts}

    travelOpts.travelMode = travelMode || travelOpts.travelMode
    travelOpts.roadType = roadType || travelOpts.roadType
    travelOpts.transitMode = transitMode || travelOpts.transitMode

    for (let driveMinutes of driveTimes) {
      // convert drive time from minutes to hours
      const driveHours = driveMinutes / 60
      const maxDistance = Util.computeMaxDistance(driveHours, Util.estimateSpeed(travelOpts))

      for (let source of sources) {
        let catchedPoints = this.getCatchedPoints(catchmentAreas)
        let availableDestinations = this.getUncatchedPoints(destinations, catchedPoints)

        let catchmentAreaForSource = this.generate(maxDistance, source, availableDestinations, clusterSize)

        catchmentAreas.push(Util.makeCatchmentArea(driveMinutes, source, catchmentAreaForSource))
      }
    }

    return catchmentAreas
  }
}
