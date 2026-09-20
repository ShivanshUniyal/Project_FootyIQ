import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

const clamp = (number, min, max) =>
    Math.min(Math.max(number, min), max);

/* =========================================
   RATING
========================================= */

function getRating(player) {
    const matches =
        Number(player.matches_played) || 0;

    const minutes =
        Number(player.minutes_played) || 0;

    const goals =
        Number(player.goals) || 0;

    const assists =
        Number(player.assists) || 0;

    const yellow =
        Number(player.yellow_cards) || 0;

    const red =
        Number(player.red_cards) || 0;

    const goalImpact =
        Math.min(goals / 15, 1);

    const assistImpact =
        Math.min(assists / 12, 1);

    const appearanceImpact =
        Math.min(matches / 30, 1);

    const minutesImpact =
        Math.min(minutes / 2500, 1);

    const disciplinePenalty =
        Math.min(
            yellow * 0.025 +
                red * 0.2,
            1
        );

    let rating =
        5.2 +
        goalImpact * 1.0 +
        assistImpact * 0.8 +
        appearanceImpact * 0.7 +
        minutesImpact * 0.8 -
        disciplinePenalty;

    if (
        [
            "ST",
            "LW",
            "RW",
            "AM",
            "CAM"
        ].includes(player.position)
    ) {
        rating += 0.15;
    }

    if (
        [
            "CB",
            "LB",
            "RB",
            "DM",
            "CDM"
        ].includes(player.position)
    ) {
        rating += 0.1;
    }

    return Number(
        clamp(
            rating,
            4.5,
            9.5
        ).toFixed(1)
    );
}

/* =========================================
   VALUE FORMAT
========================================= */

function formatValue(value) {
    const number = Number(value);

    if (!number) {
        return "N/A";
    }

    if (number >= 1000000000) {
        return `€${(
            number / 1000000000
        ).toFixed(1)}B`;
    }

    if (number >= 1000000) {
        return `€${(
            number / 1000000
        ).toFixed(1)}M`;
    }

    if (number >= 1000) {
        return `€${(
            number / 1000
        ).toFixed(0)}K`;
    }

    return `€${number}`;
}

function displayStat(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "N/A";
    }

    return value;
}

/* =========================================
   RATING RING
========================================= */

function RatingRing({
    rating,
    size = 76
}) {
    const radius = 31;

    const circumference =
        2 * Math.PI * radius;

    const progress =
        circumference -
        (rating / 10) *
            circumference;

    return (
        <div
            className="rating-ring"
            style={{
                width: size,
                height: size
            }}
        >
            <svg viewBox="0 0 72 72">

                <circle
                    className="rating-ring-bg"
                    cx="36"
                    cy="36"
                    r={radius}
                />

                <circle
                    className="rating-ring-value"
                    cx="36"
                    cy="36"
                    r={radius}
                    style={{
                        strokeDasharray:
                            circumference,
                        strokeDashoffset:
                            progress
                    }}
                />

            </svg>

            <strong>
                {rating.toFixed(1)}
            </strong>
        </div>
    );
}

/* =========================================
   PERFORMANCE PROFILE
========================================= */

function getPerformanceProfile(player) {

    const goals =
        Number(player.goals) || 0;

    const assists =
        Number(player.assists) || 0;

    const matches =
        Number(player.matches_played) || 0;

    const minutes =
        Number(player.minutes_played) || 0;

    const yellow =
        Number(player.yellow_cards) || 0;

    const red =
        Number(player.red_cards) || 0;

    const position =
        player.position || "";

    const attack = clamp(
        45 +
            goals * 2.5 +
            assists * 1.8 +
            (
                [
                    "ST",
                    "LW",
                    "RW",
                    "CAM",
                    "AM"
                ].includes(position)
                    ? 15
                    : 0
            ),
        20,
        98
    );

    const passing = clamp(
        48 +
            assists * 2.5 +
            (
                [
                    "CM",
                    "CDM",
                    "DM",
                    "CAM",
                    "AM"
                ].includes(position)
                    ? 15
                    : 0
            ),
        20,
        98
    );

    const availability = clamp(
        35 +
            matches * 1.6 +
            minutes / 100,
        20,
        98
    );

    const discipline = clamp(
        95 -
            yellow * 2.5 -
            red * 18,
        20,
        98
    );

    const finishing = clamp(
        40 +
            goals * 3.5 +
            assists * 0.7,
        20,
        98
    );

    const consistency = clamp(
        40 +
            matches * 1.3 +
            minutes / 120,
        20,
        98
    );

    return {
        attack: Math.round(attack),
        passing: Math.round(passing),
        availability:
            Math.round(availability),
        discipline:
            Math.round(discipline),
        finishing:
            Math.round(finishing),
        consistency:
            Math.round(consistency)
    };
}

