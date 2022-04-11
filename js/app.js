// Choropleth colors from http://colorbrewer2.org/
// You can choose your own range (or different number of colors)
// and the code will compensate.
//var cscale = ['#feebe2', '#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'];
var cscale = ['#ffffcc', '#a1dab4', '#41b6c4', '#1e84be', '#54278f'];

//var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors; map application by NABU'
});

var bright = L.tileLayer('http://t4b:8080/styles/bright-v9/rendered/{z}/{x}/{y}.png', {
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
    maxZoom: 12,
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

// Be nice and credit our data source, Census Reporter.
map.attributionControl.addAttribution('Data from ' +
    '<a href="http://www.bkg.bund.de">' +
    '© Bundesamt für Kartographie und Geodäsie</a>');


var params = {};


window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    params[key] = decodeURIComponent(value);
});


NProgress.configure({
    showSpinner: false,
    trickle: false,
    minimum: 0.2,
    trickleRate: 1,
    trickleSpeed: 800,
    speed: 1000
});

var birdsLayer = L.geoJson();
var birdsLayerBund = L.geoJson();

var template;

L.TopoJSON = L.GeoJSON.AJAX.extend({
    addData: function (jsonData) {
        if (jsonData.type === 'Topology') {
            for (var key in jsonData.objects) {
                var geojson = topojson.feature(jsonData, jsonData.objects[key]);
                L.GeoJSON.prototype.addData.call(this, geojson);
            }
        } else {
            L.GeoJSON.prototype.addData.call(this, jsonData);
        }
    }
});

var bundeslaender = new L.TopoJSON();

var bundeslaenderRS = [
    {
        'RS': '01',
        'GEN': 'Schleswig-Holstein'
    },
    {
        'RS': '02',
        'GEN': 'Hamburg'
    },
    {
        'RS': '03',
        'GEN': 'Niedersachsen'
    },
    {
        'RS': '04',
        'GEN': 'Bremen'
    },
    {
        'RS': '05',
        'GEN': 'Nordrhein-Westfalen'
    },
    {
        'RS': '06',
        'GEN': 'Hessen'
    },
    {
        'RS': '07',
        'GEN': 'Rheinland-Pfalz'
    },
    {
        'RS': '08',
        'GEN': 'Baden-Württemberg'
    },
    {
        'RS': '09',
        'GEN': 'Bayern'
    },
    {
        'RS': '10',
        'GEN': 'Saarland'
    },
    {
        'RS': '11',
        'GEN': 'Berlin'
    },
    {
        'RS': '12',
        'GEN': 'Brandenburg'
    },
    {
        'RS': '13',
        'GEN': 'Mecklenburg-Vorpommern'
    },
    {
        'RS': '14',
        'GEN': 'Sachsen'
    },
    {
        'RS': '15',
        'GEN': 'Sachsen-Anhalt'
    },
    {
        'RS': '16',
        'GEN': 'Thüringen'
    }
];

bundeslaender.addUrl('data/vg2500_lan-p4.json');

$.get('tmpl/template.html', function (tmpl) {
    template = tmpl;
    Mustache.parse(template); // optional, speeds up future uses
});


