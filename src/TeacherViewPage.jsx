import {navigationTitle} from "./signals.js";
import {Box, Button, TextField} from "@mui/material";
import Navigation from "./Navigation.jsx";
import {useEffect, useState} from "react";
import {useSnackbar} from "notistack";
import {useNavigate, useParams} from "react-router-dom";

export default function TeacherViewPage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [teacher, setTeacher] = useState(null);
    const [changedFirstName, setChangedFirstName] = useState(null);
    const [changedLastName, setChangedLastName] = useState(null);
    const {enqueueSnackbar} = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        navigationTitle.value = "Teacher \"...\"";

        fetch(`http://127.0.0.1:8000/api/teachers/${params.teacherId}`).then(resp => {
            resp.json().then(json => {
                if(resp.status === 404) {
                    navigate("/teachers");
                }
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to fetch teacher info from server: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to fetch teacher info from server!", {variant: "error"});
                } else {
                    navigationTitle.value = `Teacher "${json.first_name} ${json.last_name}"`;
                    setTeacher(json);
                    setLoading(false);
                }
            });
        }, (e) => {
            enqueueSnackbar("Failed to fetch teacher info from server!", {variant: "error"});
            setLoading(false);
        });
    }, [enqueueSnackbar]);

    const saveTeacherName = () => {
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/teachers/${params.teacherId}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "first_name": changedFirstName === null ? teacher.first_name : changedFirstName,
                "last_name": changedLastName === null ? teacher.last_name : changedLastName,
            })
        }).then(resp => {
            resp.json().then(json => {
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to update teacher name: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to update teacher name!", {variant: "error"});
                } else {
                    setTeacher(json);
                    enqueueSnackbar("Teacher name updated!", {variant: "success"});
                }
                setLoading(false);
            });
        }, (e) => {
            enqueueSnackbar("Failed to edit teacher name!", {variant: "error"});
            setLoading(false);
        });
    }

    const deleteTeacher = () => {
        fetch(`http://127.0.0.1:8000/api/teachers/${params.teacherId}`, {method: "DELETE"}).then(resp => {
            if (resp.status >= 400) {
                enqueueSnackbar("Failed to delete teacher!", {variant: "error"});
            } else {
                navigate("/teachers");
            }
        }, (e) => {
            enqueueSnackbar("Failed to delete teacher!", {variant: "error"});
        });
    }

    return (
        <>
            <Navigation/>
            <Box sx={{display: "flex", flexDirection: "column", gap: 1, p: 3}}>
                <TextField label="Teacher id" type="number" value={teacher ? teacher.id : "..."} disabled/>
                <TextField label="Teacher first name" type="text" value={changedFirstName === null ? (teacher ? teacher.first_name : "...") : changedFirstName}
                           disabled={loading} onChange={e => setChangedFirstName(e.target.value)}/>
                <TextField label="Teacher last name" type="text" value={changedLastName === null ? (teacher ? teacher.last_name : "...") : changedLastName}
                           disabled={loading} onChange={e => setChangedLastName(e.target.value)}/>
                <Button variant="contained" style={{width: "100%"}} onClick={saveTeacherName}
                        disabled={loading || ((changedFirstName === null || teacher === null || changedFirstName === teacher.first_name) && (changedLastName === null || teacher === null || changedLastName === teacher.last_name))}>Save</Button>

                <Button variant="outlined" style={{width: "100%"}} onClick={deleteTeacher} disabled={loading} color="error">Delete</Button>
            </Box>
        </>
    );
}