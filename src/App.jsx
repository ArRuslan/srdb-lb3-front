import {SnackbarProvider} from "notistack";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import GroupsPage from "./GroupsPage.jsx";
import GroupViewPage from "./GroupViewPage.jsx";
import SubjectsPage from "./SubjectsPage.jsx";
import SubjectViewPage from "./SubjectViewPage.jsx";
import TeacherViewPage from "./TeacherViewPage.jsx";
import TeachersPage from "./TeachersPage.jsx";


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
                <Route path="/subjects" element={<SnackbarWrapper><SubjectsPage/></SnackbarWrapper>}/>
                <Route path="/subjects/:subjectId" element={<SnackbarWrapper><SubjectViewPage/></SnackbarWrapper>}/>
                <Route path="/teachers" element={<SnackbarWrapper><TeachersPage/></SnackbarWrapper>}/>
                <Route path="/teachers/:teacherId" element={<SnackbarWrapper><TeacherViewPage/></SnackbarWrapper>}/>

                <Route path="*" element={def}/>
            </Routes>
        </BrowserRouter>
    )
}