/* =========================================
   RADAR
========================================= */

function PerformanceRadar({
    player
}) {
    const profile =
        getPerformanceProfile(player);

    const points = [
        {
            label: "Attack",
            value: profile.attack
        },
        {
            label: "Passing",
            value: profile.passing
        },
        {
            label: "Finishing",
            value: profile.finishing
        },
        {
            label: "Consistency",
            value: profile.consistency
        },
        {
            label: "Discipline",
            value: profile.discipline
        },
        {
            label: "Availability",
            value: profile.availability
        }
    ];

    const center = 160;

    const radius = 105;

    function getPoint(
        index,
        value
    ) {
        const angle =
            (Math.PI * 2 * index) /
                points.length -
            Math.PI / 2;

        const distance =
            radius *
            (value / 100);

        return {
            x:
                center +
                Math.cos(angle) *
                    distance,

            y:
                center +
                Math.sin(angle) *
                    distance
        };
    }

    const polygon =
        points
            .map(
                (
                    point,
                    index
                ) => {

                    const position =
                        getPoint(
                            index,
                            point.value
                        );

                    return `${position.x},${position.y}`;
                }
            )
            .join(" ");

    return (
        <div className="radar-container">

            <svg
                className="radar"
                viewBox="0 0 320 320"
            >

                {[20, 40, 60, 80, 100].map(
                    (level) => {

                        const ring =
                            points
                                .map(
                                    (
                                        _,
                                        index
                                    ) => {

                                        const point =
                                            getPoint(
                                                index,
                                                level
                                            );

                                        return `${point.x},${point.y}`;
                                    }
                                )
                                .join(" ");

                        return (
                            <polygon
                                key={level}
                                points={ring}
                                className="radar-grid"
                            />
                        );
                    }
                )}

                {points.map(
                    (_, index) => {

                        const point =
                            getPoint(
                                index,
                                100
                            );

                        return (
                            <line
                                key={index}
                                x1={center}
                                y1={center}
                                x2={point.x}
                                y2={point.y}
                                className="radar-axis"
                            />
                        );
                    }
                )}

                <polygon
                    points={polygon}
                    className="radar-data"
                />

                {points.map(
                    (
                        point,
                        index
                    ) => {

                        const label =
                            getPoint(
                                index,
                                120
                            );

                        return (
                            <g
                                key={
                                    point.label
                                }
                            >

                                <text
                                    x={label.x}
                                    y={label.y}
                                    className="radar-label"
                                    textAnchor="middle"
                                >
                                    {
                                        point.label
                                    }
                                </text>

                                <text
                                    x={label.x}
                                    y={
                                        label.y +
                                        14
                                    }
                                    className="radar-value"
                                    textAnchor="middle"
                                >
                                    {
                                        point.value
                                    }
                                </text>

                            </g>
                        );
                    }
                )}

            </svg>

        </div>
    );
}

/* =========================================
   MARKET VALUE CHART
========================================= */

