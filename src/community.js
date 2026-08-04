export function createCommunityClient({ url, anonKey, fetcher = fetch }) {
  const configured = Boolean(url && anonKey)
  const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' }
  return {
    configured,
    async list() {
      if (!configured) return []
      const response = await fetcher(`${url}/rest/v1/reviews?select=id,service,title,body,rating,created_at&status=eq.published&order=created_at.desc&limit=30`, { headers })
      if (!response.ok) throw new Error(`UGC取得エラー: HTTP ${response.status}`)
      return response.json()
    },
    async submit(review) {
      if (!configured) throw new Error('UGCバックエンドが未設定です')
      const response = await fetcher(`${url}/rest/v1/reviews`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ ...review, status: 'pending' }) })
      if (!response.ok) throw new Error(`投稿受付エラー: HTTP ${response.status}`)
    },
  }
}

export function validateReview(review) {
  if (!review.title.trim() || review.title.length > 80) return 'タイトルは1〜80文字で入力してください。'
  if (!review.body.trim() || review.body.length < 30 || review.body.length > 1200) return '本文は30〜1200文字で入力してください。'
  if (!Number.isInteger(Number(review.rating)) || Number(review.rating) < 1 || Number(review.rating) > 5) return '評価は1〜5で入力してください。'
  return ''
}
