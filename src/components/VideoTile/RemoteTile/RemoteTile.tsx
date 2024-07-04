import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Avatar } from "@mui/material";

type RemoteTileProps = {
    remotestream: MediaStream
    index: number
    username: string
    avatar: string
    video: boolean
}
const RemoteTile:FunctionComponent<RemoteTileProps> = ({remotestream, index, username, video, avatar}) => {
    const VideoRef = useRef<any>();
  console.log(remotestream.getVideoTracks()[0])
    useEffect( () => {
        console.log(remotestream);
        if(VideoRef.current && remotestream)
            VideoRef.current.srcObject = remotestream;

    },[remotestream]);

    return(
        <>
            {true ?
            <>
                <video className={`remote-user-${index}`} ref={VideoRef} autoPlay playsInline  width={'100%'} height={'250px'} style={{objectFit: 'cover', borderRadius: "20px", backgroundColor: 'black'}} controls={false} ></video>
                <h5 style={{position: 'absolute', bottom: 0, left: '20px', color:'whitesmoke'}}>{username}</h5>
            </>
            :
            <div style={{width: '100%', height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: "20px", backgroundColor: 'black'}}>
                <Avatar sx={{fontSize: '100px', height: '200px', width: '200px', backgroundColor: avatar }} >{username?.[0].toLocaleUpperCase()}</Avatar>
            </div>
            }
        </>
    );
}

export default RemoteTile;