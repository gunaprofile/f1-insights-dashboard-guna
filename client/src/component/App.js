import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <div className="bg-body_background min-h-screen">
            <ToastContainer />
            <Header />
            <Outlet />
        </div>
    );
}

export default App;
