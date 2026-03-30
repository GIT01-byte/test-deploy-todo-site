import os
from contextlib import asynccontextmanager

import requests
import uvicorn
from api.tasks import router as tasks_router
from database.tasks import create_table, delete_table
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

SERVER_IP = os.environ.get("SERVER_IP")
print(f"Server URL: {SERVER_IP}")
if not SERVER_IP:
    print("Server URL is not assigned")
    raise RuntimeError("Server URL is not assigned")

test_response = requests.get(f"http://{SERVER_IP}/", timeout=5)
if test_response.status_code != 200:
    print(f"Server is not available. Status code: {test_response.status_code}")
    raise RuntimeError("Server is not available")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await delete_table()
    await create_table()
    print("База перезапущена...")
    yield
    print("Выключение")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        SERVER_IP,
    ],
    allow_methods=["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
)

app.include_router(tasks_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
