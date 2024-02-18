'use client'

import styles from '../../../page.module.css'
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase-config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../firebase-config'
import { collection, getDoc, doc, updateDoc, deleteDoc} from 'firebase/firestore'
import { convertDateToMinutes, convertMinutesToDate, setExistingTeam, setGameReady, setNextGame, setPlaceholderTeamNames, updateGeneral } from '@/api/gameAPI';

export default function Home({params}) {
    const [loggedin, setLoggedin] = useState(false);
    const [game, setGame] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDivision, setEditDivision] = useState("0");
    const [day, setDay] = useState("0");
    const [hour, setHour] = useState("0");
    const [minute, setMinute] = useState("0");
    const [field, setField] = useState("");
    const [refresh, setRefresh] = useState(0);
    const [teamMenu, setTeamMenu] = useState(0);
    const [menuCode, setMenuCode] = useState(0);
    const [team1name, setTeam1Name] = useState(0);
    const [team2name, setTeam2Name] = useState(0);
    const [teamIndex, setTeamIndex] = useState("1");
    const [teamError, setTeamError] = useState(0);
    const [nextGameWL, setNGWL] = useState("0")
    const [nextGameName, setNGName] = useState("");
    const [ngError, setNGError] = useState(0);
    const [ready, setReady] = useState(0);
    const router = useRouter();

    const gameReady = () => {
      setGameReady(params.id);
      setRefresh(refresh+1)
    }
    const mcStatus = () => {
      setMenuCode(30);
    }
    const mcNextGames = () => {
      setMenuCode(20);
    }

    const mcExistingTeam = () => {
      setMenuCode(10);
    }

    const mcPlaceholderTeam = () => {
      setMenuCode(11);
    }

    const updateTeam1Name = (event) => {
      setTeam1Name(event.target.value);
    }
    const updateTeam2Name = (event) => {
      setTeam2Name(event.target.value);
    }

    const updateNGName = (event) => {
      setNGName(event.target.value);
    }

    const toggleTeamMenu = () => {
      if(teamMenu === 0){
        setTeamMenu(1);
      }else{
        setTeamMenu(0);
      }
    }

    const updateField = (event) => {
      setField(event.target.value);
    }
    
    const updateEditName = (event) => {
      setEditName(event.target.value);
    }

    const updateDay = (event) => {
      setDay(event.target.value);
    }

    const updateHour = (event) => {
      setHour(event.target.value);
    }

    const updateMinute = (event) => {
      setMinute(event.target.value);
    }

    const updatePlaceholderNames = async () => {
      await setPlaceholderTeamNames(params.id, team1name, team2name);
      setRefresh(refresh+1);
    }

    const updateTeam = async () => {
      let stat = -1;
      if(teamIndex === "1"){
        stat = await setExistingTeam(params.id, team1name, parseInt(editDivision), parseInt(teamIndex))
      } else if(teamIndex === "2"){
        stat = await setExistingTeam(params.id, team2name, parseInt(editDivision), parseInt(teamIndex)) 
      }
      if(stat === -1){
        setTeamError(1);
      }else {
        setTeamError(0);
        setRefresh(refresh+1);
      }
    }

    const updateNextGame = async () => {
      let stat = await setNextGame(params.id, nextGameName, parseInt(nextGameWL), parseInt(teamIndex))
      if(stat === -1){
        setNGError(1);
      }else {
        setNGError(0);
      }
    }

    const updateGeneralFields = async () => {
      let stat = 1;
      let d = parseInt(editDivision);
      if(parseInt(day) == NaN){
        stat = -1;
      }
      if(parseInt(hour) == NaN){
        stat = -1
      }
      if(parseInt(minute) == NaN){
        stat = -1;
      }

      if(stat === 1){
        let dt = convertDateToMinutes(day, hour, minute);
        await updateGeneral(params.id, editName, parseInt(editDivision), dt, field);
        setRefresh(refresh+1)
      }
    }

    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
              const uid = user.uid;
              setLoggedin(true)
            } else {
              setLoggedin(false);
              router.push('/');
            }
          });
         
    }, [])

    useEffect(() => {
      const getGame = async () => {
        const gameRef = doc(db, "Game", params.id);
        let game = await getDoc(gameRef);
        setGame({...game.data(), id: game.id});
      }
      getGame();
    }, [refresh])

    useEffect(() => {
      if(game){
        setEditName(game.GameName);
        setEditDivision(game.Division.toString())
        let dateTime = convertMinutesToDate(game.DateTime);
        setDay(dateTime[0]);
        setHour(dateTime[1]);
        setMinute(dateTime[2]);
        setField(game.Field);
        setTeam1Name(game.Team1Name);
        setTeam2Name(game.Team2Name);
        setReady(game.Ready);
      }
    }, [game])

    return (
        <main className={styles.main}>
          <div className={styles.center}>
            <Link href={"/games/edit"}>
              <div className={styles.enterButton}>Go back</div>
            </Link>
          </div>
          { loggedin && game &&
          <>
            <div className={styles.centerVert}>
              <div>
                <h3>Game name</h3>
                <input className={styles.input} value={editName} onChange={updateEditName} placeholder={"Edit game name"}></input>
                <h3>Division</h3>
                  <select
                      value={editDivision}
                      onChange={e => setEditDivision(e.target.value)}
                      className={styles.select}
                    >
                    <option value="0">Open</option>
                    <option value="1">Women</option>
                  </select>
              </div>
              <div className={styles.center2}>
                <input className={styles.inputSmall} value={day} onChange={updateDay}></input>
                <h3>Feb</h3>
                <input className={styles.inputSmall} value={hour} onChange={updateHour}></input>
                <h3>:</h3>
                <input className={styles.inputSmall} value={minute} onChange={updateMinute}></input>
              </div>
              <h3>Field</h3>
              <input className={styles.input} value={field} onChange={updateField}></input>
              <div className={styles.enterButton} onClick={updateGeneralFields}>Update</div>
            </div>
            <div className={styles.centerVert}>
              <div className={styles.createButton} onClick={toggleTeamMenu}>Teams</div>
              { teamMenu === 1 &&
                <>
                  <div className={styles.enterButton2} onClick={mcExistingTeam}>Add existing team</div> 
                  <div className={styles.enterButton2} onClick={mcPlaceholderTeam}>Add placeholder team</div>
                </>
              }
            </div>
            <div className={styles.centerVert}>
              <div className={styles.createButton} onClick={mcNextGames}>Next games</div>
            </div>
            <div className={styles.centerVert}>
              <div className={styles.createButton} onClick={mcStatus}>Status</div>
            </div>
            </>
          }
          { loggedin && game && menuCode === 10 &&
            <div className={styles.centerVert}>
              <select
                      value={teamIndex}
                      onChange={e => setTeamIndex(e.target.value)}
                      className={styles.select}
                    >
                    <option value="1">Team 1</option>
                    <option value="2">Team 2</option>
                  </select>
              <div className={styles.center}>
                <h4>Team {teamIndex}</h4>
                { teamIndex === "1" &&
                  <input className={styles.input} placeholder='Edit team' value={team1name} onChange={updateTeam1Name}></input>
                }
                { teamIndex === "2" &&
                  <input className={styles.input} placeholder='Edit team' value={team2name} onChange={updateTeam2Name}></input>
                }
              </div>
              <div className={styles.enterButton} onClick={updateTeam}>Set team {teamIndex}</div>
                { teamError === 1 &&
                  <h3>Error adding team</h3>
                }
            </div>
          }
          { loggedin && game && menuCode === 11 &&
            <div className={styles.centerVert}>
              <div className={styles.center}>
                <h4>Team 1</h4>
                <input className={styles.input} placeholder='Edit placeholder name' value={team1name} onChange={updateTeam1Name}></input>
              </div>
              <div className={styles.center}>
                <h4>Team 2</h4>
                <input className={styles.input} placeholder='Edit placeholder name' value={team2name} onChange={updateTeam2Name}></input>
              </div>
              <div className={styles.enterButton} onClick={updatePlaceholderNames}>Set team names</div>
            </div>
          }
          { loggedin && game && menuCode === 20 &&
            <div className={styles.centerVert}>
            <select
                    value={nextGameWL}
                    onChange={e => setNGWL(e.target.value)}
                    className={styles.select}
                  >
                  <option value="0">Winner</option>
                  <option value="1">Looser</option>
            </select>
            <select
                    value={teamIndex}
                    onChange={e => setTeamIndex(e.target.value)}
                    className={styles.select}
                  >
                  <option value="1">Team 1</option>
                  <option value="2">Team 2</option>
                  <option value="3">Group</option>
            </select>
            <div className={styles.center}>
              <h4>Game/Group</h4>
              <input className={styles.input} placeholder='Game name' value={nextGameName} onChange={updateNGName}></input>
              
            </div>
            <div className={styles.enterButton} onClick={updateNextGame}>Set next game</div>
              { ngError === 1 &&
                <h3>Error linking game</h3>
              }
          </div>
          }
          { loggedin && game && menuCode === 30 &&
            <div className={styles.centerVert}>
            <div className={styles.enterButton} onClick={gameReady}>Set ready</div>
              
            </div>
          }
        </main>
  )
}