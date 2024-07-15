import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { startTimer } from "../../helpers/helper";


const MeetTimer = () => {

    const MeetInfo = useSelector((state: RootState) => state.meeting.hostInfo)
    useEffect( () => {
        if(MeetInfo?.createdAt)
            console.log(MeetInfo, startTimer(new Date(MeetInfo?.createdAt)));
    }, []);

    return(
        <div className="meet-timer" style={{position: 'absolute', zIndex:1, right: "20px", padding: "10px"}}>
            <h1>timer</h1>
        </div>
    )
}

export default MeetTimer;