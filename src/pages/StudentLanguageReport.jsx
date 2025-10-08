// src/pages/StudentLanguageReport.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../hooks/axios";
import { useNotifier } from "../components/Notifier";
import SearchStudents from "../components/SearchStudents";
import DraggingTable from "../components/DraggingTable";

const StudentLanguageReport = () => {
    const notify = useNotifier();
    const { user } = useOutletContext();

    const [languageData, setLanguageData] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");

    // Columns for DraggingTable
    const columns = [
        { accessorKey: "student", header: "Student Name" },
        { accessorKey: "class_name", header: "Class" },
        { accessorKey: "section", header: "Section" },
        { accessorKey: "roll_no", header: "Roll No" },
        { accessorKey: "first_language", header: "First Language" },
        { accessorKey: "second_language", header: "Second Language" },
        { accessorKey: "third_language", header: "Third Language" },
        { accessorKey: "opt_elec_subject", header: "Optional/Elective" },
    ];

    // Handle search request
    const handleSearch = async (data) => {
        try {
            setSelectedClass(data.class_id);
            const res = await api.post("/language/student", data);

            if (res.data.success) {
                // Map language IDs to names for display
                const students = res.data.students.map((s) => {
                    const firstLangs = s.first_language?.split(",") || [];
                    const firstLangIds = s.first_language_id?.split(",") || [];
                    const secondLangs = s.second_language?.split(",") || [];
                    const secondLangIds = s.second_language_id?.split(",") || [];
                    const thirdLangs = s.third_language?.split(",") || [];
                    const thirdLangIds = s.third_language_id?.split(",") || [];
                    const optLangs = s.opt_elec_subject?.split(",") || [];
                    const optLangIds = s.opt_elec_subject_id?.split(",") || [];

                    return {
                        ...s,
                        first_language:
                            s.f_id && s.f_id > 0
                                ? firstLangs[firstLangIds.indexOf(s.f_id)]
                                : "No Language Selected",
                        second_language:
                            s.s_id && s.s_id > 0
                                ? secondLangs[secondLangIds.indexOf(s.s_id)]
                                : "No Language Selected",
                        third_language:
                            [5, 6, 9, 10].includes(parseInt(data.class_id))
                                ? "Not Needed"
                                : s.t_id && s.t_id > 0
                                    ? thirdLangs[thirdLangIds.indexOf(s.t_id)]
                                    : "No Language Selected",
                        opt_elec_subject:
                            [5, 6, 7, 8].includes(parseInt(data.class_id))
                                ? "Not Needed"
                                : s.opt_id && s.opt_id > 0
                                    ? optLangs[optLangIds.indexOf(s.opt_id)]
                                    : "No Language Selected",
                    };
                });

                setLanguageData(students);
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
        setLanguageData([]);
        notify("Search form reset successfully!", "warning");
    };

    return (
        <div>
            <div className="container-fluid position-absolute" style={{ top: "50px" }}>
                <h3 className="text-white fw-bold">Language Report</h3>
                <div className="card px-3 mt-4">
                    <div className="my-2">
                        <div className="card-title h4">Student Language Report</div>
                        <div className="card-category text-muted">
                            Classwise Student Language Report
                        </div>
                    </div>

                    {/* Search form */}
                    <SearchStudents onSearch={handleSearch} onReset={handleReset} />

                    {/* DraggingTable */}
                    {languageData && languageData.length > 0 && (
                        <DraggingTable
                            tableData={languageData}
                            setTableData={setLanguageData}
                            columns={columns}
                            rowDrag={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentLanguageReport;
