import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import App from './App';
import StatusPage from './components/StatusPage';
import {createRoot} from "react-dom/client";
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App/>}/>
        <Route path="/status/:pid" element={<StatusPage/>}/>
      </Routes>
    </Router>
  </React.StrictMode>
);
