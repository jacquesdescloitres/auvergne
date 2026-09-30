// Author: Jacques Descloitres (2025)

//const center = [ 28.300, -16.540 ];         // Tenerife (lat, lon)
const initMapCenter = [ 45.640, 2.850 ];         // Auvergne (lat, lon)
const initZoom = 11;
const vtf = [ 45.623, 2.695 ];      //  VTF Domaine des Puys

$(document).ready(function() {

// Initialize the map
        const mapOptions = {
            zoomControl: false,
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: 'topleft',
                title: 'Activer Mode Plein Ecran',
                titleCancel: 'Désactiver Mode Plein Ecran'
            }
        }
        const map = L.map('map', mapOptions).setView(initMapCenter, initZoom);

        // add zoom bar
        const zoomOptions = {
            position: "topleft",
        }
        if (L.Control.ZoomBar) {
            const zoomBar = new L.Control.ZoomBar(zoomOptions);
            zoomBar.addTo(map);
            zoomBar._zoomStartButton.title = 'Réinitialiser Zoom';
            zoomBar._zoomInButton.title = 'Zoom Avant';
            zoomBar._zoomOutButton.title = 'Zoom Arrière';
        }
        if (! mapOptions.zoomcontrol  ||  ! mapOptions.zoomcontrol.lasso)
            $(".leaflet-control-zoom-to-area").hide();

        // add markers
var LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});
var greenIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png'});
//L.marker(vtf).addTo(map).bindPopup("VTF Domaine des Puys");
const marker = L.marker(vtf, {icon: L.AwesomeMarkers.icon({icon: 'bed', prefix: 'fa', markerColor: 'red', iconColor: '#ffffff'})});
marker.addTo(map);
marker.bindTooltip("VTF Domaine des Puys", {permanent: false, direction: "bottom", offset: [0,0]});
        marker.on('mouseover', function (e) {
            this.openPopup();
        });
        marker.on('mouseout', function (e) {
            this.closePopup();
        });




        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    const coordOptions = {
        position: 'bottomleft',
        numDigits: 3,
        emptyString: null,
        lngFormatter: function(num) {
            var direction = (num < 0) ? 'W' : 'E';
            var formatted = 'Lon=' + Math.abs(num).toFixed(this.numDigits) + 'º ' + direction;
            return formatted;
        },
        latFormatter: function(num) {
            var direction = (num < 0) ? 'S' : 'N';
            var formatted = 'Lat=' + Math.abs(num).toFixed(this.numDigits) + 'º ' + direction;
            return formatted;
        }
    }

        L.control.mousePosition(coordOptions).addTo(map);

        // Basemaps
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: "Esri, Maxar, Earthstar Geographics",
            maxZoom: 21,
            maxNativeZoom: 19
        });
        const hot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team'
        });


  // Define population thresholds for each zoom level
const populationThresholds = [
  Infinity, Infinity, Infinity, Infinity, Infinity, // Zoom 0-4: No labels
  50000, 50000, 50000, 50000,  // Zoom 5-8
  20000, 10000, 2000, // Zoom 9-11
  0 // Zoom 12+
];

const communes = L.geoJSON(null, {
  style: function(feature) {
    return {
      color: '#3388ff',
      fillColor: '#3388ff',
      weight: 0,
      fillOpacity: 0,
/*
      weight: 1,
      fillOpacity: 0.2,
*/
    };
    return null;
  },
  onEachFeature: function(feature, layer) {
    if (feature.properties && feature.properties.nom) {
      // Calculate centroid of the polygon
      const centroid = layer.getBounds().getCenter();

      // Create a custom div icon for the label
      const label = L.divIcon({
        className: 'commune-label',
        html: feature.properties.nom,
        iconSize: [50, 20],
        iconAnchor: [25, 0]
      });

      // Add the label as a marker at the centroid
      const marker = L.marker(centroid, {
        icon: label,
        zIndexOffset: 1000
      })
        if (isLabelVisible(layer))
            marker.addTo(communes);
      layer.label = marker;
      layer.population = feature.properties.population || 0;
    }
  }
});

