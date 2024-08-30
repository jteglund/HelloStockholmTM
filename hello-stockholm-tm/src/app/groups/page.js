'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import TextButton from '@/components/TextButton'
import GroupListItem from '@/components/GroupListItem';
import { db } from '../firebase-config'
import { collection, getDocs} from 'firebase/firestore'
import { createGroup } from '@/api/group';

export default function Home() {
  const groupsCollectionRef = collection(db, "Groups");
  const groupTeamsCollectionRef = collection(db, "GroupTeams");
  const [groups, setGroups] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);


  useEffect(() => {
    const comp = (group1, group2) => {
      if(group1[0] <= group2[0]){
        return -1;
      } else {
        return 1;
      }
    }
    const getGroups = async () => {
      const gtdata = await getDocs(groupTeamsCollectionRef);
      let g2 = gtdata.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      
      let map = new Map();
      let groupNames = [];

      for(let i in g2){
        //Kolla om den här gruppen har en lista
        if(map.has(g2[i].GroupName)){
          //Lägg till GD i listan om den finns
          let tmp = map.get(g2[i].GroupName);
          tmp.push(g2[i]);
          map.set(g2[i].GroupName, tmp);
        }else{
          //Skapa
          map.set(g2[i].GroupName, [g2[i]]);
          groupNames.push(g2[i].GroupName);
        }
      }
      
      groupNames.sort(comp);

      let groupData = [];
      for(let i in groupNames){
        let tmp = map.get(groupNames[i]);
        groupData.push(tmp);
      }

      setGroups(groupData);
      setGroupTeams(g2);
    }
    
    getGroups();
  }, []);

  return (
    <main className={styles.main}>
      

      <div className={styles.container}>
        { 
           groups.map((group) => <GroupListItem key={group.id} group={group} groupsPage={true}/>)
        }
      </div>
    </main>
  )
}