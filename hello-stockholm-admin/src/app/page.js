'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import Link from 'next/link'
import { auth } from './firebase-config'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export default function Home() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const updateEmail = (event) =>{
        setEmail(event.target.value);
    }

    const updatePassword = (event) => {
        setPassword(event.target.value);
    }

    const login = () => {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            router.push('/loggedin')
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
    }

    return (
        <main className={styles.main}>
            <div className={styles.center}>
                <input value={email} onChange={updateEmail} className={styles.input} placeholder='Enter email'></input>
                <input value={password} onChange={updatePassword} className={styles.input} placeholder='Enter password'></input>
                <div className={styles.enterButton} onClick={login}>Log in</div>
            </div>
        </main>
  )
}