import React, { FunctionComponent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import RemoteTile from '../VideoTile/RemoteTile/RemoteTile';
import { ADD_REMOTESTREAM, ParticipantType } from '../../redux/meetingSlice';

const RemoteUsers: FunctionComponent = () => {

    const participants = useSelector( (state: RootState) => state.meeting.participants);
    const dispatch = useDispatch();

    useEffect( () => {
        console.log(participants);
        Object.keys(participants).forEach( (key) => {
            const user = participants[key];
            const peerConnection: RTCPeerConnection = user?.peerConnection;
           
            if(peerConnection && !user?.onTrackSet){
                const remoteStream = new MediaStream();
                peerConnection.ontrack = (event: RTCTrackEvent) => {
                    console.log("Remote User :", event);
                    event.streams[0].getTracks().forEach((track) => {
                      remoteStream.addTrack(track);
                    });
                };

                dispatch(ADD_REMOTESTREAM({ key, remoteStream}));
            }   
        })

    }, [participants])

    return(
        <div className='remote-container' style={{overflowY: "auto", height: '100%'}}>
            {
                Object.keys(participants).length > 0 && Object.keys(participants).map( (key, index) => {
                    const user = participants[key];
        
                    if(user?.IsCurrentUser)
                        return;
                    
                     
                    if(user?.remoteStream)
                        return( 
                            <div className='remote-tile' style={{padding: '10px', position: 'relative'}} key={index}>
                                <RemoteTile  remoteUser={user} index={index} />
                            </div>
                        );
                })
            }
        </div>
    )
}

export default RemoteUsers;
