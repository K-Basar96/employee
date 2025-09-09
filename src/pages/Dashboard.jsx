// src/pages/Dashboard.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const Dashboard = () => {
    const token = useSelector(state => state.token);
    return (
        <div>
            <div className='container-fluid position-absolute' style={{top:'50px'}}>
                <h3 className="text-white fw-bold " >SED Dashboard</h3>
                <div className="card px-3 mt-4">
                    <h4 className="card-title">Hello there</h4>
                    <div className="card-title">Authenticated User: {token}</div>
                    <div className="card-title">This is sample text.</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
