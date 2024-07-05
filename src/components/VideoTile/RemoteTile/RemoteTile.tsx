import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Avatar } from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

type RemoteTileProps = {
    remotestream: MediaStream
    index: number
    username: string
    avatar: string
    video: boolean
    audio: boolean
}
const RemoteTile:FunctionComponent<RemoteTileProps> = ({remotestream, index, username, video, avatar, audio}) => {
    console.log("video audio", video, audio)
    const VideoRef = useRef<any>(null);
    useEffect( () => {
        if(video && VideoRef.current)
            VideoRef.current.srcObject = remotestream;
    },[video]);

    return(
        <>
            {video ?
            <>
                {audio ? 
                    <MicIcon sx={{position: 'absolute', top: 0, right: 0, color: 'whitesmoke', padding: '15px'}}/> :
                    <MicOffIcon sx={{position: 'absolute', top: 0, right: 0, color: 'whitesmoke', padding: '15px'}}/>
                }
                <video className={`remote-user-${index}`} ref={VideoRef} autoPlay playsInline  width={'100%'} height={'200px'} style={{objectFit: 'cover', borderRadius: "20px", backgroundColor: 'black'}} controls={false} ></video>
                <h5 style={{position: 'absolute', bottom: 0, left: '20px', color:'whitesmoke'}}>{username}</h5>
            </>
            :
            <div style={{width: '100%', height: '200px', position: 'relative' ,display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: "20px", backgroundColor: 'black'}}>
                {audio ? 
                    <MicIcon sx={{position: 'absolute', top: 0, right: 0, color: 'whitesmoke', padding: '15px'}}/> :
                    <MicOffIcon sx={{position: 'absolute', top: 0, right: 0, color: 'whitesmoke', padding: '15px'}}/>
                }
                <Avatar sx={{fontSize: '3rem', height: '100px', width: '100px', backgroundColor: avatar }} >{username?.[0].toLocaleUpperCase()}</Avatar>
            </div>
            }
        </>
    );
}

export default RemoteTile;
