#!/usr/bin/env python

import asyncio
import websockets
import json
import random
import time

randomlist = []



PORT = 5678

cli_sockets = set()
dummy_data = {
    "type": "json",
    "isTrue" : True,
    "isInt": 35
}
async def echo(websocket, path):
    print("A client just connected")
    cli_sockets.add(websocket)
    try:
        async for message in websocket:
            print('Recieved message from client: ' + message)
            for cli in cli_sockets:
                if cli != websocket:
                    websocket.send("Someone said: "+ message)
                while True:
                    randomlist = []
                    for i in range(0,3):
                        n = round(random.uniform(0, 7), 2)
                        randomlist.append(n)
                    print(randomlist)
                    time.sleep(3)
                    await websocket.send(json.dumps(randomlist))
    except websockets.exceptions.ConnectionClosed as e:
        print('A client just disconnected')
        print(e)
    finally:
        cli_sockets.remove(websocket)


server =  websockets.serve(echo, "localhost", PORT)
async def main():
    async with  websockets.serve(echo, "localhost", PORT):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())

# asyncio.get_event_loop().run_until_complete(server)
# asyncio.get_event_loop().run_forever()