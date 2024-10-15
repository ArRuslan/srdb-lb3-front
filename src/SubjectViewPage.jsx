import {navigationTitle} from "./signals.js";
import {Box, Button, TextField} from "@mui/material";
import Navigation from "./Navigation.jsx";
import {useEffect, useState} from "react";
import {useSnackbar} from "notistack";
import {useNavigate, useParams} from "react-router-dom";

export default function SubjectViewPage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState(null);
    const [changedName, setChangedName] = useState(null);
    const [changedShortName, setChangedShortName] = useState(null);
    const {enqueueSnackbar} = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        navigationTitle.value = "Subject \"...\"";

        fetch(`http://127.0.0.1:8000/api/subjects/${params.subjectId}`).then(resp => {
            resp.json().then(json => {
                if(resp.status === 404) {
                    navigate("/groups");
                }
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to fetch subject info from server: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to fetch subject info from server!", {variant: "error"});
                } else {
                    navigationTitle.value = `Subject "${json.name}"`;
                    setSubject(json);
                    setLoading(false);
                }
            });
        }, (e) => {
            enqueueSnackbar("Failed to fetch subject info from server!", {variant: "error"});
            setLoading(false);
        });
    }, [enqueueSnackbar]);

    const saveSubjectName = () => {
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/subjects/${params.subjectId}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "name": changedName === null ? subject.name : changedName,
                "short_name": changedShortName === null ? subject.short_name : changedShortName,
            })
        }).then(resp => {
            resp.json().then(json => {
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to update subject name: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to update subject name!", {variant: "error"});
                } else {
                    setSubject(json);
                    enqueueSnackbar("Subject name updated!", {variant: "success"});
                }
                setLoading(false);
            });
        }, (e) => {
            enqueueSnackbar("Failed to edit subject name!", {variant: "error"});
            setLoading(false);
        });
    }

    const deleteSubject = () => {
        fetch(`http://127.0.0.1:8000/api/subjects/${params.subjectId}`, {method: "DELETE"}).then(resp => {
            if (resp.status >= 400) {
                enqueueSnackbar("Failed to delete subject!", {variant: "error"});
            } else {
                enqueueSnackbar("Subject deleted!", {variant: "success"});
                navigate("/subjects");
            }
        }, (e) => {
            enqueueSnackbar("Failed to delete subject!", {variant: "error"});
        });
    }

    return (
        <>
            <Navigation/>
            <Box sx={{display: "flex", flexDirection: "column", gap: 1, p: 3}}>
                <TextField label="Subject id" type="number" value={subject ? subject.id : "..."} disabled/>
                <TextField label="Subject name" type="text" value={changedName === null ? (subject ? subject.name : "...") : changedName}
                           disabled={loading} onChange={e => setChangedName(e.target.value)}/>
                <TextField label="Subject short name" type="text" value={changedShortName === null ? (subject ? subject.short_name : "...") : changedShortName}
                           disabled={loading} onChange={e => setChangedShortName(e.target.value)}/>
                <Button variant="contained" style={{width: "100%"}} onClick={saveSubjectName}
                        disabled={loading || ((changedName === null || subject === null || changedName === subject.name) && (changedShortName === null || subject === null || changedShortName === subject.short_name))}>Save</Button>

                <Button variant="outlined" style={{width: "100%"}} onClick={deleteSubject} disabled={loading} color="error">Delete</Button>
            </Box>
        </>
    );
}