import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://agrivaani:agrivaani_dev@localhost:5432/agrivaani")

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def get_plot_data(plot_id: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT p.*, f.preferred_language
                FROM plots p
                JOIN farmers f ON p.farmer_id = f.id
                WHERE p.id = %s
            """, (plot_id,))
            return cur.fetchone()
    finally:
        conn.close()

def save_recommendation(plot_id: str, season: str, crop_ranked: list):
    import json
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO recommendations (plot_id, season, crop_ranked, model_version)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (plot_id, season, json.dumps(crop_ranked), "rules-based-v1"))
            conn.commit()
            return cur.fetchone()['id']
    finally:
        conn.close()
