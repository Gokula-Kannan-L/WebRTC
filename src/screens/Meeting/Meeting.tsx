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
import { SET_LOCALSTREAM } from '../../redux/meetingSlice';

const Meeting = () => {
  
    const localState = useSelector((state: RootState) => state.meeting);
    const [open, setOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const dispatch = useDispatch();

    const handleSnackBar = (open: boolean, message: string) => {
        setMessage(message);
        setOpen(open);  
    }

    useEffect( () => {
        console.log("Particpant---------------------",localState.participants)
    }, [localState.participants])

    const handleDeviceChange = async(participants: any) => {
        const stream = await getMediaStream({audio: true, video: true});
        console.log("device Chnaged000000" , stream);
        console.log(participants)
        if(stream){

            Object.keys(participants).forEach(userKey => {
                const peerConnection:RTCPeerConnection = participants[userKey].peerConnection;
                console.log("user-------------",userKey, participants[userKey])
                console.log("peerConnection ---------------", peerConnection);
                if(peerConnection){
                    const senders = peerConnection.getSenders();

                    const audioTrack = stream.getAudioTracks()[0];
                    const videoTrack = stream.getVideoTracks()[0];

                    senders.forEach(sender => {
                        console.log("Sender--------------", sender);
                        if (sender.track?.kind === 'audio' && audioTrack) {
                            sender.replaceTrack(audioTrack);
                        } else if (sender.track?.kind === 'video' && videoTrack) {
                            sender.replaceTrack(videoTrack);
                        }
                    });
                }
                
            });

            dispatch(SET_LOCALSTREAM(stream));
        }
    }

    useEffect( () => {
        navigator.mediaDevices.addEventListener('devicechange', () => {
            console.log(localState.participants);
        });
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