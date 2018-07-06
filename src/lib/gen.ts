import kdbush from 'kdbush'
import * as geokdbush from 'geokdbush'
import * as R from 'ramda'
import * as typing from './typing'
import * as Util from './util'

export class CatchmentAreaGenerator {
  config: typing.Config;
  travelSpeed: typing.KilometersPerHour;

  constructor (configObject: typing.Config, travelSpeed: typing.KilometersPerHour = 80) {
    this.config = configObject;
    this.travelSpeed = travelSpeed
  }

  /**
   * Get coordinates of source points
   *
   * @return {Array<Coord>}
   **/
  get sources (): Array<typing.Coord> {
    return this.config.sources.map(source => this.config.coordinates[source]);
  }

  /**
   * Get coordinates of destination points
   *
   * @return {Array<Coord>}
   **/
  get destinations (): Array<typing.Coord> {
    return this.config.destinations.map(destination => this.config.coordinates[destination]);
  }

  /**
   * Get drive times for which catchment areas are to be computed
   *
   * @return {Array<Minutes>} a list of drive times in minutes
   **/
  get drivetimes (): Array<typing.Minutes> {
    return this.config.drivetimes;
  }

  /**
   * Get estimated travel speed
   *
   * @return {KilometersPerHour} a list of drive times in minutes
   **/
  get speed (): typing.KilometersPerHour {
    return this.travelSpeed
  }

  /**
   * Get all points for which the catchment area have been computed
   *
   * @param {Array<CatchmentArea>} catchmentAreas
   * @return {Array<Coord>}
   **/
  getCatchedPoints (catchmentAreas: Array<typing.CatchmentArea>): Array<typing.Coord> {
    return catchmentAreas.reduce(
      (catchedPoints: Array<typing.Coord>, catchmentArea: typing.CatchmentArea) => catchedPoints.concat(catchmentArea.destinations),
      []
    );
  }

  /**
   * Given two arrays of points return an array of points belonging to the first array
   * but not in the second array i.e A - (A /\ B)
   *
   * @param {Array<Coord>} allPoints
   * @param {Array<Coord>} catchedPoints
   * @return {Array<Coord>}
   **/
  getUncatchedPoints (allPoints: Array<typing.Coord>, catchedPoints: Array<typing.Coord>): Array<typing.Coord> {
    return R.differenceWith((allPointsPoint: typing.Coord, catchedPointsPoint: typing.Coord) => {
      const [long1, lat1] = allPointsPoint;
      const [long2, lat2] = catchedPointsPoint;

      return long1 == long2 && lat1 == lat2;
    }, allPoints, catchedPoints);
  }

  /**
   * Compute destinations that belong to a given source's catchment area
   *
   * @param {Kilometers} distance
   * @param {Coord} source
   * @param {Array<Coord>} destinations
   * @param {number} clusterSize
   * @return {Array<Coord>}
   **/
  generate (
    distance: typing.Kilometers,
    source: typing.Coord,
    destinations: Array<typing.Coord>,
    clusterSize: number): Array<typing.Coord> {
    // If there are fewer possible destinations than cluster size just assign them to the source.
    // This ignores the max distance so some destinations may be farther away than expected but avoids
    // leaving any destination uncatched.
    if (destinations.length <= clusterSize) {
      return destinations;
    }

    const [long, lat] = source;
    const tree = kdbush(destinations);
    const nearest: Array<typing.Coord> = geokdbush.around(tree, long, lat, clusterSize, distance);

    return nearest;
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
  run () {
    let sources: Array<typing.Coord> = this.sources;
    let destinations: Array<typing.Coord> = this.destinations;
    let drivetimes: Array<typing.Minutes> = this.drivetimes;

    if (!sources.length) {
      throw new Error('The catchment area generator config object must contain at least one source!');
    }

    let catchmentAreas: Array<typing.CatchmentArea> = [];
    let clusterSize: number = Math.floor(destinations.length / sources.length);

    for (let drivetime of drivetimes) {
      let maxDistance: typing.Kilometers = Util.computeMaxDistance(drivetime, this.speed);

      for (let source of sources) {
        let catchedPoints: Array<typing.Coord> = this.getCatchedPoints(catchmentAreas);
        let availableDestinations: Array<typing.Coord> = this.getUncatchedPoints(destinations, catchedPoints);

        let catchmentAreaForSource: Array<typing.Coord> = this.generate(maxDistance, source, availableDestinations, clusterSize);

        catchmentAreas.push(Util.makeCatchmentArea(drivetime, maxDistance, source, catchmentAreaForSource));
      }
    }

    return catchmentAreas;
  }
}
