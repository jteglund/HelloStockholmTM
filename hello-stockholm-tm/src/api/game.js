import { collection, getDocs, addDoc } from "firebase/firestore";

export async function createGame(gamesCollectionRef, team1name, team1id, team2name, team2id, datetime, field, division, gamename){
  let game = 
  {
    Team1Name: team1name,
    Team1ID: team1id,
    Team2Name: team2name,
    Team2ID: team2id,
    Team1Score: 0,
    Team2Score: 0,
    Status: 0,
    WNextGame: "",
    LNextGame: "",
    DateTime: datetime,
    Field: field,
    Division: division,
    GameName: gamename,
  }

  await addDoc(gamesCollectionRef, game);
}