import {db} from '../app/firebase-config'
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp} from 'firebase/firestore'
import { getGroups } from './api';

function checkIfGameExists(listOfGames, gameName){
    for(let i in listOfGames){
        if(listOfGames[i].GameName === gameName){
            return true;
        }
    }
    return false;
}

export async function getGames(){
    const gamesCollectionRef = collection(db, "Games");
    const data = await getDocs(gamesCollectionRef);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

export async function getTeams(){
    const teamssCollectionRef = collection(db, "Teams");
    const data = await getDocs(teamssCollectionRef);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function createGame(gameName){
    //Hämta alla matcher
    const listOfGames = await getGames();

    //Kolla om gameName finns
    let gameExists = checkIfGameExists(listOfGames, gameName);
    //Lägg till dokument
    if(!gameExists){
        const gamesCollectionRef = collection(db, "Games");
        let game = {
            DateTime: Timestamp.fromDate(new Date()),
            Field: "Field X",
            GameName: gameName,
            LNextGame: [],
            Status: 0,
            Team1Name: "Team 1",
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

export function convertMinutesToDate(dateTime){
    let monthMap = {
        0: "Jan",
        1: "Feb",
        2: "Mar",
        3: "Apr",
        4: "Maj",
        5: "Jun",
        6: "Jul",
        7: "Aug",
        8: "Sep",
        9: "Okt",
        10: "Nov",
        11: "Dec"
    }
    
    const date = dateTime.toDate();
    let month = monthMap[date.getMonth()];
    let day = date.getDate().toString();
    let hour = date.getHours().toString();
    let minutes = date.getMinutes().toString();
    return [month, day.toString(), hour, minutes];
    //return hString + ":" + mString + " - " + day.toString() + " Feb";
  }

export function convertDateToMinutes(day, hour, minute){
    const originDay = 11;
    let days = parseInt(day) - originDay;

    return days*1440 + parseInt(hour)*60 + parseInt(minute);
}

export async function updateGeneral(id, gameName, dateTime, field){
    const gameRef = doc(db, "Games", id);
    await updateDoc(gameRef, {
        GameName: gameName,
        DateTime: dateTime,
        Field: field,
    })
}

export async function setPlaceholderTeamNames(id, team1name, team2name){
    const gameRef = doc(db, "Games", id);
    await updateDoc(gameRef, {
        Team1Name: team1name,
        Team2Name: team2name,
    })
}

export async function setExistingTeam(gameID, teamname, index){
    if(index < 1 || index > 2){
        return -1;
    }
    
    let teamsList = await getTeams();
    let teamIndex = -1;
    for(let i in teamsList){
        if(teamsList[i].TeamName === teamname){
            teamIndex = i;
        }
    }
    if(teamIndex === -1){
        return -1;
    }

    const gameRef = doc(db, "Games", gameID);
    const teamGameRef = collection(db, "TeamGame");
    
    const teamRef = doc(db, "Teams", teamsList[teamIndex].id)

    let teamGame = {
        GameID: gameID,
        TeamID: teamsList[teamIndex].id,
        Position: index
    }

    await addDoc(teamGameRef, teamGame);

    if(index === 1){
        //TODO: ta bort match id från lag om det redan ligger ett lag där
        
        await updateDoc(gameRef, {
            Team1Name: teamsList[teamIndex].TeamName,
        })
    }else if(index === 2){
        await updateDoc(gameRef, {
            Team2Name: teamsList[teamIndex].TeamName,
        })
    }
    return 1;
}

export async function setNextGame(gameID, gameName, wl, teamIndex){
    if(wl < 0 || wl > 1){
        return -1;
    }

    if(teamIndex < 1 || teamIndex > 3){
        return -1;
    }
    
    let id = "";
    if(teamIndex == 3){
        let groupList = await getGroups();
        let groupIndex = -1;
        for(let i in groupList){
            if(groupList[i].GroupName === gameName){
                groupIndex = i;
            }
        }
        if(groupIndex === -1){
            return -1;
        }
        id = groupList[groupIndex].id;
    }else{
        let gamesList = await getGames();
        let gameIndex = -1;
        for(let i in gamesList){
            if(gamesList[i].GameName === gameName){
                gameIndex = i;
            }
        }
        if(gameIndex === -1){
            return -1;
        }
        id = gamesList[gameIndex].id;
    }

    const gameRef = doc(db, "Games", gameID);
    if(wl === 0){
        await updateDoc(gameRef, {
            WNextGame: [id, teamIndex]
        })
    }else if(wl === 1){
        await updateDoc(gameRef, {
            LNextGame: [id, teamIndex]
        })
    }
    return 1;
}

export async function setGameReady(gameID){
    const gameRef = doc(db, "Games", gameID)
    await updateDoc(gameRef, {
        Ready: 1
    })
}