import os
from socket import create_server
import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session, create_session
from sqlalchemy import create_engine, inspect

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy.ext.declarative import declarative_base
# from waitress import serve

import json


app = Flask(__name__)


# add route to database
#engine=create_engine("postgresql+psycopg2://postgres:postgres@localhost:5432/Project_2_Test")
#app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg2://postgres:postgres@localhost:5432/Project_2_Test"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///Test_data.sqlite"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.debug = False

db = SQLAlchemy(app)

Base = automap_base()
Base.prepare(db.engine, reflect=True)

inspector = inspect(db.engine)
tables=inspector.get_table_names()

# This works with sqlite but not with postgres

# Samples_Metadata = Base.classes.sample_metadata
# Samples = Base.classes.samples



@app.route("/")
def index():
    return render_template("index.html")

# Fetch all data here if needed for page start up.  table[0] references the first and only dataset in the database through the inspector.
@app.route("/sport")
def sport():

    conn = db.engine.connect()
    Test_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]}", conn)
    Test_data = {
    "league": Test_data_conn.league.values.tolist(),
    "team": Test_data_conn.team.values.tolist(),
    "altitude": Test_data_conn.altitude.values.tolist(),
    "win_pct_1": Test_data_conn.win_pct_1.values.tolist(),
    "home_win_pct_1": Test_data_conn.home_win_pct_1.values.tolist(),
    "similar_opp_home_1": Test_data_conn.similar_opp_home_1.values.tolist(),
    "win_pct_2": Test_data_conn.win_pct_2.values.tolist(),
    "home_win_pct_2": Test_data_conn.home_win_pct_2.values.tolist(),
    "similar_opp_home_2": Test_data_conn.similar_opp_home_2.values.tolist(),
    "win_pct_3": Test_data_conn.win_pct_3.values.tolist(),
    "home_win_pct_3": Test_data_conn.home_win_pct_3.values.tolist(),
    "similar_opp_home_3": Test_data_conn.similar_opp_home_3.values.tolist(),
    "win_pct_4": Test_data_conn.win_pct_4.values.tolist(),
    "home_win_pct_4": Test_data_conn.home_win_pct_4.values.tolist(),
    "similar_opp_home_4": Test_data_conn.similar_opp_home_4.values.tolist(),
    "win_pct_5": Test_data_conn.win_pct_5.values.tolist(),
    "home_win_pct_5": Test_data_conn.home_win_pct_5.values.tolist(),
    "similar_opp_home_5": Test_data_conn.similar_opp_home_5.values.tolist(),
}

    return jsonify(Test_data)

# Fetch the list of leagues for the league dropdown menu
@app.route("/league")
def league():

    conn = db.engine.connect()
    League_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]}", conn)
    League_list=League_data_conn.league.unique()
    League_list=list(np.ravel(League_list))

    return jsonify(League_list)

# Gets stats for each team
@app.route("/league/<team>")
def team_metadata(team):

    conn = db.engine.connect()
    Test_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} WHERE team='{team}'", conn)
    Team_data = {
    "league": Test_data_conn.league.values.tolist(),
    "team": Test_data_conn.team.values.tolist(),
    "altitude": Test_data_conn.altitude.values.tolist(),
    "win_pct_1": Test_data_conn.win_pct_1.values.tolist(),
    "home_win_pct_1": Test_data_conn.home_win_pct_1.values.tolist(),
    "similar_opp_home_1": Test_data_conn.similar_opp_home_1.values.tolist(),
    "win_pct_2": Test_data_conn.win_pct_2.values.tolist(),
    "home_win_pct_2": Test_data_conn.home_win_pct_2.values.tolist(),
    "similar_opp_home_2": Test_data_conn.similar_opp_home_2.values.tolist(),
    "win_pct_3": Test_data_conn.win_pct_3.values.tolist(),
    "home_win_pct_3": Test_data_conn.home_win_pct_3.values.tolist(),
    "similar_opp_home_3": Test_data_conn.similar_opp_home_3.values.tolist(),
    "win_pct_4": Test_data_conn.win_pct_4.values.tolist(),
    "home_win_pct_4": Test_data_conn.home_win_pct_4.values.tolist(),
    "similar_opp_home_4": Test_data_conn.similar_opp_home_4.values.tolist(),
    "win_pct_5": Test_data_conn.win_pct_5.values.tolist(),
    "home_win_pct_5": Test_data_conn.home_win_pct_5.values.tolist(),
    "similar_opp_home_5": Test_data_conn.similar_opp_home_5.values.tolist(),
}

    return jsonify(Team_data)

