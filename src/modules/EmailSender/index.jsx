import { useState } from 'react'
import emailjs from '@emailjs/browser'
import toast from 'react-hot-toast'
import { Send, Info } from 'lucide-react'
import { EMAILJS_CONFIG } from '../../lib/emailjs'

const TEMPLATES = [
  {
    id: 'follow_up',
    label: 'Follow-up',
    subject: 'Following up on our conversation',
    message: 'Hi {{to_name}},\n\nI wanted to follow up on our recent conversation. Please let me know if you need anything further.\n\nBest regards,\nDD & Co',
  },
  {
    id: 'invoice',
    label: 'Invoice notification',
    subject: 'Invoice from DD & Co',
    message: 'Hi {{to_name}},\n\nPlease find attached the invoice for services rendered. Kindly process payment at your earliest convenience.\n\nThank you,\nDD & Co',
  },
  {
    id: 'meeting',
    label: 'Meeting request',
    subject: 'Meeting request – DD & Co',
    message: 'Hi {{to_name}},\n\nI\'d love to schedule a brief call to discuss next steps. Please share a time that works for you.\n\nLooking forward,\nDD & Co',
  },
  {
    id: 'custom',
    label: 'Custom',
    subject: '',
    message: '',
  },
]

export default function EmailSender() {
  const [template, setTemplate] = useState(TEMPLATES[0])
  const [form, setForm] = useState({
    to_name: '',
    to_email: '',
    subject: TEMPLATES[0].subject,
    message: TEMPLATES[0].message,
    cc: '',
  })
  const [sending, setSending] = useState(false)
  const isConfigured = EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY'

  function pickTemplate(t) {
    setTemplate(t)
    setForm(f => ({
      ...f,
      subject: t.subject || f.subject,
      message: t.message.replace('{{to_name}}', f.to_name || '{{to_name}}'),
    }))
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!isConfigured) {
      toast.error('Add your EmailJS credentials to src/lib/emailjs.js first.')
      return
    }
    if (!form.to_email || !form.subject) {
      toast.error('Recipient email and subject are required.')
      return
    }
    setSending(true)
    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        {
          to_name: form.to_name,
          to_email: form.to_email,
          from_name: 'DD & Co',
          reply_to: 'dhruv@ddandco.in',
          subject: form.subject,
          message: form.message,
          cc: form.cc,
        },
        { publicKey: EMAILJS_CONFIG.publicKey }
      )
      toast.success('Email sent successfully!')
      setForm(f => ({ ...f, to_name: '', to_email: '', cc: '', message: template.message }))
    } catch (err) {
      toast.error(`Send failed: ${err?.text || err?.message || 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Email Sender</h1>
        <p className="text-slate-500 text-sm mt-0.5">Send templated emails via EmailJS — no server needed.</p>
      </div>

      {!isConfigured && (
        <div className="mb-5 flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>
            EmailJS not configured yet. Edit{' '}
            <code className="bg-amber-100 px-1 rounded font-mono">src/lib/emailjs.js</code>{' '}
            with your Service ID, Template ID and Public Key.{' '}
            <a href="https://www.emailjs.com/" target="_blank" rel="noreferrer" className="underline">
              Sign up free →
            </a>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template picker */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Templates</p>
          <div className="flex flex-col gap-2">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => pickTemplate(t)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors border ${
                  template.id === t.id
                    ? 'bg-sky-50 border-sky-300 text-sky-700 font-medium'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compose form */}
        <form onSubmit={handleSend} className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Recipient name</label>
              <input
                name="to_name"
                value={form.to_name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Recipient email *</label>
              <input
                name="to_email"
                type="email"
                value={form.to_email}
                onChange={handleChange}
                placeholder="rahul@example.com"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Subject *</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CC (optional)</label>
            <input
              name="cc"
              value={form.cc}
              onChange={handleChange}
              placeholder="cc@example.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={7}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Send size={15} />
            {sending ? 'Sending…' : 'Send Email'}
          </button>
        </form>
      </div>
    </div>
  )
}
