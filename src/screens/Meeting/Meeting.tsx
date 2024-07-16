import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Grid } from '@mui/material';
import LocalTile from '../../components/VideoTile/LocalTile/LocalTile';
import MeetControls from '../../components/MeetControls/MeetControls';
import RemoteUsers from '../../components/RemoteUsers/RemoteUsers';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import ScreenTile from '../../components/VideoTile/ScreenTile/ScreenTile';
import Snackbar from '@mui/material/Snackbar';
import MeetTimer from '../../components/MeetTimer/MeetTimer';
import { getMediaStream } from '../../helpers/helper';
import { MeetingState, SET_LOCALSTREAM } from '../../redux/meetingSlice';

const Meeting = () => {
  
    const localState = useSelector((state: RootState) => state.meeting);
    const localStateRef = useRef<MeetingState>(localState);
    const [open, setOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const dispatch = useDispatch();

    useEffect(() => {
        localStateRef.current = localState;
    }, [localState]);

    const handleSnackBar = (open: boolean, message: string) => {
        setMessage(message);
        setOpen(open);  
    }

    const handleDeviceChange = async() => {
        const participants = localStateRef.current.participants;
        const user = localStateRef.current.currentUser;

        const stream = await getMediaStream({audio: true, video: true});

       

        stream.getAudioTracks()[0].enabled = user?.preference.audio as boolean;
        const audioTrack = stream.getAudioTracks()[0];
                    
        // stream.getVideoTracks()[0].enabled = user?.preference.video as boolean
        // const videoTrack = stream.getVideoTracks()[0];

        console.log("New ---------", stream.getAudioTracks());
        console.log("Old ---------", localStateRef?.current?.localStream?.getAudioTracks());

        // dispatch(SET_LOCALSTREAM(stream));

        Object.keys(participants).forEach(userKey => {
            const peerConnection:RTCPeerConnection = participants[userKey].peerConnection;
            if(peerConnection){

                const sendersAudio = peerConnection.getSenders().find( (value) => value.track?.kind == 'audio');
                console.log("sendersAudio------------", sendersAudio);
                sendersAudio?.replaceTrack(audioTrack);
                console.log("AftersendersAudio------------", sendersAudio);
                // const sendersVideo = peerConnection.getSenders().find( (value) => value.track?.kind == 'video');
                // sendersAudio?.replaceTrack(audioTrack);
            
                // senders && senders.forEach(sender => {
                //     if (sender.track?.kind === 'audio' && audioTrack) {
                //         sender.replaceTrack(audioTrack);
                //     } else if (sender.track?.kind === 'video' && videoTrack) {
                //         sender.replaceTrack(videoTrack);
                //     }
                // });
            }
        });

    }

    useEffect( () => {
        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
        }
    },[])

    return(
        <Grid height={'100vh'} container display={'flex'} flexDirection={'row'} bgcolor={'#343434'}>
            <Snackbar 
                open={open}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                onClose={() => handleSnackBar(false, '')}
                message={message}
            />
            {localState.participantsCount > 1 ? 
            <Grid item xs={12} sx={{display: "flex", flexDirection: 'row'}} height={'90%'}>
                <Grid xs={9.5} item padding={"20px"} bgcolor={'#343434'} position={'relative'} >
                    {/* <MeetTimer /> */}
                    {localState.IsScreenSharing ? <ScreenTile /> :  <LocalTile />}
                </Grid>
                <Grid xs={2.5} item borderRadius={'20px'} bgcolor={'#28282B'} margin={'20px 20px 20px 0px'}>
                    <RemoteUsers />
                </Grid>
            </Grid>
            :
            <Grid item xs={12} sx={{display: "flex", flexDirection: 'row'}} height={'90%'}>
                <div style={{width: '100%', padding: '20px', position: 'relative'}}>
                    {/* <MeetTimer /> */}
                    {(localState.IsScreenSharing && localState.ShareUser?.userkey) ? <ScreenTile /> :  <LocalTile />}
                </div>
            </Grid>
            }
            <Grid item xs={12} bgcolor={'#000000'} height={'10%'}>
                <MeetControls handleSnackBar={handleSnackBar}/>
            </Grid>
        </Grid>
    )
}


export default Meeting;