'use client'

import styles from './page.module.css'
import { createGame } from '@/api/game'
import { db } from '../firebase-config'
import { collection, getDocs } from 'firebase/firestore'
import { useEffect } from 'react';
import GameListItem from '../../components/Game'

export default function Home() {
  const gamesCollectionRef = collection(db, "Game");

  useEffect(() => {
    //createGame(gamesCollectionRef, "SUFC Odin", "JDomcGBk2tsSajFdRrmA", "Stenungsund", "vbFKZ8Es2Gp3zUrL7Z6j", "08:00 - 25 Feb", "Field 1", 0);
  }, [])

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <GameListItem />
      </div>
    </main>
  )
}
