import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { InitializeListeners, createconnection, updateUserPreference } from "../server/peerconnection";

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

export interface MeetingState {
    meetingId: string,
    currentUser: UserType | null
    localStream: MediaStream | null
    peerConnection?: RTCPeerConnection //Current User
    participants: any
    participantsCount: number
}

const initialState: MeetingState  =  {
    meetingId: '',
    currentUser: null,
    localStream: null,
    participants: {},
    participantsCount: 0
}

export const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
        SET_MEET_ID: (state, action: PayloadAction<string>) => {
            let {payload} = action;
            state.meetingId = payload;
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
                    console.log("Current User :" , payload);
                    if(payload[participantkey].peerConnection)
                        state.peerConnection = payload[participantkey].peerConnection;
                }

                if(state.localStream && !payload[participantkey].IsCurrentUser){
                    createconnection(state.currentUser, payload, state.localStream);
                }
                state.participants= {...state.participants, ...payload};
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

        ADD_REMOTESTREAM: (state, action: PayloadAction<{key: string, remoteStream: MediaStream}>) => {
            const {payload} = action;
            if(state.participants[payload.key]){
                state.participants[payload.key] = {
                    ...state.participants[payload.key],
                    remoteStream: payload.remoteStream,
                    onTrackSet: true
                }
            }
        },

        RESET: (state) => {
            state = initialState
        },

    }
});

export const {SET_MEET_ID, SET_USER, UPDATE_USER, SET_LOCALSTREAM, ADD_PARTICIPANTS, UPDATE_PARTICIPANT, REMOVE_PARTICIPANT, ADD_REMOTESTREAM, RESET} = meetingSlice.actions;

export default meetingSlice.reducer;