# Fetch list of nba teams for dropdown menu
@app.route("/nba")
def nba():

    conn = db.engine.connect()
    League_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} where league='NBA'", conn)
    Nba_list=League_data_conn.team
    Nba_list=sorted(Nba_list)
    Nba_list=list(np.ravel(Nba_list))

    return jsonify(Nba_list)

# Fetches data for nba teams
@app.route("/nba_data")
def nba_data():

    conn = db.engine.connect()
    Test_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} where league='NBA'", conn)
    Nba_data = {
    "league": Test_data_conn.league.values.tolist(),
    "team": Test_data_conn.team.values.tolist(),
    "altitude": Test_data_conn.altitude.values.tolist(),
    "win_pct_1": Test_data_conn.win_pct_1.values.tolist(),
    "home_win_pct_1": Test_data_conn.home_win_pct_1.values.tolist(),
    "similar_opp_home_1": Test_data_conn.similar_opp_home_1.values.tolist(),
    "win_pct_2": Test_data_conn.win_pct_2.values.tolist(),
    "home_win_pct_2": Test_data_conn.home_win_pct_2.values.tolist(),
    "similar_opp_home_2": Test_data_conn.similar_opp_home_2.values.tolist(),
    "win_pct_3": Test_data_conn.win_pct_3.values.tolist(),
    "home_win_pct_3": Test_data_conn.home_win_pct_3.values.tolist(),
    "similar_opp_home_3": Test_data_conn.similar_opp_home_3.values.tolist(),
    "win_pct_4": Test_data_conn.win_pct_4.values.tolist(),
    "home_win_pct_4": Test_data_conn.home_win_pct_4.values.tolist(),
    "similar_opp_home_4": Test_data_conn.similar_opp_home_4.values.tolist(),
    "win_pct_5": Test_data_conn.win_pct_5.values.tolist(),
    "home_win_pct_5": Test_data_conn.home_win_pct_5.values.tolist(),
    "similar_opp_home_5": Test_data_conn.similar_opp_home_5.values.tolist(),
}

    return jsonify(Nba_data)

# Fetch list of nfl teams for dropdown menu
@app.route("/nfl")
def nfl():

    conn = db.engine.connect()
    League_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} where league='NFL'", conn)
    Nfl_list=League_data_conn.team
    Nfl_list=sorted(Nfl_list)
    Nfl_list=list(np.ravel(Nfl_list))

    return jsonify(Nfl_list)

# Fetches data for nfl teams
@app.route("/nfl_data")
def nfl_data():

    conn = db.engine.connect()
    Test_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} where league='NFL'", conn)
    Nfl_data = {
    "league": Test_data_conn.league.values.tolist(),
    "team": Test_data_conn.team.values.tolist(),
    "altitude": Test_data_conn.altitude.values.tolist(),
    "win_pct_1": Test_data_conn.win_pct_1.values.tolist(),
    "home_win_pct_1": Test_data_conn.home_win_pct_1.values.tolist(),
    "similar_opp_home_1": Test_data_conn.similar_opp_home_1.values.tolist(),
    "win_pct_2": Test_data_conn.win_pct_2.values.tolist(),
    "home_win_pct_2": Test_data_conn.home_win_pct_2.values.tolist(),
    "similar_opp_home_2": Test_data_conn.similar_opp_home_2.values.tolist(),
    "win_pct_3": Test_data_conn.win_pct_3.values.tolist(),
    "home_win_pct_3": Test_data_conn.home_win_pct_3.values.tolist(),
    "similar_opp_home_3": Test_data_conn.similar_opp_home_3.values.tolist(),
    "win_pct_4": Test_data_conn.win_pct_4.values.tolist(),
    "home_win_pct_4": Test_data_conn.home_win_pct_4.values.tolist(),
    "similar_opp_home_4": Test_data_conn.similar_opp_home_4.values.tolist(),
    "win_pct_5": Test_data_conn.win_pct_5.values.tolist(),
    "home_win_pct_5": Test_data_conn.home_win_pct_5.values.tolist(),
    "similar_opp_home_5": Test_data_conn.similar_opp_home_5.values.tolist(),
}

    return jsonify(Nfl_data)

