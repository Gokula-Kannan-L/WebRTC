import React, { FunctionComponent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import RemoteTile from '../VideoTile/RemoteTile/RemoteTile';
import { ADD_REMOTESTREAM } from '../../redux/meetingSlice';

const RemoteUsers: FunctionComponent = () => {

    const participants = useSelector((state: RootState) => state.meeting.participants);
    const host = useSelector((state:RootState) => state.meeting.hostInfo);

    const dispatch = useDispatch();
    // Low Resolution (240p): Around 300,000 - 500,000 bps
    // Standard Definition (480p): Around 500,000 - 1,000,000 bps
    // High Definition (720p): Around 1,500,000 - 3,000,000 bps
    // Full High Definition (1080p): Around 3,000,000 - 6,000,000 bps
    // 4K (2160p): Around 15,000,000 - 25,000,000 bps

    // useEffect( () => {
    //     Object.keys(participants).forEach( (userKey) => {
    //         let user = participants[userKey];
    //         if(user?.peerConnection){
    //             const peerConnection = user.peerConnection as RTCPeerConnection;
    //             peerConnection.getSenders().forEach( sender => {
    //                 if(sender.track?.kind === 'video'){
    //                     let parameters = sender.getParameters();
    //                     if (!parameters.encodings) {
    //                         parameters.encodings = [{}];
    //                     }
    
    //                     parameters.encodings[0].maxBitrate = 6000000; // Adjust bitrate as needed
    //                     sender.setParameters(parameters);
    //                 }
    //             });
    //         }
    //     })
    // }, [participants])

    useEffect( () => {
        if(participants){
            Object.keys(participants).forEach( (key) => {
                let user = participants[key];

                if(user.peerConnection && user.remoteStream ){
                    let peerConnection = user.peerConnection as RTCPeerConnection;
                    console.log("remote :" , user.remoteStream.getTracks() as MediaStream );
                    peerConnection.ontrack = async(event: RTCTrackEvent) => {
                        console.log("ontrack -----", event);

                        let remoteStream = user.remoteStream as MediaStream;
                        event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
                            remoteStream.addTrack(track);
                            track.addEventListener('ended', (event) => {
                                console.log("Event Endend", event, track);
                            })
                        });
                        dispatch(ADD_REMOTESTREAM({key, remoteStream}));
                    };

                   
                }
            })
        }
    }, [participants]);

    return(
        <div className='remote-container' style={{overflowY: "auto", height: '100%'}}>
            {
                Object.keys(participants).length > 0 && Object.keys(participants).map( (key, index) => {
                    const user = participants[key];
                   
                    if(user?.IsCurrentUser)
                        return;
                    
                    const IsHost = (host?.hostUserKey == key ) ? true : false;
                    if(user?.remoteStream)
                        
                        return( 
                            <div className='remote-tile' style={{padding: '10px', position: 'relative'}} key={index}>
                                <RemoteTile  remoteUser={user} index={index} IsHost={IsHost}/>
                            </div>
                        );
                })
            }
        </div>
    )
}

export default RemoteUsers;
