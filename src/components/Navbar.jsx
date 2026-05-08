import { NavLink } from 'react-router-dom'
import { Mail, FileText, ClipboardList, Bell, LayoutDashboard } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/email', label: 'Email', icon: Mail },
  { to: '/docs', label: 'Doc Generator', icon: FileText },
  { to: '/forms', label: 'Smart Forms', icon: ClipboardList },
  { to: '/reminders', label: 'Reminders', icon: Bell },
]

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="font-semibold text-slate-800 text-sm mr-4 shrink-0">
          🏢 Office Automation
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                ${isActive
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
