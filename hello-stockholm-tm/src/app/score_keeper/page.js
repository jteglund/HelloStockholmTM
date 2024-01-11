'use client'

import { useState } from 'react'
import styles from './page.module.css'
import Link from 'next/link'

export default function Home() {
    const [gameName, setGameName] = useState("")
    const [URL, setUrl] = useState("");

    const generateUrl = (event) =>{
        let url = '/score_keeper/'
        setGameName(event.target.value);
        setUrl(url + event.target.value);
    }

    return (
        <main className={styles.main}>
            <div className={styles.center}>
                <input value={gameName} onChange={generateUrl} className={styles.input} placeholder='Enter game name'></input>
                <Link href={URL}>
                    <div className={styles.enterButton}>Enter</div>
                </Link>
            </div>
        </main>
  )
}