# Fetch list of mlb teams for dropdown menu
@app.route("/mlb")
def mlb():

    conn = db.engine.connect()
    League_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} where league='MLB'", conn)
    Mlb_list=League_data_conn.team
    Mlb_list=sorted(Mlb_list)
    Mlb_list=list(np.ravel(Mlb_list))

    return jsonify(Mlb_list)

# Fetches data for mlb teams
@app.route("/mlb_data")
def mlb_data():

    conn = db.engine.connect()
    Test_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} where league='MLB'", conn)
    Mlb_data = {
    "league": Test_data_conn.league.values.tolist(),
    "team": Test_data_conn.team.values.tolist(),
    "altitude": Test_data_conn.altitude.values.tolist(),
    "win_pct_1": Test_data_conn.win_pct_1.values.tolist(),
    "home_win_pct_1": Test_data_conn.home_win_pct_1.values.tolist(),
    "similar_opp_home_1": Test_data_conn.similar_opp_home_1.values.tolist(),
    "win_pct_2": Test_data_conn.win_pct_2.values.tolist(),
    "home_win_pct_2": Test_data_conn.home_win_pct_2.values.tolist(),
    "similar_opp_home_2": Test_data_conn.similar_opp_home_2.values.tolist(),
    "win_pct_3": Test_data_conn.win_pct_3.values.tolist(),
    "home_win_pct_3": Test_data_conn.home_win_pct_3.values.tolist(),
    "similar_opp_home_3": Test_data_conn.similar_opp_home_3.values.tolist(),
    "win_pct_4": Test_data_conn.win_pct_4.values.tolist(),
    "home_win_pct_4": Test_data_conn.home_win_pct_4.values.tolist(),
    "similar_opp_home_4": Test_data_conn.similar_opp_home_4.values.tolist(),
    "win_pct_5": Test_data_conn.win_pct_5.values.tolist(),
    "home_win_pct_5": Test_data_conn.home_win_pct_5.values.tolist(),
    "similar_opp_home_5": Test_data_conn.similar_opp_home_5.values.tolist(),
}

    return jsonify(Mlb_data)

# Fetch list of nhl teams for dropdown menu
@app.route("/nhl")
def nhl():

    conn = db.engine.connect()
    League_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} where league='NHL'", conn)
    Nhl_list=League_data_conn.team
    Nhl_list=sorted(Nhl_list)
    Nhl_list=list(np.ravel(Nhl_list))

    return jsonify(Nhl_list)

# Fetches data for nhl teams
@app.route("/nhl_data")
def nhl_data():

    conn = db.engine.connect()
    Test_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} where league='NHL'", conn)
    Nhl_data = {
    "league": Test_data_conn.league.values.tolist(),
    "team": Test_data_conn.team.values.tolist(),
    "altitude": Test_data_conn.altitude.values.tolist(),
    "win_pct_1": Test_data_conn.win_pct_1.values.tolist(),
    "home_win_pct_1": Test_data_conn.home_win_pct_1.values.tolist(),
    "similar_opp_home_1": Test_data_conn.similar_opp_home_1.values.tolist(),
    "win_pct_2": Test_data_conn.win_pct_2.values.tolist(),
    "home_win_pct_2": Test_data_conn.home_win_pct_2.values.tolist(),
    "similar_opp_home_2": Test_data_conn.similar_opp_home_2.values.tolist(),
    "win_pct_3": Test_data_conn.win_pct_3.values.tolist(),
    "home_win_pct_3": Test_data_conn.home_win_pct_3.values.tolist(),
    "similar_opp_home_3": Test_data_conn.similar_opp_home_3.values.tolist(),
    "win_pct_4": Test_data_conn.win_pct_4.values.tolist(),
    "home_win_pct_4": Test_data_conn.home_win_pct_4.values.tolist(),
    "similar_opp_home_4": Test_data_conn.similar_opp_home_4.values.tolist(),
    "win_pct_5": Test_data_conn.win_pct_5.values.tolist(),
    "home_win_pct_5": Test_data_conn.home_win_pct_5.values.tolist(),
    "similar_opp_home_5": Test_data_conn.similar_opp_home_5.values.tolist(),
}

    return jsonify(Nhl_data)


if __name__ == "__main__":
    app.run()
    # serve(app.run(), host="0.0.0.0", port=8080)
    # server = create_server(app)
    # server.run()
