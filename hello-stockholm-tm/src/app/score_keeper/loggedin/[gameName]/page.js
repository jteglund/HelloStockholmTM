'use client'

import { useEffect, useState } from 'react'
import styles from '../../page.module.css'
import { db } from '../../../firebase-config'
import { doc, getDoc, collection, query, getDocs, where, documentId, updateDoc} from 'firebase/firestore'
import GameListItem from '@/components/Game'
import ScoreButton from '@/components/game/ScoreButton'
import StatusButton from '@/components/game/StatusButton'
import FinishGamePopup from '@/components/game/FinishGamePopup'
import {auth} from '../../../firebase-config'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { finishGame } from '@/api/game'

export default function Home({params}) {
    const [gameName, setGameName] = useState(params.gameName)
    const [game, setGame] = useState(null);
    const [score1, setScore1] = useState(null);
    const [score2, setScore2] = useState(null);
    const [status, setStatus] = useState(null);
    const [gamesRef, setGamesRef] = useState(collection(db, "Game"));
    const [goal, setGoal] = useState(0);
    const [popup, setPopup] = useState(0);
    const [loggedin, setLoggedin] = useState(false);
    const [tieError, setTieError] = useState(0);

    const router = useRouter();
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
    }, [gameName, gamesRef, status, goal]);
    
    useEffect(() => {
        if(game){
            setScore1(game.Team1Score);
            setScore2(game.Team2Score);
        }
    }, [game])

    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
              const uid = user.uid;
              setLoggedin(true)
            } else {
              setLoggedin(false);
              router.push('/score_keeper');
            }
          });
         
    }, [])

    const handleAddScore = async (team) => {
        const gameRef = doc(db, "Game", game.id);

        if(team === 1){
            await updateDoc(gameRef, {Team1Score: score1+1});
            setGoal(goal+1);
        }
        if(team === 2){
            await updateDoc(gameRef, {Team2Score: score2+1});
            setGoal(goal+2);
        }
    }

    const handleReduceScore = async (team) => {
        const gameRef = doc(db, "Game", game.id);
        if(team === 1){
            if(score1 > 0){
                await updateDoc(gameRef, {Team1Score: score1-1});
                setGoal(goal+3);
            }
        }
        if(team === 2){
            if(score2 > 0){
                await updateDoc(gameRef, {Team2Score: score2-1});
                setGoal(goal+4);
            }
        }
    }

    const handleStartGame = async () => {
        //Kolla så att matchen har lag!!!
        if(game.Team1ID != "" && game.Team2ID != ""){
            //Sätt status till 1
            const gameRef = doc(db, "Game", game.id);
            await updateDoc(gameRef, {Status: 1});
            setStatus(1);
        }
    }

    const handleFinishGame = async () => {
        if(game.Team1Score != game.Team2Score){
            //TODO: KAN GE ERROR FÖR BRACKET MATCHEr
            const gameRef = doc(db, "Game", game.id);
            await updateDoc(gameRef, {Status: 2});
            await finishGame(game);
            setStatus(2);
            setPopup(0);
        }
    }

    const test = () => {
        finishGame(game);
    }

    const openPopup = () => {
        if(game.Team1Score != game.Team2Score){
            setPopup(1);
            setTieError(0);
        }else{
            setTieError(1);
        }
    }

    const closePopup = () => {
        setPopup(0);
    }

    return (
        <main className={styles.main}>
            <div className={styles.center}>
                { game && popup === 0 &&
                    <div>
                        <GameListItem game={game} />
                        <div>
                        { game.Status === 1 ?
                            <>
                                <div className={styles.teamScore}>
                                    <StatusButton prompt={"Finish game"} handlePress={openPopup} status={game.Status}/> 
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
                                { game && tieError === 1 &&
                                    <h4>ERROR: You cannot end a game as a tie</h4>
                                }
                            </>
                            :
                            <StatusButton prompt={"Start game"} handlePress={handleStartGame} status={game.Status}/> 
                        }
                        </div>
                    </div>
                }
                { game && popup === 1 &&
                    <FinishGamePopup game={game} handleReturn={closePopup} handleSave={handleFinishGame}/>
                }
                
                
            </div>
        </main>
  )
}