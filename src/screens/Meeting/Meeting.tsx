import React, { RefObject, useEffect, useRef, useState } from 'react';
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

const Meeting = () => {
  
    const localState = useSelector((state: RootState) => state.meeting);
    const localStateRef = useRef<MeetingState>(localState);
    const [open, setOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    
    const [backdrop, setBackdrop] = useState<boolean>(false);

    const dispatch = useDispatch();


    useEffect(() => {
        localStateRef.current = localState;
    }, [localState]);

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