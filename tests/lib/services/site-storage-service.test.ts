import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadImage, deleteImage, replaceImage } from '@/lib/actions/upload-actions'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

vi.mock('@/lib/services/auth-service', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}))

function makeFile(type = 'image/jpeg', size = 1000, name = 'photo.jpg'): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('upload-actions', () => {
  const mockStorage = { from: vi.fn() }
  const mockBucket = { upload: vi.fn(), getPublicUrl: vi.fn(), remove: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    mockStorage.from.mockReturnValue(mockBucket)
    vi.mocked(createClient).mockResolvedValue({ storage: mockStorage } as any)
  })

  describe('uploadImage', () => {
    it('uploads and returns url on success', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      mockBucket.upload.mockResolvedValueOnce({ error: null })
      mockBucket.getPublicUrl.mockReturnValueOnce({ data: { publicUrl: 'https://cdn.test/general/abc.jpg' } })

      const fd = new FormData()
      fd.set('file', makeFile('image/jpeg', 500))
      fd.set('folder', 'general')

      const result = await uploadImage(fd)
      expect(result).toHaveProperty('url', 'https://cdn.test/general/abc.jpg')
      expect(result).toHaveProperty('path')
      expect(mockStorage.from).toHaveBeenCalledWith('site-images')
    })

    it('returns unauthorized when not logged in', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const fd = new FormData()
      fd.set('file', makeFile())
      const result = await uploadImage(fd)
      expect(result).toEqual({ error: 'Unauthorized' })
      expect(mockBucket.upload).not.toHaveBeenCalled()
    })

    it('rejects invalid file type', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      const fd = new FormData()
      fd.set('file', makeFile('application/pdf', 500, 'doc.pdf'))
      const result = await uploadImage(fd)
      expect(result).toEqual({ error: 'Tipe file harus JPEG/PNG/WebP' })
    })

    it('rejects oversized file', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      const fd = new FormData()
      fd.set('file', makeFile('image/jpeg', 3 * 1024 * 1024))
      const result = await uploadImage(fd)
      expect(result).toEqual({ error: 'File maksimal 2MB' })
    })

    it('returns error when no file provided', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      const fd = new FormData()
      const result = await uploadImage(fd)
      expect(result).toEqual({ error: 'Tidak ada file' })
    })

    it('returns storage error on upload failure', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      mockBucket.upload.mockResolvedValueOnce({ error: { message: 'storage full' } })
      const fd = new FormData()
      fd.set('file', makeFile('image/png', 100))
      const result = await uploadImage(fd)
      expect(result).toEqual({ error: 'storage full' })
    })

    it('accepts WebP files', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      mockBucket.upload.mockResolvedValueOnce({ error: null })
      mockBucket.getPublicUrl.mockReturnValueOnce({ data: { publicUrl: 'x' } })

      const fd = new FormData()
      fd.set('file', makeFile('image/webp', 100, 'img.webp'))
      const result = await uploadImage(fd)
      expect(result).toHaveProperty('url')
    })
  })

  describe('deleteImage', () => {
    it('deletes and returns success', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      mockBucket.remove.mockResolvedValueOnce({ error: null })
      const url = 'https://cdn.test/storage/v1/object/public/site-images/general/photo.jpg'
      const result = await deleteImage(url)
      expect(mockBucket.remove).toHaveBeenCalledWith(['general/photo.jpg'])
      expect(result).toEqual({ success: true })
    })

    it('returns unauthorized when not logged in', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const result = await deleteImage('https://cdn.test/storage/v1/object/public/site-images/general/photo.jpg')
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('returns error for invalid URL', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      const result = await deleteImage('https://cdn.test/invalid')
      expect(result).toEqual({ error: 'URL tidak valid' })
    })

    it('returns storage error on remove failure', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      mockBucket.remove.mockResolvedValueOnce({ error: { message: 'not found' } })
      const url = 'https://cdn.test/storage/v1/object/public/site-images/general/photo.jpg'
      const result = await deleteImage(url)
      expect(result).toEqual({ error: 'not found' })
    })
  })

  describe('replaceImage', () => {
    it('deletes old and uploads new', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      mockBucket.remove.mockResolvedValueOnce({ error: null })
      mockBucket.upload.mockResolvedValueOnce({ error: null })
      mockBucket.getPublicUrl.mockReturnValueOnce({ data: { publicUrl: 'https://cdn.test/new.jpg' } })

      const fd = new FormData()
      fd.set('file', makeFile('image/jpeg', 500))
      const result = await replaceImage(
        'https://cdn.test/storage/v1/object/public/site-images/old/photo.jpg',
        fd,
      )
      expect(result).toHaveProperty('url', 'https://cdn.test/new.jpg')
      expect(mockBucket.remove).toHaveBeenCalled()
      expect(mockBucket.upload).toHaveBeenCalled()
    })

    it('skips delete when oldUrl is null', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

      mockBucket.upload.mockResolvedValueOnce({ error: null })
      mockBucket.getPublicUrl.mockReturnValueOnce({ data: { publicUrl: 'https://x' } })

      const fd = new FormData()
      fd.set('file', makeFile())
      await replaceImage(null, fd)
      expect(mockBucket.remove).not.toHaveBeenCalled()
      expect(mockBucket.upload).toHaveBeenCalled()
    })
  })
})
