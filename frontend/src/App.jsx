import React, { useState, createContext } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import UserList from "./pages/UserList.jsx";
import ComplaintList from "./pages/ComplaintList.jsx";
import ComplaintForm from "./pages/ComplaintForm.jsx";
import FeedbackList from "./pages/FeedbackList.jsx";
import DepartmentList from "./pages/DepartmentList.jsx";
import DepartmentForm from "./pages/DepartmentForm.jsx";
import DepartmentDashboard from "./pages/DepartmentDashboard.jsx";
import PerformanceForm from "./pages/PerformanceForm.jsx";
import ResourceAllocationForm from "./pages/ResourceAllocationForm.jsx";
import StatusUpdateForm from "./pages/StatusUpdateForm.jsx";
import DepartmentLogin from "./components/DepartmentLogin.jsx";
import CommonDepartmentLogin from "./components/CommonDepartmentLogin.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/app.css";

export const SidebarContext = createContext();

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Hide main sidebar when viewing department dashboard
  const showMainSidebar = !location.pathname.startsWith('/department/');

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {showMainSidebar && (
        <>
          <Sidebar className={sidebarOpen ? "open" : "closed"} />
          <div className="mobile-header">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </>
      )}
      <div className={`main-content ${showMainSidebar ? (sidebarOpen ? "open" : "closed") : ""}`} 
           style={showMainSidebar ? {} : { marginLeft: 0, width: '100%' }}>
        <Routes>
          <Route path="/users" element={<UserList />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/complaint-form" element={<ComplaintForm />} />
          <Route path="/feedbacks" element={<FeedbackList />} />
          <Route path="/departments" element={<DepartmentList />} />
          <Route path="/department-form" element={<DepartmentForm />} />
          <Route path="/department/:id" element={<DepartmentDashboard />} />
          <Route path="/department-login/:id" element={<DepartmentLogin />} />
          <Route path="/department-login" element={<CommonDepartmentLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/performance-form" element={<PerformanceForm />} />
          <Route path="/resource-allocation" element={<ResourceAllocationForm />} />
          <Route path="/status-update" element={<StatusUpdateForm />} />
          <Route path="/" element={<CommonDepartmentLogin />} />
          <Route path="*" element={<CommonDepartmentLogin />} />
        </Routes>
      </div>
    </SidebarContext.Provider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;