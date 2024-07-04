import React from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './screens/Home/Home';
import MeetingForm, { FormType } from './components/MeetingForm/MeetingForm';
import Meeting from './screens/Meeting/Meeting';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';

function App() {
  const currentUser = useSelector( (state: RootState) => state.meeting.currentUser)
  return (
    <div className="App" >
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/createMeeting" element={<MeetingForm Type={FormType.CREATE}/>}/>
          <Route path="/joinMeeting" element={<MeetingForm Type={FormType.JOIN}/>}/>
          <Route path="/meeting" element={currentUser?.userid ? <Meeting/> : <Navigate to="/" />}/> 
        </Routes>
    </div>
  );
}

export default App;
