import styles from '../page.module.css'
import { createGame } from '@/api/game'
import { db } from './firebase-config'
import { collection, getDocs } from 'firebase/firestore'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <text>SCHEDULE</text>
      </div>
    </main>
  )
}
