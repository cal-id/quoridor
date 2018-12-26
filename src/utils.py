import json
import os
from pathlib import Path

def print_header(): 
    print("Content-type: application/json\r\n")
    # print("Access-Control-Allow-Origin: *\r\n")  # Allow access from code pen

def error(message):
    print_header()
    print(json.dumps({
        "error": message
    }))

def get_game_root(game_id):
    this_game_root = Path(os.getcwd()) / "games" / ("g" + str(game_id))
    this_game_root.mkdir(parents=True, exist_ok=True)
    return this_game_root

def get_largest_in_game_root(root):
    return max((int(p.name[1:]) 
               for p in root.iterdir() 
               if p.name[1:].isnumeric()), default=0)