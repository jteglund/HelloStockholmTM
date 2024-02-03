import { db } from "../app/firebase-config";
import { collection, getDocs, addDoc } from "firebase/firestore";

export async function createTeam(teamsCollectionRef, name, division){
  let team = 
  {
    Name: name,
    WinsGroup: 0,
    LossesGroup: 0,
    GoalsScoredGroup: 0,
    GoalsConcededGroup: 0,
    WinsTotal: 0,
    LossesTotal: 0,
    GoalsScoredTotal: 0,
    GoalsConcededTotal: 0,
    GroupID: [],
    Division: division,
  }

  await addDoc(teamsCollectionRef, team);
}