import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { InitializeListeners, createconnection, updateUserPreference } from "../server/peerconnection";
import { getMeetingInfo } from "../server/firebase";


export type UserType =  {
    username: string,
    userid: string,
    key?: string,
    avatar: string,
    preference: {
        audio: boolean,
        video: boolean,
        screen: boolean
    }
}

export type PreferenceType = {
    audio?: boolean,
    video?: boolean,
    screen?: boolean
}

export type ParticipantType = {
    [key: string]: {
        username: string,
        userid: string,
        preference: {
            audio: boolean,
            video: boolean,
            screen: boolean,
        }
        avatar: string,
        IsCurrentUser?: boolean
        peerConnection?: RTCPeerConnection
        remoteStream?: MediaStream;
        onTrackSet?: boolean;
    }
}

export type UpdateParticipant = {
    user: {
        [key: string]: {
            audio?: boolean,
            video?: boolean,
            screen?: boolean,
        }
    }
}
export type HostType = {
    hostName: string
    hostId: string
    hostUserKey: string
    createdAt: string
}

export enum deviceTypes {
    audioInput = 'audioInput',
    audioOutput = 'audioOutput',
    videoInput = 'videoInput'
}
export interface MeetingState {
    meetingId: string,
    devicesList: { 
        audioInput: MediaDeviceInfo[] | []
        audioOutput:  MediaDeviceInfo[] | []
        videoInput: MediaDeviceInfo[] | []
    } 
    hostInfo:  HostType | null
    currentUser: UserType | null
    localStream: MediaStream | null
    peerConnection?: RTCPeerConnection //Current User
    participants: any
    participantsCount: number,
    IsScreenSharing: boolean
    ShareUser?: {
        username: string,
        userkey: string
    }
}

const initialState: MeetingState  =  {
    meetingId: '',
    devicesList: {
        audioInput: [],
        audioOutput: [],
        videoInput: []
    },
    hostInfo: null,
    currentUser: null,
    localStream: null,
    participants: {},
    participantsCount: 0,
    IsScreenSharing: false
}

export const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
        SET_MEET_ID: (state, action: PayloadAction<string>) => {
            let {payload} = action;
            state.meetingId = payload;
        },

        SET_HOST: (state, action: PayloadAction<{host: HostType}>) => {
            let {payload} = action;
            state.hostInfo = payload.host;
        },

        SET_USER: (state, action: PayloadAction<UserType>) => {
            state.currentUser = action.payload;
            if(action.payload.key)
                InitializeListeners(action.payload.key);
        },

        UPDATE_USER: (state, action: PayloadAction<PreferenceType>) => {
            const {payload} = action;
            if(state.currentUser?.key){
                state.currentUser.preference = {...state.currentUser.preference, ...payload};
                updateUserPreference(state.currentUser.key, payload);
            }
        },

        SET_LOCALSTREAM: (state, action: PayloadAction<MediaStream>) => {
            state.localStream = action.payload;
        },

        ADD_PARTICIPANTS: (state, action: PayloadAction<ParticipantType>) => {
            const {payload} = action;

            if(state.currentUser){
                let participantkey = Object.keys(payload)[0];
                if(state.currentUser.key && state.currentUser.key === participantkey){
                    payload[participantkey].IsCurrentUser = true;
                }

                if(state.localStream && state.currentUser.key !== participantkey){
                    createconnection(state.currentUser, payload, state.localStream);
                }
              
                state.participants = {...state.participants, ...payload};

                if(payload[participantkey]?.peerConnection){
                    
                    let peerConnection = payload[participantkey]?.peerConnection as RTCPeerConnection;
                    const remoteStream = new MediaStream();

                    peerConnection.ontrack = async(event: RTCTrackEvent) => {
                        event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
                            remoteStream.addTrack(track);
                        });
                    };

                    console.log("Sender : " ,peerConnection.getSenders());

                    state.participants[participantkey] = {
                        ...state.participants[participantkey],
                        remoteStream: remoteStream,
                    }
                }

                if(!state.IsScreenSharing && payload[participantkey].preference.screen){
                    state.ShareUser = {
                        userkey: participantkey,
                        username: payload[participantkey].username,
                    }
                    state.IsScreenSharing = true;
                }
                
                state.participantsCount++;
            }
        },

        UPDATE_PARTICIPANT: (state, action: PayloadAction<UpdateParticipant>) => {

            let {payload} = action;
            const userKey = Object.keys(payload.user)[0];

            payload.user[userKey] = {
                ...state.participants[userKey],
                ...payload.user[userKey],
            };
           
            state.participants = { ...state.participants, ...payload.user };
        },

        REMOVE_PARTICIPANT: (state, action:PayloadAction<string>) => {
            
            let {payload} = action;
            let participants = {...state.participants};
            delete participants[payload];
            state.participantsCount--;
            state.participants = participants;
        },

        // ADD_REMOTESTREAM: (state, action: PayloadAction<{key: string, remoteStream: MediaStream}>) => {
        //     const {payload} = action;

        //     console.log("Updating Remote Stream.....", payload);
        //     if(state.participants[payload.key]){
        //         state.participants[payload.key] = {
        //             ...state.participants[payload.key],
        //             remoteStream: payload.remoteStream,
        //             onTrackSet: true
        //         }
        //     }
        // },

        UPDATE_SCREEN_SHARE: (state, action: PayloadAction<{userkey:string, screen: boolean}>) => {
            let {payload} = action;
            if(state.IsScreenSharing && payload.userkey == state.ShareUser?.userkey && !payload.screen){
                state.IsScreenSharing = payload.screen;
                state.ShareUser = {
                    userkey: '',
                    username: '',
                }
            }else if(!state.IsScreenSharing && !state.ShareUser?.userkey && payload.screen){
                state.IsScreenSharing = payload.screen;
                state.ShareUser = {
                    userkey: payload.userkey,
                    username: state.participants[payload.userkey].username,
                }
            }
        },

        UPDATE_DEVICE_LIST: (state, action: PayloadAction<{audioInput: MediaDeviceInfo[], audioOutput: MediaDeviceInfo[], videoInput: MediaDeviceInfo[]} >) => {
            let {payload} = action;
            state.devicesList = payload;     
        },

        RESET: (state) => {
            state = initialState
        },

    }
});

export const {SET_MEET_ID, SET_HOST, SET_USER, UPDATE_USER, SET_LOCALSTREAM, ADD_PARTICIPANTS, UPDATE_PARTICIPANT, REMOVE_PARTICIPANT, UPDATE_SCREEN_SHARE, UPDATE_DEVICE_LIST, RESET} = meetingSlice.actions;

export default meetingSlice.reducer;