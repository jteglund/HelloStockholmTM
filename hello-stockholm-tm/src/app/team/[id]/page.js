'use client'

import styles from '../../page.module.css'
import { db } from '../../firebase-config'
import { doc, getDoc, collection, query, getDocs, where, documentId} from 'firebase/firestore'
import { useState, useEffect } from 'react'
import Stats from '@/components/team/Stats'
import GroupListItem from '@/components/GroupListItem'
import GameListItem from '@/components/Game'

export default function Home({params}) {
    const teamRef = doc(db, "Team", params.id);
    const [team, setTeam] = useState(null);
    const [groups, setGroups] = useState(null);
    const [games, setGames] = useState(null);
    const [gUp, setGUp] = useState(null);
    const [gLive, setGLive] = useState(null);
    const [gPrev, setGPrev] = useState(null);

    useEffect(() => {
        const getTeam = async () => {
            const doc = await getDoc(teamRef);
            setTeam({...doc.data(), id: params.id});
        }
        getTeam();
    }, [])

    useEffect(() => {
        const getGroup = async () => {
            let lst = [];
            if(team){
                const groupsRef = collection(db, "Group");
                let groupIDs = team.GroupID;
                const q = query(groupsRef, where(documentId(), "in", groupIDs));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    lst.push({ ...doc.data(), id: doc.id });
                });
                setGroups(lst);
            }
        }

        const sortGamesByDate = (game1, game2) => {
            if(game1.DateTime <= game2.DateTime){
              return -1;
            }
            else return 1;
        }

        const getGames = async () => {
            let lst = [];
            let upcoming = [];
            let live = [];
            let prev = [];

            if(team){
                const gamesRef = collection(db, "Game");
                let gameIDs = team.gameIDs;
                const q = query(gamesRef, where(documentId(), "in", gameIDs));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    lst.push({ ...doc.data(), id: doc.id });
                });
                lst.sort(sortGamesByDate)
                for(let i in lst){
                    if(lst[i].Status === 0){
                        upcoming.push(lst[i]);
                    }
                    if(lst[i].Status === 1){
                        live.push(lst[i]);
                    }
                    if(lst[i].Status === 2){
                        prev.push(lst[i]);
                    }
                }
                setGUp(upcoming);
                setGLive(live);
                setGPrev(prev);
            }
        }
        getGroup();
        getGames();
    }, [team])

    return (
        <main className={styles.main}>
            <div className={styles.center}>
                { team &&
                    <h1 className={styles.textTeam}>{team.Name}</h1>
                }
            </div>
            { groups &&
                <div className={styles.container}>
                    {groups.map((group) => 
                        <GroupListItem key={group.id} group={group} groupsPage={true}/>)
                    }
                </div>
            }
            <h1 className={styles.text}>Games</h1>
            {  gLive &&
                    <div className={styles.container}>
                        <h4 className={styles.textStatus}>Live</h4>
                        {gLive.map((game) => 
                            <GameListItem key={game.id} game={game} clickable={true}/>)
                        }
                    </div> 
            }
            
            {  gUp &&
                    <div className={styles.container}>
                        <h4 className={styles.textStatus}>Upcoming</h4>
                        {gUp.map((game) => 
                            <GameListItem key={game.id} game={game} clickable={true}/>)
                        }
                    </div> 
            }
            
            {  gPrev &&
                    <div className={styles.container}>
                        <h4 className={styles.textStatus}>Finished</h4>
                        {gPrev.map((game) => 
                            <GameListItem key={game.id} game={game} clickable={true}/>)
                        }
                    </div> 
            }
        </main>
    )
}