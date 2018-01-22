/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN
function GeoTag(latitude, longitude, name, hashtag ) {
  this.latitude = latitude;
  this.longitude = longitude;
  this.name = name;
  this.hashtag = hashtag;

}

GeoTag.prototype.getLatitude = function () {return this.latitude};
GeoTag.prototype.getLongitiude = function () {return this.longitude};
GeoTag.prototype.getName  = function () {return this.name};
GeoTag.prototype.getHashtag = function () {return this.hashtag};


/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN
var InMemoryModul = (function () {
  //private Member
  var geoTagsArray = [];

  var id = 0;

  return{
    //Oeffentlich Member
    geoTagWithinRadius : function (latitude, longitude, radius){
      var returnList = [];
      geoTagsArray.forEach(function (element) {
        var deltaLatitude = Math.abs(element.getLatitude() - latitude);
        var deltaLongitude = Math.abs(element.getLongitiude() - longitude);
        var distance = Math.sqrt(Math.pow(deltaLatitude,2) + Math.pow(deltaLongitude,2));
        if(distance <= radius){
          returnList.push(element);
        }
      });

      return returnList;
    },

    geoTagSearch : function (searchterm){
      var returnList = [];
      geoTagsArray.forEach(function (element) {
      	var hasht = element.getHashtag ();

        if(element.getName() === searchterm || hasht.substring(1) === searchterm){
          returnList.push(element);
        }
      });
      return returnList;
    },

    addGeoTag : function (geoTag){
      id++;
      geoTag.id = id;
      geoTagsArray.push(geoTag);
    },

    deleteGeoTag : function (id){
      for(i = 0; i < geoTagsArray.length; i++){
        var tag = getTagsArray[i];
        if(id == tag.id){
          geoTagsArray.splice(i,1);
        }
      }



    }

  };
})();



/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: []
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

// TODO: CODE ERGÄNZEN START


  app.post('/tagging', function(req, res) {
    InMemoryModul.addGeoTag (new GeoTag(req.body.latitude,
       req.body.longitude, req.body.name,
       req.body.hashtag));

console.log(req.body.latitude,
   req.body.longitude, req.body.name,
   req.body.hashtag);

      res.render('gta',  {
          taglist: InMemoryModul.geoTagWithinRadius(req.body.latitude,
             req.body.longitude, 0.5)
      });
  });


/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

   app.post('/discovery', function(req, res) {


	console.log(req.body.searchterm, req.body.hiddenLatitude, 
		req.body.hiddenLongitude);


	if(req.body.searchterm != ""){
		res.render('gta',  {
          taglist: InMemoryModul.geoTagSearch(req.body.searchterm)
      	});
	}else{
		res.render('gta',  {
          taglist: InMemoryModul.geoTagWithinRadius(req.body.hiddenLatitude,
             req.body.hiddenLongitude, 0.5)
        });
	}

  });

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
