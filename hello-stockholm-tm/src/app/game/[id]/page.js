'use client'

import { useEffect, useState } from 'react'
import styles from '../../schedule/page.module.css'
import { db } from '../../firebase-config'
import { doc, getDoc} from 'firebase/firestore'
import StatusBar from '@/components/game/StatusBar'
import TeamLeft from '@/components/game/TeamLeft'
import { convertMinutesToDate } from '@/api/game'
import InfoBar from '@/components/game/InfoBar'
import Link from 'next/link'

export default function Home({params}) {
    const docRef = doc(db, "Game", params.id)
    const [game, setGame] = useState(null);
    const [time, setTime] = useState("");
    const [day, setDay] = useState("");
    const [division, setDivision] = useState("");
    const [winnerGame, setWgame] = useState(null);
    const [loserGame, setLGame] = useState(null);

    const dateTimeConverter = (minutes) => {
        let dateTime = convertMinutesToDate(minutes);
        setTime(dateTime.substring(0, 5));
        setDay(dateTime.substring(8, 10));
    }

    useEffect(() => {
        const getGame = async () => {
            const doc = await getDoc(docRef);
            setGame(doc.data());
        }
        getGame();
    }, [])

    useEffect(() => {
        const getAdv = async (wid, lid) => {
            if(lid != ""){
                const lgameRef = doc(db, "Game", lid);
                const res = await getDoc(lgameRef);
                let lgame = {...res.data(), id: res.id};
                setLGame(lgame);
            }
            if(wid != ""){
                const wgameRef = doc(db, "Game", wid);
                const res2 = await getDoc(wgameRef);
                let wgame = {...res2.data(), id: res2.id};
                setWgame(wgame);
            }
        }
        if(game){
            dateTimeConverter(game.DateTime);
            if(game.Division === 0){
                setDivision("Open");
            }
            if(game.Division === 1){
                setDivision("Women");
            }
            if(game.Type === 1){
                let wid = "";
                if(game.WNextGame.length > 0){
                    wid = game.WNextGame[0];
                }
                let lid = "";
                if(game.LNextGame.length > 0){
                    lid = game.LNextGame[0];
                }
                getAdv(wid, lid)
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
                <h4 className={styles.gameDayText}>{day} Feb</h4>
            </div>
            <div className={styles.timeContainer}>
                <TeamLeft 
                    teamName1={game.Team1Name} 
                    score1={game.Team1Score} 
                    teamName2={game.Team2Name} 
                    score2={game.Team2Score}
                    teamID1={game.Team1ID}
                    teamID2={game.Team2ID}
                />
            </div>
            <div className={styles.infoContainer}>
                <InfoBar prompt={game.Field} alignment={"left"}/>
                <InfoBar prompt={game.GameName} alignment={"center"}/>
                <InfoBar prompt={division}/>
            </div>
            { winnerGame &&
                <div className={styles.advContainer}>
                    <div className={styles.advText}>Winner advances to: </div>
                    <Link href={'/game/' + winnerGame.id}>
                        <div className={styles.advGame} >
                            <h4>{winnerGame.GameName}</h4>
                        </div>
                    </Link>
                </div>
            }
            { loserGame &&
                <div className={styles.advContainer}>
                    <div className={styles.advText}>Loser advances to: </div>
                    <Link href={'/game/' + loserGame.id}>
                        <div className={styles.advGame} >
                            <h4 >{loserGame.GameName}</h4>
                        </div>
                    </Link>
                </div>
            }
        </>
        }
        </main>
      )
}