import d3 from '../d3'
import nlcData from './nlc2016.csv'

const width = 600; const height = 600
const minRadius = 1; const maxRadius = 20
const duration = 50
const provinceRowHeight = 100
const provinceColWidth = 120

const svg = d3.select('#container').append('svg')
  .attr('viewBox', [0, 0, width, height])
  .append('g')
  .attr('transform', 'translate(5, 5)')

const fmt = d3.format(',d')

let simulation
let centerfunc, centers
let circles, labels

const tip = d3.tip()
  .attr('class', 'tooltip')
  .html(function (d) {
    return `
        <div>
            <div><span class="title"><strong>Name: </strong></span><span>${d.Name}</span></div>
            <div><span class="title"><strong>Amount: </strong></span><span>R${fmt(d.Amount)}</span></div>
        </div>
        `
  })
  .direction('n')
  .offset([-3, 0])

/* Invoke the tip in the context of your visualization */

const provinceCenters = {
  'WESTERN CAPE': { x: provinceColWidth * 0.5, y: provinceRowHeight },
  'EASTERN CAPE': { x: provinceColWidth * 1.5, y: provinceRowHeight },
  'NORTHERN CAPE': { x: provinceColWidth * 2.5, y: provinceRowHeight },
  'FREE STATE': { x: provinceColWidth * 3.5, y: provinceRowHeight },
  'KWAZULU-NATAL': { x: provinceColWidth * 4.5, y: provinceRowHeight },
  GAUTENG: { x: provinceColWidth * 0.5, y: provinceRowHeight * 2 },
  'NORTH WEST': { x: provinceColWidth * 1.5, y: provinceRowHeight * 2 },
  LIMPOPO: { x: provinceColWidth * 2.5, y: provinceRowHeight * 2 },
  MPUMALANGA: { x: provinceColWidth * 3.5, y: provinceRowHeight * 2 }
}

const sectorCentres = {
  ARTS: { x: provinceColWidth * 1, y: provinceRowHeight * 1 },
  SPORTS: { x: provinceColWidth * 3, y: provinceRowHeight * 1 },
  CHARITIES: { x: provinceColWidth * 1, y: provinceRowHeight * 2 },
  MISCELLANEOUS: { x: provinceColWidth * 3, y: provinceRowHeight * 2 }
}

const sectorfunc = function (d) {
  return sectorCentres[d.Sector]
}

const provincefunc = function (d) {
  return provinceCenters[d.Province]
}

function setForces (simulation, circles) {
  simulation
    .force('collide', null)
    .force('charge', null)
    .force('x', null)
    .force('y', null)

  simulation
    .velocityDecay(0.85)
    .alphaDecay(0.016)
    .alphaTarget(1.0)
    .force('collide', d3.forceCollide()
      .radius(d => d.r * 1.1)
      .strength(0.8)
    )
    .force('x', d3.forceX(d => centerfunc(d).x).strength(0.2))
    .force('y', d3.forceY(d => centerfunc(d).y).strength(0.2))
    .on('tick', () => {
      circles.selectAll('circle').transition()
        .duration(duration)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    })
    .restart()

  return simulation
}

function placeLabels (labels, centers) {
  console.log(centers)
  labels.selectAll('text')
    .data(Object.entries(centers), d => d[0])
    .join(
      enter => enter.append('g')
        .append('text').text(function (d) {
          return d[0].toLowerCase()
        })
        .style('opacity', 1.0),
      update => update
        .style('opacity', 1.0),
      exit => exit
        .transition()
        .duration(duration)
        .style('opacity', 0)
    )
    .attr('transform', function (d) {
      return `translate(${d[1].x}, ${d[1].y - 50})`
    })
}

d3.select('button').on('click', function () {
  if (centerfunc === provincefunc) {
    centerfunc = sectorfunc
    centers = sectorCentres
  } else {
    centerfunc = provincefunc
    centers = provinceCenters
  }

  setForces(simulation, circles)
  placeLabels(labels, centers)
})

const randX = d3.randomInt(0, width)
const randY = d3.randomInt(0, height)

d3.csv(nlcData).then(function (data) {
  centerfunc = provincefunc
  centers = provinceCenters

  data.forEach(d => {
    d.Amount = +d.Amount
    d.x = randX()
    d.y = randY()
  })
  data = data.filter(d => Math.random() > 0.8)

  const extent = d3.extent(data, d => d.Amount)
  const radiusScale = d3.scaleSqrt(extent, [minRadius, maxRadius])
  data.forEach(d => {
    d.r = radiusScale(d.Amount)
  })

  circles = svg.selectAll('g.award')
    .data(data)
    .join('g')
    .classed('award', true)
    .each(function (d, i) {
      const el = d3.select(this)
      const cls = {
        ARTS: 'sector_arts',
        CHARITIES: 'sector_charities',
        SPORTS: 'sector_sports',
        MISCELLANEOUS: 'sector_misc'
      }[d.Sector]

      if (cls !== undefined) { el.classed(cls, true) }
    })
    .on('mouseover', function (ev, d) {
      tip.show(d, this)
    })
    .on('mouseout', function (ev, d) {
      tip.hide()
    })
    .call(tip)

  circles.append('circle')
    .attr('r', d => radiusScale(d.Amount))
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)

  labels = svg.append('g').classed('labels', true)

  simulation = d3
    .forceSimulation(data)

  setForces(simulation, circles)
  placeLabels(labels, centers)
})
