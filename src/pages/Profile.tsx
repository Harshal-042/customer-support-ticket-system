import React from 'react';
import { AuthUser } from '../types';
import { User, Mail, ShieldCheck, Calendar, LifeBuoy } from 'lucide-react';
import './Profile.css';

interface Props {
  user: AuthUser | null;
}

export const Profile: React.FC<Props> = ({ user }) => {
  if (!user) return null;

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'System Administrator';
      case 'ROLE_AGENT':
        return 'Customer Support Representative';
      case 'ROLE_CUSTOMER':
        return 'Registered Customer';
      default:
        return role;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <User size={36} />
          </div>
          <div className="profile-header-info">
            <h2>{user.name}</h2>
            <span className="profile-role-tag">{getRoleTitle(user.role)}</span>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-item">
            <div className="item-label">
              <User size={15} />
              <span>User ID</span>
            </div>
            <div className="item-value">#{user.id}</div>
          </div>

          <div className="profile-item">
            <div className="item-label">
              <Mail size={15} />
              <span>Email Address</span>
            </div>
            <div className="item-value">{user.email}</div>
          </div>

          <div className="profile-item">
            <div className="item-label">
              <ShieldCheck size={15} />
              <span>Security Role</span>
            </div>
            <div className="item-value"><code>{user.role}</code></div>
          </div>

          <div className="profile-item">
            <div className="item-label">
              <Calendar size={15} />
              <span>Account Status</span>
            </div>
            <div className="item-value" style={{ color: '#059669', fontWeight: 600 }}>Active (JWT Valid)</div>
          </div>
        </div>

        <div className="profile-project-note">
          <LifeBuoy size={18} />
          <span>This profile belongs to the <strong>Nexoraa Support Portal</strong> powered by Spring Boot REST APIs and React.</span>
        </div>
      </div>
    </div>
  );
};
