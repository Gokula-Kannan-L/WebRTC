import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Avatar } from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

export type RemoteUserType = {
    remoteUser: {
        username: string,
        userid: string,
        preference: {
            audio: boolean,
            video: boolean,
            screen: boolean,
        }
        avatar: string,
        remoteStream: MediaStream;
    }
    index: number
}
const RemoteTile:FunctionComponent<RemoteUserType> = ({remoteUser, index}) => {
   
    const VideoRef = useRef<any>(null);
    useEffect( () => {
        if(VideoRef.current)
            VideoRef.current.srcObject = remoteUser.remoteStream;
            VideoRef.current.muted = remoteUser?.preference.audio;
    },[remoteUser]);

    return(
        <>
            {remoteUser.preference.video ?
            <>
                {remoteUser.preference.audio ? 
                    <MicIcon sx={{position: 'absolute', top: 0, right: 0, color: '#F4C430', padding: '25px', filter: "drop-shadow(0px 0px 20px black)", zIndex: 1}}/> :
                    <MicOffIcon sx={{position: 'absolute', top: 0, right: 0, color: '#F4C430', padding: '25px', filter: "drop-shadow(0px 0px 20px black)", zIndex: 1}}/>
                }
                <video className={`remote-user-${index}`} ref={VideoRef} autoPlay playsInline  width={'100%'} height={'200px'} style={{objectFit: 'cover', borderRadius: "20px", backgroundColor: 'black', transform: "rotateY(180deg)"}} controls={false} ></video>
                <h5 style={{position: 'absolute', bottom: 0, left: "25px",   color:'whitesmoke'}}>{remoteUser.username}</h5>
            </>
            :
            <div style={{width: '100%', height: '200px', position: 'relative' ,display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: "20px", backgroundColor: 'black'}}>
                {remoteUser.preference.audio ? 
                    <MicIcon sx={{position: 'absolute', top: 0, right: 0, color: '#F4C430', padding: '15px', filter: "drop-shadow(0px 0px 20px black)", zIndex: 1}}/> :
                    <MicOffIcon sx={{position: 'absolute', top: 0, right: 0, color: '#F4C430', padding: '15px', filter: "drop-shadow(0px 0px 20px black)", zIndex: 1}}/>
                }
                <Avatar sx={{fontSize: '3rem', height: '100px', width: '100px', backgroundColor: remoteUser.avatar }} >{remoteUser.username?.[0].toLocaleUpperCase()}</Avatar>
            </div>
            }
        </>
    );
}

export default RemoteTile;