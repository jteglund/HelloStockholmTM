'use client'

import styles from '../../page.module.css'
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createGame } from '@/api/gameAPI';

export default function Home() {
    const [loggedin, setLoggedin] = useState(false);
    const [gameName, setGameName] = useState("");
    const [division, setDivision] = useState("0");
    const [errorMessage, setErrorMessage] = useState(0);
    const [successMessage, setSuccess] = useState(0);
    const router = useRouter();

    const updateGameName = (event) => {
      setGameName(event.target.value);
    }


    const create = () =>{
      let status = createGame(gameName, parseInt(division));
      if(status === -1){
        setErrorMessage(1);
        setSuccess(0);
      }else{
        setErrorMessage(0);
        setSuccess(1);
      }
    }

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
          { loggedin &&
            <div className={styles.centerVert}>
            <h2>Create Game</h2>
            <div className={styles.center}>
              <Link href={"/games"}>
                <div className={styles.enterButton}>Go back</div>
              </Link>
            </div>
            <div className={styles.center2}> 
              <h3>Game name: </h3>
              <input value={gameName} onChange={updateGameName} className={styles.input} placeholder='Enter game name'></input>
            </div>
            <div className={styles.center2}> 
              <h3>Division:</h3>
              <select 
                value={division}
                onChange={e => setDivision(e.target.value)}
                className={styles.select}
              >
                <option value="0">Open</option>
                <option value="1">Women</option>
              </select>
            </div>
            <div className={styles.center}>
              <div className={styles.createButton} onClick={create}>Create game</div>
            </div>
            { errorMessage === 1 &&
              <h3>ERROR: Game already exists</h3>
            }
            { successMessage === 1 &&
              <h3>Added game to database</h3>
            }
          </div>
          }
        </main>
  )
}