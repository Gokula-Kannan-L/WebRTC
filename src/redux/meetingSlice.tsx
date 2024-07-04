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
        audio: boolean,
        video: boolean,
        screen: boolean,
        avatar: string,
        IsCurrentUser?: boolean
        peerConnection?: RTCPeerConnection
    }
}

export interface MeetingState {
    meetingId: string,
    currentUser: UserType | null
    localStream: MediaStream | null
    peerConnection?: RTCPeerConnection
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
                console.log("Update User ---", state.currentUser?.key);
                updateUserPreference(state.currentUser.key, payload);
                state.currentUser.preference = {...state.currentUser.preference, ...payload};
            }
        },

        SET_LOCALSTREAM: (state, action: PayloadAction<MediaStream>) => {
            state.localStream = action.payload;
        },

        ADD_PARTICIPANTS: (state, action: PayloadAction<ParticipantType>) => {
            const {payload} = action; 
            if(state.currentUser){
                let currentUserId = state.currentUser.userid;
                let participantkey = Object.keys(payload)[0];

                if(currentUserId == payload[participantkey].userid){
                    payload[participantkey].IsCurrentUser = true;
                }

                if(state.localStream && !action.payload[participantkey].IsCurrentUser){
                    createconnection(state.currentUser, payload, state.localStream);
                }
                state.participants= {...state.participants, ...payload};
                state.participantsCount++;
            }
        },

        UPDATE_PARTICIPANT: (state, action: PayloadAction<any>) => {
            let {payload} = action;
            console.log("Update Particpant------------------", payload);
        },

        REMOVE_PARTICIPANT: (state, action:PayloadAction<string>) => {
            let {payload} = action;
            let participants = {...state.participants};
            delete participants[payload];
            state.participantsCount--;
            state = {...state, participants};

        },

        RESET: (state, action:PayloadAction) => {
            console.log('Reset----------', action);
            state = initialState;
        }

    }
});

export const {SET_MEET_ID, SET_USER, UPDATE_USER, SET_LOCALSTREAM, ADD_PARTICIPANTS, UPDATE_PARTICIPANT, REMOVE_PARTICIPANT, RESET} = meetingSlice.actions;

export default meetingSlice.reducer;
