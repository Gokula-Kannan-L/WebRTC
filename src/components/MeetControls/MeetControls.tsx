import React, { FunctionComponent } from "react";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_USER } from "../../redux/meetingSlice";
import { RootState } from "../../redux/store";

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


    return(
        <div className="meet-controls" style={{height: '100%',display: 'flex', justifyContent:'center', alignItems: 'center', gap: '20px'}}>
            {localstate.currentUser?.preference.video ? 
                <div onClick={ () => ToggelVideo(false)}><VideocamIcon sx={{fontSize:'40px', color: 'whitesmoke'}} /></div> :
                <div onClick={ () => ToggelVideo(true)}><VideocamOffIcon sx={{fontSize:'40px', color: 'whitesmoke'}}/></div> 
            }
            {
                localstate.currentUser?.preference.audio ? 
                <div onClick={ () => ToggleAudio(false)}><MicIcon sx={{fontSize:'30px', color: 'whitesmoke'}}/></div> :
                <div onClick={ () => ToggleAudio(true)}><MicOffIcon sx={{fontSize:'30px', color: 'whitesmoke'}}/></div>
            }
            
        </div>
    )
}

export default MeetControls;