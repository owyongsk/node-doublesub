# doublesub

## Installation

    $ npm install doublesub

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

    See [index.js](https://github.com/owyongsk/node-doublesub/blob/master/index.js)
