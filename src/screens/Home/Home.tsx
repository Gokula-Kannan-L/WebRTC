import React, { FunctionComponent, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { RESET } from "../../redux/meetingSlice";

const Home:FunctionComponent = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect( ()=> {
        dispatch(RESET());
    },[])
    
    return(
        <Box display={'flex'} height={'100vh'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'} gap={'1rem'}>
            <Button variant="contained" sx={{width: '20%'}} onClick={() => navigate('/createMeeting')}>Create Meeting</Button>
            <Typography>OR</Typography>
            <Button variant="contained" sx={{width: '20%'}} onClick={() => navigate('/joinMeeting')}>Join Meeting</Button>
        </Box>
    )
}

export default Home;