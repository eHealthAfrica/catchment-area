import * as JSONSchema from 'jsonschema'
import { TRAVEL_MODE, TRANSIT_MODE, ROAD_TYPE } from './constants.js'
import { allSchemas, generatorOptionsSchema, catchmentAreaSchema } from './schema.js'

/**
 * Estimated average speeds of travel using different travel modes based on Nigerian
 * speed limits. Speeds are in KM/hr.
 **/
const SPEED_ESTIMATES = (() => {
  const ESTIMATES = {}

  ESTIMATES[TRAVEL_MODE.DRIVING] = {}
  ESTIMATES[TRAVEL_MODE.DRIVING][ROAD_TYPE.PRIMARY] = 50
  ESTIMATES[TRAVEL_MODE.DRIVING][ROAD_TYPE.SECONDARY] = 80
  ESTIMATES[TRAVEL_MODE.DRIVING][ROAD_TYPE.HIGHWAY] = 100

  ESTIMATES[TRAVEL_MODE.WALKING] = 5
  ESTIMATES[TRAVEL_MODE.BICYCLING] = 15

  ESTIMATES[TRAVEL_MODE.TRANSIT] = {}
  ESTIMATES[TRAVEL_MODE.TRANSIT][TRANSIT_MODE.BUS] = 90
  ESTIMATES[TRAVEL_MODE.TRANSIT][TRANSIT_MODE.RAIL] = 120

  return ESTIMATES
})()

/**
 * Default options for `travelOpts` parameter of `estimateSpeed` function
 **/
export const defaultTravelOpts = {
  travelMode: TRANSIT_MODE.DRIVING,
  roadType: ROAD_TYPE.PRIMARY, // used when `travelMode` is `TRAVEL_MODE.DRIVING`
  transitMode: TRANSIT_MODE.BUS // used when `travelMode` is `TRAVEL_MODE.TRANSIT`
}

/**
 * Get the estimated speed of travel based on the travel mode, road type and transit mode
 *
 * @param {Object} travelOpts see `defaultTravelOpts` for expected keys
 * @return {Number} the estimated speed of travel
 **/
export const estimateSpeed = (travelOpts = defaultTravelOpts) => {
  travelOpts = {...defaultTravelOpts, ...travelOpts}

  if (travelOpts.travelMode === TRAVEL_MODE.DRIVING) {
    return SPEED_ESTIMATES[TRAVEL_MODE.DRIVING][travelOpts.roadType]
  }

  if (travelOpts.travelMode === TRAVEL_MODE.TRANSIT) {
    if (travelOpts.transitMode === TRANSIT_MODE.BUS) {
      return SPEED_ESTIMATES[TRAVEL_MODE.TRANSIT][TRANSIT_MODE.BUS]
    }

    return SPEED_ESTIMATES[TRAVEL_MODE.TRANSIT][TRANSIT_MODE.RAIL]
  }

  const speed = SPEED_ESTIMATES[travelOpts.travelMode]
  if (!speed) {
    throw new Error('Invalid travel mode!')
  }

  return speed
}

export const computeMaxDistance = (travelTime, travelSpeed) => travelSpeed * travelTime

const schemaValidator = allSchemas.reduce((validator, schema) => {
  validator.addSchema(schema, schema.id)
  return validator
}, new JSONSchema.Validator())

export const validateOptions = data => {
  try {
    schemaValidator.validate(data, generatorOptionsSchema)
  } catch (error) {
    throw new Error('Invalid configuration object!')
  }
}

export const validateCatchmentArea = data => {
  try {
    schemaValidator.validate(data, catchmentAreaSchema)
  } catch (error) {
    throw new Error('Invalid catchment area object!')
  }
}

/**
 * Creates a new catchment area object from the given parameters
 *
 * @param {Number} driveTime
 * @param {turf.Coord} source an array of coordinates of the source point i.e. [lon, lat]
 * @param {Array<turf.Coord>} destinations a list of destination coordinates in the form [[lon, lat],...]
 * @return {Object}
 **/
export const makeCatchmentArea = (driveTime, estimatedDistance, source, destinations) => {
  return {
    driveTime,
    estimatedDistance,
    source,
    destinations
  }
}
