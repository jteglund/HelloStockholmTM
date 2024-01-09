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

    useEffect(() => {
        const getGroup = async () => {
            const doc = await getDoc(groupRef);
            setGroup({...doc.data(), id: params.id});
        }
        getGroup();
    }, [])

    useEffect(() => {
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
                setGames(lst);
            }
        }
        getGames();
    }, [group]);
    
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {
                    group &&
                        <GroupListItem group={group}/>
                }
                
            </div>
            <div className={styles.container}>
                {
                    games &&
                        games.map((game) => <GameListItem key={game.id} game={game} />)
                }
            </div>
        </main>
      )
}