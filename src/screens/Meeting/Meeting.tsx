import React from 'react';
import { Grid } from '@mui/material';
import LocalTile from '../../components/VideoTile/LocalTile/LocalTile';
import MeetControls from '../../components/MeetControls/MeetControls';
import RemoteUsers from '../../components/RemoteUsers/RemoteUsers';

const Meeting = () => {

    return(
        <Grid height={'100vh'} container display={'flex'} flexDirection={'row'} bgcolor={'#343434'}>
            <Grid item xs={12} sx={{display: "flex", flexDirection: 'row'}} height={'90%'}>
                <Grid xs={9} item padding={"20px"} bgcolor={'#343434'}>
                    <LocalTile />
                </Grid>
                <Grid xs={3} item borderRadius={'20px'} bgcolor={'#28282B'} margin={'20px 20px 20px 0px'}>
                    <RemoteUsers />
                </Grid>
            </Grid>
        
            <Grid item xs={12} bgcolor={'#000000'} height={'10%'}>
                <MeetControls/>
            </Grid>
        </Grid>
    )
}


export default Meeting;
