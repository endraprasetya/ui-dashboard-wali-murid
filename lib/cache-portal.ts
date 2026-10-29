import { unstable_cache } from 'next/cache'

export async function cacheBagian<T>(
  idSiswa: string,
  bagian: string,
  muat: () => Promise<T>,
  simpan: (nilai: T) => boolean = () => true,
) {
  try {
    return await unstable_cache(
      async () => {
        const nilai = await muat()
        if (!simpan(nilai)) throw new Error('lewati-cache')
        return nilai
      },
      ['wali-portal', bagian, idSiswa],
      { revalidate: 45, tags: [`wali:${idSiswa}`, `wali:${idSiswa}:${bagian}`] },
    )()
  } catch (error) {
    if (error instanceof Error && error.message.includes('lewati-cache')) return muat()
    throw error
  }
}
