import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Building2, Users, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/companies', icon: Building2, label: 'Companies' },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-dark-800 border-r border-dark-600 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-dark-600">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                <Building2 size={14} className="text-dark-900" />
              </div>
              <span className="font-bold text-sm text-white">DMS</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-accent text-dark-900 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600'
                }`
              }
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-accent text-dark-900 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600'
                }`
              }
            >
              <Users size={18} />
              {!collapsed && <span>Users</span>}
            </NavLink>
          )}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-dark-600">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-dark-900 font-bold text-xs flex-shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-dark-600 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
