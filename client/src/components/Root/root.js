import React from "react";
import Paint from "../paint/paint";
import { Auth } from "../auth/auth";
import { Reg } from "../reg";
import { What } from "../what/what";
import ErrorPage from "../404";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Root() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Reg />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/draw" element={<Paint />} />
            <Route path="/what" element={<What />} />
            <Route path="*" element={<ErrorPage />} />
        </Routes>
    </Router>
  )
}
  
export default Root;