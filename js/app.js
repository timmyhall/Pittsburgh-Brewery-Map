// Initial Brewery Data
var breweries = [
  { name: 'Roundabout Brewery',
    position: {lat: 40.477242, lng: -79.957048},
    yelpId: 'roundabout-brewery-pittsburgh',
    venueId: '51e05a19498ea3e14d2a7301'
  },
  { name: 'Hitchhiker Brewing Company',
    position: {lat: 40.377538, lng: -80.040648 },
    yelpId: 'hitchhiker-brewing-company-pittsburgh',
    venueId: '535c4d51498e51ccd217d581'
  },
  { name: 'The Brew Gentlemen Beer Co.',
    position: {lat: 40.404250, lng: -79.870155},
    yelpId: 'the-brew-gentlemen-beer-company-braddock',
    venueId: '4fd18647c2ee933d58dbe8de'
  },
  { name: 'Hop Farm Brewing Company',
    position: {lat: 40.484647, lng: -79.947931 },
    yelpId: 'hop-farm-brewing-co-pittsburgh',
    venueId: '50c1da68e4b09fd0a7a5fc2f'
  },
  { name: 'Draai Laag Brewing Company',
    position: {lat: 40.478767, lng: -79.968170},
    yelpId: 'draai-laag-brewing-millvale',
    venueId: '4f35b516e4b017ad792b227f'
  },
  { name: 'Grist House Craft Brewery',
    position: {lat: 40.478850, lng: -79.972004},
    yelpId: 'grist-house-craft-brewery-pittsburgh',
    venueId: '5334e0b2498e5a330d2e2ccc'
  },
  { name: 'Voodoo Brewery Homestead',
    position: {lat: 40.406815, lng: -79.909852},
    yelpId: 'voodoo-brewery-homestead-homestead',
    venueId: '54a81c5b498eca72326d85f2'
  },
  { name: 'Helltown Brewing',
    position: {lat: 40.150456, lng: -79.532164},
    yelpId: 'helltown-brewing-mount-pleasant',
    venueId: '4e4a8ff8315100ba6f72a9fe'
  },
  { name: 'Spoonwood Brewing Company',
    position: {lat: 40.345291, lng: -80.014076},
    yelpId: 'spoonwood-brewing-pittsburgh',
    venueId: '54cd3a32498ed2bdfc49c8e2'
  },
  { name: 'ShuBrew',
    position: {lat: 40.794078, lng: -80.136642},
    yelpId: 'shubrew-handcrafted-ales-and-food-zelienople',
    venueId: '51f5dada8bbd440ac1b2f8eb'
  }
];


// Display Map
var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    center: {lat: 40.477242, lng: -79.957048}
  });
  // Activate Knockout
  ko.applyBindings(new viewModel());
}

// Error Call for Google Maps 
// Use onerror="googleError" in script tag for google maps in html
function googleError() {
  alert('Google Maps has failed to load at this time.');
}


var viewModel = function() {

  // Optimize JavaScript
  "use strict";

  // Reference scope of another object in order to 
  // remain availabe and consistent 
  var self = this;

  // Create an observable for brewery list 
  self.breweryList = ko.observableArray(breweries);

  // Create a viewModel function that operates on the marker 
  // to open its infowindow and make it animate.
  self.breweryList().forEach(function(breweryItem) {

    // Create markers
    var marker = new google.maps.Marker({
      title: breweryItem.name,
      position: breweryItem.position,
      map: map
    });

    // Reference to the marker in you brewery object (item)
    breweryItem.marker = marker;

    //Invoke Foursquare Function
    getFoursquareData(breweryItem);
    
    // Create single infoWindow for each brewery
    self.infoWindow = new google.maps.InfoWindow();

    // Create event listener to animate marker
    // and open infowindow when clicked
    marker.addListener('click', function() {
      // self.selectBrewery(select);
      self.infoWindow.setContent(breweryItem.contentInfo);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null); 
      }, 750);
      self.infoWindow.open(map, marker);
    });
  });

  // Create an observable for filter input 
  self.filter = ko.observable("");

  // Create filter input function to update filter list
  self.filteredItems = ko.computed(function() {
    return ko.utils.arrayFilter(self.breweryList(), function(item) {
      var visible = item.name.toLowerCase().indexOf(self.filter().toLowerCase()) != -1;
      if (visible) {
        item.marker.setVisible(visible);
      } else {
        item.marker.setVisible(false);
      }
      return visible;
    });
  });

  // make a selectBrewery function that
  // animates the marker and opens its info
  self.selectBrewery = function(select) {
    select.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      select.marker.setAnimation(null); 
    }, 750);
    self.infoWindow.setContent(select.contentInfo);
    self.infoWindow.open(map, select.marker);
  };


  // Foursquare API
  function getFoursquareData(data) {

    var Client_id = 'HZTJRKAIEHY1W4LQXX1WSOTXUXPR2IU11GRYGTKQ1DPQSJIU';
    var Client_secret = 'PUGI2HCPUXLEYQZ2GM1QXEWA3CZAOXW51ZUY1CV5SLQE3ISN';

    // Foursquare v parameter in date YYYYMMDD format. 
    // m parameter only required if v parameter is >= 20140806
    var v = '20130815';
    var foursquareVenueId = data.venueId;
    var foursquareUrl = 'https://api.foursquare.com/v2/venues/'+ foursquareVenueId +
    '?client_id=' + Client_id + '&client_secret=' + Client_secret + '&v=' + v;

    // Exchange and store data from Foursquare's third party API
    $.ajax({
      url: foursquareUrl,
      success: function(response) {
        var foursquareLink = response.response.venue.canonicalUrl;
        var foursquarePhone = response.response.venue.contact.phone;
        var foursquareAddress = response.response.venue.location.formattedAddress;
        data.contentInfo = '<h4 id="heading">' + data.name + '</h4>'+
        '<h6>Phone: ' + foursquarePhone + '</h6>' + '<h6>' + foursquareAddress + '</h6>' + 
        '<h6 id="foursquareInfo"><a id="foursquareLink" href="' + 
        foursquareLink + '" target="_blank">Foursquare</a></h6>';
      },
      error: function() {
        data.contentInfo = '<h6>Failed to load Foursquare resources</h6>';
      }
    });
  }
};


