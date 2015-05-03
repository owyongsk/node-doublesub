/*
 * Library to
 * 1. Change each line of the subtitles in the .srt into one liners
 * 2. Translate each of the subtitles from its orginal language to another
 * 3. Appends the translated subtitle directly below the original subtitles
 * 4. Returns the SRT STRING as a response in the callback
 *
 * Usage:
 *
 * var dualsub = require('dualsub');
 *
 * optsObj = {
 *    srtString: "", // SRT string, try downloading one from opensubtitles.org
 *    frLang:    "", // See all supported languages here:
 *    toLang:    "", // tech.yandex.com/translate/doc/dg/concepts/langs-docpage/
 *    yandexKey: ""  // Yandex Translation API key, get at tech.yandex.com/keys
 * }
 *
 * dualsub(optsObj, function(err, res)){
 *   console.log(res); // outputs the new SRT STRING, you can save it to file
 * });
 *
 */

var parser = require('subtitles-parser');
var coll   = require('lodash/collection');
var array  = require('lodash/array');
var yandex = require('yandex-translate');

var dualsub = function(opts, callback){

  var yandexKey = opts.yandexKey;
  var parsedSrt = parser.fromSrt(opts.srtString);
  var chunkSize = 250;

  var parsedSrtWithNoWhiteSpace = coll.map(parsedSrt, function(n){
    n.text = n.text.replace("\n", " ");
    return n;
  });

  var srtLength = parsedSrtWithNoWhiteSpace.length;
  var parts = Math.ceil(srtLength/chunkSize);

  var translatedCount = 0;

  for (i=0; i < parts; i++) {
    var arrays = array.slice(parsedSrtWithNoWhiteSpace, i*chunkSize, (i+1)*chunkSize);
    var string = coll.map(arrays, function(n){
      return n.text;
    }).join("\n");

    yandex(string, { from: opts.frLang, to: opts.toLang, key: opts.yandexKey }, function(err, res) {
      if (res.code === 200) {
        var translatedArray = res.text[0].split("\n");
        for (j=0; j < translatedArray.length; j++) {
          parsedSrtWithNoWhiteSpace[(this.i*chunkSize)+j].text += "\n" + translatedArray[j];
        }
        translatedCount++;
        if (translatedCount === (parts)) {
          return callback(null, parser.toSrt(parsedSrtWithNoWhiteSpace));
        }
      } else {
        console.log(res);
      }
    }.bind({ i: i }));
  }

};

module.exports = dualsub;
