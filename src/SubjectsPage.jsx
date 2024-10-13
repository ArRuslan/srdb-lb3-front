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
        headerName: "Subject name",
        width: 150,
    },
    {
        field: "_action",
        headerName: "Action",
        width: 150,
        renderCell: function TableCellRender({row}) {
            const navigate = useNavigate();
            return <Button variant="contained" onClick={() => navigate(`/subjects/${row.id}`)}>View</Button>
        }
    },
];

export default function SubjectsPage() {
    navigationTitle.value = "Subjects";
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 10});
    const {enqueueSnackbar} = useSnackbar();

    const fetchSubjects = () => {
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/subjects?offset=${paginationModel.page * paginationModel.pageSize}&limit=${paginationModel.pageSize}`).then(resp => {
            resp.json().then(json => {
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to fetch subjects from server: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to fetch subjects from server!", {variant: "error"});
                } else {
                    setSubjects(json);
                    setLoading(false);
                }
            });
        }, (e) => {
            enqueueSnackbar("Failed to fetch subjects from server!", {variant: "error"});
            setLoading(false);
        });
    }

    useEffect(fetchSubjects, [paginationModel, enqueueSnackbar]);

    return (
        <>
            <Navigation/>
            <Box component="main" sx={{p: 3}}>
                <DataGrid
                    loading={loading}
                    rows={subjects}
                    rowCount={subjects.length}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pagination={true}
                />
                <Button variant="contained" style={{width: "100%"}} onClick={() => setCreateOpen(true)} disabled={loading}>Add subject</Button>
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

                        fetch(`http://127.0.0.1:8000/api/subjects`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({"name": formJson.name, "short_name": formJson.short_name})
                        }).then(resp => {
                            resp.json().then(json => {
                                if (resp.status >= 400 && "detail" in json) {
                                    enqueueSnackbar(`Failed to create subject: ${json.detail}`, {variant: "error"});
                                } else if (resp.status >= 400) {
                                    enqueueSnackbar("Failed to create subject!", {variant: "error"});
                                } else {
                                    enqueueSnackbar("Subject created!", {variant: "success"});
                                    setCreateOpen(false);
                                    fetchSubjects();
                                    setLoading(false);
                                }
                            });
                        }, (e) => {
                            enqueueSnackbar("Failed to create subject!", {variant: "error"});
                            setCreateOpen(false);
                            setLoading(false);
                        });
                    },
                }}
            >
                <DialogTitle>Add new subject</DialogTitle>
                <DialogContent>
                    <TextField autoFocus required margin="dense" id="name" name="name" label="Subject name" type="text" fullWidth variant="standard"/>
                    <TextField autoFocus required margin="dense" id="short_name" name="short_name" label="Subject short name" type="text" fullWidth variant="standard"/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)} disabled={loading}>Cancel</Button>
                    <Button type="submit" disabled={loading}>Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}