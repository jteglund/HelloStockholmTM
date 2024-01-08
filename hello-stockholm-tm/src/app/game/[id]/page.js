'use client'

import { useEffect, useState } from 'react'
import styles from '../../schedule/page.module.css'
import { db } from '../../firebase-config'
import { doc, getDoc} from 'firebase/firestore'
import StatusBar from '@/components/game/StatusBar'
import TeamLeft from '@/components/game/TeamLeft'
import { convertMinutesToDate } from '@/api/game'
import InfoBar from '@/components/game/InfoBar'

export default function Home({params}) {
    const docRef = doc(db, "Game", params.id)
    const [game, setGame] = useState(null);
    const [time, setTime] = useState("");
    const [day, setDay] = useState("");
    const [division, setDivision] = useState("");

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
        if(game){
            dateTimeConverter(game.DateTime);
            if(game.Division === 0){
                setDivision("Open");
            }
            if(game.Division === 1){
                setDivision("Women");
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
            <div className={styles.timeContainer}>
                <TeamLeft 
                    teamName1={game.Team1Name} 
                    score1={game.Team1Score} 
                    teamName2={game.Team2Name} 
                    score2={game.Team2Score}
                />
            </div>
            <div className={styles.timeContainer}>
                <InfoBar prompt={game.GameName}/>
                <InfoBar prompt={game.Field}/>
            </div>
            <div className={styles.timeContainer}>
                <InfoBar prompt={day + " Feb"}/>
                <InfoBar prompt={division}/>
            </div>
        </>
        }
        </main>
      )
}