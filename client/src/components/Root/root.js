import React from "react";
import Paint from "../paint/paint";
import { Auth } from '../Authentication/auth/auth'
import { Reg } from "../Authentication/reg/Reg";
import { What } from "../UI/what/what";
import Admin from "../Admin/Admin";
import ErrorPage from "../UI/404"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Root() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Reg />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/draw" element={<Paint />} />
            <Route path="/what" element={<What />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<ErrorPage />} />
        </Routes>
    </Router>
  )
}
  
export default Root;