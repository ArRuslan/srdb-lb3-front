import {SnackbarProvider} from "notistack";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import GroupsPage from "./GroupsPage.jsx";
import GroupViewPage from "./GroupViewPage.jsx";


function SnackbarWrapper({children}) {
    return (
        <SnackbarProvider maxSnack={10} anchorOrigin={{vertical: "bottom", horizontal: "right"}}>
            {children}
        </SnackbarProvider>
    )
}

export default function App() {
    const def = <Navigate to="/groups" replace/>;

    return (
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={def}/>
                <Route path="/groups" element={<SnackbarWrapper><GroupsPage/></SnackbarWrapper>}/>
                <Route path="/groups/:groupId" element={<SnackbarWrapper><GroupViewPage/></SnackbarWrapper>}/>

                <Route path="*" element={def}/>
            </Routes>
        </BrowserRouter>
    )
}
