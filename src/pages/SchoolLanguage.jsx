import React, { useState } from 'react';
import { useOutletContext } from "react-router-dom";

const SchoolLanguage = () => {
    const [medium, setMedium] = useState('');
    const { user } = useOutletContext();
    // console.log(user);
    return (
        <div>
            <div className='container-fluid position-absolute' style={{ top: '50px' }}>
                <h3 className="text-white fw-bold " >School Language Setup</h3>
                <div className="card px-3 mt-4">
                    <div className='my-2'>
                        <div className="card-title h4">Subject Language</div>
                        <div className='card-category text-muted'>Class wise student subject language setup</div>
                    </div>

                    <div className='d-flex flex-row justify-content-around my-2'>
                        <div className='d-flex flex-column col-md-4'>
                            <label htmlFor="medium">Select Medium</label>
                            <select id='medium' className="form-select form-select-lg mb-3" aria-label=".form-select-lg example">
                                <option selected value='' hidden>Open this select menu</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                        </div>
                        <div className='d-flex flex-column col-md-4'>
                            <label htmlFor="class">Select Class</label>
                            <select id='class' className="form-select form-select-lg mb-3" aria-label=".form-select-lg example">
                                <option selected value='' hidden>Open this select menu</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                        </div>
                        <div className='d-flex flex-row gap-2 col-md-3 py-4'>
                            <button className='btn btn-primary btn-lg'>Search</button>
                            <button className='btn btn-secondary'>Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default SchoolLanguage
