/*
 * Library to
 * 1. Change each line of the subtitles in the .srt into one liners
 * 2. Translate each of the subtitles from its orginal language to another
 * 3. Appends the translated subtitle directly below the original subtitles
 * 4. Returns the SRT STRING as a response in the callback
 *
 * Usage:
 *
 * var doublesub = require('doublesub');
 *
 * optsObj = {
 *    srtString: "", // SRT string, try downloading one from opensubtitles.org
 *    frLang:    "", // See all supported languages here:
 *    toLang:    "", // tech.yandex.com/translate/doc/dg/concepts/langs-docpage/
 *    yandexKey: ""  // Yandex Translation API key, get at tech.yandex.com/keys
 * }
 *
 * doublesub(optsObj, function(err, res)){
 *   console.log(res); // outputs the new SRT STRING, you can save it to file
 * });
 *
 */

var parser = require('subtitles-parser');
var coll   = require('lodash/collection');
var array  = require('lodash/array');
var yandex = require('yandex-translate');

var doublesub = function(opts, callback){

  var parsedSrt = parser.fromSrt(opts.srtString);

  // Transforms each subtitle with multiple lines into one
  var parsedSrtSingleLines = coll.map(parsedSrt, function(n){
    n.text = n.text.split("\n").join(" ");
    return n;
  });
  var srtLength = parsedSrtSingleLines.length;

  // Smaller chunks because Yandex's request limit on the text to be translated
  var chunkSize       = 250;
  var chunks          = Math.ceil(srtLength/chunkSize);

  // Loops through each chunk to send to Yandex for translation
  var translatedCount = 0;
  for (i=0; i < chunks; i++) {
    var arrays = array.slice(parsedSrtSingleLines, i*chunkSize, (i+1)*chunkSize);

    // Removes each subtitle lines' timestamp info to save line count
    // and turns each one into a newline
    var string = coll.map(arrays, function(n){
      return n.text;
    }).join("\n");

    // Sends new subtitle texts in 250 lines to Yandex Translate API
    yandex(string, { from: opts.frLang, to: opts.toLang, key: opts.yandexKey }, function(err, res) {
      if (res.code === 200) {
        // Appends the translated lines into each original SRT line
        var translatedArray = res.text[0].split("\n");
        for (j=0; j < translatedArray.length; j++) {
          parsedSrtSingleLines[(this.i*chunkSize)+j].text += "\n" + translatedArray[j];
        }
        translatedCount++;

        // Returns the new SRT after all chunks are tranlated!
        if (translatedCount === (chunks)) {
          return callback(null, parser.toSrt(parsedSrtSingleLines));
        }
      } else {
        return callback(err);
      }
    }.bind({ i: i }));
  }

};

module.exports = doublesub;
