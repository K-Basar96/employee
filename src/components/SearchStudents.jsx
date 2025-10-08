import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import api from "../hooks/axios";

const SearchStudents = ({ onSearch, onReset }) => {
    const [mediums, setMediums] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    const [selectedMedium, setSelectedMedium] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    useEffect(() => {
        fetchMediums();
    }, []);

    const fetchMediums = async () => {
        try {
            const res = await api.get("/language/school");
            if (res.data.success) setMediums(res.data.mediums);
        } catch (err) {
            console.error("Failed to fetch mediums:", err);
        }
    };

    const handleMediumChange = async (e) => {
        const medium_id = e.target.value;
        setSelectedMedium(medium_id);
        setClasses([]);
        setSections([]);
        try {
            const res = await api.post("/language/school/class", { medium_id });
            if (res.data.success) setClasses(res.data.classes);
        } catch (err) {
            console.error("Failed to fetch classes:", err);
        }
    };

    const handleClassChange = async (e) => {
        const class_id = e.target.value;
        setSelectedClass(class_id);
        setSections([]);
        try {
            const res = await api.post("/language/school/section", {
                medium_id: selectedMedium,
                class_id,
            });
            if (res.data.success) setSections(res.data.sections);
        } catch (err) {
            console.error("Failed to fetch sections:", err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedMedium || !selectedClass) return;
        onSearch({
            medium_id: selectedMedium,
            class_id: selectedClass,
            section_id: selectedSection,
        });
    };

    const handleReset = () => {
        setSelectedMedium("");
        setSelectedClass("");
        setSelectedSection("");
        setClasses([]);
        setSections([]);
        onReset();
    };

    return (
        <form className="d-flex flex-row justify-content-around my-2" onSubmit={handleSubmit}>
            {/* Medium */}
            <div className="d-flex flex-column col-md-3">
                <label htmlFor="medium">Medium <span className="text-danger">*</span></label>
                <select id="medium" className="form-select form-select-lg mb-3" required value={selectedMedium} onChange={handleMediumChange}>
                    <option value="" hidden>Select Medium</option>
                    {mediums.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                </select>
            </div>

            {/* Class */}
            <div className="d-flex flex-column col-md-3">
                <label htmlFor="class">Class <span className="text-danger">*</span></label>
                <select id="class" className="form-select form-select-lg mb-3" required value={selectedClass} onChange={handleClassChange}>
                    <option value="" hidden>Select Class</option>
                    {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
            </div>

            {/* Section */}
            <div className="d-flex flex-column col-md-3">
                <label htmlFor="section">Section <span className="text-danger">*</span></label>
                <select id="section" className="form-select form-select-lg mb-3" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                    <option value="" hidden>Select Section</option>
                    {sections.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
            </div>

            {/* Buttons */}
            <div className="d-flex flex-row gap-2 col-md-2 py-4">
                <Button type="submit" variant="contained" color="primary">
                    <i className="fa-solid fa-magnifying-glass"></i> Search
                </Button>
                <Button type="button" variant="outlined" color="warning" onClick={handleReset}>
                    <i className="fa-solid fa-arrow-rotate-right"></i> Reset
                </Button>
            </div>
        </form>
    );
};

export default SearchStudents;
