import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Backdrop, Grid } from '@mui/material';
import LocalTile from '../../components/VideoTile/LocalTile/LocalTile';
import MeetControls from '../../components/MeetControls/MeetControls';
import RemoteUsers from '../../components/RemoteUsers/RemoteUsers';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import ScreenTile from '../../components/VideoTile/ScreenTile/ScreenTile';
import Snackbar from '@mui/material/Snackbar';
import MeetTimer from '../../components/MeetTimer/MeetTimer';
import { MeetingState, RESET, SET_LOCALSTREAM } from '../../redux/meetingSlice';
import { getMeetingInfoRef } from '../../server/firebase';
import { onChildRemoved } from 'firebase/database';
import Toaster from '../../components/Toaster/Toaster';
import { getMediaStream } from '../../helpers/helper';

const Meeting = () => {
  
    const localState = useSelector((state: RootState) => state.meeting);
    const [open, setOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    
    const [backdrop, setBackdrop] = useState<boolean>(false);
    const [updateStream, setUpdateStream] = useState<MediaStream | null>(null);

    const dispatch = useDispatch();

    const handleDeviceChange =async() => {
    
        const newStream = await getMediaStream({ video: true, audio: { echoCancellation: true} });
        setUpdateStream(newStream);
    }

    useEffect( () => {
        if(updateStream ){
            console.log("old stream track : ", localState.localStream?.getAudioTracks());
            console.log("new stream track : ", updateStream.getAudioTracks());

            dispatch(SET_LOCALSTREAM(updateStream));
            
            Object.keys(localState.participants).forEach( (key) => {
                let user = localState.participants[key];
                if(user.peerConnection){
                    let peerConnection = user.peerConnection as RTCPeerConnection;
                    let sender = peerConnection.getSenders().find( (s) => s.track?.kind == 'audio');
                    console.log("Before Sender : ", sender?.track );
                    sender?.replaceTrack(updateStream.getAudioTracks()[0]);
                    console.log("After Sender : ", sender?.track );
                }
            });
            setUpdateStream(null);
        }
    }, [updateStream]);


    useEffect( () => {
        navigator?.mediaDevices.addEventListener( "devicechange" , handleDeviceChange);

        return () => {
            navigator?.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
          };
    }, []);
    

    useEffect( () => {
        const MeetingInfoRef = getMeetingInfoRef();
        onChildRemoved(MeetingInfoRef, () => {
            //Handle End Meeting, Since Host MeetInfo Removed
            setBackdrop(true);
            setTimeout( () => {
                dispatch(RESET());
                window.location.reload();
            }, 3000);
        });
    }, []);

    const handleSnackBar = (open: boolean, message: string) => {
        setMessage(message);
        setOpen(open);  
    }

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
    
            <Backdrop open={backdrop} >
                <Toaster message="You're host ended the meeting. You will be redirected." severity="error" />
            </Backdrop>
        </Grid>
    )
}


export default Meeting;