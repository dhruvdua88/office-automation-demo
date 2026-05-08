import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'
import { FileDown, Plus, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'

const emptyLine = () => ({ description: '', qty: '1', rate: '', amount: '' })

export default function DocGenerator() {
  const [meta, setMeta] = useState({
    invoiceNo: `INV-${dayjs().format('YYYYMM')}-001`,
    date: dayjs().format('YYYY-MM-DD'),
    dueDate: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    notes: 'Thank you for your business.',
    gst: '18',
  })
  const [lines, setLines] = useState([emptyLine()])

  function setMetaField(k, v) {
    setMeta(m => ({ ...m, [k]: v }))
  }

  function setLine(i, k, v) {
    setLines(ls => {
      const next = [...ls]
      next[i] = { ...next[i], [k]: v }
      if (k === 'qty' || k === 'rate') {
        const qty = parseFloat(k === 'qty' ? v : next[i].qty) || 0
        const rate = parseFloat(k === 'rate' ? v : next[i].rate) || 0
        next[i].amount = (qty * rate).toFixed(2)
      }
      return next
    })
  }

  const subtotal = lines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
  const gstAmt = subtotal * (parseFloat(meta.gst) || 0) / 100
  const total = subtotal + gstAmt

  function generatePDF() {
    if (!meta.clientName) {
      toast.error('Enter client name before generating.')
      return
    }
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(30, 30, 80)
    doc.text('DD & Co', 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('dhruv@ddandco.in', 14, 27)

    doc.setFontSize(16)
    doc.setTextColor(30)
    doc.text('INVOICE', 196, 20, { align: 'right' })
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`# ${meta.invoiceNo}`, 196, 27, { align: 'right' })

    // Meta box
    doc.setDrawColor(220)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(14, 35, 182, 28, 3, 3, 'FD')
    doc.setFontSize(9)
    doc.setTextColor(60)
    doc.text(`Bill to: ${meta.clientName}`, 18, 43)
    if (meta.clientEmail) doc.text(`Email: ${meta.clientEmail}`, 18, 49)
    if (meta.clientAddress) doc.text(`Address: ${meta.clientAddress}`, 18, 55)
    doc.text(`Date: ${dayjs(meta.date).format('DD MMM YYYY')}`, 145, 43)
    doc.text(`Due: ${dayjs(meta.dueDate).format('DD MMM YYYY')}`, 145, 49)

    // Line items table
    autoTable(doc, {
      startY: 70,
      head: [['Description', 'Qty', 'Rate (₹)', 'Amount (₹)']],
      body: lines
        .filter(l => l.description)
        .map(l => [l.description, l.qty, l.rate, l.amount]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    })

    const finalY = doc.lastAutoTable.finalY + 6
    const rightX = 196
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text(`Subtotal:`, 150, finalY)
    doc.text(`₹ ${subtotal.toFixed(2)}`, rightX, finalY, { align: 'right' })
    doc.text(`GST (${meta.gst}%):`, 150, finalY + 6)
    doc.text(`₹ ${gstAmt.toFixed(2)}`, rightX, finalY + 6, { align: 'right' })
    doc.setDrawColor(14, 165, 233)
    doc.line(140, finalY + 9, 196, finalY + 9)
    doc.setFontSize(11)
    doc.setTextColor(14, 165, 233)
    doc.text(`Total:`, 150, finalY + 15)
    doc.text(`₹ ${total.toFixed(2)}`, rightX, finalY + 15, { align: 'right' })

    if (meta.notes) {
      doc.setFontSize(8)
      doc.setTextColor(120)
      doc.text(`Notes: ${meta.notes}`, 14, finalY + 25)
    }

    doc.save(`${meta.invoiceNo}.pdf`)
    toast.success('PDF downloaded!')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Document Generator</h1>
        <p className="text-slate-500 text-sm mt-0.5">Fill the form — download a formatted invoice PDF instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — meta */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Invoice details</p>
            <div className="space-y-3">
              {[
                ['invoiceNo', 'Invoice number'],
                ['date', 'Date', 'date'],
                ['dueDate', 'Due date', 'date'],
                ['gst', 'GST %'],
              ].map(([k, label, type = 'text']) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={meta[k]}
                    onChange={e => setMetaField(k, e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Client</p>
            <div className="space-y-3">
              {[
                ['clientName', 'Name *'],
                ['clientEmail', 'Email'],
                ['clientAddress', 'Address'],
              ].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    value={meta[k]}
                    onChange={e => setMetaField(k, e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — line items */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Line items</p>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 text-xs text-slate-400 font-medium px-1">
                <span className="col-span-5">Description</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  <input
                    value={line.description}
                    onChange={e => setLine(i, 'description', e.target.value)}
                    placeholder="Service description"
                    className="col-span-5 border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300"
                  />
                  <input
                    value={line.qty}
                    onChange={e => setLine(i, 'qty', e.target.value)}
                    type="number"
                    min="0"
                    className="col-span-2 border border-slate-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-violet-300"
                  />
                  <input
                    value={line.rate}
                    onChange={e => setLine(i, 'rate', e.target.value)}
                    type="number"
                    min="0"
                    placeholder="0"
                    className="col-span-2 border border-slate-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-violet-300"
                  />
                  <div className="col-span-2 text-right text-sm text-slate-600 font-mono pr-1">
                    {line.amount || '0.00'}
                  </div>
                  <button
                    onClick={() => setLines(ls => ls.filter((_, j) => j !== i))}
                    disabled={lines.length === 1}
                    className="col-span-1 text-slate-300 hover:text-red-400 disabled:opacity-20 flex justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setLines(ls => [...ls, emptyLine()])}
              className="mt-3 flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium"
            >
              <Plus size={13} /> Add line
            </button>
          </div>

          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea
              value={meta.notes}
              onChange={e => setMetaField('notes', e.target.value)}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>

          {/* Totals */}
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>GST ({meta.gst}%)</span><span>₹ {gstAmt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-violet-700 border-t border-violet-200 pt-2">
              <span>Total</span><span>₹ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={generatePDF}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <FileDown size={16} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
