/**
 * A list containing the index of source points in the coordinates array
 * Example: [0, 1]
 **/
const sourcesSchema = {
  id: '/Sources',
  type: 'array',
  required: true,
  minItems: 1,
  items: {
    type: 'integer'
  }
}

/**
 * A list containing the index of destination points in the coordinates array
 * Example: [2, 3, 4, 5, 6]
 **/
const destinationsSchema = {
  id: '/Destinations',
  type: 'array',
  required: true,
  minItems: 0,
  items: {
    type: 'integer'
  }
}

/**
 * List of coordinates
 * Example: [[8.521614074707031, 12.041335177559377],...]
 **/
const coordinatesSchema = {
  id: '/Coordinates',
  type: 'array',
  required: true,
  minItems: 1,
  items: {
    type: 'array',
    minItems: 2,
    maxItems: 2,
    items: {
      type: 'number',
      required: true
    }
  }
}
/**
 * JSON Schema for validating CatchmentAreaGenerator constructor options object
 *
 * Example: {
 *   sources: [0, 1],
 *   destinations: [2, 3, 4, 5, 6],
 *   coordinates: [
 *     [8.521614074707031, 12.041335177559377],
 *     [8.546504974365234, 11.986935141127049],
 *     [8.402481079101562, 11.965776606631184],
 *     [8.450889587402344, 12.078938641761814],
 *     [8.558778762817383, 11.999024987663574],
 *     [8.549938201904297, 12.007420395469195],
 *     [8.554229736328125, 11.956876093184725]
 *   ],
 *   profile: 'car',
 *   drivetimes: [10]
 * }
 **/
export const generatorOptionsSchema = {
  id: '/GeneratorOptions',
  type: 'object',
  properties: {
    sources: {
      '$ref': '/Sources'
    },
    destinations: {
      '$ref': '/Destinations'
    },
    coordinates: {
      '$ref': '/Coordinates'
    },
    profile: {
      type: 'string',
      required: true
    },
    drivetimes: {
      type: 'array',
      required: true,
      minItems: 1,
      items: {
        type: 'number'
      }
    }
  }
}

/**
 * JSON Schema for validating catchment area objects
 *
 * Example: {
 *   driveTime: 10 // time in minutes
 *   source: [8.521614074707031, 12.041335177559377],
 *   destinations: [
 *     [8.546504974365234, 11.986935141127049],
 *     [8.402481079101562, 11.965776606631184],
 *   ]
 * }
 **/
export const catchmentAreaSchema = {
  id: '/CatchmentArea',
  type: 'object',
  properties: {
    driveTime: {
      type: 'number',
      required: true
    },
    estimatedDistance: {
      type: 'number',
      required: true
    },
    source: {
      type: 'array',
      required: true,
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'number',
        required: true
      }
    },
    destinations: {
      '$ref': '/Coordinates'
    }
  }
}

export const allSchemas = [
  sourcesSchema,
  destinationsSchema,
  coordinatesSchema,
  generatorOptionsSchema,
  catchmentAreaSchema
]
