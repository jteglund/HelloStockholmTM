import { db } from "../app/firebase-config";
import { collection, getDocs, addDoc } from "firebase/firestore";

export async function createGroup(groupsCollectionRef, name, division, teamdata){
  let group = 
  {
    Name: name,
    Division: division,
    TeamData: teamdata,
    NextGame: [],
    TeamIDs: [],
    Games: [],
  }

  await addDoc(groupsCollectionRef, group);
}