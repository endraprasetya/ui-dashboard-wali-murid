import Link from 'next/link'
import { BookHeart, CalendarCheck, GraduationCap, NotebookPen, ShieldCheck, UserRound, Wallet } from 'lucide-react'
import { KotakRingkas } from '@/components/dashboard/kotak-ringkas'
import { TabelTugasRumah } from '@/components/dashboard/tabel-tugas-rumah'
import type { HasilDataDiri } from '@/lib/data-diri'
import type { DashboardData, JurnalEntry, TertibEntry } from '@/lib/queries'
import { labelMapelGuru } from '@/lib/format'
import { adaIsiTugas, dahulukanBelumDikerjakan, sudahDikonfirmasi } from '@/lib/tugas-status'

type RingkasKeuangan = {
  error: string | null
  ringkas: { terbayar: number; belumTerbayar: number }
  tagihan: { keterangan: string; jumlah: number }[]
}

function rupiah(nilai: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(nilai)
}

function Baris({ kiri, kanan }: { kiri: string; kanan: string }) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-dashed border-current/25 py-1.5 last:border-0">
      <span className="min-w-0 truncate">{kiri}</span>
      <span className="shrink-0 text-[11px] opacity-80">{kanan}</span>
    </li>
  )
}

function Kosong({ teks }: { teks: string }) {
  return <p className="py-1 text-xs opacity-80">{teks}</p>
}

function JudulBagian({ children }: { children: string }) {
  return <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{children}</p>
}

function tugasTerbuka(baris: { id: string; tanggal: string; tugas: string; status: string }[]) {
  const urut = dahulukanBelumDikerjakan(baris.filter((row) => adaIsiTugas(row.tugas)))
  const pertama = urut[0]
  return pertama && !sudahDikonfirmasi(pertama.status) ? pertama : null
}

