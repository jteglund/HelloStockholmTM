'use client'

import styles from '../../groups/page.module.css'
import { db } from '../../firebase-config'
import { doc, getDoc, collection, query, getDocs, where, documentId} from 'firebase/firestore'
import { useState, useEffect } from 'react'
import GroupListItem from '@/components/GroupListItem'
import GameListItem from '@/components/Game'

export default function Home({params}) {
    const groupRef = doc(db, "Group", params.id);
    const gamesRef = collection(db, "Game");
    const [group, setGroup] = useState(null);
    const [games, setGames] = useState(null);
    const [gamesLive, setGamesLive] = useState(null);
    const [gamesUpcoming, setGamesUp] = useState(null);
    const [gamesPrev, setGamesPrev] = useState(null);

    useEffect(() => {
        const getGroup = async () => {
            const doc = await getDoc(groupRef);
            setGroup({...doc.data(), id: params.id});
        }
        getGroup();
    }, [])

    useEffect(() => {
        const sortGamesByDate = (game1, game2) => {
            if(game1.DateTime <= game2.DateTime){
              return -1;
            }
            else return 1;
        }

        const getGames = async () => {
            let lst = [];
            if(group){
                let gameIDs = group.Games;
                const q = query(gamesRef, where(documentId(), "in", gameIDs));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    lst.push({ ...doc.data(), id: doc.id });
                });
                lst.sort(sortGamesByDate);
                setGames(lst);
            }
        }
        getGames();
    }, [group]);

    useEffect(() => {
        
        const sortGames = () => {
            let upcoming = [];
            let live = [];
            let prev = [];

            if(games){
                console.log(games)
                for(let i in games){
                    if(games[i].Status === 0){
                        upcoming.push(games[i]);
                    }
                    if(games[i].Status === 1){
                        live.push(games[i]);
                    }
                    if(games[i].Status === 2){
                        prev.push(games[i]);
                    }
                }
                setGamesUp(upcoming);
                setGamesLive(live);
                setGamesPrev(prev);
            }
        }
        sortGames();
    }, [games])
    
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {
                    group &&
                        <GroupListItem group={group} groupsPage={false}/>
                }
                
            </div>
            <h1 className={styles.textGames}>Games</h1>
            <div className={styles.container}>
                
                {
                    gamesLive &&
                    <>
                        <h3 className={styles.textStatus}>Live</h3>
                        {gamesLive.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)}
                    </>
                }
                {
                    gamesUpcoming &&
                    <>
                        <h3 className={styles.textStatus}>Upcoming</h3>
                        {gamesUpcoming.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)}
                    </>
                }
                {
                    gamesPrev &&
                    <>
                        <h3 className={styles.textStatus}>Finished</h3>
                        {gamesPrev.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)}
                    </>
                }
            </div>
        </main>
      )
}