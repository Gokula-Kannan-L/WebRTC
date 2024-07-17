import store from "../redux/store";
import { ParticipantType, PreferenceType, UserType } from "../redux/meetingSlice";
import { getChildRef, getParticipantRef, handleOnChildAdded, pushNewNode, updateData, writeData } from "./firebase";
import { remove } from "firebase/database";

const servers: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          process.env.REACT_APP_TURN_URL ? process.env.REACT_APP_TURN_URL : "",
        ],
        credential:  process.env.REACT_APP_TURN_CREDENTIAL,
        username: process.env.REACT_APP_TURN_USERNAME
      },
    ],
    iceCandidatePoolSize: 10,
};

// const servers: RTCConfiguration = {
//   iceServers: [
//     {
//       urls: [
//         "stun:stun1.l.google.com:19302",
//         "stun:stun2.l.google.com:19302",
//         "stun:stun.l.google.com:19302",
//         "stun:stun3.l.google.com:19302",
//         "stun:stun4.l.google.com:19302",
//         "stun:stun.services.mozilla.com",
//       ],
//     },
//   ],
//   iceCandidatePoolSize: 10,
// };

// Add SVC configuration to the RTCConfiguration
const svcEncodingParams = [
  { rid: 'q', maxBitrate: 100000, scalabilityMode: 'L1T3' },
  { rid: 'h', maxBitrate: 500000, scalabilityMode: 'L1T3' },
  { rid: 'f', maxBitrate: 1500000, scalabilityMode: 'L1T3' }
];


export const updateUserPreference = (userKey: string, preference: PreferenceType) => {
  const participantRef = getParticipantRef();
  const userRef = getChildRef(getChildRef(participantRef, userKey), 'preference');
  setTimeout(() => {
    updateData(userRef, preference);
  });
}

export const leaveMeeting = (userKey: string) => {
  const participantRef = getParticipantRef();
  const userRef = getChildRef(participantRef, userKey);
  remove(userRef);

}

export const createOffer = async(peerConnection: RTCPeerConnection, createdId: string, receiverId: string) => {
    
    const participantRef = getParticipantRef();
    const receiverRef = getChildRef(participantRef, receiverId);

    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if(event.candidate){
        const offerCandidatesRef = getChildRef(receiverRef, "offerCandidates");
        pushNewNode(offerCandidatesRef, {...event.candidate.toJSON(), userKey: createdId});
      } 
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const offerPayload = {
      sdp: offer.sdp,
      type: offer.type,
      userKey: createdId
    }

    const offersRef = getChildRef(receiverRef, "offers");
    await writeData(pushNewNode(offersRef), {offerPayload});
    
}

export const createAnswer = async(peerConnection: RTCPeerConnection, currentUserKey: string, receiverId: string) => {
   
    
    const participantRef = getParticipantRef();
    const receiverRef = getChildRef(participantRef, receiverId);

    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if(event.candidate){
        const answerCandidatesRef = getChildRef(receiverRef, "answerCandidates")
        pushNewNode(answerCandidatesRef, {...event.candidate.toJSON(), userKey: currentUserKey});
      }
    }

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    const answerPayload = {
      sdp: answer.sdp,
      type: answer.type,
      userKey: currentUserKey
    }

    const answerRef = getChildRef(receiverRef, "answers");
    await writeData(pushNewNode(answerRef), {answerPayload});
}

export const createconnection = (currentUser: UserType, newUser: ParticipantType, mediastream: MediaStream) => {
    
    const peerConnection = new RTCPeerConnection(servers);

    mediastream.getTracks().forEach( (track: MediaStreamTrack) => {
      peerConnection.addTrack(track, mediastream)
    });

       // Set SVC encoding parameters
    const videoSender = peerConnection.getSenders().find((sender: RTCRtpSender) => sender?.track?.kind === 'video');
    if (videoSender) {
        const params = videoSender?.getParameters();
        if (params && params.encodings) {
            params.encodings = svcEncodingParams;
            videoSender?.setParameters(params).catch(error => console.error("Failed to set SVC parameters:", error));
        }
    }

    let currentUserKey = currentUser.key;
    let newUserKey = Object.keys(newUser)[0];

    if(currentUserKey && newUserKey){
      let sortedIDs = [currentUserKey, newUserKey].sort((a, b) => a.localeCompare(b));
      newUser[newUserKey].peerConnection = peerConnection;

      if(sortedIDs[1] == currentUserKey ){
        createOffer(peerConnection, sortedIDs[1], sortedIDs[0]);
      }

    }
}

export const InitializeListeners = (currentUserKey: string) => {

    const participantRef = getParticipantRef();
    const receiverRef = getChildRef(participantRef, currentUserKey);

    const offersRef = getChildRef(receiverRef, "offers");
    handleOnChildAdded(offersRef, async(snapshot) => {
      const data = snapshot.val();

      if(data?.offerPayload){
        const createdId = data?.offerPayload.userKey;
        const peerConnection: RTCPeerConnection =  store.getState().meeting.participants[createdId].peerConnection;

        await peerConnection.setRemoteDescription(new RTCSessionDescription(data?.offerPayload));
        await createAnswer(peerConnection, currentUserKey, createdId);
      }
    });

    const offerCandidatesRef = getChildRef(receiverRef, "offerCandidates");
    handleOnChildAdded(offerCandidatesRef, async(snapshot) => {
      const data = snapshot.val();

      if(data?.userKey){
        const peerConnection: RTCPeerConnection = store.getState().meeting.participants[data?.userKey].peerConnection;
        await peerConnection.addIceCandidate( new RTCIceCandidate(data));
      }
    });

    const answersRef = getChildRef(receiverRef, "answers");
    handleOnChildAdded(answersRef, async(snapshot) => {
      const data = snapshot.val();

      if(data?.answerPayload){
        const createdId = data?.answerPayload.userKey;
        const peerConnection: RTCPeerConnection = store.getState().meeting.participants[createdId].peerConnection;

        await peerConnection.setRemoteDescription(new RTCSessionDescription(data?.answerPayload));
      }
    });

    const answerCandidatesRef = getChildRef(receiverRef, "answerCandidates");
    handleOnChildAdded(answerCandidatesRef, async(snapshot) => {
      const data = snapshot.val();

      if(data?.userKey){
        const peerConnection: RTCPeerConnection = store.getState().meeting.participants[data?.userKey].peerConnection;
        await peerConnection.addIceCandidate( new RTCIceCandidate(data));
      }
    });

}