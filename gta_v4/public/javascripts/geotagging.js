/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator() {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function (onsuccess, onerror) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onsuccess, function (error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function (position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function (position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "YOUR API KEY HERE";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function (lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR API KEY HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "";
        if (typeof tags !== 'undefined') tags.forEach(function (tag) {
            tagList += "&markers=%7Clabel:" + tag.name
                + "%7C" + tag.latitude + "," + tag.longitude;
        });

        var urlString = "http://maps.googleapis.com/maps/api/staticmap?center="
            + lat + "," + lon + "&markers=%7Clabel:you%7C" + lat + "," + lon
            + tagList + "&zoom=" + zoom + "&size=640x480&sensor=false&key=" + apiKey;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function () {
            // TODO Hier Inhalt der Funktion "update" ergänzen
            //var newPosition = ;


            tryLocate(function(position) {
              //alert("Test");

              document.getElementById("hiddenLongitude").setAttribute("value",getLongitude(position));
              document.getElementById("hiddenLatitude").setAttribute("value",getLatitude(position));
              document.getElementById("longitude").setAttribute("value",getLongitude(position));
              document.getElementById("latitude").setAttribute("value",getLatitude(position));
            }, function(message){
              alert(message);
            });

        }

    }; // ... Ende öffentlicher Teil
})();

/**
 * $(document).ready wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(document).ready(function () {
    //alert("Hello World")
    //Aufgabe 4.2.1 async
    document.getElementById("submit-button").onclick = function(){ sendGeoTag(new GeoTag($('#hiddenLongitude'),
                                                                              $('#hiddenLatitude'),
                                                                              $('#name'),
                                                                              $('#hashtag')))};

    document.getElementById("apply").onclick = function(){filterGeoTag($('#searchterm').val())};
    var latitude = $("#hiddenLatitude").val();
    var longitude = $("#hiddenLongitude").val();

	//console.log(latitude, longitude);
    if(latitude === "" || longitude === ""){
    	gtaLocator.updateLocation();
    }
});

function sendGeoTag(geoTag){
    var ajax = new XMLHttpRequest();

    //EventListner
    ajax.onreadystatechange =function(){

        //readyState returns the state an XMLHttpRequest client is in. 4 == the operation is complete
        if(ajax.readyState == 4){
          console.log("Sending this to server:");
          console.log(geoTag);
        }
    };
    //send data via http post in json to the server
    ajax.open("POST", "/tagging", true);
    ajax.setRequestHeader("Content-type", "application");

    //transform to JSON
    ajax.send(JSON.stringify(geoTag));
    $('results').load(document.URL + " #results");
}

  //Teilaufgabe 4.2.1 filter formular
  function filterGeoTag(searchterm) {
    var ajax = new XMLHttpRequest();

    if(searchterm == undefined){
      searchterm = "";
    }
    var params = "searchterm=" + searchterm;

    //EventListener
    ajax.onreadystatechange = function() {
      if (ajax.readyState === 4) {
        console.log("Filtering geoTags wirh this term\" "+ searchterm + "\".");
      }
    }

    //http get with query Parameter
    ajax.open("GET", "/discovery" + "?" + params, true);
    ajax.send(null);
    $('#results').load("/discovery" + "?" + params + '#results');
  }
