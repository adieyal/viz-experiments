import d3 from '../d3';
import L from 'leaflet';
import './SmoothWheelZoom';
import dcgeo from 'url:./dc.geojson'

function projectPoint(x, y) {
    const point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}


const map = new L.Map("map", {
        center: [-33.9, 18.5],
        zoom: 4,
        scrollWheelZoom: false,
        smoothWheelZoom: true,
        smoothSensitivity: 2,
    })
    .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));


const svg = d3.select(map.getPanes().overlayPane).append('svg'),
      g = svg.append('g').attr('class', 'leaflet-zoom-hide');

const files = [dcgeo, 'https://production.wazimap-ng.openup.org.za/api/v1/profile/8/points/category/39/points/?format=json'];
const promises = files.map(url => d3.json(url))

//d3.json(dcgeo).then(function(collection) {
Promise.all(promises).then(function(data) {
    const collection = data[0];
    const points = data[1];
    console.log(data);

    function reset() {
        const bounds = path.bounds(collection),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

            g.attr('transform', `translate(${-topLeft[0]}, ${-topLeft[1]})`);

            feature.attr("d", path);
            circles.attr("d", path);
    }

    const transform = d3.geo.transform({point: projectPoint}),
          path = d3.geo.path().projection(transform),
          projection = path.projection()

          path.pointRadius(5);

    const boundaryG = g.append('g');
    const pointG = g.append('g');

    const feature = boundaryG.selectAll('path')
        .data(collection.features)
        .enter()
        .append('path')
            .attr('d', path)

    const circles = pointG.selectAll('path')
        .data(points.features)
        .enter()
        .append('path')
            .attr('d', path)

    map.on('zoom', reset);
    reset();
});

