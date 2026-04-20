'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Shield, Plus, Download, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { jsPDF } from 'jspdf'

export default function AuditPage() {
  const { userId, isLoaded } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    data_category: '',
    data_type: 'regular',
    collection_purpose: '',
    storage_location: '',
    retention_period: '',
    third_party_shared: false,
    third_party_names: ''
  })

  const [sensitiveWarning, setSensitiveWarning] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!isLoaded || !userId) return
      const { data } = await (supabase.from('data_inventory_items') as any)
        .select('*')
        .eq('company_clerk_user_id', userId)
      if (data) {
        setItems(data)
        // Check for sensitive or children data to trigger warning
        const hasSensitive = data.some((item: any) => item.data_type === 'sensitive')
        const hasChildren = data.some((item: any) => item.data_type === 'children')
        setSensitiveWarning(hasSensitive || hasChildren)
      }
      setLoading(false)
    }
    loadData()
  }, [isLoaded, userId])

  async function handleAdd() {
    const itemToInsert = {
      ...newItem,
      company_clerk_user_id: userId,
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
        data_category: '',
        data_type: 'regular',
        collection_purpose: '',
        storage_location: '',
        retention_period: '',
        third_party_shared: false,
        third_party_names: ''
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
        items.forEach((item: any, index: number) => {
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

  const sensitiveCount = items.filter((i: any) => i.data_type === 'sensitive').length
  const childrenCount = items.filter((i: any) => i.data_type === 'children').length
  const sharedCount = items.filter((i: any) => i.third_party_shared).length

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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="text-sm text-gray-500">Total Types</div><div className="text-3xl font-bold">{items.length}</div></CardContent></Card>
        <Card className={sensitiveCount > 0 ? "border-amber-200 bg-amber-50" : ""}>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 flex justify-between">Sensitive <span>{sensitiveCount > 0 ? '⚠️' : ''}</span></div>
            <div className="text-3xl font-bold">{sensitiveCount}</div>
          </CardContent>
        </Card>
        <Card className={childrenCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 flex justify-between">Children&apos;s Data <span>{childrenCount > 0 ? '🚨' : ''}</span></div>
            <div className="text-3xl font-bold text-red-600">{childrenCount}</div>
          </CardContent>
        </Card>
        <Card><CardContent className="p-6"><div className="text-sm text-gray-500">Third-party Shared</div><div className="text-3xl font-bold">{sharedCount}</div></CardContent></Card>
      </div>

      {sensitiveWarning && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="text-4xl text-red-400 mb-2" />
            <h3 className="text-xl font-bold text-red-800">⚠️ Sensitive Data Detected</h3>
            <p className="text-red-600">
              You have recorded sensitive or children&apos;s data. Ensure you have proper consent and protection measures in place as required by DPDP Act 2023.
            </p>
          </CardContent>
        </Card>
      )}

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