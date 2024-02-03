import {db} from '../app/firebase-config'
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc} from 'firebase/firestore'

export async function setAdvancements(groupId, advNames, advPos){
    //hämta alla matcher
    let adv = [];
    const gamesRef = collection(db, "Game");
    const data = await getDocs(gamesRef);
    let games = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    //kolla så alla namn finns
    let check = true;
    for(let i in advNames){
        let innerCheck = false
        for(let j in games){
            if(advNames[i] === games[j].GameName){
                innerCheck = true
                adv.push(games[j].id);
                break;
            }
        }
        check = check && innerCheck
    }
    
    if(!check){
        return null;
    }
    //skapa array och uppdatera
    let newNextGame = [];
    for(let i in advNames){
        newNextGame.push(adv[i])
        newNextGame.push(advPos[i])
    }
    const groupRef = doc(db, "Group", groupId);
    updateDoc(groupRef, {
        NextGame: newNextGame
    })
}