'use client'

import { useState } from 'react'
import styles from './page.module.css'
import TextButton from '@/components/TextButton'
import GroupListItem from '@/components/GroupListItem';

export default function Home() {
  const [openWomen, setOpenWomen] = useState(true);

  const handleOpenButtonPress = () => {
    setOpenWomen(true);
  }

  const handleWomenButtonPress = () => {
    setOpenWomen(false);
  }
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <TextButton prompt={"OPEN"} handlePress={handleOpenButtonPress} active={openWomen}/>
        <TextButton prompt={"WOMEN"} handlePress={handleWomenButtonPress} active={!openWomen}/>
      </div>

      <div className={styles.container}>
        <GroupListItem />
        <GroupListItem />
        <GroupListItem />
        <GroupListItem />
      </div>
    </main>
  )
}