#!/usr/bin/env node

var yandexKey = process.env.YANDEX_KEY;

var program = require('commander');
var fs      = require('fs');
var dualsub = require('../index.js');

program
  .version('0.0.8')
  .description('CLI to help you append translated subtitles at the bottom of the original subtitles.\n\n  See github.com/owyongsk/node-doublesub')
  .usage('-f Kung.Fury.WEBRiP.srt -T en -F es')
  .option('-T, --to-lang <lang>',      'The language to translate to and to be appended at the bottom')
  .option('-F, --from-lang <lang>',    'The original language of the .srt subtitle file')
  .option('-f, --file <path>',         'The original file of the .srt subtitle file in utf8')
  .option('-y, --yandex-key <string>', 'The API key for yandex translate, ignore if env var YANDEX_KEY is set')
  .option('-t, --translate',           'Translate only mode, if you only want translated subtitles')
  .parse(process.argv);

dualsub({
  translate: program.translate,
  srtString: fs.readFileSync(program.file,'utf8'),
  frLang:    program.fromLang,
  toLang:    program.toLang,
  yandexKey: program.yandexKey || yandexKey
}, function(error, res){
    if (error) { return console.log(error) }

    new_srt = program.file.split(".").slice(0,-2).
      concat([program.fromLang+"-"+program.toLang,"srt"]).join(".");
    fs.writeFile(new_srt, res, function(err){
      if (err) { return console.log(err) }
      console.log("New subtitles in "+new_srt);
    });
});
