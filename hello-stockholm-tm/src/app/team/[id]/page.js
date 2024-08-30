'use client'

import styles from '../../page.module.css'
import { db } from '../../firebase-config'
import { doc, getDoc, collection, query, getDocs, where, documentId} from 'firebase/firestore'
import { useState, useEffect } from 'react'
import Stats from '@/components/team/Stats'
import GroupListItem from '@/components/GroupListItem'
import GameListItem from '@/components/Game'

export default function Home({params}) {
    const teamRef = doc(db, "Teams", params.id);
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
            let groupList = [];
            if(team){
                const groupsRef = collection(db, "GroupTeams");
                const querySnapshot = await getDocs(groupsRef);

                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    lst.push({ ...doc.data(), id: doc.id });
                });
                
                let groupID = "";
                for(let i in lst){
                    if(lst[i].TeamID == team.id){
                        groupID = lst[i].GroupID;
                        break;
                    }
                }

                for(let i in lst){
                    if(lst[i].GroupID == groupID){
                        groupList.push(lst[i]);
                    }
                }
                setGroups(groupList);
            }
        }

        const sortGamesByDate = (game1, game2) => {
            if(game1.DateTime <= game2.DateTime){
              return -1;
            }
            else return 1;
        }

        const getGames = async () => {
            let teamGame = [];
            let lst = [];
            let upcoming = [];
            let live = [];
            let prev = [];

            if(team){
                const teamGameRef = collection(db, "TeamGame");
                const q = query(teamGameRef, where("TeamID", "==", team.id));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    teamGame.push(doc.data().GameID);
                });
                
                const gameRef = collection(db, "Games");
                const q2 = query(gameRef, where(documentId(), "in", teamGame));
                const querySnapshot2 = await getDocs(q2);
                querySnapshot2.forEach((doc) => {
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
                    <h1 className={styles.textTeam}>{team.TeamName}</h1>
                }
            </div>
            { groups &&
                <div className={styles.container}>
                    <GroupListItem key={groups[0].id} group={groups} groupsPage={true}/>
                    
                </div>
            }
            <h1 className={styles.text}>Matcher</h1>
            {  gLive &&
                    <div className={styles.container}>
                        <h4 className={styles.textStatus}>Spelas nu</h4>
                        {gLive.map((game) => 
                            <GameListItem key={game.id} game={game} clickable={true}/>)
                        }
                    </div> 
            }
            
            {  gUp &&
                    <div className={styles.container}>
                        <h4 className={styles.textStatus}>Framtida</h4>
                        {gUp.map((game) => 
                            <GameListItem key={game.id} game={game} clickable={true}/>)
                        }
                    </div> 
            }
            
            {  gPrev &&
                    <div className={styles.container}>
                        <h4 className={styles.textStatus}>Färdig</h4>
                        {gPrev.map((game) => 
                            <GameListItem key={game.id} game={game} clickable={true}/>)
                        }
                    </div> 
            }
        </main>
    )
}