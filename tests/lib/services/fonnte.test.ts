import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fonnteService } from '@/lib/services/fonnte-service'

describe('FonnteService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('FONNTE_TOKEN', 'test-token')
  })

  it('sends message successfully when API returns success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, message: 'Message sent' })
    } as Response)

    const result = await fonnteService.sendMessage('6281234567890', 'Hello')
    expect(result.status).toBe(true)
    expect(result.message).toBe('Message sent')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.fonnte.com/send',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('returns failure when token is missing (empty string)', async () => {
    vi.stubEnv('FONNTE_TOKEN', '')
    const result = await fonnteService.sendMessage('62812', 'Hello')
    expect(result.status).toBe(false)
    expect(result.message).toBe('Token not configured')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns failure when token is placeholder', async () => {
    vi.stubEnv('FONNTE_TOKEN', 'YOUR_FONNTE_TOKEN_HERE')
    const result = await fonnteService.sendMessage('62812', 'Hello')
    expect(result.status).toBe(false)
    expect(result.message).toBe('Token not configured')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns failure when token is whitespace-only', async () => {
    vi.stubEnv('FONNTE_TOKEN', '   ')
    // whitespace trimmed to '' → treated as missing
    const result = await fonnteService.sendMessage('62812', 'Hello')
    expect(result.status).toBe(false)
    expect(result.message).toBe('Token not configured')
  })

  it('handles HTTP error (non-200 status)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limited'
    } as Response)

    const result = await fonnteService.sendMessage('62812', 'Hello')
    expect(result.status).toBe(false)
    expect(result.message).toContain('429')
  })

  it('returns failure when API returns status false in JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: false, message: 'Insufficient balance' })
    } as Response)

    const result = await fonnteService.sendMessage('62812', 'Hello')
    expect(result.status).toBe(false)
    expect(result.message).toBe('Insufficient balance')
  })

  it('uses fallback message when API returns no message/reason', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: false })
    } as Response)

    const result = await fonnteService.sendMessage('62812', 'Hello')
    expect(result.status).toBe(false)
    // No message/reason → falls to last branch: data.status ? "Success" : "Failed"
    expect(result.message).toBe('Failed')
  })

  it('handles response with missing status field (invalid format)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ not_status: true })
    } as Response)

    const result = await fonnteService.sendMessage('62812', 'Hello')
    expect(result.status).toBe(false)
    expect(result.message).toBe('Invalid API response')
  })

  it('handles fetch network failure gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network disconnected'))
    const result = await fonnteService.sendMessage('62812', 'Hello')
    expect(result.status).toBe(false)
    expect(result.message).toBe('An error occurred in Fonnte service')
  })

  it('sends correct formData body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, message: 'ok' })
    } as Response)

    await fonnteService.sendMessage('628123456789', 'Test msg')

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = callArgs[1]?.body as FormData
    expect(body.get('target')).toBe('628123456789')
    expect(body.get('message')).toBe('Test msg')
    expect(body.get('countryCode')).toBe('62')
  })
})