function MarketValueChart({
    player
}) {
    const [
        valuations,
        setValuations
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    useEffect(() => {

        if (!player?.player_id) {
            return;
        }

        async function loadValuations() {

            try {

                setLoading(true);

                const response =
                    await fetch(
                        `${API}/api/players/${player.player_id}/valuations`
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load valuations"
                    );
                }

                const data =
                    await response.json();

                setValuations(data);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);
            }
        }

        loadValuations();

    }, [player]);

    if (loading) {
        return (
            <div className="chart-empty">
                Loading market-value
                history...
            </div>
        );
    }

    if (!valuations.length) {
        return (
            <div className="chart-empty">
                No market-value history
                available.
            </div>
        );
    }

    const width = 760;

    const height = 250;

    const padding = 35;

    const values =
        valuations.map(
            (item) =>
                Number(
                    item.market_value_eur
                ) || 0
        );

    const max =
        Math.max(...values);

    const min =
        Math.min(...values);

    const range =
        max - min || 1;

    const points =
        valuations
            .map(
                (
                    item,
                    index
                ) => {

                    const value =
                        Number(
                            item.market_value_eur
                        ) || 0;

                    const x =
                        padding +
                        (
                            index /
                            Math.max(
                                valuations.length -
                                    1,
                                1
                            )
                        ) *
                        (
                            width -
                            padding * 2
                        );

                    const y =
                        height -
                        padding -
                        (
                            (
                                value -
                                min
                            ) /
                            range
                        ) *
                        (
                            height -
                            padding * 2
                        );

                    return `${x},${y}`;
                }
            )
            .join(" ");

    return (
        <div className="market-chart">

            <div className="chart-header">

                <div>

                    <label>
                        MARKET VALUE
                    </label>

                    <h3>
                        Valuation history
                    </h3>

                </div>

                <strong>
                    {formatValue(
                        values[
                            values.length -
                                1
                        ]
                    )}
                </strong>

            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >

                <polyline
                    points={points}
                    className="market-line"
                />

                {valuations.map(
                    (
                        item,
                        index
                    ) => {

                        const value =
                            Number(
                                item.market_value_eur
                            ) || 0;

                        const x =
                            padding +
                            (
                                index /
                                Math.max(
                                    valuations.length -
                                        1,
                                    1
                                )
                            ) *
                            (
                                width -
                                padding * 2
                            );

                        const y =
                            height -
                            padding -
                            (
                                (
                                    value -
                                    min
                                ) /
                                range
                            ) *
                            (
                                height -
                                padding * 2
                            );

                        return (
                            <circle
                                key={
                                    `${item.date}-${index}`
                                }
                                cx={x}
                                cy={y}
                                r="3.5"
                                className="market-dot"
                            />
                        );
                    }
                )}

            </svg>

            <div className="chart-dates">

                <span>
                    {valuations[0].date}
                </span>

                <span>
                    {
                        valuations[
                            valuations.length -
                                1
                        ].date
                    }
                </span>

            </div>

        </div>
    );
}

/* =========================================
   PLAYER CARD
========================================= */

function PlayerCard({
    player,
    onClick
}) {
    const rating =
        getRating(player);

    return (
        <button
            className="player-card"
            onClick={onClick}
        >

            <div className="card-top">

                <span className="player-id">
                    #{player.player_id}
                </span>

                <RatingRing
                    rating={rating}
                    size={58}
                />

            </div>

            <h3>
                {player.name ||
                    "Unknown Player"}
            </h3>

            <span className="position-tag">
                {player.position || "—"}
            </span>

            <div className="player-details">

                <div>
                    <small>
                        AGE
                    </small>

                    <strong>
                        {displayStat(
                            player.age
                        )}
                    </strong>
                </div>

                <div>
                    <small>
                        TEAM
                    </small>

                    <strong>
                        {player.team ||
                            "Unknown"}
                    </strong>
                </div>

                <div>
                    <small>
                        VALUE
                    </small>

                    <strong>
                        {formatValue(
                            player.market_value_eur
                        )}
                    </strong>
                </div>

            </div>

        </button>
    );
}

/* =========================================
   PLAYER PICKER
========================================= */

