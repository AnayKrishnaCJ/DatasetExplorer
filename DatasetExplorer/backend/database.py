import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "datasets.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create datasets table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            rows INTEGER NOT NULL,
            features INTEGER NOT NULL,
            status TEXT NOT NULL
        )
    """)
    
    # Seed sample datasets if database is empty
    cursor.execute("SELECT COUNT(*) FROM datasets")
    if cursor.fetchone()[0] == 0:
        sample_datasets = [
            (
                "Iris Dataset", 
                "Classic flower classification dataset containing 3 classes of iris flowers.", 
                "Tabular", 
                150, 
                4, 
                "Ready for Training"
            ),
            (
                "MNIST Digits", 
                "Handwritten digits database commonly used for training image processing systems.", 
                "Image", 
                60000, 
                784, 
                "Trained"
            ),
            (
                "IMDB Movie Reviews", 
                "Dataset of 50,000 movie reviews for natural language processing and sentiment analysis.", 
                "Text", 
                50000, 
                1, 
                "Exploring"
            ),
            (
                "LibriSpeech Audio", 
                "Large corpus of read English speech derived from audiobooks, suitable for ASR models.", 
                "Audio", 
                29200, 
                80, 
                "Not Explored"
            )
        ]
        cursor.executemany("""
            INSERT INTO datasets (name, description, type, rows, features, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, sample_datasets)
        conn.commit()
        
    conn.close()

def get_all_datasets(search: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if search:
        cursor.execute(
            "SELECT * FROM datasets WHERE name LIKE ? OR description LIKE ? ORDER BY id DESC", 
            (f"%{search}%", f"%{search}%")
        )
    else:
        cursor.execute("SELECT * FROM datasets ORDER BY id DESC")
    
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_dataset_by_id(dataset_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM datasets WHERE id = ?", (dataset_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_dataset(name: str, description: str, dataset_type: str, rows: int, features: int, status: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO datasets (name, description, type, rows, features, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (name, description, dataset_type, rows, features, status))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return get_dataset_by_id(new_id)

def update_dataset(dataset_id: int, description: str, dataset_type: str, rows: int, features: int, status: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE datasets
        SET description = ?, type = ?, rows = ?, features = ?, status = ?
        WHERE id = ?
    """, (description, dataset_type, rows, features, status, dataset_id))
    conn.commit()
    conn.close()
    return get_dataset_by_id(dataset_id)

def delete_dataset(dataset_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Check if exists
    cursor.execute("SELECT 1 FROM datasets WHERE id = ?", (dataset_id,))
    exists = cursor.fetchone() is not None
    if exists:
        cursor.execute("DELETE FROM datasets WHERE id = ?", (dataset_id,))
        conn.commit()
    conn.close()
    return exists

def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total
    cursor.execute("SELECT COUNT(*) FROM datasets")
    total = cursor.fetchone()[0]
    
    # Breakdowns
    cursor.execute("SELECT type, COUNT(*) FROM datasets GROUP BY type")
    type_counts = dict(cursor.fetchall())
    
    conn.close()
    
    return {
        "total": total,
        "tabular": type_counts.get("Tabular", 0),
        "image": type_counts.get("Image", 0),
        "text": type_counts.get("Text", 0),
        "audio": type_counts.get("Audio", 0)
    }
