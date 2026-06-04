# Machine Learning Dataset Explorer

A modern full-stack web application designed to manage, explore, and register machine learning datasets. Built using **React + TypeScript + Tailwind CSS v3** for the frontend, and **FastAPI + SQLite + Pandas** for the backend.

This project was built to illustrate core full-stack engineering concepts, including CRUD APIs, file uploads, database persistence, state management, and responsive glassmorphic UI design.

---

## Technical Stack

### Frontend
- **Framework**: React (Vite-bootstrapped)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 (Premium Glassmorphic Dark Theme)
- **Icons**: Lucide React
- **API Client**: Axios

### Backend
- **Framework**: FastAPI
- **Web Server**: Uvicorn
- **Database**: SQLite (SQLAlchemy-free, direct `sqlite3` integration)
- **Data Analysis**: Pandas (for parsing CSV structure metadata)
- **Validation**: Pydantic v2

---

## Features Implemented

1. **Stats Dashboard**: Displays total registered datasets, along with count breakdowns for each dataset type (Tabular, Image, Text, Audio) inside stylish gradient cards.
2. **Create Dataset**: Allows users to manually register datasets by supplying the Name, Description, Type, Rows, and Features.
3. **View Datasets**: A grid-based layout displaying each dataset's metadata, dimensions, and current exploration status.
4. **Update Dataset**: Allows users to edit an existing dataset's description, type, dimensions, and status.
5. **Delete Dataset**: Safely deletes dataset records from the SQLite database.
6. **Interactive Status Tracker**: Allows users to quickly change the status of datasets directly from the card via a dropdown selector (statuses: *Not Explored*, *Exploring*, *Ready for Training*, *Trained*).
7. **Instant Search**: Debounced search input that queries the backend to filter datasets by name or keywords.
8. **CSV Metadata Parser (Upload)**: Users can upload a CSV file. The backend reads the uploaded file using Pandas, automatically calculates the number of rows and columns (features), defaults the name from the filename, and registers it as a *Tabular* dataset in the database.

---

## Project Structure

```text
DatasetExplorer/
├── backend/
│   ├── .venv/                  # Python virtual environment
│   ├── database.py             # SQLite helper and seeding script
│   ├── main.py                 # FastAPI endpoints and Pydantic models
│   ├── requirements.txt        # Backend dependencies list
│   └── datasets.db             # Generated SQLite database file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CSVUploadModal.tsx   # File dropzone & upload modal
│   │   │   ├── DatasetCard.tsx      # Interactive dataset card
│   │   │   ├── DatasetModal.tsx     # Manual create/edit modal form
│   │   │   └── StatsDashboard.tsx   # Statistics metric cards
│   │   ├── App.tsx             # Main orchestrator & state manager
│   │   ├── api.ts              # Axios REST client methods
│   │   ├── types.ts            # Domain TypeScript interfaces
│   │   ├── index.css           # Global CSS & Tailwind imports
│   │   └── main.tsx            # React application entry-point
│   ├── tailwind.config.js      # Tailwind configurations
│   ├── postcss.config.js       # PostCSS plugins (Tailwind, Autoprefixer)
│   ├── package.json            # Node.js dependencies list
│   └── index.html              # Main HTML skeleton template
└── README.md                   # Setup and usage manual (this file)
```

---

## API Documentation

The backend server runs locally on **`http://localhost:8000`** and exposes a fully interactive Swagger UI documentation at **`http://localhost:8000/docs`**.

### 1. Get All Datasets
- **Endpoint**: `GET /datasets`
- **Query Parameters**: `search` (Optional - string)
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Iris Dataset",
      "description": "Classic flower classification dataset",
      "type": "Tabular",
      "rows": 150,
      "features": 4,
      "status": "Ready for Training"
    }
  ]
  ```

### 2. Get Dataset By ID
- **Endpoint**: `GET /datasets/{id}`
- **Response**: `200 OK` or `404 Not Found`

### 3. Create Dataset (Manual)
- **Endpoint**: `POST /datasets`
- **Request Body**:
  ```json
  {
    "name": "Wine Classification",
    "description": "Chemical analysis of wines",
    "type": "Tabular",
    "rows": 178,
    "features": 13,
    "status": "Not Explored"
  }
  ```
- **Response**: `201 Created`

### 4. Update Dataset
- **Endpoint**: `PUT /datasets/{id}`
- **Request Body**:
  ```json
  {
    "description": "Updated description here",
    "type": "Tabular",
    "rows": 180,
    "features": 13,
    "status": "Exploring"
  }
  ```
- **Response**: `200 OK` or `404 Not Found`

### 5. Delete Dataset
- **Endpoint**: `DELETE /datasets/{id}`
- **Response**: `200 OK` with confirmation message, or `404 Not Found`

### 6. Get Dataset Statistics
- **Endpoint**: `GET /datasets/stats`
- **Response**: `200 OK`
  ```json
  {
    "total": 5,
    "tabular": 2,
    "image": 1,
    "text": 1,
    "audio": 1
  }
  ```

### 7. Upload CSV Dataset
- **Endpoint**: `POST /datasets/upload`
- **Request Type**: `multipart/form-data`
- **Form Parameters**:
  - `file`: CSV file object
  - `description`: (Optional) string
- **Response**: `201 Created` containing the automatically-calculated dataset stats.

---

## Setup Instructions

Ensure you have **Python 3.8+** and **Node.js 16+** installed.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the virtual environment:
   - **Windows (PowerShell)**: `.venv\Scripts\Activate.ps1`
   - **Windows (CMD)**: `.venv\Scripts\activate.bat`
   - **macOS / Linux**: `source .venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will be available at `http://localhost:8000`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.
