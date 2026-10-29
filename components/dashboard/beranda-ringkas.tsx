import Link from 'next/link'
import { BookHeart, CalendarCheck, GraduationCap, NotebookPen, ShieldCheck, UserRound, Wallet } from 'lucide-react'
import { KotakRingkas } from '@/components/dashboard/kotak-ringkas'
import { TabelTugasRumah } from '@/components/dashboard/tabel-tugas-rumah'
import type { HasilDataDiri } from '@/lib/data-diri'
import type { DashboardData, JurnalEntry, TahfidzEntry, TertibEntry } from '@/lib/queries'
import { adaIsiTugas } from '@/lib/tugas-status'

const MENU_KEUANGAN = ['SPP', 'Buku', 'Ekstrakurikuler', 'ASTS 1', 'ASAS', 'ASTS 2', 'ASAT', 'Daftar ulang']

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

export function BerandaRingkas({ data, diri }: { data: DashboardData; diri: HasilDataDiri }) {
  const siswa = data.student
  if (!siswa) return null

  const riwayatQiroah = data.qiroah.data.recent.slice(0, 3)
  const tugasQiroah = data.qiroah.data.recent.filter((row) => adaIsiTugas(row.tugas))
  const riwayatTahfidz = data.tahfidz.data.history.slice(0, 6)
  const tugasTahfidz = data.tahfidz.data.history.filter((row) => adaIsiTugas(row.tugas))
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
              <JudulBagian>3 riwayat terakhir</JudulBagian>
              {riwayatQiroah.length === 0 ? (
                <Kosong teks="Belum ada setoran." />
              ) : (
                <ul>
                  {riwayatQiroah.map((row) => (
                    <Baris key={row.id} kiri={`${row.jilid} · hal. ${row.halaman}`} kanan={row.date} />
                  ))}
                </ul>
              )}
            </div>
            <div className="min-w-0 rounded-2xl bg-white p-3 text-slate-900">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Tugas rumah</p>
              {tugasQiroah.length === 0 ? (
                <Kosong teks="Belum ada tugas rumah." />
              ) : (
                <div className="mt-2">
                  <TabelTugasRumah
                    jenis="qiroah"
                    batas={6}
                    baris={tugasQiroah.map((row) => ({
                      id: row.id,
                      tanggal: row.date,
                      tugas: row.tugas,
                      status: row.statusSetoran,
                    }))}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </KotakRingkas>

      <KotakRingkas href="/tahfidz" judul="Tahfidzul Quran" ikon={BookHeart} nada="emerald" pisahTautan>
        {data.tahfidz.error ? (
          <Kosong teks={data.tahfidz.error} />
        ) : (
          <div className="space-y-3">
            <div>
              <JudulBagian>6 riwayat terakhir</JudulBagian>
              {riwayatTahfidz.length === 0 ? (
                <Kosong teks="Belum ada setoran tahfidz." />
              ) : (
                <ul>
                  {riwayatTahfidz.map((row: TahfidzEntry) => (
                    <Baris key={row.id} kiri={`${row.surah} · ayat ${row.ayat}`} kanan={row.date} />
                  ))}
                </ul>
              )}
              <Link href="/tahfidz#riwayat-hafalan" className="mt-2 inline-block text-sm font-bold text-white underline">
                Lihat Selengkapnya
              </Link>
            </div>
            <div className="min-w-0 rounded-2xl bg-white p-3 text-slate-900">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Tugas rumah</p>
              {tugasTahfidz.length === 0 ? (
                <p className="py-1 text-xs text-slate-500">Belum ada tugas rumah.</p>
              ) : (
                <div className="mt-2">
                  <TabelTugasRumah
                    jenis="tahfidz"
                    batas={6}
                    baris={tugasTahfidz.map((row) => ({
                      id: row.id,
                      tanggal: row.date,
                      tugas: row.tugas,
                      status: row.konfirmasi,
                    }))}
                  />
                </div>
              )}
            </div>
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
                <Baris key={row.id} kiri={`${row.mapel}${row.materi ? ` · ${row.materi}` : ''}`} kanan={row.date} />
              ))}
            </ul>
          </div>
        )}
      </KotakRingkas>

      <KotakRingkas href="/profil" judul="Profil Anak" ikon={UserRound} nada="indigo">
        {diri.error ? (
          <Kosong teks={diri.error} />
        ) : !diri.data ? (
          <Kosong teks="Buku induk belum tertaut dengan akun ini." />
        ) : (
          <ul>
            <Baris kiri={diri.data.nama_lengkap || siswa.name} kanan={`Kelas ${diri.data.kelas || siswa.kelas || '-'}`} />
            <Baris kiri="Nomor induk" kanan={String(diri.data.nomor_induk_sekolah || '-')} />
            <Baris
              kiri="Kelengkapan data"
              kanan={diri.kurang.length === 0 ? 'Lengkap' : `${diri.kurang.length} belum diisi`}
            />
          </ul>
        )}
      </KotakRingkas>

      <KotakRingkas href="/tertib" judul="Tertib Point" ikon={ShieldCheck} nada="rose">
        {data.tertib.error ? (
          <Kosong teks={data.tertib.error} />
        ) : (
          <div>
            <p className="text-xs opacity-90">
              Saldo poin{' '}
              <span className="font-bold">
                {data.tertib.data.total > 0 ? `+${data.tertib.data.total}` : data.tertib.data.total}
              </span>
            </p>
            {tertib.length === 0 ? (
              <Kosong teks="Belum ada catatan poin." />
            ) : (
              <ul className="mt-1">
                {tertib.map((row: TertibEntry) => (
                  <Baris
                    key={row.id}
                    kiri={row.label}
                    kanan={row.points > 0 ? `+${row.points}` : String(row.points)}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </KotakRingkas>

      <KotakRingkas href="/keuangan" judul="Keuangan" ikon={Wallet} nada="teal">
        <p className="text-xs opacity-90">Tagihan belum dibayar dan riwayat pembayaran dari AMPSS.</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {MENU_KEUANGAN.map((item) => (
            <li key={item} className="rounded-full bg-black/10 px-2.5 py-1 text-[11px] font-semibold">
              {item}
            </li>
          ))}
        </ul>
      </KotakRingkas>

      <KotakRingkas judul={`Presensi ${absensi.monthLabel}`} ikon={CalendarCheck} nada="slate" className="md:col-span-2">
        {data.absensi.error ? (
          <Kosong teks={data.absensi.error} />
        ) : absensi.unavailable ? (
          <Kosong teks="Rekap absensi per siswa belum tersedia." />
        ) : absensi.totalDays === 0 ? (
          <Kosong teks="Belum ada catatan kehadiran." />
        ) : (
          <p className="text-sm">
            Hadir {absensi.present} · Sakit {absensi.sick} · Izin {absensi.permission} · Alpha {absensi.absent}
          </p>
        )}
      </KotakRingkas>
    </div>
  )
}
