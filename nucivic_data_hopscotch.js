/**
 * @file
 * JS for hopscotch.
 */
(function ($) {

  Drupal.behaviors.nucivicDatahopscotch = {
    attach: function (context, settings) {
      var tour = {
        id: "hello-hopscotch",
        onEnd: function() {
          setCookie("toured", "toured");

        },
        onClose: function() {
          setCookie("toured", "toured");

        },
        steps: [
          {
            title: "Welcome to DKAN",
            content: "Click next to take the tour.",
            target: document.querySelector(".logo"),
            placement: "bottom",
            fixedElement: true,
            xOffset: "0",
            yOffset: "0"
          },
          {
            title: "Search Datasets",
            content: "Unlock open data with rich search tools.",
            target: "block-dkan-sitewide-dkan-sitewide-search-bar",
            multipage: true,
            onNext: function () {
              window.location = "/dataset"
            },
            placement: "left"
          },
          {
            title: "Faceted Search",
            content: "Dig through large volumes of data with search facets.",
            target: document.querySelector(".col-md-3"),
            multipage: true,
            onNext: function () {
              window.location = "/dataset/wisconsin-polling-places"
            },
            placement: "right"
          },
          {
            title: "Rich Metadata",
            content: "DKAN makes it easy to collect and expose metatadata that conforms to a number of open specifications including DCAT and Project Open Data.",
            target: document.querySelector(".field-group-table"),
            placement: "top"
          },
          {
            title: "Expose Data in Multiple Formats",
            content: "Federate data using Project Open Data and CKAN compliant json endpoints and DCAT compatiable RDF endpoints.",
            target: document.querySelector(".pane-dkan-sitewide-dkan-sitewide-other-access"),
            multipage: true,
            onNext: function () {
              window.location = $('#data-and-resources li.first a').attr('href')
            },
            placement: "right"
          },
          {
            title: "Preview Resources",
            content: "Unlock data with rich data previews.",
            target: document.querySelector(".data-explorer"),
            placement: "top"
          },
        ]
      };

      function setCookie(key, value) {
        var expires = new Date();
        expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
        document.cookie = key + '=' + value + ';path=/' + ';expires=' + expires.toUTCString();
      };

      function getCookie(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
      };

      // Initialize tour if it's the user's first time
      if (!getCookie("toured")) {
         hopscotch.startTour(tour);
      }

    }
  }

})(jQuery);
