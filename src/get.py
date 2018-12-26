#!/usr/bin/python3
import cgi
import sys
import os
import json
from pathlib import Path
from utils import print_header, error, get_largest_in_game_root, get_game_root

import cgitb
cgitb.enable(display=0, logdir="logs")

form = cgi.FieldStorage()

def get_query():
    try:
        game_id = int(form.getvalue("gameId"))
    except:
        error("failed to parse gameId")   
        return

    this_game_root = get_game_root(game_id)
    largest = get_largest_in_game_root(this_game_root)

    if(largest != 0):
        this_one = this_game_root / ("m" + str(largest))
        print_header()
        with open(str(this_one), "r") as fh:
            print(fh.read(), end="")
    else:
        print_header()
        print(json.dumps({
            "num": largest,
            "moves": []
        }))

get_query()

