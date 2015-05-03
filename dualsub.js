var parser  = require('subtitles-parser');
var coll    = require('lodash/collection');
var array   = require('lodash/array');
var yandex  = require('yandex-translate');
var fs        = require('fs');

var dualsub = function(srtFile, fr_lang, to_lang, yandexKi){

  var yandexKey = yandexKi;

  var srtString = fs.readFileSync(srtFile,'utf8');
  var parsedSrt = parser.fromSrt(srtString);

  var chunkSize = 250;

  var parsedSrtWithNoWhiteSpace = coll.map(parsedSrt, function(n){
    n.text = n.text.replace("\n", " ");
    return n;
  });

  var srtLength = parsedSrtWithNoWhiteSpace.length;
  var parts = Math.ceil(srtLength/chunkSize);

  var translatedCount = 0;

  var saveSrtToNewFile = function() {
    var mergedSrtString = parser.toSrt(parsedSrtWithNoWhiteSpace);
    fs.writeFile("combined.srt", mergedSrtString, function(err){
      if (err) { return console.log(err) }
      console.log("New subtitles at combined.srt");
    });
  }

  for (i=0; i < parts; i++) {
    var arrays = array.slice(parsedSrtWithNoWhiteSpace, i*chunkSize, (i+1)*chunkSize);
    var string = coll.map(arrays, function(n){
      return n.text;
    }).join("\n");

    yandex(string, { from: fr_lang, to: to_lang, key: yandexKey }, function(err, res) {
      if (res.code === 200) {
        var translatedArray = res.text[0].split("\n");
        for (j=0; j < translatedArray.length; j++) {
          parsedSrtWithNoWhiteSpace[(this.i*chunkSize)+j].text += "\n" + translatedArray[j];
        }
        translatedCount++;
        if (translatedCount === (parts)) {
          saveSrtToNewFile();
        }
      } else {
        console.log(res);
      }
    }.bind({ i: i }));
  }

};

module.exports = dualsub;
