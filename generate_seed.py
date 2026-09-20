"""
Generates realistic-looking sample data for FootyIQ prototyping.

This is SYNTHETIC data (fictional stat lines), not scraped from any
real provider.

Later, this can be replaced with a real football dataset or API.
"""

import sqlite3
import random
import os


# ============================================================
# 1. DATABASE CONFIGURATION
# ============================================================

random.seed(42)

# Folder containing this Python file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Database folder
DB_DIR = os.path.join(BASE_DIR, "database")

# Database files
DB_PATH = os.path.join(DB_DIR, "footyiq.db")
SCHEMA_PATH = os.path.join(DB_DIR, "schema.sql")


# ============================================================
# 2. TEAMS
# ============================================================

TEAMS = [
    ("Ashford United", "Premier League", "England"),
    ("Real Sabina", "La Liga", "Spain"),
    ("Torino Calcio 1906", "Serie A", "Italy"),
    ("FC Rheinstadt", "Bundesliga", "Germany"),
    ("Olympique Marnais", "Ligue 1", "France"),
    ("Porto Verde", "Primeira Liga", "Portugal"),
]


# ============================================================
# 3. POSITIONS
# ============================================================

POSITIONS = [
    "GK",
    "CB",
    "LB",
    "RB",
    "CDM",
    "CM",
    "CAM",
    "LW",
    "RW",
    "ST"
]


# ============================================================
# 4. PLAYER NAMES
# ============================================================

FIRST_NAMES = [
    "Marcus",
    "Diego",
    "Luca",
    "Kwame",
    "Jonas",
    "Mateo",
    "Yusuf",
    "Erik",
    "Bruno",
    "Kian",
    "Noah",
    "Rafael",
    "Tomas",
    "Idris",
    "Lars",
    "Andre",
    "Milan",
    "Theo",
    "Sami",
    "Victor"
]

LAST_NAMES = [
    "Reyes",
    "Oduya",
    "Fischer",
    "Moreau",
    "Silva",
    "Kovac",
    "Nilsson",
    "Barreto",
    "Adeyemi",
    "Petrov",
    "Larsson",
    "Rossi",
    "Haddad",
    "Costa",
    "Berger",
    "Alvez",
    "Nowak",
    "Sørensen",
    "Diallo",
    "Mendes"
]


# ============================================================
# 5. NATIONALITIES
# ============================================================

NATIONALITIES = [
    "England",
    "Spain",
    "Brazil",
    "Nigeria",
    "Germany",
    "Netherlands",
    "Portugal",
    "France",
    "Croatia",
    "Sweden",
    "Argentina",
    "Senegal",
    "Morocco",
    "Poland",
    "Denmark"
]


# ============================================================
# 6. SEASON
# ============================================================

SEASON = "2024-25"


# ============================================================
# 7. GENERATE UNIQUE PLAYER NAME
# ============================================================

def random_name(used):
    while True:

        name = (
            f"{random.choice(FIRST_NAMES)} "
            f"{random.choice(LAST_NAMES)}"
        )

        if name not in used:
            used.add(name)
            return name


# ============================================================
# 8. GENERATE PLAYER STATISTICS
# ============================================================

