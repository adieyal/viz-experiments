import { select, selectAll, create } from 'd3-selection'
import { csv, json } from 'd3-fetch'
import { randomInt } from 'd3-random'
import { max, min, maxIndex, minIndex, extent } from 'd3-array'
import { scaleLinear, scaleSqrt, scaleOrdinal, scaleSequential } from 'd3-scale'
import {
  forceSimulation, forceCenter, forceManyBody,
  forceCollide, forceX, forceY
} from 'd3-force'
import { transition } from 'd3-transition'
import tip from 'd3-tip'
import { format } from 'd3-format'

const d3 = {
  select,
  selectAll,
  create,
  csv,
  json,
  randomInt,
  scaleLinear,
  scaleSqrt,
  scaleOrdinal,
  scaleSequential,
  max,
  min,
  maxIndex,
  minIndex,
  extent,
  forceSimulation,
  forceCenter,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
  tip,
  format,
  transition
}

export default d3
