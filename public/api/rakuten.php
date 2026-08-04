<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=120, s-maxage=300');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$configPath = getenv('RAKU_CONFIG_PATH') ?: rtrim((string) getenv('HOME'), '/') . '/erabiyori-secure/rakuten-config.php';
if (!is_file($configPath)) {
    http_response_code(503);
    echo json_encode(['error' => 'server_not_configured'], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require $configPath;
foreach (['application_id', 'access_key', 'affiliate_id'] as $required) {
    if (empty($config[$required]) || !is_string($config[$required])) {
        http_response_code(503);
        echo json_encode(['error' => 'server_not_configured'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$services = [
    'ichiba' => ['url' => 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701', 'query' => 'keyword'],
    'travel' => ['url' => 'https://openapi.rakuten.co.jp/engine/api/Travel/KeywordHotelSearch/20260731', 'query' => 'keyword'],
    'books' => ['url' => 'https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404', 'query' => 'keyword'],
    'kobo' => ['url' => 'https://openapi.rakuten.co.jp/services/api/Kobo/EbookSearch/20170426', 'query' => 'keyword'],
    'gora' => ['url' => 'https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseSearch/20170623', 'query' => 'keyword'],
    'recipe' => ['url' => 'https://openapi.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426', 'query' => null],
];

$serviceId = (string) ($_GET['service'] ?? '');
if (!isset($services[$serviceId])) {
    http_response_code(400);
    echo json_encode(['error' => 'unsupported_service'], JSON_UNESCAPED_UNICODE);
    exit;
}

$query = trim((string) ($_GET['q'] ?? ''));
if ($services[$serviceId]['query'] !== null && (mb_strlen($query) < 2 || mb_strlen($query) > 100)) {
    http_response_code(400);
    echo json_encode(['error' => 'query_must_be_2_to_100_characters'], JSON_UNESCAPED_UNICODE);
    exit;
}

$params = [
    'applicationId' => $config['application_id'],
    'accessKey' => $config['access_key'],
    'affiliateId' => $config['affiliate_id'],
    'format' => 'json',
    'formatVersion' => 2,
    'hits' => 12,
];
if ($services[$serviceId]['query']) $params[$services[$serviceId]['query']] = $query;
if ($serviceId === 'recipe') $params['categoryId'] = '30';

$requestUrl = $services[$serviceId]['url'] . '?' . http_build_query($params, '', '&', PHP_QUERY_RFC3986);
$curl = curl_init($requestUrl);
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 12, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_HTTPHEADER => ['Accept: application/json', 'accessKey: ' . $config['access_key']]]);
$body = curl_exec($curl);
$status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($curl);
curl_close($curl);

if ($body === false || $curlError !== '') {
    http_response_code(502);
    echo json_encode(['error' => 'upstream_connection_failed'], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code($status >= 200 && $status < 500 ? $status : 502);
echo $body;
