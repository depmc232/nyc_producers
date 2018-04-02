// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto */

var map = L.map('map').setView([41,-75], 5);

// Add base layer
L.tileLayer('https://api.mapbox.com/styles/v1/ceciliadepman/cjf4a6lfn14t72rqg26521q96/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2VjaWxpYWRlcG1hbiIsImEiOiJjamRwOXBtcHgwY2Q4MndxbDkwazY3bjV1In0.iVRda2sCLQEusU5MvWp-oA', {
  maxZoom:20
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: 'apikey',
  username: 'cdepman'
});

// Initialze source data
var producerSource = new carto.source.SQL('SELECT * FROM allprograms321_latlong');

// Create style for the data
var producerStyle = new carto.style.CartoCSS(`
  #layer {
    marker-width: 8;
    marker-fill: ramp([type], (#5F4690, #1D6996, #38A6A5, #0F8554, #73AF48, #EDAD08, #E17C05, #CC503E, #94346E, #6F4070, #666666), ("VEG", "ORCH", "MEAT", "PRES", "DAIRY", "BAKE", "FISH", "FUNG", "LIVESTOCK", "MULTI"), "=");
    marker-fill-opacity: 1;
    marker-allow-overlap: true;
    marker-line-width: 0;
    marker-line-color: #FFFFFF;
    marker-line-opacity: 1;
  }
`);

// Add style to the data
var producerLayer = new carto.layer.Layer(producerSource, producerStyle, {
  featureClickColumns: ['categories', 'business_name']
});

var popup = L.popup();
producerLayer.on('featureClicked', function (event) {
  // Create the HTML that will go in the popup. event.data has all the data for 
  // the clicked feature.
  //
  // I will add the content line-by-line here to make it a little easier to read.
  var content = '<h2>' + event.data['business_name'] + '</h2>'
  content += '<div>' + event.data['categories'] + '</div>';
  popup.setContent(content);
  
  
  // Place the popup and open it
  popup.setLatLng(event.latLng);
  popup.openOn(map);
});


// Initialze source data
var districtSource = new carto.source.Dataset('congressional_districts_2015');

// Create style for the data
var districtStyle = new carto.style.CartoCSS(`
  #layer {
  polygon-fill: transparent;
  polygon-opacity: 0;
}
#layer::outline {
  line-width: 1.5;
  line-color: #070707;
  line-opacity: 0.25;
}
`);

// Add style to the data
var districtLayer = new carto.layer.Layer(districtSource, districtStyle);

// Add the data to the map as two layers. Order matters here--first one goes on the bottom
client.addLayers([districtLayer, producerLayer]);
client.getLeafletLayer().addTo(map);


/*
 * Listen for changes on the layer picker
 */

// Step 1: Find the dropdown by class. If you are using a different class, change this.
var layerPicker = document.querySelector('.layer-picker');

// Step 2: Add an event listener to the dropdown. We will run some code whenever the dropdown changes.
layerPicker.addEventListener('change', function (e) {
  // The value of the dropdown is in e.target.value when it changes
  var producerType = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (producerType === 'all') {
    // If the value is "all" then we show all of the features, unfiltered
    producerSource.setQuery("SELECT * FROM allprograms321_latlong");
  }
  else {
    // Else the value must be set to a life stage. Use it in an SQL query that will filter to that life stage.
    producerSource.setQuery("SELECT * FROM allprograms321_latlong WHERE type = '" + producerType + "'");
  }
  
  // Sometimes it helps to log messages, here we log the lifestage. You can see this if you open developer tools and look at the console.
  console.log('Dropdown changed to "' + producerType + '"');
});



// Step 1: Find the search input by class. If you are using a different class, change this.
var element = document.querySelector('.product-search');

// Step 2: Add an event listener to the input. We will run some code whenever the text changes.
element.addEventListener('keyup', function (e) {
  // The value of the input is in e.target.value when it changes
  var searchText = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (searchText === '') {
    // If the search text is empty, then we show all of the features, unfiltered
    producerSource.setQuery("SELECT * FROM allprograms321_latlong");
  }
  else {
    // Else use the search text in an SQL query that will filter to names with that text in it
    producerSource.setQuery("SELECT * FROM allprograms321_latlong WHERE products ILIKE '%" + searchText + "%'");
  }
  
  // Sometimes it helps to log messages, here we log the search text. You can see this if you open developer tools and look at the console.
  console.log('Input changed to "' + searchText + '"');
});