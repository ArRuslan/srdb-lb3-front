import {
    AppBar,
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography
} from "@mui/material";
import React, {useState} from "react";
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import CategoryIcon from '@mui/icons-material/Category';
import {useNavigate} from "react-router-dom";
import {navigationTitle} from "./signals.js";

const drawerWidth = 240;

export default function Navigation() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>Lb3</Typography>
            </Toolbar>
            <Divider/>
            <List>
                <ListItem key="groups" disablePadding>
                    <ListItemButton onClick={() => {
                        navigate(`/groups`);
                        setMobileOpen(false);
                    }}>
                        <ListItemIcon>
                            <CategoryIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Groups"/>
                    </ListItemButton>
                </ListItem>

                <ListItem key="subjects" disablePadding>
                    <ListItemButton onClick={() => {
                        navigate(`/subjects`);
                        setMobileOpen(false);
                    }}>
                        <ListItemIcon>
                            <CategoryIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Subjects"/>
                    </ListItemButton>
                </ListItem>

                <ListItem key="teachers" disablePadding>
                    <ListItemButton onClick={() => {
                        navigate(`/teachers`);
                        setMobileOpen(false);
                    }}>
                        <ListItemIcon>
                            <CategoryIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Teachers"/>
                    </ListItemButton>
                </ListItem>

                <ListItem key="schedule" disablePadding>
                    <ListItemButton onClick={() => {
                        navigate(`/schedule`);
                        setMobileOpen(false);
                    }}>
                        <ListItemIcon>
                            <CategoryIcon/>
                        </ListItemIcon>
                        <ListItemText primary="All schedule items"/>
                    </ListItemButton>
                </ListItem>

                <Divider/>
            </List>
        </div>
    );

    return (<>
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{mr: 2}}>
                        <MenuIcon onClick={handleDrawerToggle}/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        {navigationTitle}
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>

        <Box component="nav" sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}>
            <Drawer container={() => window.document.body} variant="temporary" open={mobileOpen}
                    onClose={handleDrawerToggle} ModalProps={{keepMounted: true}}
                    sx={{'& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth}}}>
                {drawer}
            </Drawer>
        </Box>
    </>);
}