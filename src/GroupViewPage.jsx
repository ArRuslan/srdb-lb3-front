import {navigationTitle} from "./signals.js";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import Navigation from "./Navigation.jsx";
import {DataGrid} from '@mui/x-data-grid';
import {useEffect, useState} from "react";
import {useSnackbar} from "notistack";
import {useNavigate, useParams} from "react-router-dom";

const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
        field: "position",
        headerName: "Position",
        width: 150,
    },
    {
        field: "type",
        headerName: "Type",
        width: 150,
    },
    {
        field: "date",
        headerName: "Date",
        width: 150,
    },
    {
        field: "start_time",
        headerName: "Start time",
        width: 200,
    },
    {
        field: "subject",
        headerName: "Subject",
        width: 150,
        valueGetter: (value, row) => {
            return `${row.subject.name} (${row.subject.short_name})`
        }
    },
    {
        field: "teacher",
        headerName: "Teacher",
        width: 150,
        valueGetter: (value, row) => {
            return `${row.teacher.first_name} ${row.teacher.last_name}`
        }
    },
];

export default function GroupViewPage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [changedName, setChangedName] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const navigate = useNavigate();

    const fetchSchedule = () => {
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/groups/${params.groupId}/schedule`).then(resp => {
            resp.json().then(json => {
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to fetch groups from server: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to fetch groups from server!", {variant: "error"});
                } else {
                    setSchedule(json);
                    setLoading(false);
                }
            });
        }, (e) => {
            enqueueSnackbar("Failed to fetch groups from server!", {variant: "error"});
            setLoading(false);
        });
    }

    useEffect(() => {
        navigationTitle.value = "Group \"...\"";

        fetch(`http://127.0.0.1:8000/api/groups/${params.groupId}`).then(resp => {
            resp.json().then(json => {
                if(resp.status === 404) {
                    navigate("/groups");
                }
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to fetch group info from server: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to fetch group info from server!", {variant: "error"});
                } else {
                    navigationTitle.value = `Group "${json.name}"`;
                    setGroup(json);
                    fetchSchedule();
                }
            });
        }, (e) => {
            enqueueSnackbar("Failed to fetch group info from server!", {variant: "error"});
            setLoading(false);
        });
    }, [enqueueSnackbar]);

    const saveGroupName = () => {
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/groups/${params.groupId}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"name": changedName})
        }).then(resp => {
            resp.json().then(json => {
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to update group name: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to update group name!", {variant: "error"});
                } else {
                    setGroup(json);
                    enqueueSnackbar("Group name updated!", {variant: "success"});
                }
                setLoading(false);
            });
        }, (e) => {
            enqueueSnackbar("Failed to edit group name!", {variant: "error"});
            setLoading(false);
        });
    }

    const deleteGroup = () => {
        fetch(`http://127.0.0.1:8000/api/groups/${params.groupId}`, {method: "DELETE"}).then(resp => {
            if (resp.status >= 400) {
                enqueueSnackbar("Failed to delete group!", {variant: "error"});
            } else {
                enqueueSnackbar("Group deleted!", {variant: "success"});
                navigate("/groups");
            }
        }, (e) => {
            enqueueSnackbar("Failed to delete group!", {variant: "error"});
        });
    }

    return (
        <>
            <Navigation/>
            <Box sx={{display: "flex", flexDirection: "column", gap: 1, p: 3}}>
                <TextField label=">Group id" type="number" value={group ? group.id : "..."} disabled/>
                <TextField label="Group name" type="text" value={changedName === null ? (group ? group.name : "...") : changedName}
                           disabled={loading} onChange={e => setChangedName(e.target.value)}/>
                <Button variant="contained" style={{width: "100%"}} onClick={saveGroupName}
                        disabled={loading || changedName === null || group === null || changedName === group.name}>Save</Button>

                <Button variant="outlined" style={{width: "100%"}} onClick={deleteGroup} disabled={loading} color="error">Delete</Button>

                <DataGrid
                    loading={loading}
                    rows={schedule}
                    rowCount={schedule.length}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    paginationMode="client"
                    pagination={true}
                />
                <Button variant="contained" style={{width: "100%"}} onClick={() => setCreateOpen(true)} disabled={loading}>Add schedule item</Button>
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

                        fetch(`http://127.0.0.1:8000/api/schedule`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                "group_id": params.groupId,
                                "teacher_id": formJson.teacher_id,
                                "subject_id": formJson.subject_id,
                                "date": formJson.date,
                                "position": formJson.position,
                                "type": formJson.type,
                            })
                        }).then(resp => {
                            resp.json().then(json => {
                                if(resp.status >= 400 && "detail" in json)
                                    enqueueSnackbar(`Failed to create schedule item: ${json.detail}`, {variant: "error"});
                                else if(resp.status >= 400)
                                    enqueueSnackbar("Failed to create schedule item!", {variant: "error"});
                                else
                                    enqueueSnackbar("New schedule item added!", {variant: "success"});
                            });

                            setCreateOpen(false);
                            fetchSchedule();
                            setLoading(false);
                        }, (e) => {
                            enqueueSnackbar("Failed to create schedule item!", {variant: "error"});
                            setCreateOpen(false);
                            setLoading(false);
                        });
                    },
                }}
            >
                <DialogTitle>Add new schedule item</DialogTitle>
                <DialogContent>
                    <TextField autoFocus required margin="dense" id="teacher_id" name="teacher_id" label="Teacher id" type="number" fullWidth variant="standard"/>
                    <TextField autoFocus required margin="dense" id="subject_id" name="subject_id" label="Subject id" type="number" fullWidth variant="standard"/>
                    <TextField autoFocus required margin="dense" id="date" name="date" label="Date" type="date" fullWidth variant="standard"/>
                    <TextField autoFocus required margin="dense" id="position" name="position" label="Position" type="number" fullWidth variant="standard"/>
                    <TextField autoFocus required margin="dense" id="type" name="type" label="Type" type="text" fullWidth variant="standard"/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)} disabled={loading}>Cancel</Button>
                    <Button type="submit" disabled={loading}>Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}