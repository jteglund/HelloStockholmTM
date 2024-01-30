'use client'

import styles from '../../page.module.css'
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createGame, getGames } from '@/api/gameAPI';

function Game({game, ready}) {
    const url = '/games/edit/' + game.id;

    return(
        <Link href={url}>
            <div className={ready ? styles.gameReady : styles.game}>{game.GameName}</div>
        </Link>
    )
}

export default function Home() {
    const [loggedin, setLoggedin] = useState(false);
    const [games, setGames] = useState(null);
    const [completedGames, setCGames] = useState(null);
    const [uncompletedGames, setUncompleted] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const getAllGames = async () => {
            let lst = await getGames();
            setGames(lst);
        }
        getAllGames();
    }, []);

    useEffect(() => {
        const sortGames = (lst) => {
            let uncompleted = [];
            let completed = [];

            for(let i in lst){
                if(lst[i].Ready === 0){
                    uncompleted.push(lst[i]);
                }else if(lst[i].Ready === 1){
                    completed.push(lst[i]);
                }
            }
            setCGames(completed);
            setUncompleted(uncompleted);
        }
        sortGames(games);
    }, [games])

    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
              const uid = user.uid;
              setLoggedin(true)
            } else {
              setLoggedin(false);
              router.push('/');
            }
          });
         
    }, [])

    return (
        <main className={styles.main}>
            <div className={styles.center}>
              <Link href={"/games"}>
                <div className={styles.enterButton}>Go back</div>
              </Link>
            </div>
          { loggedin && uncompletedGames && completedGames &&
            <div className={styles.centerVert}>
                <h2>Uncompleted games: </h2>
                {uncompletedGames.map((game) => <Game key={game.id} game={game} ready={false}/>)}
                <h2>Completed games: </h2>
                {completedGames.map((game) => <Game key={game.id} game={game} ready={true}/>)} 
            </div>
          }
        </main>
  )
}