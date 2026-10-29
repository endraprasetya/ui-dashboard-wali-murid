export const KOLOM_IDENTITAS = ['nama_lengkap', 'kelas', 'nomor_induk_sekolah'] as const

export const KOLOM_EDIT = [
  'nisn',
  'nik',
  'jenis_kelamin',
  'tempat_tanggal_lahir',
  'agama',
  'anak_ke',
  'telepon',
  'pendidikan_sebelumnya',
  'jalan',
  'desa_kelurahan',
  'kecamatan',
  'kabupaten',
  'propinsi',
  'nama_ayah',
  'nama_ibu',
  'nik_ibu',
  'pekerjaan_ayah',
  'pekerjaan_ibu',
  'nama_wali',
  'alamat_wali',
  'pekerjaan_wali',
] as const

export const KOLOM_PENTING = [
  { kunci: 'nik', label: 'NIK' },
  { kunci: 'nisn', label: 'NISN' },
  { kunci: 'tempat_tanggal_lahir', label: 'tempat dan tanggal lahir' },
  { kunci: 'jenis_kelamin', label: 'jenis kelamin' },
  { kunci: 'jalan', label: 'alamat' },
  { kunci: 'nama_ayah', label: 'nama ayah' },
  { kunci: 'nama_ibu', label: 'nama ibu' },
  { kunci: 'telepon', label: 'telepon' },
] as const

export const LABEL_DATA_DIRI: Record<(typeof KOLOM_EDIT)[number], string> = {
  nisn: 'NISN',
  nik: 'NIK',
  jenis_kelamin: 'Jenis kelamin',
  tempat_tanggal_lahir: 'Tempat, tanggal lahir',
  agama: 'Agama',
  anak_ke: 'Anak ke',
  telepon: 'Telepon',
  pendidikan_sebelumnya: 'Pendidikan sebelumnya',
  jalan: 'Jalan',
  desa_kelurahan: 'Desa / kelurahan',
  kecamatan: 'Kecamatan',
  kabupaten: 'Kabupaten',
  propinsi: 'Provinsi',
  nama_ayah: 'Nama ayah',
  nama_ibu: 'Nama ibu',
  nik_ibu: 'NIK ibu',
  pekerjaan_ayah: 'Pekerjaan ayah',
  pekerjaan_ibu: 'Pekerjaan ibu',
  nama_wali: 'Nama wali',
  alamat_wali: 'Alamat wali',
  pekerjaan_wali: 'Pekerjaan wali',
}

export type DataDiri = {
  nama_lengkap: string
  kelas: string
  nomor_induk_sekolah: number
} & Record<(typeof KOLOM_EDIT)[number], string>
