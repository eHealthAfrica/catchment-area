import * as turf from '@turf/turf'
import * as R from 'ramda'
import { ROAD_TYPE, TRANSIT_MODE, TRAVEL_MODE } from './constants'
import Util from './util'

export default class CatchmentAreaGenerator {
  constructor (featureCollection) {
    this.featureCollection = featureCollection
    this.run = this.run.bind(this)
    this.generate = this.generate.bind(this)
  }

  /**
   * Extract coordinates of source points from a given feature collection
   *
   * @param {turf.FeatureCollection} featureCollection
   * @return {Array<turf.Coord>} an array of coordinates eg [[lon, lat],...]
   **/
  static extractSources (featureCollection) {
    const sources = []
    const fcSources = featureCollection.sources || []
    const fcCoordinates = featureCollection.coordinates || []

    for (let source of fcSources) {
      sources.push(fcCoordinates[source])
    }

    return sources
  }

  /**
   * Extract coordinates of destination points from a given feature collection
   *
   * @param {turf.FeatureCollection} featureCollection
   * @return {Array<turf.Coord>} an array of coordinates eg [[lon, lat],...]
   **/
  static extractDestinations (featureCollection) {
    const destinations = []
    const fcDestinations = featureCollection.destinations || []
    const fcCoordinates = featureCollection.coordinates || []

    for (let destination of fcDestinations) {
      destinations.push(fcCoordinates[destination])
    }

    return destinations
  }

  /**
   * Create a catchment area object. A catchment area is an object having keys `source` and `destinations`
   * A `source` or `destination` is just a pair [lon, lat] viz, a turf.Coord
   *
   * @param {turf.Coord} source the source whose catchment area includes all point in `destinations` parameter
   * @param {Array<turf.Coord>} destinations an array of destination points
   **/
  static makeCachmentArea (source, destinations) {
    return {
      source,
      destinations
    }
  }

  /**
   * Get all points for which the catchment area have been computed
   *
   * @param {Array<Object>} catchmentAreas an array of catchment areas
   * @return {Array<turf.Coord>}
   **/
  static getCactchedPoints (catchmentAreas) {
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
  static getUncatchedPoints (allPoints, catchedPoints) {
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
      return this.makeCachmentArea(source, destinations)
    }

    return this.makeCachmentArea(null, null) // @todo: implement
  }

  /**
   * Run the CatchmentAreaGenerator
   *
   * @param {Number} travelTime the time in minutes for which to generate catchment areas
   * @param {String} travelMode the mode of transport, possible values are defined in `TRAVEL_MODE` enum
   * @param {String} roadType the type of road travelled, possible values are defined in `ROAD_TYPE` enum
   * @param {String} transitMode used when travelMode is `TRAVEL_MODE.TRANSIT`, possible values are defined in `TRANSIT_MODE` enum
   * @return {Array<Object>} an array of objects with each object having the keys `source` and `destinations`,
   *                         `source` is the coordinate of the source while destinations is a list of coordinates of points
   *                         in the `source`'s catchment area
   **/
  run (travelTime, travelMode = TRAVEL_MODE.DRIVING, roadType = ROAD_TYPE.SECONDARY, transitMode = TRANSIT_MODE.BUS) {
    const sources = this.extractSources(this.featureCollection)
    const destinations = this.extractDestinations(this.featureCollection)

    if (!sources.length) {
      throw new Error('The feature collection must contain at least one source!')
    }

    const catchmentAreas = []
    const clusterSize = Math.floor(destinations.length / sources.length)
    const travelOpts = {...Util.defaultTravelOpts}

    travelOpts.travelMode = travelMode || travelOpts.travelMode
    travelOpts.roadType = roadType || travelOpts.roadType
    travelOpts.transitMode = transitMode || travelOpts.transitMode

    const maxDistance = Util.computeMaxDistance(travelTime, Util.estimateSpeed(travelOpts))

    for (let source of sources) {
      let catchedPoints = this.getCactchedPoints(catchmentAreas)
      let availableDestinations = this.getUncatchedPoints(destinations, catchedPoints)

      catchmentAreas.push(this.generate(maxDistance, source, availableDestinations, clusterSize))
    }

    return catchmentAreas
  }
}
