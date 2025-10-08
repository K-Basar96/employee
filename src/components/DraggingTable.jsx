import { useState } from "react";
import { useMaterialReactTable, MaterialReactTable } from "material-react-table";
import { Box, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { mkConfig, generateCsv, download } from "export-to-csv";
const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
});
const DraggingTable = ({ tableData, setTableData, columns, rowDrag = true }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [sorting, setSorting] = useState([]);

    const handleExportData = () => {
        const visibleColumnIds = columns
            .filter((col) => col.id || col.accessorKey)
            .map((col) => col.id || col.accessorKey);

        const filteredData = tableData.map((row, index) => {
            const filteredRow = { sl_no: index + 1 }; // SL.NO for CSV
            visibleColumnIds.forEach((key) => {
                filteredRow[key] = row[key];
            });
            return filteredRow;
        });

        const csv = generateCsv(csvConfig)(filteredData);
        download(csvConfig)(csv);
    };

    const table = useMaterialReactTable({
        columns,
        data: tableData,
        autoResetPageIndex: false,
        enableRowOrdering: rowDrag,
        enableSorting: true,
        state: { sorting },
        muiPaginationProps: {
            rowsPerPageOptions: [10, 25, 50, 100, { label: 'All', value: tableData.length }],
        },
        onSortingChange: setSorting,

        muiRowDragHandleProps: ({ table }) => ({
            draggable: true,
            onDragStart: (e) => {
                setIsDragging(true);
                setSorting([]); // temporarily disable sorting while dragging
                e.dataTransfer?.setData("text/plain", "");
            },
            onDragEnd: () => {
                const { draggingRow, hoveredRow } = table.getState();
                if (hoveredRow && draggingRow) {
                    const updated = [...tableData];
                    updated.splice(
                        hoveredRow.index,
                        0,
                        updated.splice(draggingRow.index, 1)[0]
                    );
                    setTableData(updated);
                }
                setIsDragging(false);
            },
        }),

        muiTableHeadCellProps: {
            sx: {
                backgroundColor: "#1976d2", // custom header background color
                color: "#fff", // text color
            },
            onClick: (e) => {
                if (isDragging) e.stopPropagation(); // prevent sorting during drag
            },
        },

        // Stripe rows
        muiTableBodyRowProps: ({ row, table }) => ({
            sx: {
                backgroundColor: row.index % 2 === 0 ? "#cecacaff" : "#fff", // alternate row color
            },
        }),

        // ✅ Single Export All Data button
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: "16px", padding: "8px", flexWrap: "wrap" }}>
                <Button
                    onClick={handleExportData}
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    variant="outlined"
                >
                    Export All Data
                </Button>
            </Box>
        ),

    });

    return <MaterialReactTable table={table} />;
};

export default DraggingTable;