// Load GeoJSON data from a URL
fetch('./data/communes-63-puy-de-dome-with-population.geojson')
  .then(response => response.json())
  .then(data => {
  communes.addData(data);
    // Initialize label color
    updateLabelStyle();
    updateLabelVisibility();
});







        const baseMaps = {
            "Carte": osm,
            "Satellite": satellite,
        };
        const overlays = {
            "Villes": communes
        };

        // Add the default basemap
        osm.addTo(map);

        // Add the layer control to the map
        const layerControl = L.control.layers(baseMaps, overlays).addTo(map);


// Function to update tooltip text color using jQuery
function updateLabelStyle() {
  const currentBaseLayer = map._layers[Object.keys(map._layers).find(key => map._layers[key] instanceof L.TileLayer && map._layers[key]._container)];
  let textColor;
  let textShadow;

  if (map.hasLayer(osm)) {
    textColor = '#000d'; // Black text
    textShadow = 'none';
  } else {
    textColor = '#fffd'; // White text
    textShadow = 'none';
  }

  // Update CSS using jQuery
  $('.commune-label').css({
    'color': textColor,
    'text-shadow': textShadow
  });
}

function isLabelVisible(layer) {
  const zoomLevel = map.getZoom();
  const minPopulation = populationThresholds[zoomLevel] || 0;
  return layer.label  &&  layer.population >= minPopulation;
}

function updateLabelVisibility() {
  const zoomLevel = map.getZoom();
  const minPopulation = populationThresholds[zoomLevel] || 0;
console.log(zoomLevel, minPopulation);

  // Update visibility for each label
  communes.eachLayer(function(layer) {
/*
    if (layer.label) {
      if (layer.population >= minPopulation) {
        // Show the label
        if (!communes.hasLayer(layer.label)) {
          communes.addLayer(layer.label);
        }
      } else {
        // Hide the label
        if (communes.hasLayer(layer.label)) {
          communes.removeLayer(layer.label);
        }
      }
    }
*/
    if (isLabelVisible(layer)) {
        if (!communes.hasLayer(layer.label))
          communes.addLayer(layer.label);
    } else {
        if (communes.hasLayer(layer.label))
          communes.removeLayer(layer.label);
    }
  });
}


// Listen for basemap changes and zoom changes
map.on('baselayerchange overlayadd zoomend', function(e) {
console.log(e.type);
  updateLabelStyle();
  updateLabelVisibility();
  if (e.type === 'baselayerchange') {       // new base layer has just been selected
    // enanle cities by default when selecting satellite layer
    // disable cities by default when selecting osm layer
    if (this.hasLayer(satellite)  &&  ! this.hasLayer(communes)) {      // selection is satellite layer and vities were visible
      map.addLayer(communes);     // remove cities from map
      layerControl._update();     // Update the layer control to reflect the change
    } else if (this.hasLayer(osm)  &&  this.hasLayer(communes)) {
      map.removeLayer(communes);  // add cities to map
      layerControl._update();     // Update the layer control to reflect the change
    }
  }
});


        // List of GPX tracks to display
const files = [
    "./gps/20260921-095637 - Puy de Dome.gpx",
    "./gps/20260923-100730 - Mont Dore.gpx",
    "./gps/20260924-095637 - Puy de Sancy.gpx",
    "./gps/20260925-145513 - Lac Pavin.gpx",
    "./gps/20260922-143544 - Banne d'Ordanche.gpx",
	"./gps/20260923-142248 - Bourboule.gpx",
    "./gps/20260925-094410 - Lac de Guery.gpx",
]

var gpxTracks = [];
Object.entries(files).forEach(([idx, value], ) => {
    var date = value.split("_")[1];
    var entry = {name: date, file: value, color: "red"};
    gpxTracks.push(entry);
});



        // Load all GPX tracks
        gpxTracks.forEach(track => {
            var gpx = new L.GPX(track.file, {
                async: true,
                polyline_options: {
                    color: track.color,
                    weight: 4,
                    opacity: 0.7
                },
                marker_options: {
                    iconSize: [40, 40],
                    iconAnchor: [12, 35],
                },
                markers: {
                    startIcon: "./icons/push-pin-icon-17895.png",
//                  startIcon: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${track.color}.png`,
                    endIcon: null,
//                  endIconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${track.color}.png`,
//                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
                },
                gpx_options: {
                    parseElements: ['track']
                }
            }).on('loaded', function(e) {
                this.bindTooltip(e.target.get_name(), {permanent: false, direction: "bottomright", offset: [0,0]});
            });
            gpx.addTo(map);
        });

/*
*/

});
