/*
  The bridge between the client and client-services
*/

var ViewModel = function() {
  var self = this;

  self.locationFilter = ko.observable();
  self.locations = ko.observableArray([]);
  self.filteredLocations = ko.observableArray([]);
  self.filteredVisible = ko.observable(false);
  self.menuVisible = ko.observable(false);

  // Filters the map with locations matching the filter applied
  self.filter = function() {
    Splash.enable('circular');

    // clear previously set filtered locatoins
    self.filteredLocations([]);

    var query = self.locationFilter().toLowerCase();
    $.each(self.locations(), function(index, location) {
      var locationName = location.name.toLowerCase();
      if (query === '') {
        location.marker.setVisible(true);
      } else if (locationName.indexOf(query) >= 0) {
        self.toggle();
        self.filteredLocations.push(location);
      } else {
        location.marker.setVisible(false);
      }
      stopLoading();
    });

  };

  // Opens the info window
  self.openInfo = function() {
    self.toggle();
    Splash.enable('circular');
    google.maps.event.trigger(this.marker, 'click');
    stopLoading();
  };

  // Displays the filtered locations
  self.toggle = function() {
    if (self.menuVisible()) {
      self.toggleMenu();
    }
    self.filteredVisible(!self.filteredVisible());
  };

  // Displays all the locations
  self.toggleMenu = function() {
    if (self.filteredVisible()) {
      self.toggle();
    }
    self.menuVisible(!self.menuVisible());
  };

};

var vm = new ViewModel();
