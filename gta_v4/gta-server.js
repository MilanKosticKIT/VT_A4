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
var url = require("url");

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
app.use(express.static(__dirname + "/public"));
app.use('/geotags', express.static("public/"));

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
    },

    getGeoTag : function(){
      return geoTagsArray;
    },

    getGeoTagAt : function (id){
      if(id >= geoTagsArray.length || id < 0){
        return false;
      }
      return [geoTagsArray[id]];
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

var inMemoryModule = InMemoryModul;

app.get('/', function(req, res) {
  res.render("gta", {taglist : inMemoryModule.getGeoTag()});
    /*res.render('gta', {
      taglist: [],
        latitude:req.body.latitude,
        longitude:req.body.longitude
    });*/
});

app.get("/geotags/:id", function(req, res) {
    if( !inMemoryModul.getGeoTagAt(req.params.id) ){
        res.status(404);
        res.render("gta", {taglist : inMemoryModule.getGeoTag()});
    } else {
        res.status(200);
        res.render("gta", {taglist : inMemoryModule.getGeoTagAt(req.params.id)});
    }

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
    inMemoryModule.addGeoTag(new GeoTag(req.body.latitude,
                                      req.body.longitude,
                                      req.body.name,
                                      req.body.hashtag));
    console.log(new GeoTag(req.body.latitude,
                           req.body.longitude,
                           req.body.name,
                           req.body.hashtag));
    res.status(201);
    res.location('/geotags/' + inMemoryModule.getGeoTag().length);

    res.render("gta.ejs", {taglist : inMemoryModule.getGeoTag()});
    /*InMemoryModul.addGeoTag(new GeoTag(req.body.latitude,
       req.body.longitude, req.body.name,
       req.body.hashtag));

console.log(req.body.latitude,
   req.body.longitude, req.body.name,
   req.body.hashtag);

      res.render('gta',  {
          taglist: InMemoryModul.geoTagWithinRadius(req.body.latitude,
             req.body.longitude, 0.5),
          latitude:req.body.latitude,
          longitude:req.body.longitude
      });*/
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

   app.get('/discovery', function(req, res) {
     var query = url.parse(req.url, true).query;
     console.log(query);
     res.status(201);
     if(query["searchterm"] != ""){
   		res.render('gta',  {
             taglist: InMemoryModul.geoTagSearch(query["searchterm"]),
             latitude:req.body.hiddenLatitude,
             longitude:req.body.hiddenLongitude
         	});
   	}else{
      console.log("LEER:" + query["searchterm"]);
   		res.render('gta',  {
             taglist: InMemoryModul.geoTagWithinRadius(req.body.hiddenLatitude,
                req.body.hiddenLongitude, 0.5),
             latitude:req.body.hiddenLatitude,
             longitude:req.body.hiddenLongitude
           });
   	}

	/*console.log(
    req.body.searchterm,
    req.body.hiddenLatitude,
		req.body.hiddenLongitude);*/


	/*if(req.body.searchterm){
		res.render('gta',  {
          taglist: InMemoryModul.geoTagSearch(req.body.searchterm),
          latitude:req.body.hiddenLatitude,
          longitude:req.body.hiddenLongitude
      	});
	}else{
		res.render('gta',  {
          taglist: InMemoryModul.geoTagWithinRadius(req.body.hiddenLatitude,
             req.body.hiddenLongitude, 0.5),
          latitude:req.body.hiddenLatitude,
          longitude:req.body.hiddenLongitude
        });
	}*/

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
