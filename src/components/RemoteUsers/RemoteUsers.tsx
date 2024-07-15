import React, { FunctionComponent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import RemoteTile from '../VideoTile/RemoteTile/RemoteTile';
import { ADD_REMOTESTREAM, ParticipantType } from '../../redux/meetingSlice';

const RemoteUsers: FunctionComponent = () => {

    const participants = useSelector( (state: RootState) => state.meeting.participants);
   
    useEffect( () => {
        Object.keys(participants).forEach( (userKey) => {
            let user = participants[userKey];
            if(user?.peerConnection){
                const peerConnection = user.peerConnection as RTCPeerConnection;
                peerConnection.getSenders().forEach( sender => {
                    let parameters = sender.getParameters();
                    console.log("Parameters--------------------",parameters);
                    if (!parameters.encodings) {
                        parameters.encodings = [{}];
                    }
                    parameters.encodings[0].maxBitrate = 6000000; // Adjust bitrate as needed
                    sender.setParameters(parameters);
                });
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
