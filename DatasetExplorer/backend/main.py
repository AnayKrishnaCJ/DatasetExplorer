from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import pandas as pd
import io

import database

app = FastAPI(
    title="Machine Learning Dataset Explorer API",
    description="A simple FastAPI backend for managing and analyzing machine learning datasets.",
    version="1.0.0"
)

# Enable CORS (Cross-Origin Resource Sharing)
# This allows our React frontend (running on a different port like http://localhost:5173) 
# to communicate with this backend API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run database initialization when FastAPI starts up
@app.on_event("startup")
def startup_event():
    database.init_db()

# --- Pydantic Schema Models ---
# Pydantic validates incoming request bodies and automatically generates OpenAPI/Swagger schemas.

class DatasetBase(BaseModel):
    description: Optional[str] = None
    type: str = Field(..., description="Must be one of: Tabular, Image, Text, Audio")
    rows: int = Field(..., ge=0, description="Number of rows in the dataset")
    features: int = Field(..., ge=0, description="Number of features/columns in the dataset")
    status: str = Field(..., description="Must be one of: Not Explored, Exploring, Ready for Training, Trained")

class DatasetCreate(DatasetBase):
    name: str = Field(..., min_length=1, max_length=100, description="The name of the dataset")

class DatasetUpdate(DatasetBase):
    pass

class DatasetResponse(DatasetBase):
    id: int
    name: str

    class Config:
        from_attributes = True

# --- API Endpoints ---

# IMPORTANT: The stats endpoint MUST be declared before the GET /datasets/{id} endpoint.
# Otherwise, FastAPI will think "stats" is a dataset ID and attempt to cast "stats" to an integer,
# resulting in a validation error. This is a common FastAPI routing order pitfall.
@app.get("/datasets/stats")
def get_dataset_stats():
    """
    Get aggregated statistics for the dashboard, including total count 
    and count broken down by dataset type.
    """
    return database.get_stats()

@app.get("/datasets", response_model=List[DatasetResponse])
def get_all_datasets(search: Optional[str] = Query(None, description="Search datasets by name or description")):
    """
    Retrieve all datasets, with optional search filtering.
    """
    return database.get_all_datasets(search)

@app.get("/datasets/{id}", response_model=DatasetResponse)
def get_dataset_by_id(id: int):
    """
    Retrieve a specific dataset by its ID.
    """
    dataset = database.get_dataset_by_id(id)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset with ID {id} not found")
    return dataset

@app.post("/datasets", response_model=DatasetResponse, status_code=201)
def create_dataset(dataset: DatasetCreate):
    """
    Manually create a new dataset record.
    """
    # Simple validation of enum-like fields
    valid_types = ["Tabular", "Image", "Text", "Audio"]
    valid_statuses = ["Not Explored", "Exploring", "Ready for Training", "Trained"]
    
    if dataset.type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid dataset type. Must be one of {valid_types}")
    if dataset.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid dataset status. Must be one of {valid_statuses}")
        
    return database.create_dataset(
        name=dataset.name,
        description=dataset.description,
        dataset_type=dataset.type,
        rows=dataset.rows,
        features=dataset.features,
        status=dataset.status
    )

@app.put("/datasets/{id}", response_model=DatasetResponse)
def update_dataset(id: int, dataset: DatasetUpdate):
    """
    Update details of an existing dataset by ID.
    """
    valid_types = ["Tabular", "Image", "Text", "Audio"]
    valid_statuses = ["Not Explored", "Exploring", "Ready for Training", "Trained"]
    
    if dataset.type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid dataset type. Must be one of {valid_types}")
    if dataset.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid dataset status. Must be one of {valid_statuses}")

    updated_dataset = database.update_dataset(
        dataset_id=id,
        description=dataset.description,
        dataset_type=dataset.type,
        rows=dataset.rows,
        features=dataset.features,
        status=dataset.status
    )
    if not updated_dataset:
        raise HTTPException(status_code=404, detail=f"Dataset with ID {id} not found")
    return updated_dataset

@app.delete("/datasets/{id}")
def delete_dataset(id: int):
    """
    Delete a dataset from the system by its ID.
    """
    deleted = database.delete_dataset(id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Dataset with ID {id} not found")
    return {"message": f"Dataset with ID {id} has been deleted successfully"}

@app.post("/datasets/upload", response_model=DatasetResponse, status_code=201)
async def upload_csv_dataset(file: UploadFile = File(...), description: Optional[str] = Form(None)):
    """
    Upload a CSV file. The backend reads it using Pandas, automatically
    determines the row and feature count, and inserts it into the database as a 'Tabular' dataset.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    try:
        # Read the file contents into memory
        contents = await file.read()
        
        # Parse CSV with Pandas
        df = pd.read_csv(io.BytesIO(contents))
        
        rows = int(df.shape[0])
        # Columns/Features count (excluding potential target/unnamed index columns can be extra, 
        # but standard is just df.shape[1])
        features = int(df.shape[1])
        
        # Create dataset name from filename (remove .csv extension)
        dataset_name = file.filename[:-4].replace('_', ' ').replace('-', ' ').title()
        
        desc = description or f"Uploaded CSV dataset containing columns: {', '.join(list(df.columns[:5]))}"
        if len(df.columns) > 5:
            desc += "..."
            
        return database.create_dataset(
            name=dataset_name,
            description=desc,
            dataset_type="Tabular",
            rows=rows,
            features=features,
            status="Not Explored"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {str(e)}")
