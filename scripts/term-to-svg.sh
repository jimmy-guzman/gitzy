#!/bin/bash

python3 -m venv .venv

source .venv/bin/activate

pip3 install termtosvg

termtosvg assets/cli.svg -t terminal_app
