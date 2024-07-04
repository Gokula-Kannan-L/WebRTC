import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Grid } from '@mui/material';
import LocalTile from '../../components/VideoTile/LocalTile/LocalTile';
import MeetControls from '../../components/MeetControls/MeetControls';
import RemoteTile from '../../components/VideoTile/RemoteTile/RemoteTile';

const Meeting = () => {

    // const AttendeesCount = useSelector( (state: RootState) => state.meeting.participantsCount);
    const participants = useSelector( (state: RootState) => state.meeting.participants);

    return(
        <Grid height={'100vh'} container display={'flex'} flexDirection={'row'} bgcolor={'#343434'}>
            {false? 
                <Grid item xs={12} padding={"20px"} bgcolor={'#343434'} height={'90%'}>
                    <LocalTile />
                </Grid>
                :
                <Grid item xs={12} sx={{display: "flex", flexDirection: 'row'}} height={'90%'}>
                    <Grid xs={9} item padding={"20px"} bgcolor={'#343434'}>
                        <LocalTile />
                    </Grid>
                    <Grid xs={3} item borderRadius={'20px'} bgcolor={'#28282B'} margin={'20px 20px 20px 0px'}>
                        <div className='remote-container' style={{overflowY: "auto", height: '100%'}}>
                        {
                            Object.keys(participants).length > 0 && Object.keys(participants).map( (key, index) => {
                                const user = participants[key];
                                
                                if(user?.IsCurrentUser)
                                    return;
                                
                                console.log(user?.IsCurrentUser, user?.peerConnection);
                                const peerConnection: RTCPeerConnection = user?.peerConnection;
                                console.log('new User', index, ':  ', peerConnection)
                                
                                if(peerConnection){
                                    console.log("peerConnection");
                                    const remoteStream = new MediaStream();
                                    
                                    peerConnection.ontrack = (event: RTCTrackEvent) => {
                                        event.streams[0].getTracks().forEach( (track) => {
                                            console.log("Track-----",track)
                                            remoteStream.addTrack(track);
                                        })
                                    }

                                    return <div className='remote-tile' style={{padding: '10px', position: 'relative'}} key={index}><RemoteTile remotestream={remoteStream} index={index} username={user.username} video={user.video} avatar={user.avatar} /></div>
                                }
                                
                            })
                        }
                        </div>
                    </Grid>
                </Grid>
            }
            <Grid item xs={12} bgcolor={'#000000'} height={'10%'}>
                <MeetControls/>
            </Grid>
        </Grid>
    )
}


export default Meeting;
