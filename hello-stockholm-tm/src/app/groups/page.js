'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import TextButton from '@/components/TextButton'
import GroupListItem from '@/components/GroupListItem';
import { db } from '../firebase-config'
import { collection, getDocs} from 'firebase/firestore'
import { createGroup } from '@/api/group';
import DivisionButton from '@/components/DivisionButton';
export default function Home() {
  const groupsCollectionRef = collection(db, "Groups");
  const groupTeamsCollectionRef = collection(db, "GroupTeams");
  const [groups, setGroups] = useState([]);
  const [openGroups, setOGroups] = useState([]);
  const [womenGroups, setWomenGroups] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);

  const [divisionFlag, setDFlag] = useState('Open');

  const setOFlag = () => {
    setDFlag("Open");
  }
  const setWFlag = () => {
    setDFlag("Women");
  }

  useEffect(() => {
    const comp = (group1, group2) => {
      if(group1[1] <= group2[1]){
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
      
      let openGroupData = [];
      let womenGroupData = [];

      for(let i in groupNames){
        let tmp = map.get(groupNames[i]);
        if(tmp[0].Division == 'Open'){
          openGroupData.push(tmp);
        }else if(tmp[0].Division == 'Women'){
          womenGroupData.push(tmp);
        }
        //groupData.push(tmp);
      }

      setOGroups(openGroupData);
      setWomenGroups(womenGroupData);
      setGroupTeams(g2);
    }
    
    getGroups();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <DivisionButton
            prompt="OPEN"
            onPressFunction={setOFlag}
          />
          
          <DivisionButton
            prompt="WOMEN"
            onPressFunction={setWFlag}
          />
        </div>
      <div className={styles.container}>
        { divisionFlag == "Open" &&
           openGroups.map((group) => <GroupListItem key={group.id} group={group} groupsPage={true}/>)
        }
        { divisionFlag == "Women" &&
          womenGroups.map((group) => <GroupListItem key={group.id} group={group} groupsPage={true}/>)
        }
      </div>
    </main>
  )
}