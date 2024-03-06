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


//window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
//    params[key] = decodeURIComponent(value);
//});


var initLatLng = [52.37559917665913, 7.998046875000001];
var locMarker = L.marker(initLatLng);
locMarker.addTo(map);

$(function() {
  var params = new URLSearchParams(window.location.search);
  if (params.has('lat') && params.has('lng')) {
    var latN = parseFloat(params.get('lat'));
    var lngN = parseFloat(params.get('lng'));
    if (latN != NaN && lngN != NaN) {
      $("#loc-in-lat").val(latN).trigger('change');
      $("#loc-in-lng").val(lngN).trigger('change');
      console.log(params.toString());
    }
  }
});

map.on("click", function(e) {
  locMarker.setLatLng(e.latlng);
  window.postMessage(e.latlng, '*');
  parent.postMessage(e.latlng, '*');
  $("#loc-out-lat").val(e.latlng.lat).trigger('change');
  $("#loc-out-lng").val(e.latlng.lng).trigger('change');
});

// locMarker.on("move", function(e) {
//   var latlng = locMarker.getLatLng();
//   // console.log(latlng);
//   parent.document.getById('loc-out-lat').value = latlng.lat
//   parent.document.getById('loc-out-lng').value = latlng.lng
// });

$(".loc-in").on("change", function(e) {
  var latlng = locMarker.getLatLng();
  if (e.target.id === "loc-in-lat") {
    latlng.lat = e.target.value;
  } else if (e.target.id === "loc-in-lng") {
    latlng.lng = e.target.value;
  }
  locMarker.setLatLng(latlng);
  map.setView(latlng, 14);
});
