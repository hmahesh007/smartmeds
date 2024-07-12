import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '/Users/arnavdixit/Downloads/hfh_copy/src/Login.tsx';
import Homepage from '/Users/arnavdixit/Downloads/hfh_copy/src/Homepage.tsx';
import SignUp from '/Users/arnavdixit/Downloads/hfh_copy/src/sign_up.tsx'; 
import MedPath from '/Users/arnavdixit/Downloads/hfh_copy/src/MedList.tsx';
import AddMed from '/Users/arnavdixit/Downloads/hfh_copy/src/AddMed.tsx';
import React from 'react';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/user_meds" element={<MedPath />} />
          <Route path="/add_med" element={<AddMed />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
