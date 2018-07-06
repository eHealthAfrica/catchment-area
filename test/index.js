const expect = require('chai').expect
const { Util, CatchmentAreaGenerator } = require('../index.js')

describe('Util', function () {
  describe('#computeMaxDistance()', function () {
    it('should compute correct distance', function () {
      // distance in kilometers travelled in 60 minutes when travelling at 80km/hr
      let distance = Util.computeMaxDistance(60, 80)
      expect(distance).to.be.a('number')
      expect(distance).to.equal(80)
    })
  })

  describe('#makeCatchmentArea()', function () {
    it('should create a valid catchment area object', function () {
      let time = 10 // minutes
      let distance = Util.computeMaxDistance(10, 80)
      let source = [8.521614074707031, 12.041335177559377]
      let destinations = [
        [8.558778762817383, 11.999024987663574],
        [8.549938201904297, 12.007420395469195]
      ]

      let catchmentArea = Util.makeCatchmentArea(time, distance, source, destinations)
      expect(catchmentArea).to.be.an('object')
      expect(catchmentArea).to.deep.include({drivetime: time})
      expect(catchmentArea).to.deep.include({source: source})
      expect(catchmentArea).to.deep.include({distance: distance})
      expect(catchmentArea).to.deep.include({destinations: destinations})
      expect(catchmentArea).to.have.property('source').that.include.members(source)
    })
  })
})

const configObject = {
  sources: [0, 1],
  destinations: [2, 3, 4, 5, 6],
  coordinates: [
    [8.521614074707031, 12.041335177559377],
    [8.546504974365234, 11.986935141127049],
    [8.402481079101562, 11.965776606631184],
    [8.450889587402344, 12.078938641761814],
    [8.558778762817383, 11.999024987663574],
    [8.549938201904297, 12.007420395469195],
    [8.554229736328125, 11.956876093184725]
  ],
  profile: 'car',
  drivetimes: [10]
}

describe('CatchmentAreaGenerator', function () {
  describe('#getters', function () {
    it('should initialize expected attributes', function () {
      let generator = new CatchmentAreaGenerator(configObject)
      expect(generator).to.have.property('sources')
      expect(generator).to.have.property('destinations')
      expect(generator).to.have.property('drivetimes')
      expect(generator).to.have.property('speed')
    })

    it('should have correct values for expected attributes', function () {
      let sources = [
        [8.521614074707031, 12.041335177559377],
        [8.546504974365234, 11.986935141127049]
      ]
      let destinations = [
        [8.402481079101562, 11.965776606631184],
        [8.450889587402344, 12.078938641761814],
        [8.558778762817383, 11.999024987663574],
        [8.549938201904297, 12.007420395469195],
        [8.554229736328125, 11.956876093184725]
      ]
      let generator = new CatchmentAreaGenerator(configObject)
      expect(generator.sources).to.deep.equal(sources)
      expect(generator.destinations).to.deep.equal(destinations)
      expect(generator.drivetimes).to.deep.equal([10])
      expect(generator.speed).to.equal(80)
    })
  })

  describe('#getCatchedPoints', function () {
    it('should return all coordinates in an array of catchment areas', function () {
      let catchmentAreas = [
        Util.makeCatchmentArea(
          5,
          10,
          [8.521614074707031, 12.041335177559377],
          [
            [8.402481079101562, 11.965776606631184],
            [8.450889587402344, 12.078938641761814]
          ]
        ),
        Util.makeCatchmentArea(
          10,
          25,
          [8.546504974365234, 11.986935141127049],
          [
            [8.558778762817383, 11.999024987663574]
          ]
        )
      ]
      let expectedCoordinates = [
        [8.402481079101562, 11.965776606631184],
        [8.450889587402344, 12.078938641761814],
        [8.558778762817383, 11.999024987663574]
      ]
      let coordinates = (new CatchmentAreaGenerator(configObject)).getCatchedPoints(catchmentAreas)
      expect(coordinates).to.deep.equal(expectedCoordinates)
    })
  })

  describe('#getUncatchedPoints', function () {
    it('should return all coordinates that does not belong to a catchment area', function () {
      let generator = new CatchmentAreaGenerator(configObject)
      let allPoints = generator.destinations
      let catchmentAreas = generator.run()
      let catchedPoints = generator.getCatchedPoints(catchmentAreas)
      let uncatchedPoints = generator.getUncatchedPoints(allPoints, catchedPoints)

      // these points are farther than 13.5km from the two sources in configObject
      let expectedUncatchedPoints = [
        [ 8.402481079101562, 11.965776606631184 ],
        [ 8.450889587402344, 12.078938641761814 ]
      ]
      expect(uncatchedPoints).to.have.lengthOf(2)
      expect(uncatchedPoints).to.deep.equal(expectedUncatchedPoints)
    })
  })
})
