# FootyIQ

## Football Analytics and Scouting Platform

FootyIQ is a full-stack football analytics platform designed to explore player performance, compare players, analyze teams, and support data-driven scouting workflows.

The application combines a React frontend, Node.js/Express REST API, SQLite database, and Python-based data processing and machine learning experimentation.

---

## Overview

Football produces a large amount of player and match data, but raw statistics can be difficult to interpret when evaluating players.

FootyIQ provides an interactive interface for exploring football data and converting statistical information into meaningful performance indicators.

The platform currently supports:

- Player search and filtering
- Player profiles
- Player comparison
- Performance statistics
- Player ratings
- Team exploration
- Scouting-oriented player discovery
- REST API access to football data
- Python-based data processing
- Machine learning experimentation

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | SQLite, better-sqlite3 |
| Data Processing | Python, Pandas, NumPy |
| Machine Learning | Scikit-learn |
| API | REST |
| Version Control | Git, GitHub |

---

## System Architecture

```text
Football Dataset
       |
       v
Python Data Processing
       |
       v
SQLite Database
       |
       v
Node.js / Express REST API
       |
       v
React Frontend
       |
       v
Analytics, Comparison and Scouting
