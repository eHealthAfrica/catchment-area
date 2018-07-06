export type Coord = [number, number]

export type Minutes = number

export type Kilometers = number

export type KilometersPerHour = number

export interface Config {
  readonly sources: Array<number>,
  readonly destinations: Array<number>,
  readonly coordinates: Array<Coord>,
  readonly profile?: string
  readonly drivetimes: Array<Minutes>
}

export interface CatchmentArea {
  readonly source: Coord,
  readonly destinations: Array<Coord>,
  readonly drivetime: Minutes,
  readonly distance: Kilometers
}
