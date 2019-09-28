import os
import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session, create_session
from sqlalchemy import create_engine, inspect

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy.ext.declarative import declarative_base

import json


app = Flask(__name__)


# add route to database
engine=create_engine("postgresql+psycopg2://postgres:postgres@localhost:5432/Legends_Temple_Runs")
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg2://postgres:postgres@localhost:5432/Legends_Temple_Runs"
db = SQLAlchemy(app)

Base = automap_base()
Base.prepare(db.engine, reflect=True)

inspector = inspect(engine)
tables=inspector.get_table_names()

# This works with sqlite but now with postgres

# Samples_Metadata = Base.classes.sample_metadata
# Samples = Base.classes.samples



@app.route("/")
def index():
    return render_template("index.html")

# Fetch all data here for page start up
@app.route("/sport")
def sport():

    conn = engine.connect()
    Temple_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]}", conn)
#     Temple_data = {
#     "episode": Temple_data_conn.episode.values.tolist(),
#     "season": Temple_data_conn.season.values.tolist(),
#     "name": Temple_data_conn.name.values.tolist(),
#     "team": Temple_data_conn.team.values.tolist(),
#     "temple_layout": Temple_data_conn.temple_layout.values.tolist(),
#     "artifact_location": Temple_data_conn.artifact_location.values.tolist(),
#     "artifact_found": Temple_data_conn.artifact_found.values.tolist(),
#     "failure_due_to": Temple_data_conn.failure_due_to.values.tolist(),
#     "success": Temple_data_conn.success.values.tolist(),
#     "solo": Temple_data_conn.solo.values.tolist(),
#     "time_left": Temple_data_conn.time_left.values.tolist(),
#     "pendants": Temple_data_conn.pendants.values.tolist(),
#     "pen_dummy": Temple_data_conn.pen_dummy.values.tolist(),
# }

    # return (Temple_data)

# Default route to pick league
@app.route("/default")
def default():

    League_choice=["NFL", "NBA", "MLB", "NHL"]
    League_list=list(np.ravel(League_choice))

    return jsonify(League_list)

# Have routes to fetch team names for all 4 sport leagues
@app.route("/nfl")
def nfl():

    conn = engine.connect()
    Nfl_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]}", conn)
    Nfl_list=Nfl_data_conn.{columns with nfl team names}.unique()
    Nfl_list=list(np.ravel(Nfl_list))

    return jsonify(Nfl_list)

@app.route("/nba")
def nba():

    conn = engine.connect()
    Nba_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]}", conn)
    Nba_list=Nba_data_conn.{columns with nba team names}.unique()
    Nba_list=list(np.ravel(Nba_list))

    return jsonify(Nba_list)
    
@app.route("/mlb")
def mlb():

    conn = engine.connect()
    Mlb_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]}", conn)
    Mlb_list=Mlb_data_conn.{columns with mlb team names}.unique()
    Mlb_list=list(np.ravel(Mlb_list))

    return jsonify(Mlb_list)

@app.route("/nhl")
def nhl():

    conn = engine.connect()
    Nhl_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]}", conn)
    Nhl_list=Nhl_data_conn.{columns with nhl team names}.unique()
    Nhl_list=list(np.ravel(Nhl_list))

    return jsonify(Nhl_list)

# Example route for specific nfl team
@app.route("/nfl/<nfl>")
def nfl_metadata(nfl):

    conn = engine.connect()
    Season_data_conn=pd.read_sql(f"SELECT * FROM {tables[0]} WHERE nfl='{nfl}'", conn)
    Season_data = {
    "episode": Season_data_conn.episode.values.tolist(),
    "season": Season_data_conn.season.values.tolist(),
    "name": Season_data_conn.name.values.tolist(),
    "team": Season_data_conn.team.values.tolist(),
    "temple_layout": Season_data_conn.temple_layout.values.tolist(),
    "artifact_location": Season_data_conn.artifact_location.values.tolist(),
    "artifact_found": Season_data_conn.artifact_found.values.tolist(),
    "failure_due_to": Season_data_conn.failure_due_to.values.tolist(),
    "success": Season_data_conn.success.values.tolist(),
    "solo": Season_data_conn.solo.values.tolist(),
    "time_left": Season_data_conn.time_left.values.tolist(),
    "pendants": Season_data_conn.pendants.values.tolist(),
    "pen_dummy": Season_data_conn.pen_dummy.values.tolist(),
}

    return (Season_data)


if __name__ == "__main__":
    app.run()
