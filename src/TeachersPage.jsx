import {navigationTitle} from "./signals.js";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import Navigation from "./Navigation.jsx";
import { DataGrid } from '@mui/x-data-grid';
import {useEffect, useState} from "react";
import {useSnackbar} from "notistack";
import {useNavigate} from "react-router-dom";

const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
        field: "name",
        headerName: "Teacher name",
        width: 150,
        valueGetter: (value, row) => `${row.first_name} ${row.last_name}`,
    },
    {
        field: "_action",
        headerName: "Action",
        width: 150,
        renderCell: function TableCellRender({row}) {
            const navigate = useNavigate();
            return <Button variant="contained" onClick={() => navigate(`/teachers/${row.id}`)}>View</Button>
        }
    },
];

export default function TeachersPage() {
    navigationTitle.value = "Teachers";
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 10});
    const {enqueueSnackbar} = useSnackbar();

    const fetchTeachers = () => {
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/teachers?offset=${paginationModel.page * paginationModel.pageSize}&limit=${paginationModel.pageSize}`).then(resp => {
            resp.json().then(json => {
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to fetch teachers from server: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to fetch teachers from server!", {variant: "error"});
                } else {
                    setTeachers(json);
                    setLoading(false);
                }
            });
        }, (e) => {
            enqueueSnackbar("Failed to fetch teachers from server!", {variant: "error"});
            setLoading(false);
        });
    }

    useEffect(fetchTeachers, [paginationModel, enqueueSnackbar]);

    return (
        <>
            <Navigation/>
            <Box component="main" sx={{p: 3}}>
                <DataGrid
                    loading={loading}
                    rows={teachers}
                    rowCount={teachers.length}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pagination={true}
                />
                <Button variant="contained" style={{width: "100%"}} onClick={() => setCreateOpen(true)} disabled={loading}>Add teacher</Button>
            </Box>

            <Dialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                PaperProps={{
                    component: "form",
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());

                        setLoading(true);

                        fetch(`http://127.0.0.1:8000/api/teachers`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({"first_name": formJson.first_name, "last_name": formJson.last_name})
                        }).then(resp => {
                            resp.json().then(json => {
                                if (resp.status >= 400 && "detail" in json) {
                                    enqueueSnackbar(`Failed to create teacher: ${json.detail}`, {variant: "error"});
                                } else if (resp.status >= 400) {
                                    enqueueSnackbar("Failed to create teacher!", {variant: "error"});
                                } else {
                                    enqueueSnackbar("Teacher created!", {variant: "success"});
                                    setCreateOpen(false);
                                    fetchTeachers();
                                    setLoading(false);
                                }
                            });
                        }, (e) => {
                            enqueueSnackbar("Failed to create teacher!", {variant: "error"});
                            setCreateOpen(false);
                            setLoading(false);
                        });
                    },
                }}
            >
                <DialogTitle>Add new teacher</DialogTitle>
                <DialogContent>
                    <TextField autoFocus required margin="dense" id="first_name" name="first_name" label="Teacher first name" type="text" fullWidth variant="standard"/>
                    <TextField autoFocus required margin="dense" id="last_name" name="last_name" label="Teacher last name" type="text" fullWidth variant="standard"/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)} disabled={loading}>Cancel</Button>
                    <Button type="submit" disabled={loading}>Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}