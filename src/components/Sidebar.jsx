import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ collapsed, user }) => {
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

        {/* {user.designation === "School" && (
          <NavLink to="/Verification" className="nav-link mb-2" title="Language Setup">
            <i className="fas fa-user-check"></i>
            {isExpanded && <span className="ms-2">Language Setup</span>}
          </NavLink>)} */}
        {user.designation === "School" && (
          <details className="nav-link mb-2">
            <summary className="d-flex align-items-center">
              <i className="fas fa-language"></i>
              {isExpanded && (<span className="ms-2">Language Setup</span>)}
              <i className="fas fa-chevron-down ms-auto text-dark"></i>
            </summary>

            <div className=" flex-column mt-2">
              <NavLink to="/language/school" className="nav-link">
                <i className="fas fa-school"></i>
                {isExpanded && <span className='mx-2'>School Language</span>}
              </NavLink>
              <NavLink to="/language/student" className="nav-link">
                <i className='fas fa-book-reader'></i>
                {isExpanded && <span className='mx-2'>Student Language</span>}
              </NavLink>
            </div>
          </details>
        )}

        <NavLink to="/sign" className="nav-link mb-2" title="Signature">
          <i className="fas fa-pen-fancy"></i>
          {isExpanded && <span className="ms-2">Signature</span>}
        </NavLink>

      </nav>
    </aside>
  );
};

export default Sidebar;
