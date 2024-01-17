import {db} from '../app/firebase-config'
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc} from 'firebase/firestore'

function checkIfGameExists(listOfGames, gameName){
    for(let i in listOfGames){
        if(listOfGames[i].GameName === gameName){
            return true;
        }
    }
    return false;
}

async function getGames(){
    const gamesCollectionRef = collection(db, "Game");
    const data = await getDocs(gamesCollectionRef);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

export async function createGame(gameName, division){
    //Hämta alla matcher
    const listOfGames = await getGames();

    //Kolla om gameName finns
    let gameExists = checkIfGameExists(listOfGames, gameName);
    //Lägg till dokument
    if(!gameExists){
        const gamesCollectionRef = collection(db, "Game");
        let game = {
            DateTime: 0,
            Division: division,
            Field: "Field X",
            GameName: gameName,
            LNextGame: [],
            Status: 0,
            Team1ID: "",
            Team1Name: "Team 1",
            Team2ID: "",
            Team1Score: 0,
            Team2Name: "Team 2",
            Team2Score: 0,
            WNextGame: [],
            Type: 1,
            Ready: 0
        }
         
        //Lägg till matchID i lagobjekt
        let id = await addDoc(gamesCollectionRef, game);
        return id.id;
    }
    // -1 = Game exists error
    return -1;
}