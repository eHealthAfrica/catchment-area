import { TRAVEL_MODE, TRANSIT_MODE, ROAD_TYPE } from './constants'

/**
 * Estimated average speeds of travel using different travel modes based on Nigerian
 * speed limits
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

export default {
  estimateSpeed,
  computeMaxDistance
}
