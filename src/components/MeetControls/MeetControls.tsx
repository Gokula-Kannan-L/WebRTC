import React, { FunctionComponent } from "react";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_USER } from "../../redux/meetingSlice";
import { RootState } from "../../redux/store";
import { Button } from "@mui/material";

const MeetControls:FunctionComponent = () => {
    const dispatch = useDispatch();
    const localstate = useSelector( (state: RootState) => state.meeting);
    
    const ToggelVideo = (video: boolean) => {
        if(localstate.localStream){
            dispatch(UPDATE_USER({video}));
            localstate.localStream.getVideoTracks()[0].enabled = video;
        }
    }

    const ToggleAudio = (audio: boolean) => {
        if(localstate.localStream){
            dispatch(UPDATE_USER({audio}));
            localstate.localStream.getAudioTracks()[0].enabled = audio;
        }
    }

    const CopyMeetingID = () => {
        if(localstate.meetingId){
            navigator.clipboard.writeText(localstate.meetingId);
            alert('Meeting ID copied to clipboard');
        }
    }

    return(
        <div className="meet-controls" style={{height: '100%',display: 'flex', justifyContent:'center', alignItems: 'center', gap: '20px'}}>
            <Button variant='contained' onClick={CopyMeetingID} sx={{color:'whitesmoke'}}>Copy MeetID</Button>
            {localstate.currentUser?.preference.video ? 
                <div onClick={ () => ToggelVideo(false)} style={{cursor: 'pointer'}}><VideocamIcon sx={{fontSize:'40px', color: 'whitesmoke'}} /></div> :
                <div onClick={ () => ToggelVideo(true)} style={{cursor: 'pointer'}}><VideocamOffIcon sx={{fontSize:'40px', color: 'whitesmoke'}}/></div> 
            }
            {
                localstate.currentUser?.preference.audio ? 
                <div onClick={ () => ToggleAudio(false)} style={{cursor: 'pointer'}}><MicIcon sx={{fontSize:'30px', color: 'whitesmoke'}}/></div> :
                <div onClick={ () => ToggleAudio(true)} style={{cursor: 'pointer'}}><MicOffIcon sx={{fontSize:'30px', color: 'whitesmoke'}}/></div>
            }
            
        </div>
    )
}

export default MeetControls;
