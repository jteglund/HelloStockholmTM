import sqlite3
from sqlite3 import Error
from dbSetup import create_connection

def create_game(conn, game):
    sql = ''' INSERT INTO game(team1name,team2name,gamename,datetime,division,wnextgame,lnextgame)
              VALUES(?,?,?,?,?,?,?) '''
    cur = conn.cursor()
    cur.execute(sql, game)
    conn.commit()
    return cur.lastrowid

def create_group(conn, group):
    sql = ''' INSERT INTO groups(name,division,size)
              VALUES(?,?,?) '''
    cur = conn.cursor()
    cur.execute(sql, group)
    conn.commit()
    return cur.lastrowid

def create_team(conn, team):
    sql = ''' INSERT INTO team(name,division,groupid)
              VALUES(?,?,?) '''
    
    cur = conn.cursor()
    cur.execute(sql, team)
    conn.commit()
    return cur.lastrowid

def create_group_teams(conn, groupTeams):
    sql = ''' INSERT INTO groupteams(groupid,teamid)
              VALUES(?,?) '''
    
    cur = conn.cursor()
    cur.execute(sql, groupTeams)
    conn.commit()
    return cur.lastrowid 

def create_group_games(conn, groupGames):
    sql = ''' INSERT INTO groupgames(groupid,gameid)
              VALUES(?,?) '''
    
    cur = conn.cursor()
    cur.execute(sql, groupGames)
    conn.commit()
    return cur.lastrowid 

if __name__ == '__main__':
    database = r"hs.db"
    conn = create_connection(database)

    # create tables
    if conn is not None:
        group = ("OA", 0, 2)
        group_id = create_group(conn, group)

        team = ("SUFC Odin", 0, 1)
        create_team(conn, team)
        team = ("KFUM ÖREBAJS", 0, 1)
        create_team(conn, team)
        
        game = ('SUFC ODIN', 'ÖREBAJS', "GOA", "DATUM", 0, "NULL", "NULL");
        game_id = create_game(conn, game)

        groupTeams = (1, 1)
        create_group_teams(conn, groupTeams)
        groupTeams = (1, 2)
        create_group_teams(conn, groupTeams)

        groupGames = (1, 1)
        create_group_games(conn, groupGames) 
        
        conn.close()
    else:
        print("Error! cannot create the database connection.")
    