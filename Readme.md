# doublesub

A CLI tool and node API to help you append translated subtitles at the bottom of the original ones.

Watch your shows with hilarious mistranslated subtitles. At least you can learn languages faster.

## Requirements

  You need a Yandex translate API key [here](http://tech.yandex.com/keys)

## Installation

  If you just want to use the API

    $ npm install doublesub

  With also the CLI utility

    $ npm install doublesub --global

## CLI Usage

    doublesub -f Kung.Fury.WEBRiP.srt -T en -F es

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -T, --to-lang <lang>       The language to translate to and to be appended at the bottom
    -F, --from-lang <lang>     The original language of the .srt subtitle file
    -f, --file <path>          The original file of the .srt subtitle file in utf8
    -y, --yandex-key <string>  The API key for yandex translate, ignore if YANDEX_KEY is set

## API Usage

  See comments on [index.js](https://github.com/owyongsk/node-doublesub/blob/master/index.js)
