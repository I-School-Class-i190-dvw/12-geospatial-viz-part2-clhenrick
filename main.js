console.log('hello world!');

var width = Math.max(960, window.innerWidth),
    height = Math.max(500, window.innerHeight);

var pi = Math.PI,
    tau = 2 * pi;

var projection = d3.geoMercator()
  .scale(1 / tau)
  .translate([0, 0]);

var path = d3.geoPath()
  .projection(projection);

var tile = d3.tile()
  .size([width, height]);

var zoom = d3.zoom()
  .scaleExtent([
    1 << 11,
    1 << 24
  ])
  .on('zoom', zoomed);

var radius = d3.scaleSqrt().range([0, 10]);

var svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

var raster = svg.append('g');

// render to a single path:
// var vector = svg.append('path');
// render to multiple paths:
var vector = svg.selectAll('path');

d3.json('data/earthquakes_4326_cali.geojson', function(error, geojson) {
  if (error) throw error;
  
  console.log(geojson);
  
  radius.domain([0, d3.max(geojson.features, function(d) { return d.properties.mag; })]);
  
  path.pointRadius(function(d) {
    return radius(d.properties.mag);
  });
  
  // render to a single path:
  // vector = vector.datum(geojson);
  // render to multiple paths:
  vector = vector
    .data(geojson.features)
    .enter().append('path')
    .attr('d', path)
    .on('mouseover', function(d) { console.log(d); });
  
  var center = projection([-119.665, 37.414]);
  
  svg.call(zoom)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(1 << 14)
        .translate(-center[0], -center[1])
    );
});


function zoomed() {
  var transform = d3.event.transform;
  
  var tiles = tile
    .scale(transform.k)
    .translate([transform.x, transform.y])
    ();
  
  console.log(transform.x, transform.y, transform.k);
  
  projection
    .scale(transform.k / tau)
    .translate([transform.x, transform.y]);
  
  vector.attr('d', path);
  
  var image = raster
    .attr('transform', stringify(tiles.scale, tiles.translate))
    .selectAll('image')
    .data(tiles, function(d) { return d; });
  
  image.exit().remove();
  
  image.enter().append('image')
    .attr('xlink:href', function(d) {
      return 'http://' + 'abc'[d[1] % 3] + '.basemaps.cartocdn.com/rastertiles/voyager/' +
        d[2] + "/" + d[0] + "/" + d[1] + ".png";
    })
    .attr('x', function(d) { return d[0] * 256; })
    .attr('y', function(d) { return d[1] * 256; })
    .attr('width', 256)
    .attr('height', 256);
}

function stringify(scale, translate) {
  var k = scale / 256,
      r = scale % 1 ? Number : Math.round;
  return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
}










///