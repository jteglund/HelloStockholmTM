'use client'

import styles from '../../groups/page.module.css'
import { db } from '../../firebase-config'
import { doc, getDoc, collection, query, getDocs, where, documentId} from 'firebase/firestore'
import { useState, useEffect } from 'react'
import GroupListItem from '@/components/GroupListItem'
import GameListItem from '@/components/Game'

export default function Home({params}) {
    const groupRef = doc(db, "Groups", params.id);
    const gamesRef = collection(db, "Games");
    const groupID = params.id;

    const [groupData, setGroupData] = useState(null);
    const [gameIDs, setGameIDs] = useState([]);
    const [games, setGames] = useState(null);
    const [gamesLive, setGamesLive] = useState(null);
    const [gamesUpcoming, setGamesUp] = useState(null);
    const [gamesPrev, setGamesPrev] = useState(null);

    useEffect(() => {
        const getGameIDs = async () => {
            const doc = await getDoc(groupRef);
            setGameIDs(doc.data().GameIDs);
        }

        const getGroupData = async () => {
            const q = query(collection(db, "GroupTeams"), where("GroupID", "==", groupID));

            const querySnapshot = await getDocs(q);
            let data = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                data.push({...doc.data(), id: doc.id});
            });
            setGroupData(data);
        }

        getGameIDs();
        getGroupData();
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
            if(gameIDs.length != 0){
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
    }, [gameIDs]);

    useEffect(() => {
        
        const sortGames = () => {
            let upcoming = [];
            let live = [];
            let prev = [];

            if(games){
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
                    groupData &&
                        <GroupListItem group={groupData} groupsPage={false}/>
                }
                
            </div>
            <h1 className={styles.textGames}>Matcher</h1>
            <div className={styles.container}>
                
                {
                    gamesLive &&
                    <>
                        <h3 className={styles.textStatus}>Spelas nu</h3>
                        {gamesLive.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)}
                    </>
                }
                {
                    gamesUpcoming &&
                    <>
                        <h3 className={styles.textStatus}>Framtida</h3>
                        {gamesUpcoming.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)}
                    </>
                }
                {
                    gamesPrev &&
                    <>
                        <h3 className={styles.textStatus}>Färdigspelade</h3>
                        {gamesPrev.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)}
                    </>
                }
            </div>
        </main>
      )
}