def gen_stats(position):

    """
    Generate synthetic statistics based on player position.
    """

    matches = random.randint(18, 36)

    minutes = matches * random.randint(60, 90)

    base = {
        "matches_played": matches,
        "minutes_played": minutes,
        "goals": 0,
        "assists": 0,

        "shots_on_target_pct": round(
            random.uniform(25, 55), 1
        ),

        "pass_accuracy": round(
            random.uniform(68, 93), 1
        ),

        "key_passes": round(
            random.uniform(0.3, 2.5), 2
        ),

        "dribbles_completed": round(
            random.uniform(0.2, 3.0), 2
        ),

        "tackles": round(
            random.uniform(0.5, 3.5), 2
        ),

        "interceptions": round(
            random.uniform(0.5, 3.0), 2
        ),

        "aerial_duels_won_pct": round(
            random.uniform(35, 75), 1
        ),

        "yellow_cards": random.randint(0, 9),

        "red_cards": random.choice([
            0, 0, 0, 0, 1
        ])
    }


    # --------------------------------------------------------
    # GOALKEEPER
    # --------------------------------------------------------

    if position == "GK":

        base.update(
            goals=0,

            assists=random.randint(0, 1),

            tackles=round(
                random.uniform(0, 0.3), 2
            ),

            interceptions=round(
                random.uniform(0, 0.5), 2
            ),

            pass_accuracy=round(
                random.uniform(60, 88), 1
            )
        )


    # --------------------------------------------------------
    # CENTRE BACK
    # --------------------------------------------------------

    elif position == "CB":

        base.update(
            goals=random.randint(0, 5),

            assists=random.randint(0, 3),

            tackles=round(
                random.uniform(1.5, 4.5), 2
            ),

            interceptions=round(
                random.uniform(1.5, 4.0), 2
            ),

            aerial_duels_won_pct=round(
                random.uniform(55, 85), 1
            )
        )


    # --------------------------------------------------------
    # LEFT / RIGHT BACK
    # --------------------------------------------------------

    elif position in ("LB", "RB"):

        base.update(
            goals=random.randint(0, 4),

            assists=random.randint(1, 8),

            key_passes=round(
                random.uniform(0.8, 2.8), 2
            ),

            dribbles_completed=round(
                random.uniform(0.5, 3.0), 2
            )
        )


    # --------------------------------------------------------
    # DEFENSIVE MIDFIELDER
    # --------------------------------------------------------

    elif position == "CDM":

        base.update(
            goals=random.randint(0, 3),

            assists=random.randint(0, 5),

            tackles=round(
                random.uniform(2.0, 5.0), 2
            ),

            interceptions=round(
                random.uniform(1.5, 4.0), 2
            )
        )


    # --------------------------------------------------------
    # CENTRAL MIDFIELDER
    # --------------------------------------------------------

    elif position == "CM":

        base.update(
            goals=random.randint(1, 8),

            assists=random.randint(1, 9),

            key_passes=round(
                random.uniform(1.0, 3.2), 2
            ),

            pass_accuracy=round(
                random.uniform(80, 94), 1
            )
        )


    # --------------------------------------------------------
    # ATTACKING MIDFIELDER
    # --------------------------------------------------------

    elif position == "CAM":

        base.update(
            goals=random.randint(3, 12),

            assists=random.randint(3, 12),

            key_passes=round(
                random.uniform(1.8, 4.0), 2
            ),

            dribbles_completed=round(
                random.uniform(1.5, 4.5), 2
            )
        )


    # --------------------------------------------------------
    # LEFT / RIGHT WINGER
    # --------------------------------------------------------

    elif position in ("LW", "RW"):

        base.update(
            goals=random.randint(4, 16),

            assists=random.randint(3, 12),

            dribbles_completed=round(
                random.uniform(2.0, 5.5), 2
            ),

            key_passes=round(
                random.uniform(1.2, 3.5), 2
            )
        )


    # --------------------------------------------------------
    # STRIKER
    # --------------------------------------------------------

    elif position == "ST":

        base.update(
            goals=random.randint(8, 26),

            assists=random.randint(1, 8),

            shots_on_target_pct=round(
                random.uniform(35, 65), 1
            ),

            aerial_duels_won_pct=round(
                random.uniform(40, 80), 1
            )
        )


    return base


# ============================================================
# 9. GENERATE MARKET VALUE
# ============================================================

def market_value(position, age, stats):

    """
    Generate a synthetic market value for demonstration.
    """

    peak = 26

    age_factor = max(
        0.3,
        1 - abs(age - peak) * 0.045
    )

    scoring = (
        stats["goals"] * 1.2
        +
        stats["assists"] * 0.9
    )

    base = {
        "GK": 8_000_000,
        "CB": 10_000_000,
        "LB": 9_000_000,
        "RB": 9_000_000,
        "CDM": 11_000_000,
        "CM": 13_000_000,
        "CAM": 15_000_000,
        "LW": 16_000_000,
        "RW": 16_000_000,
        "ST": 18_000_000
    }[position]

    value = (
        base * age_factor
        +
        scoring * 500_000
    )

    return int(
        round(value / 100_000)
        * 100_000
    )


# ============================================================
# 10. MAIN FUNCTION
# ============================================================

