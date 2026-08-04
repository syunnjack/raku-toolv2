export const API_SERVICES = [
  {
    id: 'ichiba', name: '楽天市場', eyebrow: 'PRODUCTS', color: '#bf0000',
    endpoint: 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701',
    queryKey: 'keyword', affiliate: true, docs: 'https://webservice.rakuten.co.jp/documentation/ichiba-item-search',
  },
  {
    id: 'travel', name: '楽天トラベル', eyebrow: 'STAYS', color: '#005bac',
    endpoint: 'https://openapi.rakuten.co.jp/engine/api/Travel/KeywordHotelSearch/20260731',
    queryKey: 'keyword', affiliate: true, docs: 'https://webservice.rakuten.co.jp/documentation/keyword-hotel-search',
  },
  {
    id: 'books', name: '楽天ブックス', eyebrow: 'BOOKS · CD · DVD · GAME', color: '#734d26',
    endpoint: 'https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404',
    queryKey: 'keyword', affiliate: true, docs: 'https://webservice.rakuten.co.jp/documentation/books-total-search',
  },
  {
    id: 'kobo', name: '楽天Kobo', eyebrow: 'EBOOKS', color: '#00a0c6',
    endpoint: 'https://openapi.rakuten.co.jp/services/api/Kobo/EbookSearch/20170426',
    queryKey: 'keyword', affiliate: true, docs: 'https://webservice.rakuten.co.jp/documentation/kobo-ebook-search',
  },
  {
    id: 'gora', name: '楽天GORA', eyebrow: 'GOLF', color: '#257942',
    endpoint: 'https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseSearch/20170623',
    queryKey: 'keyword', affiliate: true, docs: 'https://webservice.rakuten.co.jp/documentation/gora-golf-course-search',
  },
  {
    id: 'recipe', name: '楽天レシピ', eyebrow: 'CONTENT SUPPORT', color: '#e66b16',
    endpoint: 'https://openapi.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426',
    queryKey: null, affiliate: false, docs: 'https://webservice.rakuten.co.jp/documentation/recipe-category-ranking',
  },
]

export const AFFILIATE_CATALOG = [
  ['市場・通販', ['楽天市場', '楽天ブックス', '楽天ブックス（ダウンロード）', '楽天Kobo', '楽天ビック', '楽天Edy', 'Rakuten Fashion', '楽天24', '楽天24エクスプレス', '楽天オリジナル']],
  ['旅行', ['楽天トラベル（国内宿泊・海外航空券・高速バス・楽パック・海外ホテル・海外ツアー）', '楽天トラベル レンタカー', '楽天トラベル 観光体験']],
  ['レジャー', ['楽天GORA']],
  ['通信・金融・暮らし', ['楽天モバイル', '楽天カード', '楽天銀行', '楽天証券', '楽天生命', '楽天損保', '楽天ペイ', '楽天インサイト', '楽天市場 出店資料請求']],
]

export function buildApiUrl(service, credentials, query) {
  const url = new URL(service.endpoint)
  url.searchParams.set('applicationId', credentials.applicationId)
  url.searchParams.set('accessKey', credentials.accessKey)
  if (credentials.affiliateId && service.affiliate) url.searchParams.set('affiliateId', credentials.affiliateId)
  url.searchParams.set('format', 'json')
  url.searchParams.set('formatVersion', '2')
  url.searchParams.set('hits', '12')
  if (service.queryKey && query) url.searchParams.set(service.queryKey, query)
  if (service.id === 'recipe') url.searchParams.set('categoryId', '30')
  return url
}

export function buildProxyUrl(service, query) {
  const url = new URL('/api/rakuten.php', window.location.origin)
  url.searchParams.set('service', service.id)
  if (query) url.searchParams.set('q', query)
  return url
}

export function normalizeItems(serviceId, payload) {
  const raw = payload.Items || payload.items || payload.hotels || payload.Hotels || payload.courses || []
  return raw.map((wrapper) => {
    const item = wrapper.Item || wrapper.item || wrapper.hotel || wrapper.hotelBasicInfo || wrapper
    return {
      id: item.itemCode || item.hotelNo || item.golfCourseId || item.recipeId || item.isbn || item.itemNumber || crypto.randomUUID(),
      title: item.itemName || item.hotelName || item.golfCourseName || item.recipeTitle || item.title || '名称未取得',
      description: item.catchcopy || item.hotelSpecial || item.golfCourseCaption || item.recipeDescription || item.itemCaption || '',
      price: item.itemPrice || item.hotelMinCharge || item.playPrice || 0,
      image: item.mediumImageUrls?.[0]?.imageUrl || item.mediumImageUrl || item.hotelImageUrl || item.golfCourseImageUrl || item.foodImageUrl || '',
      url: item.affiliateUrl || item.hotelInformationUrl || item.golfCourseDetailUrl || item.itemUrl || item.recipeUrl || '',
      review: item.reviewAverage || item.reviewAverageScore || item.evaluation || null,
      serviceId,
    }
  })
}

export function buildDisclosure(serviceName) {
  return `広告｜${serviceName}の公式情報を参照しています。価格・空室・在庫・条件はリンク先で確認してください。`
}