function join(lookupTable, mainTable, lookupKey, mainKey, select) {
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex[y.properties[mainKey]]; // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};

function joinData(filterResult,kreise) {
    // Vlt. hilfreich: http://learnjsdata.com/combine_data.html
    var kr = kreise.toGeoJSON();

    return join(filterResult, kr.features, 'kreisid', 'rs', function (kreis, filter) {
        return {
            geometry: kreis.geometry,
            type: kreis.type,
            properties: {
                rs: kreis.properties.rs,
                des: kreis.properties.des,
                gen: kreis.properties.gen,
                anzahl: (filter !== undefined) ? filter.anzahl : undefined,
                art: (filter !== undefined) ? filter.art : undefined,
                durchschnitt: (filter !== undefined) ? filter.durchschnitt : undefined,
                gaerten_gesamt: (filter !== undefined) ? filter.gaerten_gesamt : undefined,
                kreisid: (filter !== undefined) ? filter.kreisid : undefined
            }
        };
    });
}

//TODO:Must be optimized for mobile browsers.
function setLegendOverview(bird, ranges, metadata) {
    var umlaut;
    if (typeof bird !== 'undefined') {
        umlaut = bird.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss");
    }


    var color = d3.scaleQuantile().domain([ranges.durchschnitt.min, ranges.durchschnitt.max]).range(cscale);


    if (!metadata.length) {
        return;
    } else {
        // build the map legend
        d3.select('.legend-overview').remove();
        var legend = d3.select('#map').append('div').attr('class', 'legend-overview').html('<a class="closeX" id="closeX">&#10006;</a><p><b style="color:#0068b4">' + bird + '</b></p><p><img width="190" src="https://www.nabu.de/modules/sdg-sdw/vogelbilder_'+selectAction.getValue()+'/' + metadata[0].Bild + '" alt="Bild: "' + umlaut + '"></p><p><a href=' + metadata[0].Link + ' target="_blank">Mehr zu "' + bird + '"</a></p><p>&empty; Anzahl der Vögel pro Garten</p>').append('ul').attr('class', 'list-inline');
        var keys = legend.selectAll('li.key').data(color.range());
        var legendItems = [ranges.durchschnitt.min, '', '', '', ranges.durchschnitt.max];
        keys.enter().append('li').attr('class', 'key').style('border-top-color', String).text(function (d, i) {
            return legendItems[i];
        });
    }

}

//TODO:Must be optimized for mobile browsers.
function setLegend(bird, ranges, metadata) {
    var umlaut;
    if (typeof bird !== 'undefined') {
        umlaut = bird.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss");
    }


    var color = d3.scaleQuantile().domain([ranges.durchschnitt.min, ranges.durchschnitt.max]).range(cscale);

    if (!metadata.length) {
        return;
    } else {

        // build the map legend
        d3.select('.legend').remove();
        var legend = d3.select('#map').append('div').attr('class', 'legend').html('<a class="closeX" id="closeX">&#10006;</a><p><b style="color:#0068b4">' + bird + '</b></p><p><img width="190" src="https://www.nabu.de/modules/sdg-sdw/vogelbilder_'+selectAction.getValue()+'/' + metadata[0].Bild + '" alt="Bild: "' + umlaut + '"></p><p><a href=' + metadata[0].Link + ' target="_blank">Mehr zu "' + bird + '"</a></p><p>&empty; Anzahl der Vögel pro Garten</p>').append('ul').attr('class', 'list-inline');
        var keys = legend.selectAll('li.key').data(color.range());
        var legendItems = [ranges.durchschnitt.min, '', '', '', ranges.durchschnitt.max];
        keys.enter().append('li').attr('class', 'key').style('border-top-color', String).text(function (d, i) {
            return legendItems[i];
        });
    }
}

function getColor(d, ranges) {
    if (typeof d !== 'undefined') {
        //Alte Klassifikation: rgb(255,255,200), rgb(150,255,150),rgb(0,175,0),rgb(255,255,0),rgb(255,128,0),rgb(255,50,50)

        var color = d3.scaleQuantile().domain([ranges.durchschnitt.min, ranges.durchschnitt.max]).range(cscale);
        return color(d);
    } else {
        return 'rgb(255,255,255)';
    }
}

function clickLayer() {
    $('.country-name').hide();
    $('.country-name').html(Mustache.render(template, this.feature.properties)).show();

}

function enterLayer() {
    $('.country-name').html(Mustache.render(template, this.feature.properties)).show();
    //console.log(this.feature.properties.rs+" "+this.feature.properties.des+" "+this.feature.properties.gen);

    this.setStyle({
        weight: 3
            //opacity: 1
    });
}

function leaveLayer() {
    $('.country-name').hide();

    this.setStyle({
        weight: 1
            //opacity:.5
    });
}
// Excuse the short function name: this is not setting a JavaScript
// variable, but rather the variable by which the map is colored.
// The input is a string 'name', which specifies which column
// of the imported JSON file is used to color the map.
function setVariable(newLayer, variable, ranges) {
    newLayer.eachLayer(function (layer) {
        layer.on({
            mouseover: enterLayer,
            mouseout: leaveLayer,
            click: clickLayer
        });
        layer.setStyle({
            fillColor: getColor(layer.feature.properties[variable], ranges),
            fillOpacity: 0.6,
            weight: 1
        });
    });
}


function createOverview(data, metadata) {

    var bundeslaenderBirds = [];

    bundeslaenderRS.forEach(function (item) {

        var result = data.filter(function (el) {
            return (el.kreisid).slice(0, 2) === item.RS && el.art === selectBird.getValue();
        });

        // Wenn keine Einträge für das Bundesland gefunden, dann gehe zum nächsten Bundesland.
        if (result.length === 0) {
            return;
        }


        var resultKreise = data.filter(function (el) {
            return (el.kreisid).slice(0, 2) === item.RS;
        });

        var gesamt= [],
            id = [];

        resultKreise.forEach(function(obj) {
                if (id.indexOf(obj.kreisid) == -1)
                        id.push(obj.kreisid);

                var lastIndex = id.length - 1;
                if (typeof gesamt[lastIndex] == "undefined")
                        gesamt.push(obj.gaerten_gesamt);
                else
                        gesamt[lastIndex] = obj.gaerten_gesamt;
        });

        var gaerten_gesamt=gesamt.reduce(function(sum, elem){
                return parseInt(sum) + parseInt(elem);
        });

        item.art = selectBird.getValue();

        var anzahl = result.reduce(function(prevVal, elem) {return prevVal + elem.anzahl * 1},0);
        item.anzahl = (anzahl !== 0) ? anzahl : undefined;

        item.gaerten_gesamt = (gaerten_gesamt !== 0) ? gaerten_gesamt : undefined;

        item.durchschnitt = !isNaN((item.anzahl / item.gaerten_gesamt).toFixed(2)) ? (item.anzahl / item.gaerten_gesamt).toFixed(2) : undefined;

        bundeslaenderBirds.push(item)
    });

    birdsLayerBund.clearLayers();
    birdsLayerBund.remove();

    var bl = bundeslaender.toGeoJSON();

    var result = join(bundeslaenderBirds, bl.features, 'RS', 'RS', function (bundesland, filter) {
        if (filter !== undefined) {
            return {
                geometry: bundesland.geometry,
                type: bundesland.type,
                properties: {
                    rs: bundesland.properties.RS,
                    gen: bundesland.properties.GEN,
                    anzahl: (filter.anzahl !== undefined) ? filter.anzahl : undefined,
                    art: (filter.art !== undefined) ? filter.art : undefined,
                    durchschnitt: (filter.durchschnitt !== undefined) ? filter.durchschnitt : undefined,
                    gaerten_gesamt: (filter.gaerten_gesamt !== undefined) ? filter.gaerten_gesamt : undefined
                }
            }
        } else {
            return {
                geometry: bundesland.geometry,
                type: bundesland.type,
                properties: {
                    rs: bundesland.properties.RS,
                    gen: bundesland.properties.GEN,
                    anzahl: undefined,
                    art: undefined,
                    durchschnitt: undefined,
                    gaerten_gesamt: undefined
                }

            }
        }
    });

    birdsLayerBund.addData(result);

    var rangesOverview = {};
    rangesOverview.durchschnitt = {
        min: '',
        max: ''
    };

    for (var i = 0; i < result.length; i++) {
        if (result[i].properties['durchschnitt'] !== undefined) {
            rangesOverview.durchschnitt.min = Math.min(result[i].properties['durchschnitt'], rangesOverview.durchschnitt.min);
            rangesOverview.durchschnitt.max = Math.max(result[i].properties['durchschnitt'], rangesOverview.durchschnitt.max);
        }
    }
    setVariable(birdsLayerBund, 'durchschnitt', rangesOverview);
    setLegendOverview(selectBird.getValue(), rangesOverview, metadata);
    if (screen.height <= 500) {
        $(".legend-overview").hide();
        $("#info").show();
    }else{
        $(".legend-overview").show();
        $("#info").hide();

    }

}

function doStuff(data, bird, kreise) {
    NProgress.start();

    birdsLayer.clearLayers();
    birdsLayer.remove();
    birdsLayer = L.geoJson();

    birdsLayerBund.clearLayers();
    birdsLayerBund.remove();
    birdsLayerBund = L.geoJson();

    // Collect the range of each variable over the full set, so
    // we know what to color the brightest or darkest.
    var ranges = {};
    ranges.durchschnitt = {
        min: '',
        max: ''
    };


    var filterResult;
    if (typeof bird !== 'undefined') {
        filterResult = data.filter(function (el) {
            return el.art === bird;
        });
    } else {
        filterResult = data.filter(function (el) {
            return el.art === "";
        });
    }

    birdsLayer.addData(joinData(filterResult,kreise));

    var metadata = vogelarteninfos.filter(function (el) {
        return el.Vogelart === bird;
    });
    createOverview(data, metadata);

    for (var i = 0; i < filterResult.length; i++) {
        ranges.durchschnitt.min = Math.min(filterResult[i]['durchschnitt'], ranges.durchschnitt.min);
        ranges.durchschnitt.max = Math.max(filterResult[i]['durchschnitt'], ranges.durchschnitt.max);
    }

    // Kick off by filtering on an attribute.
    setVariable(birdsLayer, 'durchschnitt', ranges);
    birdsLayerBund.addTo(map);
    if (typeof bird !== 'undefined') {
        setLegend(bird, ranges, metadata);
        $('.legend').hide();
    }
$(".closeX").on('click', function (event) {
            $(this).parent().hide();
$("#info").show();
        });
    NProgress.done();
}

var selectAction, $selectAction;
var selectYear, $selectYear;
var selectBird, $selectBird;

function parseData(url, callback) {
    Papa.parse(url, {
        fastMode: true,
        download: true,
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        complete: function (results) {
            //Nicht schoen! Besser durch den callback reichen!
            data = results.data;
            callback(results.data);
        }
    });
}

var infoButton = L.easyButton({
  id: 'info',  // an id for the generated button
  position: 'bottomright',      // inherited from L.Control -- the corner it goes in
  type: 'replace',          // set to animate when you're comfy with css
  leafletClasses: true,     // use leaflet classes to style the button?
  states:[{                 // specify different icons and responses for your button
    stateName: 'get-legend',
    onClick: function(button, map){
    if (map.getZoom() < 7) {
        $('.legend-overview').show();
    } else if (map.getZoom() <= 13) {
        $('.legend').show();
    }
$("#info").hide();
    },
    title: 'Mehr Infos.',
    icon: '<img alt="info" src="css/images/imagebot.png"/>'
  }]
});

infoButton.addTo(map);
$("#info").hide();




$selectAction = $('#select-action').selectize({
    closeAfterSelect: true,
    create: false,
    onChange: function (aktion) {
        if (!aktion.length) {
            return;
        }
        birdsLayer.clearLayers();
        birdsLayerBund.clearLayers();
        $('.legend-overview').remove();
        $('.legend').remove();
        Papa.parse('https://www.nabu.de/modules/sdg-sdw/'+aktion+'_vogelarteninfo.csv', {
        //Papa.parse('data/' + aktion + '_vogelarteninfo.csv', {

        // Fixed url to sdg_vogelarteninfo. Because sdw_vogelarteninfo.csv seems unmaintained.
        //Papa.parse('https://www.nabu.de/modules/sdg-sdw/sdg_vogelarteninfo.csv', {
        //Papa.parse('data/sdg_vogelarteninfo.csv', {
            quotes: true,
            fastMode: true,
            download: true,
            header: true,
            dynamicTyping: false,
            skipEmptyLines: true,
            complete: function (results) {
                //Nicht schoen! Besser durch den callback reichen!
                NProgress.start();
                //Global vogelarteninfos
                vogelarteninfos = results.data;
                selectYear.clear();
                selectYear.clearOptions();
                selectYear.disable();
                selectBird.clear();
                selectBird.clearOptions();
                selectBird.disable();
                selectYear.load(function (callback) {
                    function foo(years) {
                        var items = years.map(function (x) {
                            return {
                                item: x
                            };
                        });
                        callback(items);
                    }
                    if (aktion === "sdg") {
                        var sdg_years = ["2021", "2020", "2019", "2018", "2017","2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006"];
                        foo(sdg_years);
                    } else if (aktion === "sdw") {
                        var sdw_years = ["2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009"];
                        foo(sdw_years);
                    }
                    selectYear.enable();
                NProgress.done();

                });
            }
        });
    },
    sortField: 'text'
});

$selectYear = $('#select-year').selectize({
    closeAfterSelect: true,
    delimiter: ',',
    labelField: 'item',
    valueField: 'item',
    searchField: 'item',
    onChange: function (jahr) {
                NProgress.start();
                birdsLayer.clearLayers();
                birdsLayerBund.clearLayers();
//Workaround for slow connections.

        $('#mySpinner').show();
        if (!jahr.length) {
            return;
        }
        $('.legend-overview').remove();
        $('.legend').remove();
        selectBird.disable();
        selectBird.clear();
        selectBird.clearOptions();
        //Workaround for slow connections.

        selectBird.load(function (callback) {
            //parseData('data/' + selectAction.getValue() + '_' + jahr + '.csv', function (data) {
            parseData('https://www.nabu.de/modules/sdg-sdw/karte/'+selectAction.getValue()+'_'+jahr+'.csv', function (data) {
                var test = data.map(function(data){
                    return data.art;
                });

                var unique = test.filter(function(value,index,self){
                        return self.indexOf(value) === index;
                });

                var items = unique.map(function (x) {
                    return {
                        item: x
                    };
                });

                callback(items);
                selectBird.enable();
                $('#mySpinner').hide();

                NProgress.done();
            });
        });

    }
});

$selectBird = $('#select-bird').selectize({
    closeAfterSelect: true,
    labelField: 'item',
    valueField: 'item',
    sortField: 'item',
    searchField: 'item',
    delimiter: ',',
    persist: false,
    selectOnTab: true,
    onChange: function (bird) {
      $('#mySpinner').show();
      birdsLayer.clearLayers();
      birdsLayer.remove();
      birdsLayerBund.clearLayers();
      birdsLayerBund.remove();
      var kreise = new L.TopoJSON();
      var promise = new Promise(function(resolve, reject) {
          if (selectYear.getValue() <= 2016){
            kreise.addUrl('data/vg250.json');
            kreise.on("data:loaded",function(){
                resolve(1);
            });
          } else {
            //Kreise ab 2017
            kreise.addUrl('data/VG250_KRS_20170101.json');
            kreise.on("data:loaded", function () {
                resolve(1);
            })
        }

      });
      //Workaround for slow connections.
      promise.then(function(){
        doStuff(data, bird, kreise);
        $('#mySpinner').hide();
                });

    }

});

selectAction = $selectAction[0].selectize;
selectYear = $selectYear[0].selectize;
selectBird = $selectBird[0].selectize;

selectYear.disable();
selectBird.disable();

map.on('zoomend ', function (e) {
    if (map.getZoom() < 7) {
        if ($('.legend').css('display') == 'none'){
        }
        else {
            $('.legend').hide();
            $('.legend-overview').show();
        }
        map.addLayer(birdsLayerBund);
        map.removeLayer(birdsLayer);
        //TODO: must be optimized for mobile browsers.
    } else if (map.getZoom() <= 13) {
        if ($('.legend-overview').css('display') == 'none'){
        }
        else {
            $('.legend-overview').hide();
            $('.legend').show();
        }

        map.removeLayer(birdsLayerBund);
        map.addLayer(birdsLayer)
    }
});

    $('.country-name').on('click',function(){
    $('.country-name').hide();
    });

if (!jQuery.isEmptyObject(params)) {
    $('.selectize-control:first').remove();
    $(".country-name").css({ top: '100px' });
    selectAction.setValue(params.aktion);
    selectYear.on("load", function () {
        selectYear.setValue(params.jahr);
    });
    selectBird.on("load", function () {
    //Workaround for slow connections.
    //promise.then(function(){
        selectBird.setValue(params.vogel);
        if (params.bundesland) {
            //console.log(params.bundesland);
            birdsLayerBund.eachLayer(function(layer){
                if (layer.feature.properties.gen === params.bundesland){
                    map._layers[layer._leaflet_id].fire('mouseover');
                }});
    }
    //});
    });
}

if (L.Browser.mobile) {
    $(".selectize-input input").attr('readonly','readonly');

}
