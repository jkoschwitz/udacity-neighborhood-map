const GMAP_KEY = 'AIzaSyBom-cjRo-fy7JXK7UcX--BhKweCRXCGSM';
const GMAP_BASE_URL = 'http://maps.googleapis.com/maps/';

// AIzaSyBom-cjRo-fy7JXK7UcX--BhKweCRXCGSM

const YELP_BASE_URL = 'http://api.yelp.com/v2/search/';
const YELP_CONSUMER_KEY = 'QDjUDjcyJm01dz_NPhUlRw';
const YELP_CONSUMER_SECRET = 'rKa0IsIz0xRnA1PpKdi_DMsIsWQ';
const YELP_TOKEN = 'tJL7VrTzLMTY2oLMLNnccRx2_sqtjgLe';
const YELP_TOKEN_SECRET = 'GO3wgsHu58M67PwuiQMtjtUkFPc';

// Consumer Key	QDjUDjcyJm01dz_NPhUlRw
// Consumer Secret	rKa0IsIz0xRnA1PpKdi_DMsIsWQ
// Token	tJL7VrTzLMTY2oLMLNnccRx2_sqtjgLe
// Token Secret	GO3wgsHu58M67PwuiQMtjtUkFPc

// https://api.yelp.com/oauth2/token
// App ID
// K9Pvl_e7--ZTrD7p49MSfw
// App Secret
// 6Wdrh6d0xtGnErhSypBhfYTMUQ2NQVxg20TkThTjs2wHU3nrypA0xJO7rCNHPifv

// enter the lat & long of your desired location
const CURRENT_LOCATION = { lat: 38.900138, lng: -77.044532};

var yelpLocations = [];
var markerArray = [];
var infoWindow;
var bounds;

var map = null;
var panorama = null;
var fenway = {lat: 52.527797, lng: 13.394694};

/*
  Places all markers on the map
  @param locationArray - location with data retrieved from Yelp
*/
function setMarkers(locationArray) {
  clearMarkers();
  $.each(locationArray, function(index, location) {
    createMarker(location);
  });

  // center the map
  map.fitBounds(bounds);
  if (DIMS.width > 662) {
    map.setZoom(16);
  }
}

// Clears existing markers that are displayed
function clearMarkers() {
  $.each(markerArray, function(index, marker) {
    marker.setMap(null);
  });
  markerArray = [];
}

/*
Function for streetview stuff
*/

function createStreetView(svLocation){

  panorama = new google.maps.StreetViewPanorama(

      document.getElementById('pano'), {
        position: svLocation,
        pov: {
          heading: 14,
          pitch: 2
        }
      });

  map.setStreetView(panorama);

}

/*
  Creates markers from a location object
  @param location - a location object containing data from Yelp
*/
function createMarker(location) {
  var latlng = new google.maps.LatLng(location.lat, location.lng);
  var marker = new google.maps.Marker({
    title: location.name,
    position: latlng,
    map: map,
    animation: google.maps.Animation.DROP,
  });

  // extend the map bounds to include marker position
  bounds.extend(marker.position);

  var parseURL;
  if (location.url === '') {
    parseURL = '">';
  } else {
    parseURL = (location.url || '#') + '" target="_blank">Visit Website';
  }

  var content = '<div id="venue">' +
    '<h5 class="venue-name">' + (location.name || '') + '</h5>' +
    '<div class="venue-address">' + (location.address[0] || '') +
    '<br>' + (location.address[2] || location.address[1] || '') + '</div>' +
    '<div class="venue-contact">' + (location.phone || '') + '</div>' +
    '<div class="venue-url"><a href="' + parseURL + '</a></div>' +
    '<div class="venue-rating" style="margin-top:10px"><img src="' + (location.ratingImage || '' ) +'" /></div>' +
    '</div>';

  google.maps.event.addListener(marker, 'click', function() {

    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout( function() { marker.setAnimation(null); }, 700 * 2);
    }
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
    map.setCenter(marker.getPosition());

    // fenway = {52.526836, 13.393152};
    fenway = {lat: marker.getPosition().lat(), lng: marker.getPosition().lng()};
    createStreetView(fenway);

  });

  location.marker = marker;
  markerArray.push(marker);
}

/*
  Retrieve location data from Yelp API
  @param locationArray - a list of location objects with a name, coordinates, and address
*/
function getYelpData(locationArray) {
  // fetch data for each location in the array
  $.each(locationArray, function(index, location) {
    var params = {
      oauth_consumer_key: YELP_CONSUMER_KEY,
      oauth_token: YELP_TOKEN,
      oauth_nonce: nonceString(15),
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      callback: 'cb',
      term: location.name,
      location: 'Berlin, Germany',
      limit: 1
    };

    // generate an oauth signature
    params.oauth_signature = oauthSignature.generate(
      'GET',
      YELP_BASE_URL,
      params,
      YELP_CONSUMER_SECRET,
      YELP_TOKEN_SECRET
    );

    // call the API
    $.ajax({
      url: YELP_BASE_URL,
      data: params,
      cache: true,
      async: true,
      dataType: 'jsonp',
    }).done(function(data) {
      var loc = data.businesses[0];
      var locObject = {
        id: loc.id || '',
        name: loc.name || location.name,
        phone: loc.display_phone || '',
        url: loc.url || '',
        lat: loc.location.coordinate.latitude || location.lat,
        lng: loc.location.coordinate.longitude || location.lng,
        address: loc.location.display_address || location.address,
        ratingImage: loc.rating_img_url || '',
      };

      yelpLocations.push(locObject);

      // when all locations have been loaded then display the markers
      if (yelpLocations.length > 0) {
        setMarkers(yelpLocations);
        vm.locations(yelpLocations);
        stopLoading();
      }
    }).fail(function() {
      errorHandler('Faild to load data from Yelp. Try again later.')
    });
  });
}

// Initializes the Google Map display
function initializeMap() {

  // Splash.enable('circular');

  var mapContainer = document.getElementById('map');

  var mapOptions = {
    zoom: (DIMS.width < 662) ? 10 : 16,
    center: new google.maps.LatLng(
      CURRENT_LOCATION.lat,
      CURRENT_LOCATION.lng
    ),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    streetViewControl: true
  };
  infoWindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
  map = new google.maps.Map(mapContainer, mapOptions);

  panorama = new google.maps.StreetViewPanorama(

      document.getElementById('pano'), {
        position: fenway,
        pov: {
          heading: 14,
          pitch: 2
        }
      });

  map.setStreetView(panorama);


  // load in all the location data and place markers
  getYelpData(LOCATIONS);

  // Bind the ViewModel once loaded
  ko.applyBindings(vm);

}

// Alerts user when an error occurs
function errorHandler(msg) {
  if (msg) {
    $('.error-msg').html(msg);
  } else {
    $('.error-msg').html('The page didn\'t load Google Maps correctly. Try refreshing the page or try again later.');
  }
  $('#mapErrorModal').modal('show');
}
