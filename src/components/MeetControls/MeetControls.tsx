import React, { FunctionComponent, useEffect } from "react";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import { useDispatch, useSelector } from "react-redux";
import { RESET, UPDATE_USER } from "../../redux/meetingSlice";
import { RootState } from "../../redux/store";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { leaveMeeting } from "../../server/peerconnection";
import { getDisplayMedia } from "../../helpers/helper";

const MeetControls:FunctionComponent = () => {
    const dispatch = useDispatch();

    const localstate = useSelector( (state: RootState) => state.meeting);
    const participants = useSelector( (state: RootState) => state.meeting.participants);

    useEffect( () => {
        console.log("Local Peer Connection --------",localstate.peerConnection);
    },[localstate.peerConnection])

    const ToggelVideo = (video: boolean) => {
        if(localstate.localStream){
            // localstate.localStream.getVideoTracks()[0].enabled = video;
            localstate.localStream.getTracks().find( (track) => {
                if(track.kind == 'video'){
                    track.enabled = video;
                    dispatch(UPDATE_USER({video}));
            }})
            
        }
    }

    const ToggleAudio = (audio: boolean) => {
        if(localstate.localStream){
            // localstate.localStream.getAudioTracks()[0].enabled = audio;
            localstate.localStream.getTracks().find( (track) => {
                if(track.kind == 'audio'){
                    track.enabled = audio;
                    dispatch(UPDATE_USER({audio}));
            }})
            
        }
    }

    const CopyMeetingID = () => {
        if(localstate.meetingId){
            navigator.clipboard.writeText(localstate.meetingId);
            alert('Meeting ID copied to clipboard');
        }
    }

    const handleScreenShare = async() => {
       await getDisplayMedia({video: true, audio: true}).then( (value) => {
            console.log(value.getVideoTracks())
            Object.keys(participants).forEach( (key) => {
                const user = participants[key];
                const peerConnection: RTCPeerConnection = user?.peerConnection;
                if(peerConnection && localstate?.localStream){
                    peerConnection.addTrack(value.getVideoTracks()[0], localstate?.localStream)
                }
            })
        }).catch( error => {
        console.log(error);
       })
    }

    const handleLeave = async() => {
        if(localstate.localStream && localstate.currentUser?.key){
            const video: HTMLVideoElement = document.getElementById('local-videotile') as HTMLVideoElement;
            if(video)
                video.srcObject = null;
            localstate.localStream.getTracks().forEach( async(track: MediaStreamTrack) => {
                await track.stop();
            });
            
           leaveMeeting(localstate.currentUser?.key);
           dispatch(RESET());   
           window.location.reload();
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
            <div onClick={handleScreenShare} style={{cursor: 'pointer'}}><PresentToAllIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#F4C430', padding: '10px'}}/></div>
            <div onClick={handleLeave} style={{cursor: 'pointer'}}><CallEndIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div>
        </div>
    )
}

export default MeetControls;