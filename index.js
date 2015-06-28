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
var async  = require('async');

var doublesub = function(opts, callback){

  var parsedSrt = parser.fromSrt(opts.srtString);

  // Transforms each subtitle with multiple lines into one
  var arrParsedSrtSingleLines = coll.map(parsedSrt, function(n){
    n.text = n.text.split("\n").join(" ");
    return n;
  });
  var srtLength = arrParsedSrtSingleLines.length;

  // Smaller chunks because Yandex's request limit on the text to be translated
  var chunkSize       = 200;
  var chunks          = Math.ceil(srtLength/chunkSize);
  var strings         = [];

  // Splits the subtitles into smaller chunks to be processed by Yandex
  for (i=0; i < chunks; i++) {
    var arrays = array.slice(arrParsedSrtSingleLines, i*chunkSize, (i+1)*chunkSize);

    // Removes each subtitle lines' timestamp info to save line count
    // and turns each one into a newline
    strings[i] = coll.map(arrays, function(n){
      return n.text;
    }).join("\n");
  }

  // Function to send string to Yandex to be processed
  var sendToYandex = function(string, cb) {
    yandex(string
      , { from: opts.frLang, to: opts.toLang, key: opts.yandexKey }
      , function(err, res) {
        if (err) { return cb(err); }

        if (res.code === 200) {
          cb(null, res.text[0]);
        } else {
          console.log(res);
          return cb(res);
        }
      });
  }

  // Asynchronously send each chunk of strings to be processed in parallel
  async.map(strings, sendToYandex, function(err, results) {
    if(err) { return callback(err); }

    coll.eachRight(results, function(n, i) {
      coll.eachRight(n.split("\n"), function(translated_line, j){
        parsedSrt[(i*chunkSize)+j].text += "\n" + translated_line;
      });
    });

    var appendedSrtString = parser.toSrt(parsedSrt);
    return callback(null, appendedSrtString);
  });

};

module.exports = doublesub;
