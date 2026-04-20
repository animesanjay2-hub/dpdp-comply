'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Shield, Plus, Download, ArrowRight } from 'lucide-react'
import { jsPDF } from 'jspdf'

export default function AuditPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [companyId, setCompanyId] = useState('')

  const [newItem, setNewItem] = useState({
    data_category: '', data_type: 'regular', collection_purpose: '',
    storage_location: '', retention_period: '', third_party_shared: false, third_party_names: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: user } = await supabase.auth.getUser()
      if (user.user) {
        setCompanyId(user.user.id)
        const { data } = await (supabase.from('data_inventory_items') as any)
          .select('*')
          .eq('company_id', user.user.id)
        if (data) setItems(data)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleAdd() {
    const itemToInsert = {
      ...newItem,
      company_id: companyId,
      third_party_names: newItem.third_party_names
        ? newItem.third_party_names.split(',').map(s => s.trim())
        : []
    }
    const { data, error } = await (supabase.from('data_inventory_items') as any)
      .insert([itemToInsert])
      .select()

    if (!error && data) {
      setItems([...items, data[0]])
      setIsOpen(false)
      setNewItem({
        data_category: '', data_type: 'regular', collection_purpose: '',
        storage_location: '', retention_period: '', third_party_shared: false, third_party_names: ''
      })
    }
  }

  function exportPDF() {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Data Inventory Audit Report', 15, 20)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 28)
    
    let y = 40
    doc.setFontSize(12)
    doc.text('Inventory Items:', 15, y)
    y += 10
    
    items.forEach((item, index) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${item.data_category} (${item.data_type})`, 15, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.text(`Purpose: ${item.collection_purpose || 'N/A'}`, 20, y)
      y += 5
      doc.text(`Storage: ${item.storage_location || 'N/A'}`, 20, y)
      y += 5
      doc.text(`Retention: ${item.retention_period || 'N/A'}`, 20, y)
      y += 10
    })
    
    doc.save('data-audit-inventory.pdf')
  }

  const sensitiveCount = items.filter(i => i.data_type === 'sensitive').length
  const childrenCount = items.filter(i => i.data_type === 'children').length
  const sharedCount = items.filter(i => i.third_party_shared).length

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="text-[#1a237e]" /> Data Audit</h1>
          <p className="text-gray-500">Record all personal data collected and processed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF} disabled={items.length === 0}>
            <Download size={16} className="mr-2" /> Export PDF
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1a237e]"><Plus size={16} className="mr-2" /> Add Data Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Data Type</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Data Category (e.g., Email)</Label>
                  <Input value={newItem.data_category} onChange={e => setNewItem({...newItem, data_category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Sensitivity</Label>
                  <Select onValueChange={v => setNewItem({...newItem, data_type: v})} defaultValue={newItem.data_type}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="sensitive">Sensitive</SelectItem>
                      <SelectItem value="children">Children's Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Collection Purpose</Label>
                  <Input value={newItem.collection_purpose} onChange={e => setNewItem({...newItem, collection_purpose: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Storage Location</Label>
                  <Input value={newItem.storage_location} onChange={e => setNewItem({...newItem, storage_location: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Retention Period</Label>
                  <Input value={newItem.retention_period} onChange={e => setNewItem({...newItem, retention_period: e.target.value})} />
                </div>
                <Button className="w-full" onClick={handleAdd}>Add to Inventory</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="text-sm text-gray-500">Total Types</div><div className="text-3xl font-bold">{items.length}</div></CardContent></Card>
        <Card className={sensitiveCount > 0 ? "border-amber-200 bg-amber-50" : ""}>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 flex justify-between">Sensitive <span>{sensitiveCount > 0 && '⚠️'}</span></div>
            <div className="text-3xl font-bold">{sensitiveCount}</div>
          </CardContent>
        </Card>
        <Card className={childrenCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 flex justify-between">Children's Data <span>{childrenCount > 0 && '🚨'}</span></div>
            <div className="text-3xl font-bold text-red-600">{childrenCount}</div>
          </CardContent>
        </Card>
        <Card><CardContent className="p-6"><div className="text-sm text-gray-500">Third-party Shared</div><div className="text-3xl font-bold">{sharedCount}</div></CardContent></Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Data Category</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Purpose</th>
                <th className="px-6 py-4 font-medium">Storage</th>
                <th className="px-6 py-4 font-medium">Retention</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.data_category}</td>
                  <td className="px-6 py-4">
                    {item.data_type === 'sensitive'
                      ? <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Sensitive</Badge>
                      : item.data_type === 'children'
                        ? <Badge variant="destructive">Children</Badge>
                        : <Badge variant="secondary">Regular</Badge>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.collection_purpose || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{item.storage_location || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{item.retention_period || '—'}</td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No data mapped yet. Click "Add Data Item" to start your audit.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={5} className="px-6 py-8 text-center"><div className="animate-pulse text-gray-400">Loading inventory...</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8 border-t pt-8">
        <h3 className="font-bold text-xl mb-4">Data Flow Diagram</h3>
        <div className="flex items-center gap-4 text-sm font-medium bg-white p-6 rounded-lg shadow-sm border max-w-2xl flex-wrap">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">Data Principal (User)</div>
          <ArrowRight className="text-gray-400" />
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">Your App (Fiduciary)</div>
          <ArrowRight className="text-gray-400" />
          <div className="p-3 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 border-dashed">Processors (Vendors)</div>
        </div>
      </div>
    </div>
  )
}