import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { Plus, Download, Trash2, FileSpreadsheet } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number').optional().or(z.literal('')),
  department: z.string().min(1, 'Select a department'),
  amount: z.coerce.number().positive('Must be a positive number'),
  category: z.string().min(1, 'Select a category'),
  remarks: z.string().optional(),
})

const DEPARTMENTS = ['Finance', 'Sales', 'HR', 'Operations', 'IT', 'Management']
const CATEGORIES = ['Expense', 'Revenue', 'Asset', 'Liability', 'Payroll', 'Other']

export default function SmartForms() {
  const [rows, setRows] = useState([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  function onSubmit(data) {
    setRows(r => [...r, { ...data, id: Date.now(), ts: new Date().toLocaleString() }])
    toast.success('Entry added!')
    reset()
  }

  function removeRow(id) {
    setRows(r => r.filter(row => row.id !== id))
  }

  function exportXLSX() {
    if (!rows.length) { toast.error('No entries to export.'); return }
    const data = rows.map(({ id, ...r }) => ({
      Name: r.name,
      Email: r.email,
      Phone: r.phone,
      Department: r.department,
      Amount: r.amount,
      Category: r.category,
      Remarks: r.remarks,
      Timestamp: r.ts,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [20, 28, 14, 14, 12, 14, 24, 22].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Entries')
    XLSX.writeFile(wb, 'office-entries.xlsx')
    toast.success('Excel downloaded!')
  }

  function exportCSV() {
    if (!rows.length) { toast.error('No entries to export.'); return }
    const headers = ['Name', 'Email', 'Phone', 'Department', 'Amount', 'Category', 'Remarks', 'Timestamp']
    const csvRows = [headers, ...rows.map(r => [r.name, r.email, r.phone, r.department, r.amount, r.category, r.remarks, r.ts])]
    const csv = csvRows.map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'office-entries.csv'
    a.click()
    toast.success('CSV downloaded!')
  }

  const F = ({ name, label, as: As = 'input', children, ...rest }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {As === 'input' ? (
        <input
          {...register(name)}
          {...rest}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      ) : (
        <select
          {...register(name)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
        >
          <option value="">Select…</option>
          {children}
        </select>
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Smart Forms</h1>
        <p className="text-slate-500 text-sm mt-0.5">Validated data entry with one-click Excel / CSV export.</p>
      </div>

      {/* Entry form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">New entry</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <F name="name" label="Full name *" placeholder="Rahul Sharma" />
          <F name="email" label="Email *" type="email" placeholder="rahul@example.com" />
          <F name="phone" label="Mobile" placeholder="9XXXXXXXXX" />
          <F name="department" label="Department *" as="select">
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </F>
          <F name="amount" label="Amount (₹) *" type="number" min="0" step="0.01" placeholder="0.00" />
          <F name="category" label="Category *" as="select">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </F>
          <div className="sm:col-span-2 lg:col-span-3">
            <F name="remarks" label="Remarks" placeholder="Optional notes…" />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={15} /> Add Entry
        </button>
      </form>

      {/* Entries table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-700">
            {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={exportXLSX}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <FileSpreadsheet size={13} /> Export .xlsx
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Download size={13} /> Export .csv
            </button>
          </div>
        </div>
        {rows.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No entries yet — fill the form above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-medium">
                  {['Name', 'Email', 'Dept', 'Amount', 'Category', 'Remarks', ''].map(h => (
                    <th key={h} className="px-4 py-2 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{row.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{row.email}</td>
                    <td className="px-4 py-2.5 text-slate-500">{row.department}</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-700">₹{Number(row.amount).toFixed(2)}</td>
                    <td className="px-4 py-2.5">
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{row.category}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs max-w-[160px] truncate">{row.remarks}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => removeRow(row.id)} className="text-slate-300 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
