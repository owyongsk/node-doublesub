#!/usr/local/bin/node

var yandexKey = process.env.YANDEX_KEY;

var fs      = require('fs');
var dualsub = require('../index.js');

dualsub({
  srtString: fs.readFileSync(process.argv[2],'utf8'),
  frLang:    process.argv[3],
  toLang:    process.argv[4],
  yandexKey: yandexKey
}, function(error, res){
    if (error) { return console.log(error) }

    fs.writeFile("combined.srt", res, function(err){
      if (err) { return console.log(err) }
      console.log("New subtitles at combined.srt");
    });
});
