'use client'

import styles from './page.module.css'
import { createGame } from '@/api/game'
import { db } from '../firebase-config'
import { collection, getDocs } from 'firebase/firestore'
import { useEffect, useState } from 'react';
import GameListItem from '../../components/Game'
import TextButton from '@/components/TextButton'

export default function Home() {
  const gamesCollectionRef = collection(db, "Games");
  const [games, setGames] = useState([]);
  const [gamesUpcoming, setGamesUpcoming] = useState([]);
  const [gamesLive, setGamesLive] = useState([]);
  const [gamesPrev, setGamesPrev] = useState([]);

  const [filter, setFilter] = useState("LiveUpcomming");


  const sortGamesByDate = (game1, game2) => {
    if(game1.DateTime.toDate() <= game2.DateTime.toDate()){
      return -1;
    }
    else return 1;
  }
  
  const setGamesByType = () => {
    let upcoming = [];
    let live = [];
    let prev = [];

    for(let g in games){
      if(games[g].Status === 0){
        upcoming.push(games[g])
      }
      if(games[g].Status === 1){
        live.push(games[g])
      }
      if(games[g].Status === 2){
        prev.push(games[g])
      }
    
    }
    setGamesUpcoming(upcoming);
    setGamesLive(live);
    setGamesPrev(prev);
  }

  useEffect(() => {
    //createGame(gamesCollectionRef, "TEST3", "aqKio94NNAmTmrLqnbW0", "TEST4", "vbFKZ8Es2Gp3zUrL7Z6j", "15:00 - 23 Feb", "Field 1", 1, "OA3");
    
    const getGames = async () => {
      const data = await getDocs(gamesCollectionRef);
      let sortedGames = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      sortedGames.sort(sortGamesByDate);
      setGames(sortedGames);
    }
    
    getGames();
  }, [])

  useEffect(()=> {
    setGamesByType(games)
  }, [games])
  
  return (
    <main className={styles.main}>
      
      <div className={styles.gameListContainer}>
        <select className={styles.filter} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="LiveUpcomming">Live / Kommande</option>
          <option value="Previous">Resultat</option>
        </select>
        { filter === "LiveUpcomming"
            ? 
            <>
            { gamesLive.length != 0 &&
              <>
                <h3 className={styles.typeText}>Live</h3>
                {gamesLive.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)}
              </>
            }
            { gamesUpcoming.length != 0 &&
              <>
                <h3 className={styles.typeText}>Framtida matcher</h3>
                {gamesUpcoming.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)}
              </>
            }
              </>
            :
              gamesPrev.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)
        }
      </div>
    </main>
  )
}
