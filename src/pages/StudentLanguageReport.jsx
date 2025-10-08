import api from "../hooks/axios";
import { useNotifier } from "../components/Notifier";
import React, { useState } from 'react';
import { useOutletContext } from "react-router-dom";
import SearchStudents from '../components/SearchStudents';

const StudentLanguageReport = () => {
    const notify = useNotifier();
    const { user } = useOutletContext();

    const [languageData, setLanguageData] = useState(null);
    const [selectedClass, setSelectedClass] = useState("");

    const handleSearch = async (data) => {
        try {
            setSelectedClass(data.class_id);
            const res = await api.post("/language/student", data);
            if (res.data.success) {
                setLanguageData(res.data.students);
            } else {
                notify("No students found.", "warning");
            }
        } catch (err) {
            console.error("Error during search:", err);
            notify("Search failed! Please try again.", "error");
        }
    };

    // Reset data
    const handleReset = () => {
        setLanguageData(null);
        notify("Search form reset successfully!", "warning");
    };

    return (
        <div>
            <div className='container-fluid position-absolute' style={{ top: '50px' }}>
                <h3 className="text-white fw-bold " >Language Report</h3>
                <div className="card px-3 mt-4">
                    <div className='my-2'>
                        <div className="card-title h4">Student language Report</div>
                        <div className='card-category text-muted'>Classwise Student language Report</div>
                    </div>

                    <SearchStudents onSearch={handleSearch} onReset={handleReset} />

                    {languageData && languageData.length > 0 && (
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>SL.NO</th>
                                    <th>STUDENT DETAILS</th>
                                    <th>FIRST LANGUAGE</th>
                                    <th>SECOND LANGUAGE</th>
                                    <th>THIRD LANGUAGE</th>
                                    <th>OPTIONAL/ELECTIVE</th>
                                </tr>
                            </thead>

                            <tbody>
                                {languageData.map((lang, index) => {
                                    const firstLangs = lang.first_language?.split(",") || [];
                                    const firstLangIds = lang.first_language_id?.split(",") || [];
                                    const secondLangs = lang.second_language?.split(",") || [];
                                    const secondLangIds = lang.second_language_id?.split(",") || [];
                                    const thirdLangs = lang.third_language?.split(",") || [];
                                    const thirdLangIds = lang.third_language_id?.split(",") || [];
                                    const optLangs = lang.opt_elec_subject?.split(",") || [];
                                    const optLangIds = lang.opt_elec_subject_id?.split(",") || [];

                                    return (
                                        <tr key={lang.student_id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <b>Name:</b> {lang.student} <br />
                                                <b>Class:</b> {lang.class_name} &emsp; <b>Section:</b> {lang.section} &emsp; <b>Roll No:</b> {lang.roll_no}
                                            </td>

                                            {/* FIRST LANGUAGE */}
                                            <td>
                                                {(lang.f_id && lang.f_id > 0) ? firstLangs[firstLangIds.indexOf(lang.f_id)] :
                                                    <span className='text-danger'>No Language Selected</span>}
                                            </td>

                                            {/* SECOND LANGUAGE */}
                                            <td>
                                                {(lang.s_id && lang.s_id > 0) ? secondLangs[secondLangIds.indexOf(lang.s_id)] :
                                                    <span className='text-danger'>No Language Selected</span>}
                                            </td>

                                            {/* THIRD LANGUAGE */}
                                            <td>
                                                {[9, 10].includes(parseInt(selectedClass)) ?
                                                    <label className="text-info">Not Needed</label>
                                                    : ((lang.t_id && lang.t_id > 0) ? thirdLangs[thirdLangIds.indexOf(lang.t_id)] :
                                                        <span className='text-danger'>No Language Selected</span>)}
                                            </td>

                                            {/* OPTIONAL/ELECTIVE */}
                                            <td>
                                                {[5, 6, 7, 8].includes(parseInt(selectedClass)) ?
                                                    <label className="text-info">Not Needed</label>
                                                    : ((lang.opt_id && lang.opt_id > 0) ? optLangs[optLangIds.indexOf(lang.opt_id)] :
                                                        <span className="text-danger">No Language Selected</span>)
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div >
    )
}

export default StudentLanguageReport
