import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import useAuth from '../hooks/useAuth';

const Sidebar = ({ collapsed }) => {
  const { user } = useAuth();
  const [hovered, setHovered] = useState(false);

  // Sidebar is expanded if not collapsed, or if collapsed but hovered
  const isExpanded = !collapsed || hovered;

  return (
    <aside className={`app-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="sidebar-top text-center" >
        {isExpanded ? (<> 
          <div className="school-name my-4">
            <strong>{user.name}</strong>
            <div className="small text-muted">{user.designation}</div>
          </div>
          <hr />
          <div className="academic-year">ACADEMIC YEAR: 2025</div>
        </>
        ) : (<div className="academic-year mt-2">2025</div>)
        }
      </div>

      <nav className="nav flex-column p-2">
        
        <NavLink to="/dashboard" className="nav-link mb-2" title="Dashboard">
          <i className="fas fa-home"></i>
          {isExpanded && <span className="ms-2">Dashboard</span>}
        </NavLink>

        {user.designation==="DI/S (SE)" && (
        <NavLink to="/Verification" className="nav-link mb-2" title="Verification of Eligibility">
          <i className="fas fa-user-check"></i>
          {isExpanded && <span className="ms-2">Verification of Eligibility</span>}
        </NavLink>)}

        {user.designation==="DI/S (SE)" && (
          <NavLink to="/discontinuity" className="nav-link mb-2" title="Proposal of Member's discontinuity">
          <i className="fas fa-file-alt"></i>
          {isExpanded && <span className="ms-2">Proposal of Member's discontinuity</span>}
        </NavLink>)}

        {user.designation==="SED" && (
          <NavLink to="/mc_status" className="nav-link mb-2" title="Managing Committee Status">
            <i className="fas fa-users-cog"></i>
            {isExpanded && <span className="ms-2">Managing Committee Status</span>}
          </NavLink>)}

        {user.designation==="DI/S (SE)" && (
        <NavLink to="/uploaded" className="nav-link mb-2" title="Uploaded Data">
          <i className="fas fa-upload"></i>
          {isExpanded && <span className="ms-2">Uploaded Data</span>}
        </NavLink>)}

        <NavLink to="/sign" className="nav-link mb-2" title="Signature">
          <i className="fas fa-pen-fancy"></i>
          {isExpanded && <span className="ms-2">Signature</span>}
        </NavLink>

      </nav>
    </aside>
  );
};

export default Sidebar;
