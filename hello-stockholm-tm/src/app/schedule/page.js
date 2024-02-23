'use client'

import styles from './page.module.css'
import { createGame } from '@/api/game'
import { db } from '../firebase-config'
import { collection, getDocs } from 'firebase/firestore'
import { useEffect, useState } from 'react';
import GameListItem from '../../components/Game'
import TextButton from '@/components/TextButton'

export default function Home() {
  const gamesCollectionRef = collection(db, "Game");
  const [games, setGames] = useState([]);
  const [openGames, setOpenGames] = useState([]);
  const [womenGames, setWomenGames] = useState([]);
  const [openGamesUpcoming, setOpenGamesUpcoming] = useState([]);
  const [openGamesLive, setOpenGamesLive] = useState([]);
  const [openGamesPrev, setOpenGamesPrev] = useState([]);
  const [womenGamesUpcoming, setWomenGamesUpcoming] = useState([]);
  const [womenGamesLive, setWomenGamesLive] = useState([]);
  const [womenGamesPrev, setWomenGamesPrev] = useState([]);

  const [openWomen, setOpenWomen] = useState(true);
  const [filter, setFilter] = useState("Upcoming");

  const handleOpenButtonPress = () => {
    setOpenWomen(true);
  }
  const handleWomenButtonPress = () => {
    setOpenWomen(false);
  }
  

  const sortGamesByDate = (game1, game2) => {
    if(game1.DateTime <= game2.DateTime){
      return -1;
    }
    else return 1;
  }
  
  const setOpenWomenGames = () => {
    let openUp = [];
    let openLive = [];
    let openPrev = [];

    let womenUp = [];
    let womenLive = [];
    let womenPrev = [];

    for(let g in games){
      if(games[g].Division === 0){
        if(games[g].Status === 0){
          openUp.push(games[g])
        }
        if(games[g].Status === 1){
          openLive.push(games[g])
        }
        if(games[g].Status === 2){
          openPrev.push(games[g])
        }
      }else if (games[g].Division === 1){
        if(games[g].Status === 0){
          womenUp.push(games[g])
        }
        if(games[g].Status === 1){
          womenLive.push(games[g])
        }
        if(games[g].Status === 2){
          womenPrev.push(games[g])
        }
      }
    }
    setOpenGamesUpcoming(openUp);
    setOpenGamesLive(openLive);
    setOpenGamesPrev(openPrev);

    setWomenGamesUpcoming(womenUp);
    setWomenGamesLive(womenLive);
    setWomenGamesPrev(womenPrev);
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
    setOpenWomenGames(games)
  }, [games])
  
  return (
    <main className={styles.main}>
      <div className={styles.center} style={{paddingBottom: "20px"}}>
        <iframe width="360" 
        height="200" 
        src="https://www.youtube.com/embed/videoseries?si=1j456eLMElDHX2KC&amp;list=PLl4jul1hSIE61QYOGNs_6hJk-xWinTqaB" 
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; allowfullscreen">
          
        </iframe>

      </div>
      <div className={styles.center}>
        <TextButton prompt={"OPEN"} handlePress={handleOpenButtonPress} active={openWomen}/>
        <TextButton prompt={"WOMEN"} handlePress={handleWomenButtonPress} active={!openWomen}/>
      </div>
      <div className={styles.gameListContainer}>
        <select className={styles.filter} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="Upcoming">Upcoming games</option>
          <option value="Live">Live games</option>
          <option value="Previous">Previous games</option>
        </select>
        { openWomen && filter === "Upcoming"
            ? openGamesUpcoming.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)
            : openWomen && filter === "Live"
            ? openGamesLive.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>) 
            : openWomen && filter === "Previous" 
            ? openGamesPrev.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)
            : !openWomen && filter === "Upcoming"
            ? womenGamesUpcoming.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)
            : !openWomen && filter === "Live"
            ? womenGamesLive.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>) 
            : womenGamesPrev.map((game) => <GameListItem key={game.id} game={game} clickable={true}/>)
        }
      </div>
    </main>
  )
}
