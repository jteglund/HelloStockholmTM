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

function convertDateToMinutes(day, hour, minute){
  const originDay = 23;
  let days = parseInt(day) - originDay;

  return days*1440 + parseInt(hour)*60 + parseInt(minute);
}

export function convertMinutesToDate(minutes){
  const originDay = 23;
  let dayMinute = 1440;
  let hourMinute = 60;
  let remainder;

  let day = Math.floor(minutes/dayMinute) + originDay;
  remainder = minutes % dayMinute;

  let hour = Math.floor(remainder/hourMinute);
  remainder = remainder % hourMinute;

  let minute = remainder;
  let hString = hour.toString();
  if(hour < 10){
    hString = "0" + hour.toString();
  }

  let mString = minute.toString()
  if(minute < 10){
    mString = "0" + minute.toString();
  }

  return hString + ":" + mString + " - " + day.toString() + " Feb";
}