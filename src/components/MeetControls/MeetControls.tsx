import React, { FunctionComponent, useEffect, useState } from "react";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { useDispatch, useSelector } from "react-redux";
import { RESET, SET_LOCALSTREAM, UPDATE_USER } from "../../redux/meetingSlice";
import { RootState } from "../../redux/store";
import { Button } from "@mui/material";
import { leaveMeeting } from "../../server/peerconnection";
import { getDisplayMedia, getMediaStream } from "../../helpers/helper";
import DialogBox from "../DialogBox/DialogBox";

type MeetControlsProps = {
    handleSnackBar: (open: boolean, message: string) => void
}
const MeetControls:FunctionComponent<MeetControlsProps> = ({handleSnackBar}) => {
    const dispatch = useDispatch();
    const [dialogBox, setDialogBox] = useState<boolean>(false);
    const localstate = useSelector( (state: RootState) => state.meeting);
    const participants = useSelector( (state: RootState) => state.meeting.participants);

    const ToggelVideo = (video: boolean) => {
        if(localstate.localStream && !localstate.currentUser?.preference.screen){
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

    const UpdateRemoteStreams = (stream: MediaStream, screen: boolean) => {
        Object.keys(participants).forEach( (key) => {
            const user = participants[key];
            const peerConnection: RTCPeerConnection = user?.peerConnection;
            if(peerConnection){
                let userConnection = peerConnection.getSenders().find((s) => (s.track ? s.track.kind === "video" : false));
                if(userConnection)
                    userConnection?.replaceTrack(stream.getVideoTracks()[0]);
                else
                    stream.getVideoTracks().forEach( track => {
                        peerConnection.addTrack(track, stream);
                    })
            }
        });
        dispatch(UPDATE_USER({screen}));
    }

    const handleScreenShare = async(screen: boolean) => {
        if(localstate.ShareUser?.userkey !== localstate.currentUser?.key && localstate.IsScreenSharing && localstate.ShareUser?.username){
            let message =  `${localstate.ShareUser?.username} is sharing now`;
            handleSnackBar(true, message);
            setTimeout( () => {
                handleSnackBar(false, message);
            }, 5000)
        }
        else if(screen){
            await getDisplayMedia({video: true, audio: false}).then( (stream: MediaStream) => {
                UpdateRemoteStreams(stream, true);

                stream.getVideoTracks()[0].onended = async() => {
                    await getMediaStream({audio: localstate.currentUser?.preference.audio, video: localstate.currentUser?.preference.video}).then( stream => {
                        UpdateRemoteStreams(stream, false);
                    });
                }
            }).catch( error => {
            console.log(error);
           });
        }else{
            await getMediaStream({audio: true, video: true}).then( stream => {
                UpdateRemoteStreams(stream, false);
            }).catch( error => {
                console.log(error);
            });
        }
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

    const handleEndMeeting = () => {
        
        Object.keys(localstate.participants).forEach( key => {
            let user = localstate.participants[key];
            console.log(user);
            if(user?.peerConnection){
                let pc = user.peerConnection as RTCPeerConnection;
                pc.close();
            }
        });
        handleLeave();
    }

    return(
        <div className="meet-controls" style={{height: '100%',display: 'flex', justifyContent:'center', alignItems: 'center', gap: '30px'}}>
            <Button variant='contained' onClick={CopyMeetingID} sx={{color:'whitesmoke', fontSize:'15px', backgroundColor:'#F4C430', fontWeight: 500, textTransform: 'none'}}>Copy MeetID</Button>
            {   
                localstate.currentUser?.preference.video ? 
                <div onClick={ () => ToggelVideo(false)} style={{cursor: 'pointer'}}><VideocamIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#F4C430', padding: '10px'}} /></div> :
                <div onClick={ () => ToggelVideo(true)} style={{cursor: 'pointer'}}><VideocamOffIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div> 
            }
            {
                localstate.currentUser?.preference.audio ? 
                <div onClick={ () => ToggleAudio(false)} style={{cursor: 'pointer'}}><MicIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#F4C430', padding: '10px'}}/></div> :
                <div onClick={ () => ToggleAudio(true)} style={{cursor: 'pointer'}}><MicOffIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div>
            }
            {   
                localstate.currentUser?.preference.screen ?   
                <div onClick={() => handleScreenShare(false)} style={{cursor: 'pointer'}}><CancelPresentationIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div> :
                <div onClick={() => handleScreenShare(true)} style={{cursor: 'pointer'}}><PresentToAllIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#F4C430', padding: '10px'}}/></div>
            }
            {localstate.hostInfo?.hostUserKey === localstate.currentUser?.key ?
                <div onClick={() => setDialogBox(true)} style={{cursor: 'pointer'}}><CallEndIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div>:
                <div onClick={handleLeave} style={{cursor: 'pointer'}}><CallEndIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div>
            }
            <DialogBox open={dialogBox} title="You're the host." content="Are you sure, do you want to end the call ?" agreeBtnMsg="Yes" disagreeMsg="No" handleAgree={handleEndMeeting} handleDisagree={ () => setDialogBox(false)}/>
        </div>
    )
}

export default MeetControls;