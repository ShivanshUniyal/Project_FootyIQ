import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

const PORT = 5000;

app.use(cors());

app.use(express.json());



app.get("/", (req, res) => {
    res.json({
        message: "FootyIQ API is running!"
    });
});



app.get("/api/players", (req, res) => {
    try {
        const { position, search } = req.query;

        let query = `
            SELECT
                players.player_id,
                players.name,
                players.position,
                players.age,
                players.nationality,
                players.height_cm,
                players.preferred_foot,
                players.market_value_eur,
                teams.name AS team,
                teams.league,
                player_stats.season,
                player_stats.matches_played,
                player_stats.minutes_played,
                player_stats.goals,
                player_stats.assists,
                player_stats.yellow_cards,
                player_stats.red_cards

            FROM players

            LEFT JOIN teams
                ON players.team_id = teams.team_id

            LEFT JOIN player_stats
                ON players.player_id = player_stats.player_id
        `;

        const conditions = [];

        const params = [];

        if (position) {
            conditions.push(
                "players.position = ?"
            );

            params.push(
                position.toUpperCase()
            );
        }

        if (search) {
            conditions.push(`
                (
                    LOWER(players.name) LIKE ?
                    OR LOWER(teams.name) LIKE ?
                    OR LOWER(players.nationality) LIKE ?
                )
            `);

            const searchValue =
                `%${search.toLowerCase()}%`;

            params.push(searchValue);
            params.push(searchValue);
            params.push(searchValue);
        }

        if (conditions.length > 0) {
            query +=
                " WHERE " +
                conditions.join(" AND ");
        }

        query += `
            ORDER BY players.name
        `;

        const players = db
            .prepare(query)
            .all(...params);

        res.json(players);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch players"
        });
    }
});

/* =========================================
   GET SINGLE PLAYER
========================================= */

app.get("/api/players/:id", (req, res) => {
    try {
        const playerId =
            Number(req.params.id);

        const player = db.prepare(`
            SELECT
                players.player_id,
                players.name,
                players.position,
                players.age,
                players.nationality,
                players.height_cm,
                players.preferred_foot,
                players.market_value_eur,
                teams.name AS team,
                teams.league,
                player_stats.season,
                player_stats.matches_played,
                player_stats.minutes_played,
                player_stats.goals,
                player_stats.assists,
                player_stats.yellow_cards,
                player_stats.red_cards

            FROM players

            LEFT JOIN teams
                ON players.team_id = teams.team_id

            LEFT JOIN player_stats
                ON players.player_id =
                   player_stats.player_id

            WHERE players.player_id = ?
        `).get(playerId);

        if (!player) {
            return res.status(404).json({
                error: "Player not found"
            });
        }

        res.json(player);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch player"
        });
    }
});



app.get(
    "/api/players/:id/valuations",
    (req, res) => {

        try {

            const playerId =
                Number(req.params.id);

            const valuations =
                db.prepare(`
                    SELECT
                        date,
                        market_value_eur,
                        current_club_name

                    FROM player_valuations

                    WHERE player_id = ?

                    ORDER BY date ASC
                `).all(playerId);

            res.json(valuations);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Failed to fetch player valuations"
            });
        }
    }
);



app.get("/api/teams", (req, res) => {

    try {

        const teams = db.prepare(`
            SELECT
                team_id,
                name,
                league,
                country

            FROM teams

            ORDER BY name
        `).all();

        res.json(teams);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch teams"
        });
    }
});



app.listen(PORT, () => {

    console.log(
        `FootyIQ server running on http://localhost:${PORT}`
    );

});