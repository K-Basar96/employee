import Button from '@mui/material/Button';
import api from "../hooks/axios";
import React, { useEffect, useState } from 'react';
import { useOutletContext } from "react-router-dom";

const SchoolLanguage = () => {

    const [medium, setMedium] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedMedium, setSelectedMedium] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
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

    useEffect(() => {
        fetchMediums();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/language/school/search", {
                medium_id: selectedMedium,
                class_id: selectedClass,
            });
            if (res.data.success) {
                // console.table(res.data.result);
                setLanguageData(res.data.result);
            } else {
                console.error("Search failed:", res.data.message);
            }
        } catch (err) {
            console.error("Error during search:", err);
        }
    }

    const handleReset = async (e) => {
        setLanguageData(null);
    }

    const handleCheckboxChange = (e, type) => {
        const id = e.target.value;
        const checked = e.target.checked;

        const updatedData = { ...languageData };
        let selectedIds = updatedData[type]?.split(",") || [];
        if (checked) {
            if (!selectedIds.includes(id)) selectedIds.push(id);
        } else {
            selectedIds = selectedIds.filter((x) => x !== id);
        }

        updatedData[type] = selectedIds.join(",");
        setLanguageData(updatedData);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        console.table(languageData);
    }

    return (
        <div>
            <div className='container-fluid position-absolute' style={{ top: '50px' }}>
                <h3 className="text-white fw-bold " >School Language Setup</h3>
                <div className="card px-3 mt-4">
                    <div className='my-2'>
                        <div className="card-title h4">Subject Language</div>
                        <div className='card-category text-muted'>Class wise student subject language setup</div>
                    </div>

                    <form className='d-flex flex-row justify-content-around my-2' onSubmit={handleSearch}>
                        <div className='d-flex flex-column col-md-4'>
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
                        <div className='d-flex flex-column col-md-4'>
                            <label htmlFor="class">Class <span className='text-danger'>*</span></label>
                            <select id='class' className="form-select form-select-lg mb-3" aria-label=".form-select-lg example" required value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}>
                                <option value='' hidden>Select Class</option>
                                {classes.length > 0 ?
                                    (classes.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    )))
                                    : (<option disabled>Select Class</option>)}
                            </select>
                        </div>
                        <div className='d-flex flex-row gap-2 col-md-3 py-4'>
                            <Button type="submit" variant="contained" color="primary">
                                <i className="fa-solid fa-magnifying-glass"></i>Search
                            </Button>
                            <Button type='reset' variant="outlined" color="warning" onClick={handleReset}>
                                <i className="fa-solid fa-arrow-rotate-right"></i>Reset
                            </Button>
                        </div>
                    </form>

                    {languageData && (
                        <form className='col-md-12 m-2' onSubmit={handleSave}>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>CLASS</th>
                                        <th>FIRST LANGUAGE</th>
                                        <th>SECOND LANGUAGE</th>
                                        <th>THIRD LANGUAGE</th>
                                        <th>OPTIONAL/ELECTIVE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[languageData].map((lang, idx) => {
                                        const types = [
                                            { key: "first_language", label: "First Language", idKey: "fl_id" },
                                            { key: "second_language", label: "Second Language", idKey: "sl_id" },
                                            { key: "third_language", label: "Third Language", idKey: "tl_id" },
                                            { key: "opt_elec_subject", label: "Optional/Elective", idKey: "opt_id" },
                                        ];
                                        return (
                                            <tr key={lang.class_id}>
                                                <td>{lang.class_name}</td>
                                                {types.map((t) => {
                                                    const names = lang[t.key]?.split(",") || [];
                                                    const ids = lang[t.key + "_id"]?.split(",") || [];
                                                    const selectedIds = lang[t.idKey]?.split(",") || [];
                                                    return (
                                                        <td key={t.key}>
                                                            {names.map((name, i) => {
                                                                const id = ids[i];
                                                                const checked = selectedIds.includes(id);
                                                                return (
                                                                    <div className="form-check" key={id}>
                                                                        <input type="checkbox" className="form-check-input" value={id}
                                                                            id={`chk_${lang.class_id}_${id}_${t.key}`}
                                                                            checked={checked} onChange={(e) => handleCheckboxChange(e, t.idKey)}
                                                                        />
                                                                        <label className="form-check-label" htmlFor={`chk_${lang.class_id}_${id}_${t.key}`}>
                                                                            {name}
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className='float-end mx-5'>
                                <Button type="submit" variant="contained" color="primary" size="large">
                                    <i className="fa-solid fa-save"></i>Save
                                </Button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div >
    )
}

export default SchoolLanguage
