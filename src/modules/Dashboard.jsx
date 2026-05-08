import { useNavigate } from 'react-router-dom'
import { Mail, FileText, ClipboardList, Bell, ArrowRight } from 'lucide-react'

const modules = [
  {
    to: '/email',
    icon: Mail,
    color: 'bg-sky-50 border-sky-200',
    iconColor: 'text-sky-600',
    badge: 'EmailJS',
    title: 'Email Sender',
    desc: 'Send templated emails without a backend. Configure EmailJS once — works from any static host.',
    features: ['Template selector', 'Dynamic variables', 'CC / BCC support'],
  },
  {
    to: '/docs',
    icon: FileText,
    color: 'bg-violet-50 border-violet-200',
    iconColor: 'text-violet-600',
    badge: 'jsPDF',
    title: 'Doc Generator',
    desc: 'Fill a form and download a formatted PDF — invoices, letters, reports — all in-browser.',
    features: ['Invoice template', 'Auto table layout', 'Instant PDF download'],
  },
  {
    to: '/forms',
    icon: ClipboardList,
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    badge: 'SheetJS',
    title: 'Smart Forms',
    desc: 'Validated data-entry forms that export your submissions to Excel or CSV in one click.',
    features: ['Zod validation', 'Multi-row entries', 'Export to .xlsx / .csv'],
  },
  {
    to: '/reminders',
    icon: Bell,
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    badge: 'Day.js',
    title: 'Reminders',
    desc: 'Set deadline reminders with browser push notifications — no server, no signup.',
    features: ['Browser notifications', 'Countdown timers', 'Priority tagging'],
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Office Automation Toolkit</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Four production-ready modules — static, no backend, deployable to GitHub Pages.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {modules.map(({ to, icon: Icon, color, iconColor, badge, title, desc, features }) => (
          <div
            key={to}
            onClick={() => navigate(to)}
            className={`border rounded-xl p-5 cursor-pointer hover:shadow-md transition-all group ${color}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg bg-white/70 ${iconColor}`}>
                <Icon size={22} />
              </div>
              <span className="text-xs font-mono bg-white/80 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            </div>
            <h2 className="font-semibold text-slate-800 text-base mb-1">{title}</h2>
            <p className="text-slate-500 text-sm mb-3 leading-snug">{desc}</p>
            <ul className="space-y-1 mb-4">
              {features.map(f => (
                <li key={f} className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className={`flex items-center gap-1 text-sm font-medium ${iconColor} group-hover:gap-2 transition-all`}>
              Open module <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-slate-800 text-slate-300 p-5 text-sm">
        <p className="font-semibold text-white mb-1">⚡ Quick start</p>
        <p>
          All modules run entirely in the browser. To enable Email Sender, add your{' '}
          <span className="font-mono text-sky-300">EmailJS</span> credentials to{' '}
          <span className="font-mono text-slate-100">src/lib/emailjs.js</span>. Everything else works out of the box.
        </p>
      </div>
    </div>
  )
}
