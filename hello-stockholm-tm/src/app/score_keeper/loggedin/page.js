'use client'

import { useState } from 'react'
import styles from '../page.module.css'
import Link from 'next/link'
import {auth} from '../../firebase-config'
import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Score() {
    const [gameName, setGameName] = useState("")
    const [URL, setUrl] = useState("");
    const [loggedin, setLoggedin] = useState(false);
    const router = useRouter();

    const generateUrl = (event) =>{
        let url = '/score_keeper/loggedin/'
        setGameName(event.target.value);
        setUrl(url + event.target.value);
    }

    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
              const uid = user.uid;
              setLoggedin(true)
            } else {
              setLoggedin(false);
              router.push('/score_keeper');
            }
          });
         
    }, [])

    return (
        <main className={styles.main}>
            <div className={styles.center}>
                { loggedin &&
                    <>
                        <input value={gameName} onChange={generateUrl} className={styles.input} placeholder='Enter game name'></input>
                        <Link href={URL}>
                            <div className={styles.enterButton}>Enter</div>
                        </Link>
                    </>
                }
            </div>
        </main>
  )
}