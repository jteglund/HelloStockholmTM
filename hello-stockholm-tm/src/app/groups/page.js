'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import TextButton from '@/components/TextButton'
import GroupListItem from '@/components/GroupListItem';
import { db } from '../firebase-config'
import { collection, getDocs} from 'firebase/firestore'
import { createGroup } from '@/api/group';

export default function Home() {
  const groupsCollectionRef = collection(db, "Group");
  const [openWomen, setOpenWomen] = useState(true);
  const [groups, setGroups] = useState([]);
  const [openGroups, setOpenGroups] = useState([]);
  const [womenGroups, setWomenGroups] = useState([]);

  const handleOpenButtonPress = () => {
    setOpenWomen(true);
  }

  const handleWomenButtonPress = () => {
    setOpenWomen(false);
  }

  //TODO Ta bort }:-(
  const temp = () => {
    let name = "OB";
    let division = 0;
    let teamdata = ["SUFC Odin", "3", "3", "0", "+24", "9","KFUM Örebro", "3", "2", "1", "+13", "6","Stendungsund", "3", "2", "1", "+11", "6","La Bamba", "3", "0", "3", "-8", "0"]
    createGroup(groupsCollectionRef, name, division, teamdata);
  }

  useEffect(() => {
    const comp = (group1, group2) => {
      if(group1.Name[1] <= group2.Name[1]){
        return -1;
      } else {
        return 1;
      }
    }
    const getGroups = async () => {
      const data = await getDocs(groupsCollectionRef);
      let g = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      g.sort(comp);
      setGroups(g);
    }
    
    getGroups();
  }, []);

  useEffect(() => {
    const splitDivision = (groups) => {
      let o = [];
      let w = [];
      for(let i in groups){
        if(groups[i].Division === 0){
          o.push(groups[i]);
        } else if(groups[i].Division === 1){
          w.push(groups[i]);
        }
      }
      setOpenGroups(o);
      setWomenGroups(w);
    }
    splitDivision(groups);
  }, [groups])

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <TextButton prompt={"OPEN"} handlePress={handleOpenButtonPress} active={openWomen}/>
        <TextButton prompt={"WOMEN"} handlePress={handleWomenButtonPress} active={!openWomen}/>
      </div>

      <div className={styles.container}>
        { openWomen 
          ? openGroups.map((group) => <GroupListItem key={group.id} group={group} groupsPage={true}/>)
          : womenGroups.map((group) => <GroupListItem key={group.id} group={group} groupsPage={true}/>) 
        }
      </div>
    </main>
  )
}