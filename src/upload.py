#!/usr/bin/python3
import cgi
import sys
import os
import json
from pathlib import Path

import cgitb
cgitb.enable(display=0, logdir="logs")


def print_header(): 
    print("Content-type: application/json")
    print("Access-Control-Allow-Origin: *\r\n")  # Allow access from code pen

def error(message):
    print_header()
    print(json.dumps({
        "error": message
    }))

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

    this_game_root = Path(os.getcwd()) / "games" / ("g" + str(game_id))
    this_game_root.mkdir(parents=True, exist_ok=True)
    
    largest = max((int(p.name[1:]) for p in this_game_root.iterdir() if p.name[1:].isnumeric()), default=0)

    this_one = this_game_root / ("m" + str(largest + 1))

    if not this_one.parent.exists():
        error("Something is wrong with the filesystem. Can't access: " + this_one.parent)
        return

    with open(str(this_one), "w") as fh:
        fh.write(json.dumps({
            "moves": clean_moves
        }))
    
    with open(str(this_game_root / "latest"), "w") as fh:
        fh.write(json.dumps({"latest": this_one.name}))

    print_header()
    print(json.dumps({"latest": this_one.name}))

save_query()

