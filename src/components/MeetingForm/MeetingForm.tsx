import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { getMediaStream, getRandomColor } from "../../helpers/helper";
import { useDispatch, useSelector } from "react-redux";
import { UserType, SET_USER, SET_LOCALSTREAM, ADD_PARTICIPANTS, ParticipantType, REMOVE_PARTICIPANT, SET_MEET_ID, UPDATE_PARTICIPANT, RESET, UPDATE_SCREEN_SHARE, SET_HOST, HostType, UPDATE_DEVICE_LIST, deviceTypes } from "../../redux/meetingSlice";
import { useNavigate } from "react-router-dom";
import { InitializeMeeting, JoinMeeting, getChildRef, getMeetingInfo } from "../../server/firebase";
import { v4 as uuidv4 } from 'uuid';
import {  onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";

export enum FormType{
    CREATE = 1,
    JOIN = 2
}

type MeetFormType = {
    Type: FormType
}
const MeetingForm:FunctionComponent<MeetFormType> = ({Type}) => {

    const videoRef = useRef<any>(null);

    const [localstream, setLocalStream] = useState<MediaStream>();
    const [username, setUserName] = useState<string>('');
    const [MeetId, setMeetID] = useState<string>('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getStream = async() => {
        try{
            const stream = await getMediaStream();
            if(stream){
                videoRef.current.srcObject = stream;
                setLocalStream(stream);
            }
        }catch(error){
           console.log('Error', error);

        }
    }


    const handleCreateMeeting = async() => {
        dispatch(RESET());
       
        let payload: UserType = {
            username,
            userid: uuidv4(),
            avatar: getRandomColor(),
            preference: {
                audio: true,
                video: true,
                screen: false
            }
        }

        if(localstream){
            
            const {participantRef, key, meetingId} = await InitializeMeeting(localstream, payload);
            payload.key = key;
            dispatch(SET_MEET_ID(String(meetingId)));
            dispatch(SET_LOCALSTREAM(localstream));
            dispatch(SET_USER(payload));

            await getMeetingInfo().then( (host) => {
                dispatch(SET_HOST({host}));
            });
           
            onChildAdded(participantRef, (snapshot) => {
                let key: string = String(snapshot.key);
             
                const userRef = getChildRef(participantRef, key);
               
                onChildChanged(userRef, (event) => {        
                    let updateKey = String(event.key);
                
                    if(updateKey == 'preference' && userRef.key){
                        dispatch(UPDATE_SCREEN_SHARE({userkey: userRef.key, screen: event.val()?.screen}));
                    }

                    dispatch(UPDATE_PARTICIPANT({user: {
                        [String(userRef.key)] : {
                            [updateKey]: event.val()
                        }
                    }}))
                });

                const {username, preference, userid, avatar} = snapshot.val();
            
                let participant: ParticipantType = {
                    [key]: {
                        username,
                        userid,
                        avatar,
                        preference
                    }
                }
        
                dispatch(ADD_PARTICIPANTS(participant));
            });

            
            onChildRemoved(participantRef, (snapshot) => {
                if(snapshot.key){
                    dispatch(REMOVE_PARTICIPANT(snapshot.key));
                }
            });

            await navigator.mediaDevices.enumerateDevices().then( (value) => {
                const audioInput = value.filter( device => device.kind === "audioinput");
                const audioOutput = value.filter( device => device.kind === "audiooutput");
                const videoInput = value.filter( device => device.kind === "videoinput");
              
                dispatch(UPDATE_DEVICE_LIST({ audioInput, audioOutput, videoInput}));
            });
            
            navigate('/meeting');
        }
        else{
            getStream(); 
        }
    }

    const handleJoinMeeting = async() => {
        dispatch(RESET());

        let payload: UserType = {
            username,
            userid: uuidv4(),
            avatar: getRandomColor(),
            preference: {
                audio: true,
                video: true,
                screen: false
            }
        }

        
        if(localstream){
            
            const {participantRef, key} = JoinMeeting(MeetId, payload);

            dispatch(SET_LOCALSTREAM(localstream));
            dispatch(SET_MEET_ID(MeetId));

            payload.key = key;
            dispatch(SET_USER(payload));
            await getMeetingInfo().then( (host) => {
                dispatch(SET_HOST({host}));
            });

            onChildAdded(participantRef, (snapshot) => {
                
                let key: string = String(snapshot.key);
                const userRef = getChildRef(participantRef, key);
               
                onChildChanged(userRef, (event) => {
                    let updateKey = String(event.key);
                    
                    if(updateKey == 'preference' && userRef.key){
                        dispatch(UPDATE_SCREEN_SHARE({userkey: userRef.key, screen: event.val()?.screen}));
                    }
                    
                    dispatch(UPDATE_PARTICIPANT({user: {
                        [String(userRef.key)] : {
                            [updateKey]: event.val()
                        }
                    }}))
                });
              
                const {username, avatar, preference, userid} = snapshot.val();
                let participant: ParticipantType = {
                    [key]: {
                        username,
                        userid,
                        avatar,
                        preference
                    }
                }
        
                dispatch(ADD_PARTICIPANTS(participant));
            });

            onChildRemoved(participantRef, (snapshot) => {
                if(snapshot.key)
                    dispatch(REMOVE_PARTICIPANT(snapshot.key));
            });
            
            await navigator.mediaDevices.enumerateDevices().then( (value) => {
                const audioInput = value.filter( device => device.kind === "audioinput");
                const audioOutput = value.filter( device => device.kind === "audiooutput");
                const videoInput = value.filter( device => device.kind === "videoinput");
              
                dispatch(UPDATE_DEVICE_LIST({ audioInput, audioOutput, videoInput}));
            });
           
            navigate('/meeting');
        }
        else{
            getStream(); 
        }
    }

    const handleDeviceChange = async() => {
        await getStream();
        if(localstream){
            dispatch(SET_LOCALSTREAM(localstream));
        }
    }

    useEffect( () => {
        getStream();

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
        }

    }, []);

    return(
        <Grid sx={{height: '100vh'}} container>
            <Grid item xs={5} sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '1rem', borderRight: '2px solid lightgrey'}}>
                <TextField placeholder="Enter your name" required sx={{width: '50%'}} value={username} onChange={ (e) => setUserName(e.target.value)} />
                {Type == FormType.CREATE ? 
                    <Button variant="contained" sx={{width: '50%'}} disabled={username?.length > 2 ? false : true} onClick={handleCreateMeeting}>Start Meeting</Button>
                    :
                    <>
                        <TextField placeholder="Enter Meeting Id" required sx={{width: '50%'}} value={MeetId} onChange={ (e) => setMeetID(e.target.value)} />
                        <Button variant="contained" sx={{width: '50%'}} disabled={(MeetId?.length == 20 && username?.length > 2) ? false : true} onClick={handleJoinMeeting}>Join Meeting</Button>
                    </>
                }
            </Grid>
            <Grid item xs={7} sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <Typography variant="h5"> Preview</Typography>
                <video ref={videoRef} style={{ width: '80%', height: '60%', backgroundColor: 'black', borderRadius: '1rem', objectFit: 'cover', transform: "rotateY(180deg)"}} autoPlay playsInline controls={false} muted={true}></video>
            </Grid>
        </Grid>
    )
}

export default MeetingForm;                                                                                                                                                                                                                                                                                         