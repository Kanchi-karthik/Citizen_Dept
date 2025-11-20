import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Building, Menu, X } from "lucide-react";
import { SidebarContext } from "../App";
import "../styles/app.css";

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);

  return (
    <>
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h3>Citizen</h3>
          <button 
            className="toggle-btn" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <NavLink to="/departments" className={({ isActive }) => isActive ? 'active' : ''}>
          <Building size={20} /> <span>Departments</span>
        </NavLink>
      </div>
    </>
  );
};

export default Sidebar;