def main():

    print("Starting FootyIQ database generation...")

    # --------------------------------------------------------
    # Check schema file
    # --------------------------------------------------------

    if not os.path.exists(SCHEMA_PATH):

        print()
        print("ERROR: schema.sql not found.")
        print()
        print("Expected location:")
        print(SCHEMA_PATH)
        print()

        return


    # --------------------------------------------------------
    # Create database folder if needed
    # --------------------------------------------------------

    os.makedirs(
        DB_DIR,
        exist_ok=True
    )


    # --------------------------------------------------------
    # Read schema
    # --------------------------------------------------------

    with open(
        SCHEMA_PATH,
        "r",
        encoding="utf-8"
    ) as file:

        schema_sql = file.read()


    # --------------------------------------------------------
    # Connect to SQLite
    # --------------------------------------------------------

    conn = sqlite3.connect(DB_PATH)

    cur = conn.cursor()


    # --------------------------------------------------------
    # Create/reset tables
    # --------------------------------------------------------

    conn.executescript(schema_sql)


    # ========================================================
    # 11. INSERT TEAMS
    # ========================================================

    team_ids = []

    for name, league, country in TEAMS:

        cur.execute(
            """
            INSERT INTO teams
            (name, league, country)
            VALUES (?, ?, ?)
            """,
            (
                name,
                league,
                country
            )
        )

        team_ids.append(
            cur.lastrowid
        )


    # ========================================================
    # 12. SQUAD STRUCTURE
    # ========================================================

    # 17 players per team:
    #
    # 2 GK
    # 3 CB
    # 1 LB
    # 1 RB
    # 2 CDM
    # 2 CM
    # 2 CAM
    # 1 LW
    # 1 RW
    # 2 ST

    squad_template = (

        ["GK"] * 2

        + ["CB"] * 3

        + ["LB"]

        + ["RB"]

        + ["CDM"] * 2

        + ["CM"] * 2

        + ["CAM"] * 2

        + ["LW"]

        + ["RW"]

        + ["ST"] * 2
    )


    # ========================================================
    # 13. CREATE PLAYERS
    # ========================================================

    used_names = set()

    player_rows = []


    for team_id in team_ids:

        for position in squad_template:

            name = random_name(
                used_names
            )

            age = random.randint(
                18,
                35
            )

            height = random.randint(
                168,
                198
            )

            foot = random.choices(
                ["Right", "Left", "Both"],
                weights=[65, 28, 7]
            )[0]

            nationality = random.choice(
                NATIONALITIES
            )


            # Generate statistics
            stats = gen_stats(
                position
            )


            # Generate market value
            mv = market_value(
                position,
                age,
                stats
            )


            # =================================================
            # INSERT PLAYER
            # =================================================

            cur.execute(
                """
                INSERT INTO players
                (
                    team_id,
                    name,
                    position,
                    age,
                    nationality,
                    height_cm,
                    preferred_foot,
                    market_value_eur
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    team_id,
                    name,
                    position,
                    age,
                    nationality,
                    height,
                    foot,
                    mv
                )
            )


            player_id = cur.lastrowid


            # =================================================
            # INSERT PLAYER STATS
            # =================================================

            cur.execute(
                """
                INSERT INTO player_stats
                (
                    player_id,
                    season,
                    matches_played,
                    minutes_played,
                    goals,
                    assists,
                    shots_on_target_pct,
                    pass_accuracy,
                    key_passes,
                    dribbles_completed,
                    tackles,
                    interceptions,
                    aerial_duels_won_pct,
                    yellow_cards,
                    red_cards
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    player_id,
                    SEASON,
                    stats["matches_played"],
                    stats["minutes_played"],
                    stats["goals"],
                    stats["assists"],
                    stats["shots_on_target_pct"],
                    stats["pass_accuracy"],
                    stats["key_passes"],
                    stats["dribbles_completed"],
                    stats["tackles"],
                    stats["interceptions"],
                    stats["aerial_duels_won_pct"],
                    stats["yellow_cards"],
                    stats["red_cards"]
                )
            )


            player_rows.append(
                player_id
            )


    # ========================================================
    # 14. SAVE CHANGES
    # ========================================================

    conn.commit()


    # ========================================================
    # 15. VERIFY DATABASE
    # ========================================================

    n_teams = cur.execute(
        "SELECT COUNT(*) FROM teams"
    ).fetchone()[0]


    n_players = cur.execute(
        "SELECT COUNT(*) FROM players"
    ).fetchone()[0]


    n_stats = cur.execute(
        "SELECT COUNT(*) FROM player_stats"
    ).fetchone()[0]


    # ========================================================
    # 16. PRINT RESULT
    # ========================================================

    print()
    print("========================================")
    print("       FOOTYIQ DATABASE READY")
    print("========================================")
    print()

    print(
        f"Teams: {n_teams}"
    )

    print(
        f"Players: {n_players}"
    )

    print(
        f"Stat rows: {n_stats}"
    )

    print()
    print("Database:")
    print(DB_PATH)

    print()
    print("========================================")


    # ========================================================
    # 17. CLOSE DATABASE
    # ========================================================

    conn.close()


# ============================================================
# 18. START PROGRAM
# ============================================================

if __name__ == "__main__":
    main()