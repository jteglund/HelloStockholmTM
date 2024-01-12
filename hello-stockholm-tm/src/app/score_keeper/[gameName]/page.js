'use client'

import { useEffect, useState } from 'react'
import styles from '../page.module.css'
import { db } from '../../firebase-config'
import { doc, getDoc, collection, query, getDocs, where, documentId, updateDoc} from 'firebase/firestore'
import GameListItem from '@/components/Game'
import ScoreButton from '@/components/game/ScoreButton'
import StatusButton from '@/components/game/StatusButton'

export default function Home({params}) {
    const [gameName, setGameName] = useState(params.gameName)
    const [game, setGame] = useState(null);
    const [score1, setScore1] = useState(null);
    const [score2, setScore2] = useState(null);
    const [status, setStatus] = useState(null);
    const [gamesRef, setGamesRef] = useState(collection(db, "Game"));

    useEffect(() => {
        const getGame = async () => {
            const q = query(gamesRef, where("GameName", "==", gameName));
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
    }, [gameName, gamesRef, status]);
    
    useEffect(() => {
        if(game){
            setScore1(game.Team1Score);
            setScore2(game.Team2Score);
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

    const handleStartGame = async () => {
        //Sätt status till 1
        const gameRef = doc(db, "Game", game.id);
        await updateDoc(gameRef, {Status: 1});
        setStatus(1);
    }

    const handleFinishGame = async () => {
        //Sätt status till 2
        const gameRef = doc(db, "Game", game.id);
        await updateDoc(gameRef, {Status: 2});
        setStatus(2);
    }

    return (
        <main className={styles.main}>
            <div className={styles.center}>
                { game &&
                    <div>
                        <GameListItem game={game} />
                        <div>
                        { game.Status === 1 ?
                            <>
                                <div className={styles.teamScore}>
                                    <StatusButton prompt={"Finish game"} handlePress={handleFinishGame} status={game.Status}/> 
                                </div>
                                <div className={styles.teamScore}>
                                    <ScoreButton prompt={"-"} handlePress={handleReduceScore} team={1}/>
                                    <h3 className={styles.TeamText}>{game.Team1Name}</h3>
                                    <ScoreButton prompt={"+"} handlePress={handleAddScore} team={1}/>
                                </div>
                                <div className={styles.teamScore}>
                                    <ScoreButton prompt={"-"} handlePress={handleReduceScore} team={2}/>
                                    <h3 className={styles.TeamText}>{game.Team2Name}</h3>
                                    <ScoreButton prompt={"+"} handlePress={handleAddScore} team={2}/>
                                </div>
                            </>
                            :
                            <StatusButton prompt={"Start game"} handlePress={handleStartGame} status={game.Status}/> 
                        }
                        </div>
                    </div>
                }
                
            </div>
        </main>
  )
}