import './style.css'
import './community.css'
import { AFFILIATE_CATALOG, API_SERVICES, buildDisclosure, buildProxyUrl, normalizeItems } from './services.js'
import { createCommunityClient, validateReview } from './community.js'

const community = createCommunityClient({ url: import.meta.env.VITE_SUPABASE_URL, anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY })

const state = {
  active: API_SERVICES[0], results: [], saved: JSON.parse(localStorage.getItem('raku-v2.saved') || '[]'),
  reviews: [],
}

const app = document.querySelector('#app')

function money(value) { return value ? new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(value) : '料金はリンク先で確認' }
function escapeHtml(value = '') { const el = document.createElement('span'); el.textContent = value; return el.innerHTML }

function render() {
  app.innerHTML = `
    <header class="masthead">
      <a class="brand" href="#">えらび<i>より</i></a>
      <span class="issue">OFFICIAL API WORKBENCH · 2026</span>
      <a class="docs-link" href="https://webservice.rakuten.co.jp/documentation" target="_blank" rel="noreferrer">API仕様 ↗</a>
    </header>
    <main>
      <section class="hero">
        <div><p class="kicker">SEARCH · COMPARE · PUBLISH</p><h1>楽天のサービスを、<br><em>ひとつの編集室に。</em></h1><p class="dek">市場、旅、本、電子書籍、ゴルフ。公式APIの取得結果から紹介候補を選び、根拠のある投稿メモへ整えます。</p></div>
        <aside class="fact"><strong>6</strong><span>APIサービス群</span><p>アフィリエイト対応APIと、コンテンツ企画用APIを明示して分離。</p></aside>
      </section>

      <section class="credentials"><div><p class="section-label">01 / CONNECTION</p><h2>Xサーバー安全接続</h2><p>楽天APIの認証情報はXサーバー側だけで保持します。ブラウザやGitHubへAccess Keyを配信しません。</p></div><div class="server-status"><strong>SERVER-SIDE PROXY</strong><span>/api/rakuten.php</span><p>接続確認は検索時に行います。</p></div></section>

      <nav class="service-tabs" aria-label="APIサービス">
        ${API_SERVICES.map((service) => `<button data-service="${service.id}" class="${service.id === state.active.id ? 'active' : ''}" style="--accent:${service.color}"><small>${service.eyebrow}</small>${service.name}<b>${service.affiliate ? 'AFFILIATE API' : '企画支援・非アフィリエイトAPI'}</b></button>`).join('')}
      </nav>

      <section class="search-panel" style="--accent:${state.active.color}">
        <div><p class="section-label">02 / DISCOVERY</p><h2>${state.active.name}を検索</h2><p>${state.active.affiliate ? 'APIのaffiliateUrlを優先して表示します。' : 'このAPI自体はアフィリエイト非対応。記事企画から関連商品へつなぐ用途です。'}</p></div>
        <form id="search-form"><input name="query" placeholder="${state.active.id === 'recipe' ? 'カテゴリランキングを取得' : 'キーワードを入力'}" ${state.active.queryKey ? 'required' : 'disabled'}><button>${state.active.queryKey ? '公式APIで検索' : 'ランキング取得'}</button></form>
        <p id="status" role="status"></p>
      </section>

      <section class="results"><div class="section-head"><div><p class="section-label">03 / SHORTLIST</p><h2>紹介候補</h2></div><span>${state.results.length} RESULTS</span></div><div class="card-grid">${state.results.length ? state.results.map(card).join('') : '<p class="empty">認証情報を入力し、サービスを選んで検索してください。架空の商品は表示しません。</p>'}</div></section>

      <section class="saved"><div class="section-head"><div><p class="section-label">04 / EDITORIAL DESK</p><h2>保存した候補</h2></div><span>${state.saved.length} SAVED</span></div>${state.saved.map((item) => `<article><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.serviceName)}</span><textarea aria-label="投稿メモ">${escapeHtml(buildDisclosure(item.serviceName))}\n${escapeHtml(item.title)}を紹介する理由：</textarea><a href="${escapeHtml(item.url)}" target="_blank" rel="sponsored noreferrer">公式ページ ↗</a><button data-remove="${escapeHtml(String(item.id))}">削除</button></article>`).join('') || '<p class="empty">検索結果から候補を保存すると、広告表記付きの投稿メモを作れます。</p>'}</section>

      <section class="catalog"><p class="section-label">05 / FULL AFFILIATE MAP</p><h2>楽天アフィリエイト対象サービス</h2><p class="catalog-note">公式APIで検索できないサービスも含みます。APIなしのサービスは楽天公式のリンク作成画面を利用してください。対象・料率は変わるため公開前に公式確認が必要です。</p><div class="catalog-grid">${AFFILIATE_CATALOG.map(([group, names]) => `<article><h3>${group}</h3>${names.map((name) => `<span>${name}</span>`).join('')}</article>`).join('')}</div><a class="official" href="https://affiliate.rakuten.co.jp/group/" target="_blank" rel="noreferrer">楽天公式の対象サービス一覧で確認 ↗</a></section>
      <section class="community"><div class="section-head"><div><p class="section-label">06 / COMMUNITY NOTES</p><h2>利用者の実体験</h2></div><span>${state.reviews.length} PUBLISHED</span></div><p class="catalog-note">投稿は公開前に管理者が確認します。価格や成果条件の確認には公式ページを優先してください。</p>${community.configured ? `<form id="review-form"><select name="service">${API_SERVICES.map((service) => `<option>${service.name}</option>`)}</select><input name="title" maxlength="80" placeholder="体験の見出し" required><select name="rating"><option value="5">★5</option><option value="4">★4</option><option value="3">★3</option><option value="2">★2</option><option value="1">★1</option></select><textarea name="body" minlength="30" maxlength="1200" placeholder="比較条件、良かった点、注意点を具体的に（30文字以上）" required></textarea><button>審査へ投稿</button></form>` : '<p class="ugc-offline">UGC投稿は未接続です。Supabase URL・Anon KeyとRLSを設定すると有効になります。</p>'}<p id="review-status" role="status"></p><div class="review-grid">${state.reviews.map((review) => `<article><p>${'★'.repeat(review.rating)}</p><h3>${escapeHtml(review.title)}</h3><span>${escapeHtml(review.service)} · ${escapeHtml(review.created_at.slice(0,10))}</span><p>${escapeHtml(review.body)}</p></article>`).join('') || '<p class="empty">公開済みレビューはまだありません。</p>'}</div></section>
    </main>
    <footer><strong>えらびより</strong><p>楽天株式会社の公式サイトではありません。成果・報酬を保証しません。自己購入、不正誘導、条件の誤表示を行わず、楽天の最新規約を確認してください。</p></footer>`
  bind()
}

