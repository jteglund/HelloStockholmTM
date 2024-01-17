'use client'

import styles from '../../../page.module.css'
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase-config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home({params}) {
    const [loggedin, setLoggedin] = useState(false);
    const [game, setGame] = useState(null);
    const router = useRouter();
    console.log(params.id)

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
            
            </div>
          }
        </main>
  )
}