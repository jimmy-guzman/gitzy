#!/bin/bash

python3 -m venv .venv

source .venv/bin/activate

pip3 install asciinema

asciinema rec

npx svg-term-cli --cast=388263 --out assets/cli.svg --window --height 20
