import { ShieldCheck } from 'lucide-react'
import type { TertibData } from '@/lib/queries'
import { TertibSaldoKartu } from '@/components/dashboard/tertib-saldo-kartu'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'

export function TertibCard({ data, error }: { data: TertibData; error: string | null }) {
  const saldo = {
    modal: data.modal,
    positif: data.prestasi,
    negatif: data.pelanggaran,
    sisa: data.sisa,
  }

  return (
    <DashboardCard title="Tertib & Poin" subtitle="Pelanggaran dan prestasi" icon={ShieldCheck}>
      {error ? (
        <ModuleMessage tone="error">{error}</ModuleMessage>
      ) : (
        <TertibSaldoKartu saldo={saldo} namaBulan={data.bulanLabel} ringkas />
      )}
    </DashboardCard>
  )
}
