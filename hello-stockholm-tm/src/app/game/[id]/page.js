'use client'

import { useEffect, useState } from 'react'
import styles from '../../schedule/page.module.css'
import { db } from '../../firebase-config'
import { doc, getDoc, getDocs, collection, query, where} from 'firebase/firestore'
import StatusBar from '@/components/game/StatusBar'
import TeamLeft from '@/components/game/TeamLeft'
import { convertMinutesToDate } from '@/api/game'
import InfoBar from '@/components/game/InfoBar'
import Link from 'next/link'

export default function Home({params}) {
    //Referens till databasobjektet
    const docRef = doc(db, "Games", params.id)
    const gameID = params.id;

    const [scoreKeeperURL, setSCURL] = useState("");
    const [game, setGame] = useState(null);
    const [time, setTime] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [division, setDivision] = useState("");
    const [winnerGame, setWgame] = useState(null);
    const [loserGame, setLGame] = useState(null);
    const [lgameOrGroup, setLGOG] = useState(null);
    const [team1ID, setTeam1ID] = useState(null);
    const [team2ID, setTeam2ID] = useState(null);

    const dateTimeConverter = (minutes) => {
        let dateTime = convertMinutesToDate(minutes);
        setTime(dateTime[0] + ":" + dateTime[1]);
        setDay(dateTime[2]);
        setMonth(dateTime[3])
    }

    useEffect(() => {
        const getGame = async () => {
            const teamGameRef = collection(db, "TeamGame");
            const q = query(teamGameRef, where("GameID", "==", gameID));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                let teamGame = doc.data();
                if(teamGame.TeamPosition == 1){
                    setTeam1ID(teamGame.TeamID);
                }else if(teamGame.TeamPosition == 2){
                    setTeam2ID(teamGame.TeamID);
                }
            });
            const doc = await getDoc(docRef);
            setSCURL("/score_keeper/" + doc.data().GameName);
            setGame(doc.data());
        }
        getGame();
    }, [])

    useEffect(() => {
        const getAdv = async (wid, lid, lpos) => {
            if(lid != ""){
                if(lpos != 3){
                    const lgameRef = doc(db, "Games", lid);
                    const res = await getDoc(lgameRef);
                    let lgame = {...res.data(), id: res.id};
                    setLGame(lgame);
                    setLGOG(1);
                }else{
                    const lgroupRef = doc(db, "Groups", lid);
                    const res = await getDoc(lgroupRef);
                    let lgroup = {...res.data(), id: res.id};
                    setLGame(lgroup);
                    setLGOG(2);
                }
            }
            if(wid != ""){
                const wgameRef = doc(db, "Games", wid);
                const res2 = await getDoc(wgameRef);
                let wgame = {...res2.data(), id: res2.id};
                setWgame(wgame);
            }
        }
        if(game){
            dateTimeConverter(game.DateTime);
            setDivision("ÅM");
            if(game.Type === 1){
                let wid = "";
                if(game.WNextGame.length > 0){
                    wid = game.WNextGame[0];
                }
                let lid = "";
                let lpos = 0;
                if(game.LNextGame.length > 0){
                    lid = game.LNextGame[0];
                    lpos = game.LNextGame[1];
                }
                getAdv(wid, lid, lpos)
            }
        }
    }, [game]);

    return (
        <main className={styles.main}>
        { game &&
        <>
            <div className={styles.center}>
                <StatusBar status={game.Status}/>
            </div>
            <div className={styles.timeContainer}>
                <h1 className={styles.TimeText}>{time}</h1>
            </div>
            <div className={styles.gameDayContainer}>
                <h4 className={styles.gameDayText}>{day} {month}</h4>
            </div>
            <div className={styles.timeContainer}>
                <TeamLeft 
                    teamName1={game.Team1Name} 
                    score1={game.Team1Score} 
                    teamName2={game.Team2Name} 
                    score2={game.Team2Score}
                    teamID1={team1ID}
                    teamID2={team2ID}
                />
            </div>
            <div className={styles.infoContainer}>
                <InfoBar prompt={game.Field} alignment={"left"}/>
                <InfoBar prompt={game.GameName} alignment={"center"}/>
                <Link href={scoreKeeperURL}>
                    <InfoBar prompt={division}/>
                </Link>
            </div>
            { winnerGame &&
                <div className={styles.advContainer}>
                    <div className={styles.advText}>Vinnare går till: </div>
                    <Link href={'/game/' + winnerGame.id}>
                        <div className={styles.advGame} >
                            <h4>{winnerGame.GameName}</h4>
                        </div>
                    </Link>
                </div>
            }
            { lgameOrGroup === 1 &&
                <div className={styles.advContainer}>
                    <div className={styles.advText}>Förlorare går till: </div>
                    <Link href={'/game/' + loserGame.id}>
                        <div className={styles.advGame} >
                            <h4 >{loserGame.GameName}</h4>
                        </div>
                    </Link>
                </div>
            }
            { lgameOrGroup === 2 &&
                <div className={styles.advContainer}>
                    <div className={styles.advText}>Förlorare går till: </div>
                    <Link href={'/group/' + loserGame.id}>
                        <div className={styles.advGame} >
                            <h4 >{loserGame.GroupName}</h4>
                        </div>
                    </Link>
                </div>
            }
        </>
        }
        </main>
      )
}