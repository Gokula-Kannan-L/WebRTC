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
import { Button, MenuItem, Select } from "@mui/material";
import { leaveMeeting } from "../../server/peerconnection";
import { getDisplayMedia, getMediaStream } from "../../helpers/helper";
import DialogBox from "../DialogBox/DialogBox";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import VideoLabelIcon from '@mui/icons-material/VideoLabel';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

type MeetControlsProps = {
    handleSnackBar: (open: boolean, message: string) => void
}
const MeetControls:FunctionComponent<MeetControlsProps> = ({handleSnackBar}) => {
    const dispatch = useDispatch();
    const [dialogBox, setDialogBox] = useState<boolean>(false);
    const localstate = useSelector( (state: RootState) => state.meeting);
    const participants = useSelector( (state: RootState) => state.meeting.participants);

    const [videoDeviceToggle, setVideoDeviceToggle] = useState<boolean>(false);
    const [audiDeviceToggle, setAudioDeviceToggle] = useState<boolean>(false);

    const updateStream = async() => {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true,  audio: { echoCancellation: true, }});
        if(newStream){
            Object.keys(participants).forEach( async(key) => {
                let user = participants[key];
                
                if(user.peerConnection){
                    let peerConnection = user.peerConnection as RTCPeerConnection;
                    
                    peerConnection.getSenders().find( async(sender) => {
                        if(sender.track?.kind == "audio"){
                            await sender.replaceTrack(newStream.getAudioTracks()[0]);
                        }else if(sender.track?.kind == "video"){
                            await sender.replaceTrack(newStream.getVideoTracks()[0]);
                        }
                    
                    });

                }
            });
            dispatch(SET_LOCALSTREAM(newStream));
        }
    }

    useEffect( () => {
       if(localstate.localStream?.getAudioTracks()[0].label !== localstate.devicesList.audioInput[0].label){
            console.log("Device Changed From ", localstate.localStream?.getAudioTracks()[0].label, " to ", localstate.devicesList.audioInput[0].label);
            updateStream();
       }
       if(localstate.localStream?.getVideoTracks()[0].label !== localstate.devicesList.videoInput[0].label){
            console.log("Device Changed From ", localstate.localStream?.getVideoTracks()[0].label, " to ", localstate.devicesList.videoInput[0].label);
            updateStream();
        }
    }, [localstate.devicesList])

    const ToggelVideo = (video: boolean) => {
        if(localstate.localStream && !localstate.currentUser?.preference.screen){
            localstate.localStream.getTracks().find( (track) => {
                if(track.kind == 'video'){
                    track.enabled = video;
                    dispatch(UPDATE_USER({video}));
            }})
            
        }
    }

    const ToggleAudio = (audio: boolean) => {
        if(localstate.localStream){
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
                let userConnection = peerConnection.getSenders().find((s) => ( s.track?.kind === "video" ));
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
                    await getMediaStream().then( stream => {
                        UpdateRemoteStreams(stream, false);
                    });
                }
            }).catch( error => {
            console.log(error);
           });
        }else{
            await getMediaStream().then( stream => {
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
        handleLeave();
    }

    const DropDown: FunctionComponent<{Items: MediaDeviceInfo[]}> = ({Items}) => {
        const defaultItem = Items[0];
        const newList = Items.slice(1);
        return(
            <Select defaultValue={defaultItem.deviceId} displayEmpty={true} sx={{"& .MuiOutlinedInput-notchedOutline": {border: 'none'}, width: '240px', border: 'none'}}>
                <MenuItem value={defaultItem.deviceId} >{defaultItem.label}</MenuItem>
                {
                    newList.map( (item, index) => <MenuItem value={item.deviceId} key={index}>{item.label}</MenuItem>)
                }
            </Select>
        )
    }

    return(
        <div className="meet-controls" style={{height: '100%',display: 'flex', justifyContent:'center', alignItems: 'center', gap: '30px'}}>
            
            {videoDeviceToggle && localstate.devicesList.videoInput.length && 
                <div style={{position: 'absolute', bottom: '12%', padding: '0 10px 0 20px' ,backgroundColor: '#93C572', borderRadius: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <VideoLabelIcon/><DropDown Items={localstate.devicesList.videoInput}/>
                </div>}
            
            {audiDeviceToggle && localstate.devicesList.audioInput.length && localstate.devicesList.audioOutput.length && 
                <div style={{position: 'absolute', bottom: '12%', padding: '0 10px 0 20px' ,backgroundColor: '#93C572', borderRadius: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px'}}>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}><MicIcon/><DropDown Items={localstate.devicesList.audioInput}/></div>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}><VolumeUpIcon/><DropDown Items={localstate.devicesList.audioOutput}/></div>
                </div>}
            
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 50px', gap: '24px', borderRadius: '40px', backgroundColor: '#899499'}}>
                <Button variant='contained' onClick={CopyMeetingID} sx={{color:'whitesmoke', fontSize:'15px', backgroundColor:'#4CBB17', fontWeight: 500, textTransform: 'none'}}>Copy MeetID</Button>
                
                <div style={{display: 'flex', gap: '0px', justifyContent: 'center', alignItems: 'center', backgroundColor: '#93C572', borderRadius: '40px', padding: '0 10px 0 0'}}> 
                    {  
                        localstate.currentUser?.preference.video ? 
                        <div onClick={ () => ToggelVideo(false)} style={{cursor: 'pointer', height: '44px'}}><VideocamIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#4CBB17', padding: '10px'}} /> </div> :
                        <div onClick={ () => ToggelVideo(true)} style={{cursor: 'pointer', height: '44px'}}><VideocamOffIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div> 
                    }
                    {videoDeviceToggle ? <div onClick={ () => {setVideoDeviceToggle(false)}}><KeyboardArrowUpIcon /></div> : <div onClick={ () => {setAudioDeviceToggle(false); setVideoDeviceToggle(true)}}><KeyboardArrowDownIcon /></div>}
                </div>
                
                <div style={{display: 'flex', gap: '0px', justifyContent: 'center', alignItems: 'center', backgroundColor: '#93C572', borderRadius: '40px', padding: '0 10px 0 0'}}> 
                    {
                        localstate.currentUser?.preference.audio ? 
                        <div onClick={ () => ToggleAudio(false)} style={{cursor: 'pointer', height: '44px'}}><MicIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#4CBB17', padding: '10px'}}/></div> :
                        <div onClick={ () => ToggleAudio(true)} style={{cursor: 'pointer', height: '44px'}}><MicOffIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div>
                    }
                    {audiDeviceToggle ? <div onClick={ () => setAudioDeviceToggle(false)}><KeyboardArrowUpIcon /></div> : <div onClick={ () => {setVideoDeviceToggle(false); setAudioDeviceToggle(true)}}><KeyboardArrowDownIcon /></div>}
                </div>
                
                {   
                    localstate.currentUser?.preference.screen ?   
                    <div onClick={() => handleScreenShare(false)} style={{cursor: 'pointer'}}><CancelPresentationIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div> :
                    <div onClick={() => handleScreenShare(true)} style={{cursor: 'pointer'}}><PresentToAllIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#4CBB17', padding: '10px'}}/></div>
                }
                {localstate.hostInfo?.hostUserKey === localstate.currentUser?.key ?
                    <div onClick={() => setDialogBox(true)} style={{cursor: 'pointer'}}><CallEndIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div>:
                    <div onClick={handleLeave} style={{cursor: 'pointer'}}><CallEndIcon sx={{fontSize:'25px', color: 'whitesmoke', borderRadius: '50%', backgroundColor: '#D2042D', padding: '10px'}}/></div>
                }
            </div>
            <DialogBox open={dialogBox} title="You're the host." content="Are you sure, do you want to end the call ?" agreeBtnMsg="Yes" disagreeMsg="No" handleAgree={handleEndMeeting} handleDisagree={ () => setDialogBox(false)}/>
        </div>
    )
}

export default MeetControls;