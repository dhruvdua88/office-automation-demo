import { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import toast from 'react-hot-toast'
import { Bell, BellOff, Plus, Trash2, CheckCircle } from 'lucide-react'

dayjs.extend(relativeTime)
dayjs.extend(duration)

const PRIORITIES = ['Low', 'Medium', 'High']
const PRIORITY_STYLE = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
}

function getPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

function useNow() {
  const [now, setNow] = useState(dayjs())
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function Reminders() {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: 'Submit GST return',
      due: dayjs().add(2, 'hour').toISOString(),
      priority: 'High',
      done: false,
      notified: false,
    },
    {
      id: 2,
      title: 'Send monthly report to clients',
      due: dayjs().add(1, 'day').toISOString(),
      priority: 'Medium',
      done: false,
      notified: false,
    },
  ])
  const [form, setForm] = useState({ title: '', due: '', priority: 'Medium' })
  const [permission, setPermission] = useState(getPermission())
  const now = useNow()
  const fired = useRef(new Set())

  // Fire browser notifications
  useEffect(() => {
    if (permission !== 'granted') return
    reminders.forEach(r => {
      if (r.done || fired.current.has(r.id)) return
      const diff = dayjs(r.due).diff(now, 'second')
      if (diff <= 0 && diff > -60) {
        fired.current.add(r.id)
        new Notification(`⏰ ${r.title}`, {
          body: 'This reminder is due now.',
          icon: 'https://emojicdn.elk.sh/⏰',
        })
        toast(`⏰ ${r.title}`, { duration: 5000 })
        setReminders(rs => rs.map(x => x.id === r.id ? { ...x, notified: true } : x))
      }
    })
  }, [now, reminders, permission])

  async function requestPermission() {
    if (!('Notification' in window)) { toast.error('Browser notifications not supported.'); return }
    const p = await Notification.requestPermission()
    setPermission(p)
    if (p === 'granted') toast.success('Notifications enabled!')
    else toast.error('Permission denied.')
  }

  function addReminder() {
    if (!form.title || !form.due) { toast.error('Title and due date/time required.'); return }
    if (dayjs(form.due).isBefore(now)) { toast.error('Due date must be in the future.'); return }
    setReminders(rs => [...rs, { id: Date.now(), ...form, done: false, notified: false }])
    setForm({ title: '', due: '', priority: 'Medium' })
    toast.success('Reminder set!')
  }

  function toggle(id) {
    setReminders(rs => rs.map(r => r.id === id ? { ...r, done: !r.done } : r))
  }

  function remove(id) {
    setReminders(rs => rs.filter(r => r.id !== id))
  }

  function countdown(due) {
    const diff = dayjs(due).diff(now, 'second')
    if (diff <= 0) return 'Overdue'
    const d = dayjs.duration(diff, 'second')
    if (d.days() > 0) return `${d.days()}d ${d.hours()}h`
    if (d.hours() > 0) return `${d.hours()}h ${d.minutes()}m`
    if (d.minutes() > 0) return `${d.minutes()}m ${d.seconds()}s`
    return `${d.seconds()}s`
  }

  const active = reminders.filter(r => !r.done).sort((a, b) => dayjs(a.due).diff(dayjs(b.due)))
  const done = reminders.filter(r => r.done)

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reminders</h1>
          <p className="text-slate-500 text-sm mt-0.5">Deadline alerts with live countdowns and browser push notifications.</p>
        </div>
        {permission !== 'granted' ? (
          <button
            onClick={requestPermission}
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
          >
            <BellOff size={14} /> Enable notifications
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
            <Bell size={14} /> Notifications on
          </span>
        )}
      </div>

      {/* Add form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">New reminder</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="What do you need to do?"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <input
            type="datetime-local"
            value={form.due}
            onChange={e => setForm(f => ({ ...f, due: e.target.value }))}
            min={dayjs().format('YYYY-MM-DDTHH:mm')}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <select
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <button
            onClick={addReminder}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Active */}
      <div className="space-y-2 mb-6">
        {active.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl py-10 text-center text-slate-400 text-sm">
            No active reminders — add one above.
          </div>
        ) : active.map(r => {
          const overdue = dayjs(r.due).isBefore(now)
          return (
            <div
              key={r.id}
              className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all ${
                overdue ? 'border-red-200 bg-red-50' : 'border-slate-200'
              }`}
            >
              <button onClick={() => toggle(r.id)} className="text-slate-300 hover:text-emerald-500 transition-colors">
                <CheckCircle size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                <p className="text-xs text-slate-400">{dayjs(r.due).format('DD MMM YYYY, h:mm A')}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLE[r.priority]}`}>
                {r.priority}
              </span>
              <span className={`text-xs font-mono font-semibold min-w-[56px] text-right ${overdue ? 'text-red-600' : 'text-amber-600'}`}>
                {countdown(r.due)}
              </span>
              <button onClick={() => remove(r.id)} className="text-slate-200 hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Completed ({done.length})</p>
          <div className="space-y-1">
            {done.map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 opacity-60">
                <button onClick={() => toggle(r.id)} className="text-emerald-400">
                  <CheckCircle size={18} />
                </button>
                <p className="flex-1 text-sm text-slate-500 line-through">{r.title}</p>
                <button onClick={() => remove(r.id)} className="text-slate-200 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
