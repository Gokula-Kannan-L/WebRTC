import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const ScreenTile:FunctionComponent = () => {

    const VideoRef = useRef<any>(null);
    const localstate = useSelector((state: RootState) => state.meeting);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    console.log(localstate.ShareUser?.userkey )
    useEffect( () => {
        if(localstate.IsScreenSharing){
            if(localstate.ShareUser?.userkey === localstate.currentUser?.key){
                setScreenStream(localstate.localStream);
            }else{
                if(localstate.ShareUser?.userkey){
                    let RemoteUser = localstate.participants[localstate.ShareUser?.userkey];
                    const peerConnection: RTCPeerConnection = RemoteUser?.peerConnection;
                    console.log("Remote User--------", RemoteUser, "Peer connection---------", peerConnection);
                    if(peerConnection){
                        const remoteStream = new MediaStream();
                        peerConnection.ontrack = async(event: RTCTrackEvent) => {
                            event.streams[0].getTracks().forEach((track) => {
                                console.log("Track--------", track);
                              remoteStream.addTrack(track);
                            });
                        };
                        console.log("remoteStream----------", remoteStream);
                        setScreenStream(remoteStream);
                    }
                }
            }
        }
    },[localstate.IsScreenSharing]);

    useEffect( () => {
        if(screenStream && VideoRef.current){
            VideoRef.current.srcObject = screenStream;
        }
        console.log("screenStream",screenStream)
    }, [screenStream])

    return(
        <video ref={VideoRef} id="local-videotile" autoPlay playsInline width={'100%'} height={'100%'} style={{objectFit: 'cover', borderRadius: "20px", backgroundColor: 'black'}} controls={false} muted={true}></video>
    );
}
export default ScreenTile;