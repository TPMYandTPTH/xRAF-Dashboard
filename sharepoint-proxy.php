<?php
// SharePoint Proxy - Place this on a server with PHP support
// This bypasses CORS issues by making server-side requests

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// SharePoint credentials (use App-Only authentication in production)
$username = 'your-email@domain.com';
$password = 'your-password';
$domain = 'DOMAIN';

// Get request parameters
$endpoint = $_GET['endpoint'] ?? '';
$siteUrl = $_GET['siteUrl'] ?? '';

if (empty($endpoint) || empty($siteUrl)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing endpoint or siteUrl parameter']);
    exit;
}

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_NTLM);
curl_setopt($ch, CURLOPT_USERPWD, "$domain\\$username:$password");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Accept: application/json;odata=verbose',
    'Content-Type: application/json;odata=verbose'
));

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Handle errors
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'cURL error: ' . $error]);
    exit;
}

// Return response
http_response_code($httpCode);
echo $response;
?>