function PlayerPicker({
    label,
    value,
    setValue,
    players,
    otherPlayer
}) {

    const [
        query,
        setQuery
    ] = useState(
        value?.name || ""
    );

    const [
        open,
        setOpen
    ] = useState(false);

    const results =
        useMemo(() => {

            const search =
                query
                    .trim()
                    .toLowerCase();

            if (!search) {
                return [];
            }

            return players
                .filter(
                    (player) => {

                        const text = [
                            player.name,
                            player.team,
                            player.position,
                            player.nationality
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();

                        return text.includes(
                            search
                        );
                    }
                )
                .slice(0, 8);

        }, [players, query]);

    function selectPlayer(
        player
    ) {

        setValue(player);

        setQuery(
            player.name
        );

        setOpen(false);
    }

    function clearPlayer() {

        setQuery("");

        setValue(null);

        setOpen(false);
    }

    return (
        <div className="player-picker">

            <label>
                {label}
            </label>

            <div className="picker-input-wrapper">

                <input
                    type="text"
                    value={query}
                    placeholder="Type player name..."
                    onFocus={() =>
                        setOpen(true)
                    }
                    onChange={
                        (event) => {

                            setQuery(
                                event.target.value
                            );

                            setValue(null);

                            setOpen(true);
                        }
                    }
                />

                {value && (
                    <button
                        className="picker-clear"
                        onClick={
                            clearPlayer
                        }
                    >
                        ×
                    </button>
                )}

            </div>

            {open &&
                query &&
                !value && (
                    <div className="picker-results">

                        {results.length >
                        0 ? (

                            results.map(
                                (player) => {

                                    const disabled =
                                        otherPlayer?.player_id ===
                                        player.player_id;

                                    return (
                                        <button
                                            key={
                                                player.player_id
                                            }
                                            className="picker-result"
                                            disabled={
                                                disabled
                                            }
                                            onMouseDown={
                                                (
                                                    event
                                                ) =>
                                                    event.preventDefault()
                                            }
                                            onClick={() =>
                                                selectPlayer(
                                                    player
                                                )
                                            }
                                        >

                                            <span className="picker-avatar">
                                                {
                                                    (
                                                        player.name ||
                                                        "?"
                                                    )[0]
                                                }
                                            </span>

                                            <span className="picker-info">

                                                <strong>
                                                    {
                                                        player.name
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        player.team ||
                                                        "Unknown"
                                                    }{" "}
                                                    ·{" "}
                                                    {
                                                        player.position ||
                                                        "—"
                                                    }
                                                </small>

                                            </span>

                                            <b>
                                                {getRating(
                                                    player
                                                ).toFixed(
                                                    1
                                                )}
                                            </b>

                                        </button>
                                    );
                                }
                            )

                        ) : (

                            <div className="no-results">
                                No players found
                            </div>

                        )}

                    </div>
                )}

        </div>
    );
}

/* =========================================
   COMPARISON STAT
========================================= */

function ComparisonStat({
    name,
    valueOne,
    valueTwo,
    formatter = displayStat
}) {

    const numberOne =
        Number(valueOne) || 0;

    const numberTwo =
        Number(valueTwo) || 0;

    const maximum =
        Math.max(
            numberOne,
            numberTwo,
            1
        );

    const widthOne =
        `${(
            numberOne /
            maximum
        ) * 100}%`;

    const widthTwo =
        `${(
            numberTwo /
            maximum
        ) * 100}%`;

    return (
        <div className="comparison-stat">

            <div className="comparison-stat-values">

                <strong>
                    {formatter(valueOne)}
                </strong>

                <span>
                    {name}
                </span>

                <strong>
                    {formatter(valueTwo)}
                </strong>

            </div>

            <div className="comparison-bars">

                <div className="bar-left">
                    <div
                        style={{
                            width: widthOne
                        }}
                    />
                </div>

                <div className="bar-right">
                    <div
                        style={{
                            width: widthTwo
                        }}
                    />
                </div>

            </div>

        </div>
    );
}

/* =========================================
   APP
========================================= */

function App() {

    const [
        players,
        setPlayers
    ] = useState([]);

    const [
        teams,
        setTeams
    ] = useState([]);

    const [
        position,
        setPosition
    ] = useState("");

    const [
        search,
        setSearch
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        selectedPlayer,
        setSelectedPlayer
    ] = useState(null);

    const [
        activePage,
        setActivePage
    ] = useState("players");

    const [
        compareOne,
        setCompareOne
    ] = useState(null);

    const [
        compareTwo,
        setCompareTwo
    ] = useState(null);

    const [
        maxAge,
        setMaxAge
    ] = useState("");

    const [
        minGoals,
        setMinGoals
    ] = useState("");

    const [
        maxValue,
        setMaxValue
    ] = useState("");

    /* =========================================
       LOAD PLAYERS
    ========================================= */

    useEffect(() => {

        async function loadPlayers() {

            try {

                setLoading(true);

                let url =
                    `${API}/api/players`;

                if (position) {

                    url +=
                        `?position=${encodeURIComponent(
                            position
                        )}`;
                }

                const response =
                    await fetch(url);

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch players"
                    );
                }

                const data =
                    await response.json();

                setPlayers(data);

            } catch (error) {

                console.error(
                    "Failed to load players:",
                    error
                );

            } finally {

                setLoading(false);
            }
        }

        loadPlayers();

    }, [position]);

    /* =========================================
       LOAD TEAMS
    ========================================= */

    useEffect(() => {

        async function loadTeams() {

            try {

                const response =
                    await fetch(
                        `${API}/api/teams`
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch teams"
                    );
                }

                const data =
                    await response.json();

                setTeams(data);

            } catch (error) {

                console.error(
                    "Failed to load teams:",
                    error
                );
            }
        }

        loadTeams();

    }, []);

    /* =========================================
       FILTER PLAYERS
    ========================================= */

    const filteredPlayers =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return players;
            }

            return players.filter(
                (player) => {

                    const text = [
                        player.name,
                        player.team,
                        player.league,
                        player.nationality,
                        player.position
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return text.includes(
                        query
                    );
                }
            );

        }, [players, search]);

    /* =========================================
       SCOUTING
    ========================================= */

    const scoutingPlayers =
        useMemo(() => {

            return players.filter(
                (player) => {

                    const ageOK =
                        !maxAge ||
                        !player.age ||
                        Number(
                            player.age
                        ) <=
                            Number(
                                maxAge
                            );

                    const goalsOK =
                        !minGoals ||
                        (
                            Number(
                                player.goals
                            ) || 0
                        ) >=
                            Number(
                                minGoals
                            );

                    const valueOK =
                        !maxValue ||
                        !player.market_value_eur ||
                        Number(
                            player.market_value_eur
                        ) <=
                            Number(
                                maxValue
                            );

                    return (
                        ageOK &&
                        goalsOK &&
                        valueOK
                    );
                }
            );

        }, [
            players,
            maxAge,
            minGoals,
            maxValue
        ]);

    return (
        <div className="app">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="logo">

                    <span>
                        FQ
                    </span>

                    <h1>
                        FootyIQ
                    </h1>

                    <p>
                        Football Intelligence
                    </p>

                </div>

                <nav>

                    {[
                        [
                            "players",
                            "Players"
                        ],
                        [
                            "teams",
                            "Teams"
                        ],
                        [
                            "compare",
                            "Compare"
                        ],
                        [
                            "scouting",
                            "Scouting"
                        ]
                    ].map(
                        (
                            [page, name],
                            index
                        ) => (

                            <button
                                key={page}
                                className={
                                    activePage ===
                                    page
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActivePage(
                                        page
                                    )
                                }
                            >

                                <small>
                                    0
                                    {index + 1}
                                </small>

                                {name}

                            </button>
                        )
                    )}

                </nav>

                <div className="side-status">

                    ● REAL DATA

                    <br />

                    <span>
                        2024 season dataset
                    </span>

                </div>

            </aside>

            {/* MAIN */}

            <main className="main">

                {/* HERO */}

                <header className="hero">

                    <div>

                        <label>
                            FOOTBALL ANALYTICS / 2024
                        </label>

                        <h2>

                            {activePage ===
                                "players" &&
                                "Player Database"}

                            {activePage ===
                                "teams" &&
                                "Teams"}

                            {activePage ===
                                "compare" &&
                                "Player Comparison"}

                            {activePage ===
                                "scouting" &&
                                "Scouting Centre"}

                        </h2>

                        <p>
                            Data-driven player
                            intelligence for modern
                            football scouting.
                        </p>

                    </div>

                    <div className="hero-count">

                        {String(
                            players.length
                        ).padStart(5, "0")}

                        <small>
                            PLAYER RECORDS
                        </small>

                    </div>

                </header>

                {/* PLAYERS */}

                {activePage ===
                    "players" && (

                    <section>

                        <div className="section-heading">

                            <div>

                                <label>
                                    DATABASE
                                </label>

                                <h3>
                                    Explore the
                                    player pool
                                </h3>

                            </div>

                            <span>
                                {
                                    filteredPlayers.length
                                }{" "}
                                results
                            </span>

                        </div>

                        <div className="controls">

                            <input
                                type="text"
                                placeholder="Search player, team, league or nationality..."
                                value={search}
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />

                            <select
                                value={
                                    position
                                }
                                onChange={(
                                    event
                                ) =>
                                    setPosition(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >

                                <option value="">
                                    All Positions
                                </option>

                                {[
                                    "GK",
                                    "CB",
                                    "LB",
                                    "RB",
                                    "DM",
                                    "CM",
                                    "AM",
                                    "LW",
                                    "RW",
                                    "ST"
                                ].map(
                                    (item) => (

                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {item}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        {loading ? (

                            <div className="message">
                                Loading player
                                intelligence...
                            </div>

                        ) : (

                            <div className="player-grid">

                                {filteredPlayers
                                    .slice(
                                        0,
                                        100
                                    )
                                    .map(
                                        (
                                            player
                                        ) => (

                                            <PlayerCard
                                                key={
                                                    player.player_id
                                                }
                                                player={
                                                    player
                                                }
                                                onClick={() =>
                                                    setSelectedPlayer(
                                                        player
                                                    )
                                                }
                                            />

                                        )
                                    )}

                            </div>

                        )}

                    </section>
                )}

                {/* TEAMS */}

                {activePage ===
                    "teams" && (

                    <section>

                        <div className="section-heading">

                            <div>

                                <label>
                                    CLUB NETWORK
                                </label>

                                <h3>
                                    Teams in the
                                    dataset
                                </h3>

                            </div>

                            <span>
                                {teams.length}{" "}
                                teams
                            </span>

                        </div>

                        <div className="summary-grid">

                            <div>

                                <strong>
                                    {
                                        teams.length
                                    }
                                </strong>

                                <span>
                                    Teams
                                </span>

                            </div>

                            <div>

                                <strong>
                                    {
                                        players.length
                                    }
                                </strong>

                                <span>
                                    Players
                                </span>

                            </div>

                            <div>

                                <strong>
                                    2024
                                </strong>

                                <span>
                                    Season
                                </span>

                            </div>

                        </div>

                        <div className="team-grid">

                            {teams
                                .slice(
                                    0,
                                    100
                                )
                                .map(
                                    (
                                        team
                                    ) => (

                                        <article
                                            className="team-card"
                                            key={
                                                team.team_id
                                            }
                                        >

                                            <small>
                                                #
                                                {
                                                    team.team_id
                                                }
                                            </small>

                                            <h3>
                                                {
                                                    team.name
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    team.league ||
                                                    "Unknown league"
                                                }
                                            </p>

                                            <b>
                                                {
                                                    team.country ||
                                                    "Unknown country"
                                                }
                                            </b>

                                        </article>

                                    )
                                )}

                        </div>

                    </section>
                )}

                {/* COMPARE */}

                {activePage ===
                    "compare" && (

                    <section>

                        <div className="section-heading">

                            <div>

                                <label>
                                    HEAD TO HEAD
                                </label>

                                <h3>
                                    Compare player
                                    profiles
                                </h3>

                            </div>

                            <span>
                                Search by player
                                name
                            </span>

                        </div>

                        <div className="pickers">

                            <PlayerPicker
                                label="PLAYER 01"
                                value={
                                    compareOne
                                }
                                setValue={
                                    setCompareOne
                                }
                                players={
                                    players
                                }
                                otherPlayer={
                                    compareTwo
                                }
                            />

                            <PlayerPicker
                                label="PLAYER 02"
                                value={
                                    compareTwo
                                }
                                setValue={
                                    setCompareTwo
                                }
                                players={
                                    players
                                }
                                otherPlayer={
                                    compareOne
                                }
                            />

                        </div>

                        {compareOne &&
                        compareTwo ? (

                            <div className="comparison">

                                <div className="compare-player">

                                    <div className="compare-player-main">

                                        <div className="compare-number">
                                            01
                                        </div>

                                        <div>

                                            <label>
                                                PLAYER 01
                                            </label>

                                            <h2>
                                                {
                                                    compareOne.name
                                                }
                                            </h2>

                                            <p>
                                                {
                                                    compareOne.team ||
                                                    "Unknown Team"
                                                }{" "}
                                                ·{" "}
                                                {
                                                    compareOne.position ||
                                                    "Unknown Position"
                                                }
                                            </p>

                                        </div>

                                    </div>

                                    <RatingRing
                                        rating={getRating(
                                            compareOne
                                        )}
                                        size={105}
                                    />

                                </div>

                                <div className="compare-player">

                                    <div className="compare-player-main">

                                        <div className="compare-number">
                                            02
                                        </div>

                                        <div>

                                            <label>
                                                PLAYER 02
                                            </label>

                                            <h2>
                                                {
                                                    compareTwo.name
                                                }
                                            </h2>

                                            <p>
                                                {
                                                    compareTwo.team ||
                                                    "Unknown Team"
                                                }{" "}
                                                ·{" "}
                                                {
                                                    compareTwo.position ||
                                                    "Unknown Position"
                                                }
                                            </p>

                                        </div>

                                    </div>

                                    <RatingRing
                                        rating={getRating(
                                            compareTwo
                                        )}
                                        size={105}
                                    />

                                </div>

                                <div className="comparison-overview">

                                    <div className="comparison-title">

                                        <label>
                                            FOOTYIQ RATING
                                        </label>

                                        <h3>
                                            Overall
                                            performance
                                            profile
                                        </h3>

                                    </div>

                                    <div className="rating-comparison">

                                        <div className="rating-side left">

                                            <strong>
                                                {getRating(
                                                    compareOne
                                                ).toFixed(
                                                    1
                                                )}
                                            </strong>

                                            <div
                                                className="rating-line"
                                                style={{
                                                    width: `${
                                                        getRating(
                                                            compareOne
                                                        ) *
                                                        10
                                                    }%`
                                                }}
                                            />

                                        </div>

                                        <div className="vs">
                                            VS
                                        </div>

                                        <div className="rating-side right">

                                            <strong>
                                                {getRating(
                                                    compareTwo
                                                ).toFixed(
                                                    1
                                                )}
                                            </strong>

                                            <div
                                                className="rating-line"
                                                style={{
                                                    width: `${
                                                        getRating(
                                                            compareTwo
                                                        ) *
                                                        10
                                                    }%`
                                                }}
                                            />

                                        </div>

                                    </div>

                                </div>

                                <div className="comparison-table">

                                    <ComparisonStat
                                        name="Age"
                                        valueOne={
                                            compareOne.age
                                        }
                                        valueTwo={
                                            compareTwo.age
                                        }
                                    />

                                    <ComparisonStat
                                        name="Matches"
                                        valueOne={
                                            compareOne.matches_played
                                        }
                                        valueTwo={
                                            compareTwo.matches_played
                                        }
                                    />

                                    <ComparisonStat
                                        name="Minutes"
                                        valueOne={
                                            compareOne.minutes_played
                                        }
                                        valueTwo={
                                            compareTwo.minutes_played
                                        }
                                    />

                                    <ComparisonStat
                                        name="Goals"
                                        valueOne={
                                            compareOne.goals
                                        }
                                        valueTwo={
                                            compareTwo.goals
                                        }
                                    />

                                    <ComparisonStat
                                        name="Assists"
                                        valueOne={
                                            compareOne.assists
                                        }
                                        valueTwo={
                                            compareTwo.assists
                                        }
                                    />

                                    <ComparisonStat
                                        name="Yellow Cards"
                                        valueOne={
                                            compareOne.yellow_cards
                                        }
                                        valueTwo={
                                            compareTwo.yellow_cards
                                        }
                                    />

                                    <ComparisonStat
                                        name="Red Cards"
                                        valueOne={
                                            compareOne.red_cards
                                        }
                                        valueTwo={
                                            compareTwo.red_cards
                                        }
                                    />

                                    <ComparisonStat
                                        name="Market Value"
                                        valueOne={
                                            compareOne.market_value_eur
                                        }
                                        valueTwo={
                                            compareTwo.market_value_eur
                                        }
                                        formatter={
                                            formatValue
                                        }
                                    />

                                </div>

                                <div className="comparison-extra">

                                    <div>
                                        <small>
                                            NATIONALITY
                                        </small>

                                        <strong>
                                            {
                                                compareOne.nationality ||
                                                "N/A"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            HEIGHT
                                        </small>

                                        <strong>
                                            {
                                                compareOne.height_cm
                                                    ? `${compareOne.height_cm} cm`
                                                    : "N/A"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            FOOT
                                        </small>

                                        <strong>
                                            {
                                                compareOne.preferred_foot ||
                                                "N/A"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            NATIONALITY
                                        </small>

                                        <strong>
                                            {
                                                compareTwo.nationality ||
                                                "N/A"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            HEIGHT
                                        </small>

                                        <strong>
                                            {
                                                compareTwo.height_cm
                                                    ? `${compareTwo.height_cm} cm`
                                                    : "N/A"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            FOOT
                                        </small>

                                        <strong>
                                            {
                                                compareTwo.preferred_foot ||
                                                "N/A"
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        ) : (

                            <div className="message">
                                Type a player name
                                above and select
                                two players to
                                compare.
                            </div>

                        )}

                    </section>
                )}

                {/* SCOUTING */}

                {activePage ===
                    "scouting" && (

                    <section>

                        <div className="section-heading">

                            <div>

                                <label>
                                    SCOUTING TOOL
                                </label>

                                <h3>
                                    Build a
                                    shortlist
                                </h3>

                            </div>

                            <span>
                                {
                                    scoutingPlayers.length
                                }{" "}
                                players found
                            </span>

                        </div>

                        <div className="scout-box">

                            <div>

                                <label>
                                    MAXIMUM AGE
                                </label>

                                <input
                                    type="number"
                                    placeholder="23"
                                    value={
                                        maxAge
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setMaxAge(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />

                            </div>

                            <div>

                                <label>
                                    MINIMUM GOALS
                                </label>

                                <input
                                    type="number"
                                    placeholder="10"
                                    value={
                                        minGoals
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setMinGoals(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />

                            </div>

                            <div>

                                <label>
                                    MAXIMUM VALUE (€)
                                </label>

                                <input
                                    type="number"
                                    placeholder="10000000"
                                    value={
                                        maxValue
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setMaxValue(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        <div className="player-grid">

                            {scoutingPlayers
                                .slice(
                                    0,
                                    100
                                )
                                .map(
                                    (
                                        player
                                    ) => (

                                        <PlayerCard
                                            key={
                                                player.player_id
                                            }
                                            player={
                                                player
                                            }
                                            onClick={() =>
                                                setSelectedPlayer(
                                                    player
                                                )
                                            }
                                        />

                                    )
                                )}

                        </div>

                    </section>
                )}

            </main>

            {/* PLAYER PROFILE */}

            {selectedPlayer && (

                <div
                    className="modal"
                    onClick={() =>
                        setSelectedPlayer(
                            null
                        )
                    }
                >

                    <div
                        className="profile"
                        onClick={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            className="close"
                            onClick={() =>
                                setSelectedPlayer(
                                    null
                                )
                            }
                        >
                            ×
                        </button>

                        <div className="profile-head">

                            <div>

                                <label>
                                    {
                                        selectedPlayer.position ||
                                        "PLAYER"
                                    }
                                </label>

                                <h1>
                                    {
                                        selectedPlayer.name
                                    }
                                </h1>

                                <p>
                                    {
                                        selectedPlayer.team ||
                                        "Unknown"
                                    }{" "}
                                    ·{" "}
                                    {
                                        selectedPlayer.nationality ||
                                        "Unknown"
                                    }
                                </p>

                            </div>

                            <RatingRing
                                rating={getRating(
                                    selectedPlayer
                                )}
                                size={110}
                            />

                        </div>

                        <div className="profile-info">

                            <div>

                                <small>
                                    AGE
                                </small>

                                <strong>
                                    {displayStat(
                                        selectedPlayer.age
                                    )}
                                </strong>

                            </div>

                            <div>

                                <small>
                                    HEIGHT
                                </small>

                                <strong>
                                    {
                                        selectedPlayer.height_cm
                                            ? `${selectedPlayer.height_cm} cm`
                                            : "N/A"
                                    }
                                </strong>

                            </div>

                            <div>

                                <small>
                                    FOOT
                                </small>

                                <strong>
                                    {
                                        selectedPlayer.preferred_foot ||
                                        "N/A"
                                    }
                                </strong>

                            </div>

                            <div>

                                <small>
                                    MARKET VALUE
                                </small>

                                <strong>
                                    {formatValue(
                                        selectedPlayer.market_value_eur
                                    )}
                                </strong>

                            </div>

                        </div>

                        <div className="profile-section">

                            <div className="profile-section-title">

                                <label>
                                    PERFORMANCE PROFILE
                                </label>

                                <h3>
                                    Player attributes
                                </h3>

                            </div>

                            <PerformanceRadar
                                player={
                                    selectedPlayer
                                }
                            />

                        </div>

                        <div className="profile-section">

                            <div className="profile-section-title">

                                <label>
                                    SEASON OUTPUT
                                </label>

                                <h3>
                                    2024 performance
                                </h3>

                            </div>

                            <div className="stat-grid">

                                <div>
                                    <small>
                                        MATCHES
                                    </small>

                                    <strong>
                                        {displayStat(
                                            selectedPlayer.matches_played
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <small>
                                        MINUTES
                                    </small>

                                    <strong>
                                        {displayStat(
                                            selectedPlayer.minutes_played
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <small>
                                        GOALS
                                    </small>

                                    <strong>
                                        {displayStat(
                                            selectedPlayer.goals
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <small>
                                        ASSISTS
                                    </small>

                                    <strong>
                                        {displayStat(
                                            selectedPlayer.assists
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <small>
                                        YELLOW
                                    </small>

                                    <strong>
                                        {displayStat(
                                            selectedPlayer.yellow_cards
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <small>
                                        RED
                                    </small>

                                    <strong>
                                        {displayStat(
                                            selectedPlayer.red_cards
                                        )}
                                    </strong>
                                </div>

                            </div>

                        </div>

                        <div className="profile-section">

                            <MarketValueChart
                                player={
                                    selectedPlayer
                                }
                            />

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default App;