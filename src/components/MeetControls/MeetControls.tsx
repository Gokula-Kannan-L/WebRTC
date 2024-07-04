import React, { FunctionComponent } from "react";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { useDispatch, useSelector } from "react-redux";
import { RESET, UPDATE_USER } from "../../redux/meetingSlice";
import { RootState } from "../../redux/store";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { leaveMeeting } from "../../server/peerconnection";

const MeetControls:FunctionComponent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const localstate = useSelector( (state: RootState) => state.meeting);
    
    const ToggelVideo = (video: boolean) => {
        if(localstate.localStream){
            localstate.localStream.getVideoTracks()[0].enabled = video;
            dispatch(UPDATE_USER({video}));
        }
    }

    const ToggleAudio = (audio: boolean) => {
        if(localstate.localStream){
            localstate.localStream.getAudioTracks()[0].enabled = audio;
            dispatch(UPDATE_USER({audio}));
        }
    }

    const CopyMeetingID = () => {
        if(localstate.meetingId){
            navigator.clipboard.writeText(localstate.meetingId);
            alert('Meeting ID copied to clipboard');
        }
    }

    const handleLeave = () => {
        if(localstate.localStream){
           localstate.localStream.getTracks().forEach( (track: MediaStreamTrack) => {
                track.stop();
           });
            dispatch(RESET());
            navigate('/');
        }
       
    }

    return(
        <div className="meet-controls" style={{height: '100%',display: 'flex', justifyContent:'center', alignItems: 'center', gap: '30px'}}>
            <Button variant='contained' onClick={CopyMeetingID} sx={{color:'whitesmoke', fontSize:'15px', backgroundColor:'#F4C430', fontWeight: 500, textTransform: 'none'}}>Copy MeetID</Button>
            {localstate.currentUser?.preference.video ? 
                <div onClick={ () => ToggelVideo(false)} style={{cursor: 'pointer'}}><VideocamIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#F4C430', padding: '10px'}} /></div> :
                <div onClick={ () => ToggelVideo(true)} style={{cursor: 'pointer'}}><VideocamOffIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div> 
            }
            {
                localstate.currentUser?.preference.audio ? 
                <div onClick={ () => ToggleAudio(false)} style={{cursor: 'pointer'}}><MicIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#F4C430', padding: '10px'}}/></div> :
                <div onClick={ () => ToggleAudio(true)} style={{cursor: 'pointer'}}><MicOffIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div>
            }
            <div onClick={handleLeave} style={{cursor: 'pointer'}}><CallEndIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div>
        </div>
    )
}

export default MeetControls;
