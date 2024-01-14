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
              <h3>Groups</h3>
            </div>
          }
        </main>
  )
}