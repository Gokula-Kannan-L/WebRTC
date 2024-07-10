import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Typography } from '@mui/material';

const ScreenTile:FunctionComponent = () => {

    const VideoRef = useRef<any>(null);
    const localstate = useSelector((state: RootState) => state.meeting);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [userName, setUsername] = useState<string>('');

    useEffect( () => {
        if(localstate.IsScreenSharing){
           
            if(localstate.ShareUser?.userkey === localstate.currentUser?.key){
                setScreenStream(localstate.localStream);
                setUsername('You are')
            }else{
                if(localstate.ShareUser?.userkey){


                    let RemoteUser = localstate.participants[localstate.ShareUser?.userkey];
                    if(RemoteUser.remoteStream){
                        setScreenStream(RemoteUser.remoteStream);
                        setUsername(RemoteUser.username + ' is')
                    }
                       

                }
            }
        }
    },[localstate.IsScreenSharing]);

    useEffect( () => {
        if(screenStream && VideoRef.current){
            VideoRef.current.srcObject = screenStream;
        }
    }, [screenStream])

    return(
        <>
            <video ref={VideoRef} id="local-videotile" autoPlay playsInline width={'100%'} height={'100%'} style={{objectFit: 'cover', borderRadius: "20px", backgroundColor: 'black'}} controls={false} muted={true}></video>
            <Typography sx={{fontSize: '16px', color: '#F4C430', background: 'rgba(0, 0, 0, 0.7)', padding: '8px 15px', borderRadius: '20px'}}>{userName} presenting the screen</Typography>
        </>
        
    );
}
export default ScreenTile;