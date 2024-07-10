import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Grid } from '@mui/material';
import LocalTile from '../../components/VideoTile/LocalTile/LocalTile';
import MeetControls from '../../components/MeetControls/MeetControls';
import RemoteUsers from '../../components/RemoteUsers/RemoteUsers';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import ScreenTile from '../../components/VideoTile/ScreenTile/ScreenTile';

const Meeting = () => {
  
    const localState = useSelector((state: RootState) => state.meeting);

    useEffect( () => {
       console.log(localState.IsScreenSharing)
    },[localState.IsScreenSharing]);

    return(
        <Grid height={'100vh'} container display={'flex'} flexDirection={'row'} bgcolor={'#343434'}>
            {localState.participantsCount > 1 ? 
            <Grid item xs={12} sx={{display: "flex", flexDirection: 'row'}} height={'90%'}>
                <Grid xs={9.5} item padding={"20px"} bgcolor={'#343434'}>
                    {localState.IsScreenSharing ? <ScreenTile /> :  <LocalTile />}
                </Grid>
                <Grid xs={2.5} item borderRadius={'20px'} bgcolor={'#28282B'} margin={'20px 20px 20px 0px'}>
                    <RemoteUsers />
                </Grid>
            </Grid>
            :
            <Grid item xs={12} sx={{display: "flex", flexDirection: 'row'}} height={'90%'}>
                <div style={{width: '100%', padding: '20px'}}>
                {localState.IsScreenSharing ? <ScreenTile /> :  <LocalTile />}
                </div>
            </Grid>
            }
            <Grid item xs={12} bgcolor={'#000000'} height={'10%'}>
                <MeetControls/>
            </Grid>
        </Grid>
    )
}


export default Meeting;