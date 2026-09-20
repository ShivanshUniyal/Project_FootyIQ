import pandas as pd
import sqlite3
from datetime import datetime

DB_PATH = "database/footyiq_real.db"
DATA_PATH = "archive (1)"

SEASON = 2024

print("Loading CSV files...")

players = pd.read_csv(f"{DATA_PATH}/players.csv")
appearances = pd.read_csv(f"{DATA_PATH}/appearances.csv")
clubs = pd.read_csv(f"{DATA_PATH}/clubs.csv")
games = pd.read_csv(f"{DATA_PATH}/games.csv")

print("CSV files loaded!")

print("Filtering season...")

games = games[games["season"] == SEASON]

appearances = appearances[
    appearances["game_id"].isin(games["game_id"])
]

print("Appearances:", len(appearances))

print("Creating player statistics...")

stats = appearances.groupby(
    ["player_id", "player_club_id"]
).agg(
    matches_played=("game_id", "nunique"),
    minutes_played=("minutes_played", "sum"),
    goals=("goals", "sum"),
    assists=("assists", "sum"),
    yellow_cards=("yellow_cards", "sum"),
    red_cards=("red_cards", "sum")
).reset_index()

stats["season"] = SEASON

print("Player statistics created!")

print("Preparing players...")

players = players[
    [
        "player_id",
        "name",
        "current_club_id",
        "country_of_citizenship",
        "date_of_birth",
        "sub_position",
        "foot",
        "height_in_cm",
        "market_value_in_eur"
    ]
]

players = players.rename(columns={
    "current_club_id": "team_id",
    "country_of_citizenship": "nationality",
    "height_in_cm": "height_cm",
    "market_value_in_eur": "market_value_eur",
    "foot": "preferred_foot"
})


def calculate_age(date):
    if pd.isna(date):
        return None

    birth_date = pd.to_datetime(date)

    today = datetime(2025, 7, 1)

    age = today.year - birth_date.year

    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1

    return age


players["age"] = players["date_of_birth"].apply(calculate_age)


def convert_position(position):
    mapping = {
        "Goalkeeper": "GK",
        "Centre-Back": "CB",
        "Left-Back": "LB",
        "Right-Back": "RB",
        "Defensive Midfield": "CDM",
        "Central Midfield": "CM",
        "Attacking Midfield": "CAM",
        "Left Winger": "LW",
        "Right Winger": "RW",
        "Centre-Forward": "ST"
    }

    return mapping.get(position, position)


players["position"] = players["sub_position"].apply(convert_position)

players = players[
    [
        "player_id",
        "name",
        "team_id",
        "position",
        "age",
        "nationality",
        "height_cm",
        "preferred_foot",
        "market_value_eur"
    ]
]

print("Preparing teams...")

teams = clubs[
    [
        "club_id",
        "name",
        "domestic_competition_id"
    ]
]

teams = teams.rename(columns={
    "club_id": "team_id"
})

teams["league"] = teams["domestic_competition_id"]
teams["country"] = "Unknown"

teams = teams[
    [
        "team_id",
        "name",
        "league",
        "country"
    ]
]

print("Connecting to database...")

connection = sqlite3.connect(DB_PATH)

cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS teams (
    team_id INTEGER PRIMARY KEY,
    name TEXT,
    league TEXT,
    country TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS players (
    player_id INTEGER PRIMARY KEY,
    name TEXT,
    team_id INTEGER,
    position TEXT,
    age INTEGER,
    nationality TEXT,
    height_cm INTEGER,
    preferred_foot TEXT,
    market_value_eur INTEGER
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS player_stats (
    stat_id INTEGER PRIMARY KEY,
    player_id INTEGER,
    season INTEGER,
    matches_played INTEGER,
    minutes_played INTEGER,
    goals INTEGER,
    assists INTEGER,
    yellow_cards INTEGER,
    red_cards INTEGER
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS performance_scores (
    player_id INTEGER,
    season INTEGER,
    predicted_score REAL,
    model_version TEXT,
    generated_at TEXT
)
""")

connection.commit()

print("Clearing old real data...")

cursor.execute("DELETE FROM performance_scores")
cursor.execute("DELETE FROM player_stats")
cursor.execute("DELETE FROM players")
cursor.execute("DELETE FROM teams")

connection.commit()

print("Inserting teams...")

teams.to_sql(
    "teams",
    connection,
    if_exists="append",
    index=False
)

print("Inserting players...")

players.to_sql(
    "players",
    connection,
    if_exists="append",
    index=False
)

print("Inserting statistics...")

stats["stat_id"] = range(1, len(stats) + 1)

stats = stats[
    [
        "stat_id",
        "player_id",
        "season",
        "matches_played",
        "minutes_played",
        "goals",
        "assists",
        "yellow_cards",
        "red_cards"
    ]
]

stats.to_sql(
    "player_stats",
    connection,
    if_exists="append",
    index=False
)

connection.commit()
connection.close()

print()
print("================================")
print("REAL DATA IMPORT COMPLETE!")
print("================================")
print("Season:", SEASON)
print("Players:", len(players))
print("Teams:", len(teams))
print("Stat rows:", len(stats))