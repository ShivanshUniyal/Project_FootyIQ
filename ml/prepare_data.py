import sqlite3
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score




db_path = "database/footyiq_real.db"

connection = sqlite3.connect(db_path)

query = """
SELECT
    players.player_id,
    players.name,
    players.position,
    player_stats.season,
    player_stats.matches_played,
    player_stats.minutes_played,
    player_stats.goals,
    player_stats.assists,
    player_stats.yellow_cards,
    player_stats.red_cards
FROM players
JOIN player_stats
ON players.player_id = player_stats.player_id
"""

data = pd.read_sql_query(query, connection)

connection.close()

print("Dataset loaded!")
print("Rows:", len(data))




data["rating"] = 6.0

data["rating"] += data["goals"] * 0.8
data["rating"] += data["assists"] * 0.6
data["rating"] += data["matches_played"] * 0.03
data["rating"] += data["minutes_played"] * 0.0005

data["rating"] -= data["yellow_cards"] * 0.5
data["rating"] -= data["red_cards"] * 2.0


# Extra goal value for defenders
defender_mask = data["position"].isin(["DEF", "CB", "LB", "RB"])

data.loc[defender_mask, "rating"] += (
    data.loc[defender_mask, "goals"] * 0.4
)


# Extra goal value for midfielders
midfielder_mask = data["position"].isin(
    ["MID", "CM", "CDM", "CAM", "LM", "RM"]
)

data.loc[midfielder_mask, "rating"] += (
    data.loc[midfielder_mask, "goals"] * 0.2
)


# Keep rating between 0 and 10
data["rating"] = data["rating"].clip(0, 10)




features = [
    "matches_played",
    "minutes_played",
    "goals",
    "assists",
    "yellow_cards",
    "red_cards"
]

X = data[features]

y = data["rating"]



X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))




model = LinearRegression()

model.fit(X_train, y_train)

print("\nLinear Regression model trained!")




predictions = model.predict(X_test)

print("\nFirst 10 predictions:")

for i in range(10):
    print(
        "Actual:",
        round(y_test.iloc[i], 2),
        "| Predicted:",
        round(predictions[i], 2)
    )



mae = mean_absolute_error(y_test, predictions)

r2 = r2_score(y_test, predictions)

print("\nModel Evaluation")

print("MAE:", round(mae, 3))

print("R² Score:", round(r2, 3))