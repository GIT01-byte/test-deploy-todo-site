from typing import List, Optional
from pydantic import BaseModel


class TaskCreateSchema(BaseModel):
    name: str
    description: Optional[str] = None
    completed: bool = False

class TaskUpdateSchema(BaseModel):
    name: Optional[str]
    description: Optional[str] = None

class TaskSchema(BaseModel):
    id: int

class TaskIDs(BaseModel):
    ids: List[int]
