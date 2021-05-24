// Create a map object
var myMap = L.map('map', {
  // The id of the HTML element which the leaflet insert the map into
  center: [39.7392, -104.9903], // Set the latitude, longitude of center
  zoom: 4, // Set the starting zoom level
});

// Tile layer
L.tileLayer(
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
  {
    attribution:
      "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken: API_KEY,
  }
).addTo(myMap);

earthQuickUrl =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

d3.json(earthQuickUrl, (data) => {
  // console.log('data', data);
  var magnitudes = data.features.map((d) => d.properties.mag);
  var rScale = d3.scaleLinear().domain(d3.extent(magnitudes)).range([1, 20]);

  function chooseColor(depth) {
    switch (true) {
      case depth > 90:
        return 'darkred';
      case depth > 70:
        return 'red';
      case depth > 50:
        return 'orange';
      case depth > 30:
        return 'gold';
      case depth > 10:
        return 'yellow';
      default:
        return 'lightgreen';
    }
  }

  L.geoJSON(data.features, {
    pointToLayer: (feature, latlng) =>
      L.circleMarker(latlng, {
        radius: rScale(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color: 'green',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.8,
      }),

    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        '<h3>Location: ' +
          feature.properties.place +
          '</h3><hr><p>Date: ' +
          new Date(feature.properties.time) +
          '</p><hr><p>Magnitude: ' +
          feature.properties.mag +
          '</p>'
      );
    },
  }).addTo(myMap);

  // Add lendend to map
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    var depth = [-10, 10, 30, 50, 70, 90];

    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="padding: 5px; margin-right: 5px; background:' +
        chooseColor(depth[i] + 1) +
        '"></i> ' +
        depth[i] +
        (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);
});
