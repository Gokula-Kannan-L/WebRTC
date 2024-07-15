import { initializeApp } from "firebase/app";
import {DataSnapshot, DatabaseReference, Query, child, getDatabase, onChildAdded, get, onDisconnect, onValue, push, ref, set, update} from 'firebase/database';
import {  UserType } from "../redux/meetingSlice";


const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    databaseURL: process.env.REACT_APP_DATABASE_URL
}


// Initialize firebase app.
const app = initializeApp(firebaseConfig);

// Initialize firebase database and get the reference of firebase database object.
export let dbRef = ref(getDatabase(app));

let connectedRef = ref(getDatabase(app), ".info/connected");


export const InitializeMeeting = (stream: MediaStream, user: UserType) => {

    dbRef = push(dbRef);
    const MeetingInfoRef = child(dbRef, 'MeetingInfo'); //Meeting Info Node
    const participantRef = child(dbRef, 'participants');
    const contentshareRef = child(dbRef, 'contentshare');
    let key:string = ''; 
    onValue(connectedRef, (snapshot) => {

        if(snapshot.val()){
            const userRef = push(participantRef, {
                username: user.username,
                preference: user.preference,
                userid: user.userid,
                avatar: user.avatar
            });

            if(userRef.key)
                key = userRef.key;

            onDisconnect(userRef).remove();
        }
    });

    const InfoRef =  push(MeetingInfoRef, {
        hostName: user.username,
        hostId: user.userid,
        hostUserKey: key,
        createdAt: String(new Date())
    });
    onDisconnect(InfoRef).remove();

    return {participantRef, contentshareRef, key, meetingId: dbRef.key, infoKey: InfoRef.key};
}

export const JoinMeeting = (meetingId: string, user: UserType) => {

    dbRef = child(dbRef, meetingId);
    const participantRef = child(dbRef, 'participants');
    const contentshareRef = child(dbRef, 'contentshare');
    let key:string = ''; 
    onValue(connectedRef, (snapshot) => {

        if(snapshot.val()){
            const userRef = push(participantRef, {
                username: user.username,
                preference: user.preference,
                userid: user.userid,
                avatar: user.avatar
            });

            if(userRef.key)
                key = userRef.key;

            onDisconnect(userRef).remove();
        }
    });

    return {participantRef, contentshareRef ,key};
}

export const getMeetingInfo = async(infoKey: string) => {

    const MeetingInfoRef = child(dbRef, 'MeetingInfo');
    let meetInfo = {
        createdAt: '',
        hostId: '',
        hostName: '',
        hostUserKey: ''
    }
    await get(child(MeetingInfoRef, infoKey)).then( async (snapshot) => {
        snapshot.val();
        if(snapshot.exists()){
            meetInfo = snapshot.val();
        }
    });

    return meetInfo;
}

export const getParticipantRef = () => {
    return child(dbRef, 'participants');
}

export const getChildRef = (ref: DatabaseReference, path: string) => {
    return child(ref, path);
}

export const pushNewNode = (parent: DatabaseReference, value?: any) => {
    if(value){
        return push(parent, value);
    }else{
        return push(parent);
    }
}

export const updateData = (ref: DatabaseReference, values: Object) => {
    update(ref, values);
}

export const writeData = (ref: DatabaseReference, value: any) => {
    set(ref, value);
}

export const handleOnChildAdded = (query: Query, callback: (snapshot: DataSnapshot)=> void) => {
    onChildAdded(query, callback)
} 