export function BerandaRingkas({
  data,
  diri,
  keuangan = null,
}: {
  data: DashboardData
  diri: HasilDataDiri
  keuangan?: RingkasKeuangan | null
}) {
  const siswa = data.student
  if (!siswa) return null

  const setoranQiroah = data.qiroah.data.recent[0] ?? null
  const tugasQiroah = tugasTerbuka(
    data.qiroah.data.recent.map((row) => ({
      id: row.id,
      tanggal: row.date,
      tugas: row.tugas,
      status: row.statusSetoran,
    })),
  )
  const setoranTahfidz = data.tahfidz.data.history[0] ?? null
  const tugasTahfidz = tugasTerbuka(
    data.tahfidz.data.history.map((row) => ({
      id: row.id,
      tanggal: row.date,
      tugas: row.tugas,
      status: row.konfirmasi,
    })),
  )
  const jurnal = data.jurnal.data.slice(0, 3)
  const tertib = data.tertib.data.items.slice(0, 3)
  const absensi = data.absensi.data

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <KotakRingkas href="/qiroah" judul="Qiroatul Quran" ikon={GraduationCap} nada="blue" pisahTautan>
        {data.qiroah.error ? (
          <Kosong teks={data.qiroah.error} />
        ) : (
          <div className="space-y-3">
            <div>
              <JudulBagian>Riwayat setoran terakhir</JudulBagian>
              {setoranQiroah ? (
                <ul>
                  <Baris kiri={`${setoranQiroah.jilid} · hal. ${setoranQiroah.halaman}`} kanan={setoranQiroah.date} />
                </ul>
              ) : (
                <Kosong teks="Belum ada setoran." />
              )}
            </div>
            <div className="min-w-0 rounded-2xl bg-white p-3 text-slate-900">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Tugas belum dikerjakan</p>
              {tugasQiroah ? (
                <div className="mt-2">
                  <TabelTugasRumah jenis="qiroah" batas={1} baris={[tugasQiroah]} konfirmasiAktif={false} />
                </div>
              ) : (
                <p className="py-1 text-xs text-slate-500">Tidak ada tugas yang belum dikerjakan.</p>
              )}
            </div>
            <Link href="/qiroah" className="tombol-buka inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-bold">
              Buka halaman Qiroah
            </Link>
          </div>
        )}
      </KotakRingkas>

      <KotakRingkas href="/tahfidz" judul="Tahfidzul Quran" ikon={BookHeart} nada="emerald" pisahTautan>
        {data.tahfidz.error ? (
          <Kosong teks={data.tahfidz.error} />
        ) : (
          <div className="space-y-3">
            <div>
              <JudulBagian>Riwayat setoran terakhir</JudulBagian>
              {setoranTahfidz ? (
                <ul>
                  <Baris
                    kiri={`${setoranTahfidz.surah} · ayat ${setoranTahfidz.ayat}`}
                    kanan={setoranTahfidz.date}
                  />
                </ul>
              ) : (
                <Kosong teks="Belum ada setoran tahfidz." />
              )}
            </div>
            <div className="min-w-0 rounded-2xl bg-white p-3 text-slate-900">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Tugas belum dikerjakan</p>
              {tugasTahfidz ? (
                <div className="mt-2">
                  <TabelTugasRumah jenis="tahfidz" batas={1} baris={[tugasTahfidz]} konfirmasiAktif={false} />
                </div>
              ) : (
                <p className="py-1 text-xs text-slate-500">Tidak ada tugas yang belum dikerjakan.</p>
              )}
            </div>
            <Link href="/tahfidz" className="tombol-buka inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-bold">
              Buka halaman Tahfidz
            </Link>
          </div>
        )}
      </KotakRingkas>

      <KotakRingkas href="/jurnal" judul="Jurnal Pembelajaran" ikon={NotebookPen} nada="amber">
        {data.jurnal.error ? (
          <Kosong teks={data.jurnal.error} />
        ) : jurnal.length === 0 ? (
          <Kosong teks="Belum ada jurnal untuk kelas ini." />
        ) : (
          <div>
            <JudulBagian>3 kegiatan terakhir</JudulBagian>
            <ul>
              {jurnal.map((row: JurnalEntry) => (
                <Baris
                  key={row.id}
                  kiri={`${labelMapelGuru(row.mapel, row.guru)}${row.materi ? ` · ${row.materi}` : ''}`}
                  kanan={row.date}
                />
              ))}
            </ul>
          </div>
        )}
      </KotakRingkas>

      <KotakRingkas href="/profil" judul="Profil Siswa" ikon={UserRound} nada="indigo" className="kartu-profil">
        <div className="isi-kartu rounded-2xl p-3 shadow-sm">
          {diri.error ? (
            <p className="py-1 text-xs text-slate-600">{diri.error}</p>
          ) : !diri.data ? (
            <p className="py-1 text-xs text-slate-600">Buku induk belum tertaut dengan akun ini.</p>
          ) : (
            <ul>
              <Baris kiri={diri.data.nama_lengkap || siswa.name} kanan={`Kelas ${diri.data.kelas || siswa.kelas || '-'}`} />
              <Baris kiri="Nomor induk" kanan={String(diri.data.nomor_induk_sekolah || siswa.nis || '-')} />
              <Baris kiri="Unit" kanan={siswa.unit || '-'} />
              <Baris
                kiri="Kelengkapan data"
                kanan={diri.kurang.length === 0 ? 'Lengkap' : `${diri.kurang.length} belum diisi`}
              />
            </ul>
          )}
        </div>
      </KotakRingkas>

      <KotakRingkas href="/tertib" judul="Rekap Tertib Point" ikon={ShieldCheck} nada="rose" className="kartu-tertib">
        <div className="isi-kartu rounded-2xl p-3 shadow-sm">
          {data.tertib.error ? (
            <p className="py-1 text-xs text-slate-600">{data.tertib.error}</p>
          ) : (
            <div>
              <p className="text-xs text-slate-600">
                Saldo poin{' '}
                <span className="font-bold text-slate-900">
                  {data.tertib.data.total > 0 ? `+${data.tertib.data.total}` : data.tertib.data.total}
                </span>
              </p>
              {tertib.length === 0 ? (
                <p className="py-1 text-xs text-slate-600">Belum ada catatan poin.</p>
              ) : (
                <ul className="mt-1">
                  {tertib.map((row: TertibEntry) => (
                    <Baris
                      key={row.id}
                      kiri={row.keterangan ? `${row.label} · ${row.keterangan}` : row.label}
                      kanan={row.points > 0 ? `+${row.points}` : String(row.points)}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </KotakRingkas>

      <KotakRingkas href="/keuangan" judul="Informasi Keuangan" ikon={Wallet} nada="teal" className="kartu-keuangan">
        <div className="isi-kartu rounded-2xl p-3 shadow-sm">
          <p className="text-sm font-medium leading-relaxed">
            Informasi administrasi SPP, Daftar Ulang PSB, Ujian, Ekstrakurikuler, Buku Paket dan lainnya
          </p>
          {keuangan && !keuangan.error ? (
            <ul className="mt-2 border-t border-slate-200 pt-1">
              <Baris kiri="Belum terbayar" kanan={rupiah(keuangan.ringkas.belumTerbayar)} />
              <Baris kiri="Sudah terbayar" kanan={rupiah(keuangan.ringkas.terbayar)} />
            </ul>
          ) : null}
        </div>
      </KotakRingkas>

      <KotakRingkas href="/absensi" judul={`Presensi ${absensi.monthLabel}`} ikon={CalendarCheck} nada="slate" className="md:col-span-2">
        {data.absensi.error ? (
          <Kosong teks={data.absensi.error} />
        ) : absensi.unavailable ? (
          <Kosong teks="Rekap absensi per siswa belum tersedia." />
        ) : absensi.totalDays === 0 ? (
          <Kosong teks="Belum ada catatan kehadiran." />
        ) : (
          <p className="text-sm">
            {absensi.totalDays} hari efektif · Hadir {absensi.present} hari · Tidak hadir: Sakit {absensi.sick}, Izin{' '}
            {absensi.permission}, Alpha {absensi.absent}
          </p>
        )}
      </KotakRingkas>
    </div>
  )
}
