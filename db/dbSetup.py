import sqlite3
from sqlite3 import Error

def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
    return conn

def create_table(conn, create_table_sql):
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Error as e:
        print(e)

def create_sql_group_table():
    sql_create_group_table = """ CREATE TABLE IF NOT EXISTS groups (
                                        id integer PRIMARY KEY AUTOINCREMENT,
                                        name text NOT NULL UNIQUE,
                                        division integer NOT NULL,
                                        size integer NOT NULL,
					                    team1 text,
                                        nextgame1 integer,
                                        team2 text,
                                        nextgame2 integer,
                                        team3 text,
                                        nextgame3 integer,
                                        team4 text,
                                        nextgame4 integer,
                                        team5 text,
                                        nextgame5 integer,
                                        FOREIGN KEY (nextgame1) REFERENCES game(id),
                                        FOREIGN KEY (nextgame2) REFERENCES game(id),
                                        FOREIGN KEY (nextgame3) REFERENCES game(id),
                                        FOREIGN KEY (nextgame4) REFERENCES game(id),
                                        FOREIGN KEY (nextgame5) REFERENCES game(id)); """

    return sql_create_group_table

def create_sql_team_table():
    sql_create_team_table = """ CREATE TABLE IF NOT EXISTS team (
                                        id integer PRIMARY KEY AUTOINCREMENT,
                                        name text NOT NULL,
                                        winsgroup integer DEFAULT 0,
                                        lossesgroup integer DEFAULT 0,
                                        goalsscoredgroup integer DEFAULT 0,
                                        goalsconcededgroup integer DEFAULT 0,
                                        winstotal integer DEFAULT 0,
                                        lossestotal integer DEFAULT 0,
                                        goalsscoredtotal integer DEFAULT 0,
                                        goalsconcededtotal integer DEFAULT 0, 
                                        division integer NOT NULL,
                                        groupid integer,
                                        FOREIGN KEY (groupid) REFERENCES groups(id)); """
    
    return sql_create_team_table

def create_sql_group_team_table():
    sql_command = """ CREATE TABLE IF NOT EXISTS groupteams (
                                        id integer PRIMARY KEY AUTOINCREMENT,
                                        groupid integer,
                                        teamid integer,
                                        FOREIGN KEY (groupid) REFERENCES groups(id),
                                        FOREIGN KEY (teamid) REFERENCES team(id)); """
    return sql_command

def create_sql_group_game_table():
    sql_command = """ CREATE TABLE IF NOT EXISTS groupgames (
                                        id integer PRIMARY KEY AUTOINCREMENT,
                                        groupid integer,
                                        gameid integer,
                                        FOREIGN KEY (groupid) REFERENCES groups(id),
                                        FOREIGN KEY (gameid) REFERENCES game(id)); """
    return sql_command

def create_sql_game_table():
    sql_create_game_table = """ CREATE TABLE IF NOT EXISTS game (
                                        id integer PRIMARY KEY AUTOINCREMENT,
                                        team1name text,
                                        team2name text,
                                        gamename text NOT NULL UNIQUE,
                                        team1score INTEGER DEFAULT 0,
                                        team2score INTEGER DEFAULT 0,
                                        status INTEGER DEFAULT 0,
                                        datetime text,
                                        division INTEGER,
                                        wnextgame INTEGER,
                                        lnextgame INTEGER,
                                        FOREIGN KEY (wnextgame) REFERENCES game(id),
                                        FOREIGN KEY (lnextgame) REFERENCES game(id)
                                    ); """
    return sql_create_game_table


if __name__ == '__main__':
    database = r"hs.db"
    conn = create_connection(database)
    
    sql_create_game_table = create_sql_game_table()
    sql_create_group_table = create_sql_group_table()
    sql_create_team_table = create_sql_team_table()
    sql_create_group_teams = create_sql_group_team_table()
    sql_create_group_games = create_sql_group_game_table()

    # create a database connection
    conn = create_connection(database)

    # create tables
    if conn is not None:
        # create game table
        create_table(conn, sql_create_game_table)
        create_table(conn, sql_create_group_table)
        create_table(conn, sql_create_team_table)
        create_table(conn, sql_create_group_teams)
        create_table(conn, sql_create_group_games)

        game = ('SUFC ODIN', 'ÖREBAJS', "GOA", "DATUM", 0, "NULL", "NULL");
        #game_id = create_game(conn, game)

        group = ("OA", 0, 4)
        #group_id = create_group(conn, group)
        #print(group_id)

        conn.close()
    else:
        print("Error! cannot create the database connection.")
    