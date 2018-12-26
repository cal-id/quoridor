#!/usr/bin/python3
import cgi
import sys
import os
import json
from pathlib import Path
from utils import print_header, error, get_largest_in_game_root, get_game_root

import cgitb
cgitb.enable(display=0, logdir="logs")

def save_query():
    try:
        content_len = int(os.environ["CONTENT_LENGTH"])
        
        if(content_len > 200000):
            error("post too large")
            return

        req_body = sys.stdin.read(content_len)
        sent_json = json.loads(req_body)
    except:
        error("failed to parse json POST")   
        return

    try:
        game_id = int(sent_json["gameId"])
    except (ValueError, KeyError):
        error("gameId should be int")
        return

    try:
        moves = sent_json["moves"]
    except KeyError:
        error("need moves in JSON")
        return

    if len(moves) > 1000:
        error("too many moves")
        return

    clean_moves = []

    for move in moves:
        this_move = {}
        if move["type"] == "wall":
            this_move["type"] = move["type"]
            this_move["data"] = {
                "position": {
                    "x": move["data"]["position"]["x"],
                    "y": move["data"]["position"]["y"]
                },
                "h": move["data"]["h"]
            }
        elif move["type"] == "player":
            this_move["type"] = move["type"]
            this_move["data"] = {
                "position": {
                    "x": move["data"]["position"]["x"],
                    "y": move["data"]["position"]["y"]
                }
            }
        else:
            this_move = {}
        clean_moves.append(this_move)

    this_game_root = get_game_root(game_id)
    
    largest = get_largest_in_game_root(this_game_root)
    new_num = largest + 1
    this_one = this_game_root / ("m" + str(new_num))

    if not this_one.parent.exists():
        error("Something is wrong with the filesystem. Can't access: " + this_one.parent)
        return

    with open(str(this_one), "w") as fh:
        fh.write(json.dumps({
            "moves": clean_moves,
            "num": new_num
        }))

    print_header()
    print(json.dumps({"latest": new_num}))

save_query()

