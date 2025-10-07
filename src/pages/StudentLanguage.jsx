import Button from '@mui/material/Button';
import api from "../hooks/axios";
import { useNotifier } from "../components/Notifier";
import React, { useEffect, useState } from 'react';
import { useOutletContext } from "react-router-dom";

const StudentLanguage = () => {
    const notify = useNotifier();

    const [medium, setMedium] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedMedium, setSelectedMedium] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [languageData, setLanguageData] = useState(null);
    const { user } = useOutletContext();

    const fetchMediums = async () => {
        try {
            const res = await api.get("/language/school");
            if (res.data.success) {
                setMedium(res.data.mediums);
            }
        } catch (err) {
            console.error("Failed to fetch mediums:", err);
        }
    };

    const handleChange = async (e) => {
        const medium_id = e.target.value;
        setSelectedMedium(medium_id);
        try {
            const res = await api.post("/language/school/class", {
                medium_id: medium_id
            });
            if (res.data.success) {
                setClasses(res.data.classes);
            }
        } catch (err) {
            console.error("Failed to fetch classes:", err);
        }
    };

    const handleClassChange = async (e) => {
        const class_id = e.target.value;
        setSelectedClass(class_id);
        try {
            const res = await api.post("/language/school/section", {
                medium_id: selectedMedium,
                class_id: class_id
            });
            if (res.data.success) {
                setSections(res.data.sections);
            }
        } catch (err) {
            console.error("Failed to fetch sections:", err);
        }
    };

    useEffect(() => {
        fetchMediums();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/language/student", {
                medium_id: selectedMedium,
                class_id: selectedClass,
                section_id: selectedSection
            });
            if (res.data.success) {
                // console.table(res.data.students);
                setLanguageData(res.data.students);
            } else {
                console.error("Search failed:", res.data.message);
            }
        } catch (err) {
            console.error("Error during search:", err);
        }
    }

    const handleReset = async (e) => {
        setLanguageData(null);
        notify("Searching form reset successfully!", "warning");
    }

    const handleResetLanguage = (studentId) => {
        let studentName = "this student";
        setLanguageData(prevData =>
            prevData.map(student => {
                if (student.student_id === studentId) {
                    studentName = student.student;
                    return {
                        ...student,
                        f_id: "",
                        s_id: "",
                        t_id: "",
                        opt_id: ""
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

                    <form className='d-flex flex-row justify-content-around my-2' onSubmit={handleSearch}>
                        <div className='d-flex flex-column col-md-3'>
                            <label htmlFor="medium">Medium <span className='text-danger'>*</span></label>
                            <select id='medium' className="form-select form-select-lg mb-3" required onChange={handleChange} value={selectedMedium}>
                                <option value='' hidden>Select Medium</option>
                                {medium.length > 0 ?
                                    (medium.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    )))
                                    : (<option disabled>Select Medium</option>)}
                            </select>
                        </div>
                        <div className='d-flex flex-column col-md-3'>
                            <label htmlFor="class">Class <span className='text-danger'>*</span></label>
                            <select id='class' className="form-select form-select-lg mb-3" aria-label=".form-select-lg example" onChange={handleClassChange} required value={selectedClass}>
                                <option value='' hidden>Select Class</option>
                                {classes.length > 0 ?
                                    (classes.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    )))
                                    : (<option disabled>Select Class</option>)}
                            </select>
                        </div>
                        <div className='d-flex flex-column col-md-3'>
                            <label htmlFor="section">Section <span className='text-danger'>*</span></label>
                            <select id='section' className="form-select form-select-lg mb-3" aria-label=".form-select-lg example" required value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}>
                                <option value='' hidden>Select Section</option>
                                {sections.length > 0 ?
                                    (sections.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    )))
                                    : (<option disabled>Select Section</option>)}
                            </select>
                        </div>
                        <div className='d-flex flex-row gap-2 col-md-2 py-4'>
                            <Button type="submit" variant="contained" color="primary">
                                <i className="fa-solid fa-magnifying-glass"></i>Search
                            </Button>
                            <Button type='reset' variant="outlined" color="warning" onClick={handleReset}>
                                <i className="fa-solid fa-arrow-rotate-right"></i>Reset
                            </Button>
                        </div>
                    </form>

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
                                                    <Button variant="contained" color="warning" onClick={() => handleResetLanguage(lang.student_id)}
                                                        disabled={firstLangs.length === 1 && secondLangs.length === 1 && thirdLangs.length === 1 && optLangs.length === 1}
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
