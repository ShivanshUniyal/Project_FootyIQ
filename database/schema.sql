CREATE TABLE teams (
    team_id INTEGER PRIMARY KEY,
    name TEXT,
    league TEXT,
    country TEXT
);

CREATE TABLE players (
    player_id INTEGER PRIMARY KEY,
    name TEXT,
    team_id INTEGER,
    position TEXT,
    age INTEGER,
    nationality TEXT,
    height_cm INTEGER,
    preferred_foot TEXT,
    market_value_eur INTEGER,
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE TABLE player_stats (
    stat_id INTEGER PRIMARY KEY,
    player_id INTEGER,
    season INTEGER,
    matches_played INTEGER,
    minutes_played INTEGER,
    goals INTEGER,
    assists INTEGER,
    yellow_cards INTEGER,
    red_cards INTEGER,
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);

CREATE TABLE performance_scores (
    player_id INTEGER,
    season INTEGER,
    predicted_score REAL,
    model_version TEXT,
    generated_at TEXT,
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);