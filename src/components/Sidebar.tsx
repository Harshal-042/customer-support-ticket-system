import React from 'react';
import { NavLink } from 'react-router-dom';
import { AuthUser } from '../types';
import { LayoutDashboard, PlusCircle, Ticket, UserCheck, ShieldAlert, User, LifeBuoy } from 'lucide-react';
import './Sidebar.css';

interface Props {
  user: AuthUser | null;
}

export const Sidebar: React.FC<Props> = ({ user }) => {
  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-section-title">Navigation</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              end
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {user.role === 'ROLE_CUSTOMER' && (
            <>
              <li>
                <NavLink
                  to="/create-ticket"
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <PlusCircle size={18} />
                  <span>Create Ticket</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/my-tickets"
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Ticket size={18} />
                  <span>My Tickets</span>
                </NavLink>
              </li>
            </>
          )}

          {(user.role === 'ROLE_AGENT' || user.role === 'ROLE_ADMIN') && (
            <>
              <li>
                <NavLink
                  to="/agent-tickets"
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <UserCheck size={18} />
                  <span>Assigned Tickets</span>
                </NavLink>
              </li>
            </>
          )}

          {user.role === 'ROLE_ADMIN' && (
            <>
              <li>
                <NavLink
                  to="/admin-tickets"
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <ShieldAlert size={18} />
                  <span>All Tickets (Admin)</span>
                </NavLink>
              </li>
            </>
          )}

          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <User size={18} />
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="sidebar-info-box">
        <LifeBuoy size={20} className="info-icon" />
        <div className="info-title">Need Help?</div>
        <div className="info-text">
          Create a support ticket and our support team will respond as soon as possible.
        </div>
      </div>
    </aside>
  );
};
