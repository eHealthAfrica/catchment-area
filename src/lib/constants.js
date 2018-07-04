/**
 * Travel Modes
 **/
export const TRAVEL_MODE = {
  DRIVING: 'driving',
  WALKING: 'walking',
  BICYCLING: 'bicycling',
  TRANSIT: 'transit'
}

/**
 * Transit Modes
 **/
export const TRANSIT_MODE = {
  BUS: 'bus',
  SUBWAY: 'subway',
  TRAIN: 'train',
  TRAM: 'tram', // tram | light rail
  RAIL: 'rail' // train | tram | subway
}

/**
 * Road Types
 **/
export const ROAD_TYPE = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  HIGHWAY: 'highway'
}

export default {
  TRAVEL_MODE,
  TRANSIT_MODE,
  ROAD_TYPE
}
