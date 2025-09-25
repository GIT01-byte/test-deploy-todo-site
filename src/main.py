from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from database.tasks import create_table
from database.tasks import delete_table

from api.tasks import router as tasks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await delete_table()
    await create_table()
    print('База перезапущена...')
    yield
    print('Выключение')


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://'
                ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(tasks_router)

if __name__ == '__main__':
    uvicorn.run(app, reload=True, host='0.0.0.0', port=8000)
