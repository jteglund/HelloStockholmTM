'use client'

import styles from '../page.module.css'
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase-config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
    const [loggedin, setLoggedin] = useState(false);
    const router = useRouter();

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
              <div className={styles.center}>
                <Link href={"/teams"}>
                  <div className={styles.enterButton}>Manage Teams</div>
                </Link>
              </div>
              <div className={styles.center}>
                <Link href={"/groups"}>
                <div className={styles.enterButton}>Manage Groups</div>
                </Link>
              </div>
              <div className={styles.center}>
                <Link href={"/games"}>
                <div className={styles.enterButton}>Manage Games</div>
                </Link>
              </div>
            </div>
          }
        </main>
  )
}