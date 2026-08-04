import test from 'node:test'
import assert from 'node:assert/strict'
import { API_SERVICES, AFFILIATE_CATALOG, buildApiUrl, buildDisclosure, buildProxyUrl, normalizeItems } from '../src/services.js'
import { createCommunityClient, validateReview } from '../src/community.js'

test('公式APIサービス群を重複なく登録している', () => {
  assert.deepEqual(API_SERVICES.map((service) => service.id), ['ichiba', 'travel', 'books', 'kobo', 'gora', 'recipe'])
  assert.equal(new Set(API_SERVICES.map((service) => service.endpoint)).size, 6)
})

test('認証情報とaffiliateIdを対応API URLへ設定する', () => {
  const url = buildApiUrl(API_SERVICES[0], { applicationId: 'app', accessKey: 'key', affiliateId: 'aff' }, '防災')
  assert.equal(url.searchParams.get('applicationId'), 'app')
  assert.equal(url.searchParams.get('accessKey'), 'key')
  assert.equal(url.searchParams.get('affiliateId'), 'aff')
  assert.equal(url.searchParams.get('keyword'), '防災')
})

test('ブラウザは同一ドメインのXサーバープロキシだけを呼ぶ', () => {
  global.window = { location: { origin: 'https://erabiyori.jp' } }
  const url = buildProxyUrl(API_SERVICES[1], '温泉')
  assert.equal(url.origin, 'https://erabiyori.jp')
  assert.equal(url.pathname, '/api/rakuten.php')
  assert.equal(url.searchParams.get('service'), 'travel')
  delete global.window
})

test('商品とホテルのレスポンスを共通形式にする', () => {
  const products = normalizeItems('ichiba', { Items: [{ itemName: '水', itemPrice: 1200, affiliateUrl: 'https://example.com/a' }] })
  const hotels = normalizeItems('travel', { hotels: [{ hotelName: '宿', hotelMinCharge: 9000, hotelInformationUrl: 'https://example.com/h' }] })
  assert.equal(products[0].title, '水')
  assert.equal(products[0].price, 1200)
  assert.equal(hotels[0].title, '宿')
})

test('広告表記とサービス一覧を提供する', () => {
  assert.match(buildDisclosure('楽天トラベル'), /^広告/)
  assert.ok(AFFILIATE_CATALOG.flatMap(([, names]) => names).some((name) => name.includes('楽天トラベル')))
})

test('UGCは未設定時に無効で入力を検証する', async () => {
  const client = createCommunityClient({ url: '', anonKey: '' })
  assert.equal(client.configured, false)
  assert.deepEqual(await client.list(), [])
  assert.match(validateReview({ title: '短評', body: '短い', rating: 5 }), /30/)
  assert.equal(validateReview({ title: '旅行レビュー', body: '実際に比較した条件と注意点を具体的に記録します。十分な長さを確保しています。', rating: 4 }), '')
})
