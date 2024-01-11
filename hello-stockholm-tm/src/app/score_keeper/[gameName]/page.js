'use client'

import { useEffect, useState } from 'react'
import styles from '../page.module.css'
import { db } from '../../firebase-config'
import { doc, getDoc, collection, query, getDocs, where, documentId} from 'firebase/firestore'
import GameListItem from '@/components/Game'
import ScoreButton from '@/components/game/ScoreButton'

export default function Home({params}) {
    const [game, setGame] = useState(null);
    const [score1, setScore1] = useState(null);
    const [score2, setScore2] = useState(null);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const getGame = async () => {
            const gamesRef = collection(db, "Game");
            const q = query(gamesRef, where("GameName", "==", params.gameName));
            const querySnapshot = await getDocs(q);
            let lst = [];

            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                lst.push({ ...doc.data(), id: doc.id });
                console.log("HEJ")
            });
            setGame(lst[0]);
        }
        getGame();
    }, []);
    
    useEffect(() => {
        if(game){
            setScore1(game.Team1Score);
            setScore2(game.Team2Score);
            setStatus(game.Status);
        }
    }, [game])

    const handleAddScore = (team) => {
        if(team === 1){
            setScore1(score1+1);
        }
        if(team === 2){
            setScore2(score2+1);
        }
    }

    const handleReduceScore = (team) => {
        if(team === 1){
            if(score1 > 0){
                setScore1(score1-1);
            }
        }
        if(team === 2){
            if(score2 > 0){
                setScore2(score2-1);
            }
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.center}>
                { game &&
                    <div>
                        <GameListItem game={game} />
                        <div className={styles.center}>
                            <ScoreButton prompt={"-"} handlePress={handleReduceScore} team={1}/>
                            <h3 className={styles.TeamText}>{game.Team1Name}</h3>
                            <ScoreButton prompt={"+"} handlePress={handleAddScore} team={1}/>
                            <h3>{score1}</h3>
                        </div>
                        <div className={styles.center}>
                            <ScoreButton prompt={"-"} handlePress={handleReduceScore} team={2}/>
                            <h3 className={styles.TeamText}>{game.Team2Name}</h3>
                            <ScoreButton prompt={"+"} handlePress={handleAddScore} team={2}/>
                            <h3>{score2}</h3>
                        </div>
                    </div>
                }
            </div>
        </main>
  )
}