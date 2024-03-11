//Set source URL as a constant, Past 7 Days -> All Earthquakes was chosen
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//Create instance of leaflet map
var myMap = L.map("map", {
    //Options settings, currently set to open around Australia
    center: [-25.27, 133.77],
    zoom: 4
});

//Add a tile layer to map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

//Fetch earthquake data from source URL using D3
d3.json(url).then(function (data) {

    //Define SetColour function that returns colour choice depending on depth metric passed to it
    function SetColour(depth) {
        //Switch cases handle correct return
        switch (true) {
            case depth > 90:
                return "darkred";
            case depth > 70:
                return "orangered";
            case depth > 50:
                return "orange";
            case depth > 30:
                return "yellow";
            case depth > 10:
                return "green";
            default:
                return "lightgreen";
        }
    }

    //Define SetRadius function that returns marker size parameter based on earthquake magnitude
    function SetRadius(magnitude) {
        //In case magnitude is 0, return radius of 1
        if (magnitude === 0) {
            return 1;
        }
        //Else, return radius * 4
        return magnitude * 4;
    }

    //Define SetStyle function that returns style settings for each marker
    function SetStyle(earthquake) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: SetColour(earthquake.geometry.coordinates[2]),
            color: "black",
            radius: SetRadius(earthquake.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    //Create GeoJSON layer, takes earthquake data
    L.geoJson(data, {
        
        //pointToLayer configuration set to create circle marker based on latitude and longitude
        pointToLayer: function (earthquake, latlng) {
            return L.circleMarker(latlng);
        },
        
        //Set the SetStyle function to be called by the geoJson method for styling settings
        style: SetStyle,

        //onEachFeature configured to bind a popup to each marker that displays metadata of earthquake
        onEachFeature: function (earthquake, layer) {
            layer.bindPopup("Magnitude: " + earthquake.properties.mag + "<br>Location: " + earthquake.properties.place + "<br>Depth: " + earthquake.geometry.coordinates[2]);
        }

    }).addTo(myMap);

//Create legend showing what depth each colour represents, set to bottom right corner of map
var legend = L.control({position: "bottomright"});

//Configure legend
legend.onAdd = function() {

    //Create div element called legend
    var div = L.DomUtil.create("div", "legend"),
    //Define list of depths
    depth = [-10, 10, 30, 50, 70, 90];

    //For loop to populate the legend
    for (var i = 0; i < depth.length; i++) {
        //Create HTML content for each depth, sets colour using SetColour function
        div.innerHTML += '<i style="background:' + SetColour(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+'); //+ sign for the last threshold
    }
    //Return legend items (div)
    return div;
};

//Add legend to Leaflet map
legend.addTo(myMap)

});