function card(item) {
  return `<article class="result-card"><div class="image">${item.image ? `<img src="${escapeHtml(item.image)}" alt="">` : '<span>NO IMAGE</span>'}</div><p class="tag">${state.active.name}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description).slice(0, 120)}</p><div class="meta"><strong>${money(item.price)}</strong>${item.review ? `<span>★ ${item.review}</span>` : ''}</div>${item.url ? `<button data-save="${escapeHtml(String(item.id))}">候補に保存</button><a href="${escapeHtml(item.url)}" target="_blank" rel="sponsored noreferrer">リンク確認 ↗</a>` : '<small>アフィリエイトURL未取得</small>'}</article>`
}

function bind() {
  document.querySelectorAll('[data-service]').forEach((button) => button.addEventListener('click', () => { state.active = API_SERVICES.find((service) => service.id === button.dataset.service); state.results = []; render() }))
  document.querySelector('#search-form').addEventListener('submit', search)
  document.querySelectorAll('[data-save]').forEach((button) => button.addEventListener('click', () => { const item = state.results.find((result) => String(result.id) === button.dataset.save); if (!state.saved.some((saved) => String(saved.id) === String(item.id))) state.saved.unshift({ ...item, serviceName: state.active.name }); persist(); render() }))
  document.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => { state.saved = state.saved.filter((item) => String(item.id) !== button.dataset.remove); persist(); render() }))
  document.querySelector('#review-form')?.addEventListener('submit', submitReview)
}

async function search(event) {
  event.preventDefault(); const status = document.querySelector('#status')
  const query = new FormData(event.currentTarget).get('query') || ''
  status.textContent = '公式APIへ問い合わせ中…'
  try {
    const response = await fetch(buildProxyUrl(state.active, query))
    const payload = await response.json()
    if (!response.ok || payload.error) throw new Error(payload.error_description || `HTTP ${response.status}`)
    state.results = normalizeItems(state.active.id, payload); render(); document.querySelector('#status').textContent = `${state.results.length}件取得しました。`
  } catch (error) { status.textContent = `取得失敗: ${error.message}。認証情報、API利用承認、CORS、入力条件を確認してください。` }
}

function persist() { localStorage.setItem('raku-v2.saved', JSON.stringify(state.saved)) }
async function submitReview(event) {
  event.preventDefault()
  const review = Object.fromEntries(new FormData(event.currentTarget))
  const error = validateReview(review)
  const status = document.querySelector('#review-status')
  if (error) { status.textContent = error; return }
  try {
    await community.submit({ ...review, rating: Number(review.rating) })
    event.currentTarget.reset()
    status.textContent = '投稿を受け付けました。管理者確認後に公開されます。'
  } catch (submitError) { status.textContent = submitError.message }
}

async function start() {
  try { state.reviews = await community.list() } catch (error) { console.error(error) }
  render()
}
start()
