// Choropleth colors from http://colorbrewer2.org/
// You can choose your own range (or different number of colors)
// and the code will compensate.
//var cscale = ['#feebe2', '#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'];
var cscale = ['#ffffcc', '#a1dab4', '#41b6c4', '#1e84be', '#54278f'];

//var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors; map application by NABU'
});

// Construct a bounding box for this map that the user cannot
// move out of
//http://boundingbox.klokantech.com/
var southWest = L.latLng(45.8, 2.8),
    northEast = L.latLng(56.7, 18.3),
    maxBounds = L.latLngBounds(southWest, northEast);

// initialize the map
var map = L.map('map', {
    center: [48.47292127248785, 10.656738281250002],
    maxZoom: 18,
    minZoom: 6,
    //maxBounds: maxBounds,
    layers: [osm],
    defaultExtentControl: true
});


// zoom the map to that bounding box
var southWest = L.latLng(47.47266286861342, 0.9228515625000001),
    northEast = L.latLng( 55.015425940562984, 20.566406250000004),
    bounds = L.latLngBounds(southWest, northEast);
map.fitBounds(bounds);


var initLatLng = [0.0, 0.0];
var locMarker = L.marker(initLatLng);
locMarker.addTo(map);


function plzToCoord(plz) {
  return fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      body: "data="+ encodeURIComponent(`
        [bbox:47.2701114,5.8663153,55.0991610,15.0419309]
	[out:json] [timeout:10] ;
        rel["postal_code"="` + plz + `"]; out center;`
      )
    },
  ).then(
    (data) => data.json()
  )
}

function setLocation(latlng, zoom) {
  console.log("Setting location " + latlng)
  locMarker.setLatLng(latlng);
  window.postMessage(latlng, '*');
  parent.postMessage(latlng, '*');
  $("#loc-out-lat").val(latlng.lat).trigger('change');
  $("#loc-out-lng").val(latlng.lng).trigger('change');

  if (zoom > 0) {
    map.setView(latlng, zoom);
  }
}


function onInit() {
  var params = new URLSearchParams(window.location.search);
  if (params.has('lat') && params.has('lng')) {
    var latN = parseFloat(params.get('lat'));
    var lngN = parseFloat(params.get('lng'));
    if (latN != NaN && lngN != NaN) {
      setLocation({ 'lat': latN, 'lng': lngN }, 16);
      return
    }
  }

  // If lat/lng were given this function did return already
  // -> resolve plz as fallback
  if (params.has('plz')) {
    plzToCoord(params.get('plz')).then(
      (data) => {
        setLocation({
          'lat': data.elements[0].center.lat,
          'lng': data.elements[0].center.lon
	}, 11);
      }
    )
  }
}

$(onInit);

map.on("click", function(e) {
  setLocation(e.latlng, 0)
});
