import {db} from '../app/firebase-config'
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where} from 'firebase/firestore'

function checkIfGameExists(listOfGames, gameName){
    for(let i in listOfGames){
        if(listOfGames[i].GameName === gameName){
            return true;
        }
    }
    return false;
}

async function getGames(){
    const gamesCollectionRef = collection(db, "Games");
    const data = await getDocs(gamesCollectionRef);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

export async function getGroups(){
    const groupCollectionRef = collection(db, "Group");
    const data = await getDocs(groupCollectionRef);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}
//KLAR
export async function createAndAddGame(gameName, team1ID, team2ID, team1Name, team2Name){
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
            Team1Name: team1Name,
            Team1Score: 0,
            Team2Name: team2Name,
            Team2Score: 0,
            WNextGame: [],
            Type: 0,
            Ready: 0
        }
         
        //Lägg till matchID i lagobjekt
        let id = await addDoc(gamesCollectionRef, game)

        let teamGame1 = {
            TeamID: team1ID,
            GameID: id.id,
            TeamPosition: 1,
        }

        let teamGame2 = {
            TeamID: team2ID,
            GameID: id.id,
            TeamPosition: 2,
        }

        const teamGameRef = collection(db, "TeamGame");
        await addDoc(teamGameRef, teamGame1);
        await addDoc(teamGameRef, teamGame2);

        return id;
    }
    // -1 = Game exists error
    return -1;
}

async function createTemplateGame(gameName, division, team1Name, team2Name){
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
            Team1Name: team1Name,
            Team2ID: "",
            Team1Score: 0,
            Team2Name: team2Name,
            Team2Score: 0,
            WNextGame: [],
            Type: 0,
            Ready: 0
        }
         
        //Lägg till matchID i lagobjekt
        let id = await addDoc(gamesCollectionRef, game)

        return id;
    }
    // -1 = Game exists error
    return -1;
}

async function generateTemplateGroupGames(groupID, groupName, division, teamData, groupGames){
    let gameIDs = [];
    let count = 1;
    for(let i = 0; i < teamData.length/6; i++){
        for(let j = i+1; j < teamData.length/6; j++){
            let id = await createTemplateGame(groupName+((count).toString()), division, teamData[i*6], teamData[j*6]); 
            count++;
            if(id === -1){
                return -1;
            }
            gameIDs.push(id.id);
        }
    }
    //Lägg till matchID i gruppobjekt
    const groupRef = doc(db, "Group", groupID);
    await updateDoc(groupRef, {
        Games: groupGames.concat(gameIDs)
    });
    return 1;
}
//KLAR
export async function generateGroupGames(groupID, groupName, teamIDAndName, groupGames){
    let gameIDs = [];
    let count = 1;
    for(let i = 0; i < teamIDAndName.length-1; i++){
        for(let j = i+1; j < teamIDAndName.length; j++){
            
            let id = await createAndAddGame(groupName+((count).toString()), teamIDAndName[i][0], teamIDAndName[j][0], teamIDAndName[i][1], teamIDAndName[j][1]); 
            count++;
            if(id === -1){
                return -1;
            }
            gameIDs.push(id.id);
        }
    }
    //Lägg till matchID i gruppobjekt
    const groupRef = doc(db, "Groups", groupID);
    await updateDoc(groupRef, {
        GameIDs: groupGames.concat(gameIDs)
    });
    return 1;
}

function removeGroupFromTeam(teamGroups, groupToRemove){
    return teamGroups.filter(function (group) {
        return group != groupToRemove;
    });
}

function removeGameFromTeam(teamGames, gameToRemove){
    return teamGames.filter(function (game) {
        return game != gameToRemove;
    });
}

export async function deleteGroupOld(group){
    //Ta bort gruppID från lag
    let teamIDs = group.TeamIDs;
    for(let i in teamIDs){
        let teamRef = doc(db, "Team", teamIDs[i]);
        let team = await getDoc(teamRef);
        let teamGroups = team.data().GroupID;
        let newTeamGroups = removeGroupFromTeam(teamGroups, group.id);

        let teamGames = team.data().gameIDs;
        for(let i in group.Games){
            teamGames = removeGameFromTeam(teamGames, group.Games[i]);    
        }
        
        await updateDoc(teamRef, {
            GroupID: newTeamGroups,
            gameIDs: teamGames
        });
    }
    //Ta bort matcher från Game och Team/gameIDs
    let gameIDs = group.Games;
    for(let i in gameIDs){
        let gameRef = doc(db, "Game", gameIDs[i]);
        await deleteDoc(gameRef);
    }

    //Ta bort grupp
    let groupRef = doc(db, "Group", group.id);
    await deleteDoc(groupRef);
}

//TODO: EJ TESTAD
export async function removeGame(id){
    let gameRef = doc(db, "Games", id);
    var query = firebase.collection("TeamGame").where("GameID", "==", id);
    query
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let teamGameDoc = doc(db, "TeamGame", doc.id);
            deleteDoc(teamGameDoc);
            console.log(doc.id, " => ", doc.data());
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });

    await deleteDoc(gameRef);
}

//TODO: EJ TESTAD
export async function deleteGroup(group){
    //Ta bort matcher
    //Ta bort matchlänkar
    let gameids = group.GameIDs;
    let groupID = group.id;
    
    for(let i in gameids){
        removeGame(gameids[i]);
    }

    
    //Ta bort GroupTeams
    const q = query(collection(db, "GroupTeams"), where("GroupID", "==", groupID));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let groupteamref = doc(db, "GroupTeams", doc.id);
        deleteDoc(groupteamref);
        console.log(doc.id, " => ", doc.data());
    });

    //Ta bort Group
    let groupRef = doc(db, "Groups", groupID);
    await deleteDoc(groupRef);

}