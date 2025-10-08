import Button from '@mui/material/Button';
import api from "../hooks/axios";
import { useNotifier } from "../components/Notifier";
import React, { useState } from 'react';
import { useOutletContext } from "react-router-dom";
import SearchStudents from '../components/SearchStudents';

const StudentLanguage = () => {
    const notify = useNotifier();

    const [selectedMedium, setSelectedMedium] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [languageData, setLanguageData] = useState(null);
    const { user } = useOutletContext();

    const handleSearch = async (data) => {
        try {
            setSelectedClass(data.class_id); // keep for later optional subject condition
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

    // Reset search field and results
    const handleReset = () => {
        setLanguageData(null);
        notify("Search form reset successfully!", "warning");
    };

    const handleResetLanguage = (studentId, firstLangs, secondLangs, thirdLangs, optLangs) => {
        let studentName = "this student";
        setLanguageData(prevData =>
            prevData.map(student => {
                if (student.student_id === studentId) {
                    studentName = student.student;
                    return {
                        ...student,
                        f_id: firstLangs.length === 1 ? student.f_id : "",
                        s_id: secondLangs.length === 1 ? student.s_id : "",
                        t_id: thirdLangs.length === 1 ? student.t_id : "",
                        opt_id: optLangs.length === 1 ? student.opt_id : "",
                    };
                }
                return student;
            })
        );
        notify(`Language selection reset for ${studentName}!`, "error");
    };

    const handleCheckboxChange = (studentId, field, langId) => {
        setLanguageData(prevData =>
            prevData.map(student => {
                if (student.student_id === studentId) {
                    return { ...student, [field]: langId.toString() };
                }
                return student;
            })
        );
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/language/student/save", {
                medium_id: selectedMedium,
                class_id: selectedClass,
                section_id: selectedSection,
                languageData
            });
            if (res.data.success) {
                notify("Saved successfully!", "success");
                setLanguageData(languageData);
            } else {
                notify("Save failed. Please try again.", "error");
            }
        } catch (err) {
            notify("Error during save!", "error");
        }
    }

    return (
        <div>
            <div className='container-fluid position-absolute' style={{ top: '50px' }}>
                <h3 className="text-white fw-bold " >Student Language Setup</h3>
                <div className="card px-3 mt-4">
                    <div className='my-2'>
                        <div className="card-title h4">Subject Language</div>
                        <div className='card-category text-muted'>Classwise Student language setup</div>
                    </div>
                    <SearchStudents onSearch={handleSearch} onReset={handleReset} />

                    {languageData && languageData.length > 0 && (
                        <form className="col-md-12 m-2" onSubmit={handleSave}>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>SL.NO</th>
                                        <th>STUDENT</th>
                                        <th>DETAILS</th>
                                        <th>FIRST LANGUAGE</th>
                                        <th>SECOND LANGUAGE</th>
                                        <th>THIRD LANGUAGE</th>
                                        <th>OPTIONAL/ELECTIVE</th>
                                        <th>ACTION</th>
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
                                                <td>{lang.student}</td>
                                                <td>
                                                    <b>Class:</b> {lang.class_name} <br />
                                                    <b>Roll No:</b> {lang.roll_no} <br />
                                                    <b>Section:</b> {lang.section}
                                                </td>

                                                {/* FIRST LANGUAGE */}
                                                <td>
                                                    {firstLangs.map((name, i) => {
                                                        const id = firstLangIds[i];
                                                        const checked = (lang.f_id || "").split(",").includes(id);
                                                        const disabled = firstLangs.length === 1;
                                                        return (
                                                            <div className="form-check" key={id}>
                                                                <input className="form-check-input" type="radio" name={`first_language_${lang.student_id}`} value={id}
                                                                    checked={checked} disabled={disabled} onChange={() => handleCheckboxChange(lang.student_id, "f_id", id)}
                                                                />
                                                                <label className="form-check-label fw-normal">{name}</label>
                                                            </div>
                                                        );
                                                    })}
                                                </td>

                                                {/* SECOND LANGUAGE */}
                                                <td>
                                                    {secondLangs.map((name, i) => {
                                                        const id = secondLangIds[i];
                                                        const checked = (lang.s_id || "").split(",").includes(id);
                                                        const disabled = secondLangs.length === 1;
                                                        return (
                                                            <div className="form-check" key={id}>
                                                                <input className="form-check-input" type="radio" name={`second_language_${lang.student_id}`} value={id}
                                                                    checked={checked} disabled={disabled} onChange={() => handleCheckboxChange(lang.student_id, "s_id", id)}
                                                                />
                                                                <label className="form-check-label fw-normal">{name}</label>
                                                            </div>
                                                        );
                                                    })}
                                                </td>

                                                {/* THIRD LANGUAGE */}
                                                <td>
                                                    {thirdLangs.map((name, i) => {
                                                        const id = thirdLangIds[i];
                                                        const checked = (lang.t_id || "").split(",").includes(id);
                                                        const disabled = thirdLangs.length === 1;
                                                        return (
                                                            <div className="form-check" key={id}>
                                                                <input className="form-check-input" type="radio" name={`third_language_${lang.student_id}`} value={id}
                                                                    checked={checked} disabled={disabled} onChange={() => handleCheckboxChange(lang.student_id, "t_id", id)}
                                                                />
                                                                <label className="form-check-label fw-normal">{name}</label>
                                                            </div>
                                                        );
                                                    })}
                                                </td>

                                                {/* OPTIONAL/ELECTIVE */}
                                                <td>
                                                    {optLangs.map((name, i) => {
                                                        const id = optLangIds[i];
                                                        const checked = (lang.opt_id || "").split(",").includes(id);
                                                        const disabled = optLangs.length === 1;
                                                        return (
                                                            <div className="form-check" key={id}>
                                                                <input className="form-check-input" type="radio" name={`opt_elec_subject_${lang.student_id}`} value={id}
                                                                    checked={checked} disabled={disabled} onChange={() => handleCheckboxChange(lang.student_id, "opt_id", id)}
                                                                />
                                                                <label className="form-check-label">{name}</label>
                                                            </div>
                                                        );
                                                    })}
                                                </td>

                                                {/* ACTION (Reset button) */}
                                                <td>
                                                    {/* this button will reset the language selection for the student */}
                                                    <Button variant="contained" color="warning" onClick={() => handleResetLanguage(lang.student_id, firstLangs, secondLangs, thirdLangs, optLangs)}
                                                        disabled={firstLangs.length <= 1 && secondLangs.length <= 1 && thirdLangs.length <= 1 && optLangs.length <= 1}
                                                    >
                                                        <i className="fas fa-undo"></i>&nbsp;Reset
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Save Button */}
                            <div style={{ position: "fixed", bottom: "50px", right: "85px", zIndex: 5 }}>
                                <Button type="submit" variant="contained" color="success" size="large" sx={{ boxShadow: 4, borderRadius: "50px", px: 4, py: 1.2 }}>
                                    <i className="fa-solid fa-save me-2"></i> Save
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div >
    )
}

export default StudentLanguage
