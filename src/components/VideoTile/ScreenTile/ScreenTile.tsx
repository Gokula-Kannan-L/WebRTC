import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const ScreenTile:FunctionComponent = () => {

    const VideoRef = useRef<any>(null);
    const localstate = useSelector((state: RootState) => state.meeting);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

    useEffect( () => {
        if(localstate.IsScreenSharing){
            if(localstate.ShareUser?.userkey === localstate.currentUser?.key){
                setScreenStream(localstate.localStream);
            }else{
                let RemoteUser = localstate.ShareUser?.userkey ? localstate.participants[localstate.ShareUser?.userkey] : null;
                const peerConnection: RTCPeerConnection = RemoteUser?.peerConnection;
                if(peerConnection){
                    const remoteStream = new MediaStream();
                    peerConnection.ontrack = async(event: RTCTrackEvent) => {
                        event.streams[0].getTracks().forEach((track) => {
                          remoteStream.addTrack(track);
                        });
                    };
                    setScreenStream(remoteStream);
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
        <video ref={VideoRef} id="local-videotile" autoPlay playsInline width={'100%'} height={'100%'} style={{objectFit: 'cover', borderRadius: "20px", backgroundColor: 'black'}} controls={false} muted={true}></video>
    );
}
export default ScreenTile;