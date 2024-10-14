import {navigationTitle} from "./signals.js";
import {Box, Button} from "@mui/material";
import Navigation from "./Navigation.jsx";
import {DataGrid} from '@mui/x-data-grid';
import {useEffect, useState} from "react";
import {useSnackbar} from "notistack";
import {useNavigate} from "react-router-dom";

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
        field: "group",
        headerName: "Group",
        width: 150,
        renderCell: function GroupCell({row}) {
            const navigate = useNavigate();
            return <a href="#" onClick={() => navigate(`/groups/${row.group.id}`)}>{row.group.name}</a>;
        }
    },
    {
        field: "subject",
        headerName: "Subject",
        width: 150,
        renderCell: function GroupCell({row}) {
            const navigate = useNavigate();
            return <a href="#" onClick={() => navigate(`/subjects/${row.subject.id}`)}>{row.subject.name} ({row.subject.short_name})</a>;
        }
    },
    {
        field: "teacher",
        headerName: "Teacher",
        width: 150,
        renderCell: function GroupCell({row}) {
            const navigate = useNavigate();
            return <a href="#" onClick={() => navigate(`/teachers/${row.teacher.id}`)}>{row.teacher.first_name} {row.teacher.last_name}</a>;
        }
    },
    /*{
        field: "_action",
        headerName: "Action",
        width: 150,
        renderCell: function TableCellRender({row}) {
            return <Button variant="contained">Delete</Button>
        }
    },*/
];

export default function SchedulePage() {
    navigationTitle.value = "Schedule items";
    const [loading, setLoading] = useState(true);
    const [rowsCount, setRowsCount] = useState(0);
    const [schedule, setSchedule] = useState([]);
    const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 10});
    const {enqueueSnackbar} = useSnackbar();

    const fetchSubjects = () => {
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/schedule?offset=${paginationModel.page * paginationModel.pageSize}&limit=${paginationModel.pageSize}`).then(resp => {
            resp.json().then(json => {
                if (resp.status >= 400 && "detail" in json) {
                    enqueueSnackbar(`Failed to fetch schedule from server: ${json.detail}`, {variant: "error"});
                } else if (resp.status >= 400) {
                    enqueueSnackbar("Failed to fetch schedule from server!", {variant: "error"});
                } else {
                    setRowsCount(json.count);
                    setSchedule(json.results);
                    setLoading(false);
                }
            });
        }, (e) => {
            enqueueSnackbar("Failed to fetch schedule from server!", {variant: "error"});
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
                    rows={schedule}
                    rowCount={rowsCount}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pagination={true}
                />
            </Box>
        </>
    );
}