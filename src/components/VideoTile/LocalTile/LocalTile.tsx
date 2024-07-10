import React, { FunctionComponent, RefObject, SetStateAction, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Avatar, Typography } from '@mui/material';

const LocalTile:FunctionComponent = () => {
    const VideoRef = useRef<any>(null);
    const localStream = useSelector((state:  RootState) => state.meeting.localStream);
    const user = useSelector((state:  RootState) => state.meeting.currentUser);
    
    useEffect( () => {
        if (VideoRef.current) {
            VideoRef.current.srcObject = localStream;
            // VideoRef.current.muted = user?.preference.audio;
        }

    },[localStream, user?.preference.video]);

    return(
        <div className='local-tile' style={{height: '100%', position: 'relative'}}>
            {user?.preference.video ? 
                <video ref={VideoRef} id="local-videotile" autoPlay playsInline width={'100%'} height={'100%'} style={{objectFit: 'cover', borderRadius: "20px", backgroundColor: 'black', transform: "rotateY(180deg)"}} controls={false} muted={true}></video> : 
                <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: "20px", backgroundColor: 'black'}}>
                    <Avatar sx={{fontSize: '100px', height: '200px', width: '200px', backgroundColor: user?.avatar }} >{user?.username?.[0].toLocaleUpperCase()}</Avatar>
                </div>
            }
            <h5 style={{position: 'absolute', bottom: 0, left: '20px', color:'whitesmoke'}}>You ({user?.username})</h5>
        </div>
        
    )
}

export default LocalTile;