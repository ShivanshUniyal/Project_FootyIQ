import sqlite3
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

CSV_PATH = BASE_DIR / "archive (1)" / "player_valuations.csv"
DB_PATH = BASE_DIR / "database" / "footyiq_real.db"

print("Loading valuation data...")

df = pd.read_csv(CSV_PATH)

print(f"Rows found: {len(df)}")

conn = sqlite3.connect(DB_PATH)

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS player_valuations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    date TEXT,
    market_value_eur INTEGER,
    current_club_name TEXT,
    current_club_id INTEGER,
    player_club_domestic_competition_id INTEGER
)
""")

cursor.execute("""
DELETE FROM player_valuations
""")

conn.commit()

df = df[
    [
        "player_id",
        "date",
        "market_value_eur",
        "current_club_name",
        "current_club_id",
        "player_club_domestic_competition_id"
    ]
]

df.to_sql(
    "player_valuations",
    conn,
    if_exists="append",
    index=False
)

conn.commit()

count = cursor.execute("""
SELECT COUNT(*)
FROM player_valuations
""").fetchone()[0]

conn.close()

print()
print("VALUATION IMPORT COMPLETE!")
print(f"Valuation records: {count}")