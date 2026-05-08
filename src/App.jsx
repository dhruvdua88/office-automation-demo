import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Dashboard from './modules/Dashboard'
import EmailSender from './modules/EmailSender'
import DocGenerator from './modules/DocGenerator'
import SmartForms from './modules/SmartForms'
import Reminders from './modules/Reminders'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/email" element={<EmailSender />} />
          <Route path="/docs" element={<DocGenerator />} />
          <Route path="/forms" element={<SmartForms />} />
          <Route path="/reminders" element={<Reminders />} />
        </Routes>
      </main>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </div>
  )
}
