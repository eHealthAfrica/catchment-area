import * as typing from './typing'

export function computeMaxDistance (
  travelTime: typing.Minutes,
  travelSpeed: typing.KilometersPerHour
  ): typing.Kilometers {
  // convert minutes to hours and compute distance
  return travelSpeed * (travelTime / 60)
}

/**
 * Creates a new catchment area object from the given parameters
 *
 * @param {Minutes} drivetime
 * @param {Kilometers} distance
 * @param {Coord} source
 * @param {Array<Coord>} destinations
 * @return {CatchmentArea}
 **/
export function makeCatchmentArea(
  drivetime: typing.Minutes,
  distance: typing.Kilometers,
  source: typing.Coord,
  destinations: Array<typing.Coord>
  ): typing.CatchmentArea {
  return {
    source,
    destinations,
    drivetime,
    distance
  }
}
