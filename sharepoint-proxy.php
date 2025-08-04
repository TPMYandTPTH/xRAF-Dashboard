<?php
// Simple SharePoint Proxy - No Azure AD needed
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get input
$input = json_decode(file_get_contents('php://input'), true);
$phone = $input['phone'] ?? '';
$email = $input['email'] ?? '';

// For now, return mock data to test the connection
// Replace this with actual SharePoint API calls once authentication is set up
$mockData = [
    [
        'Person_system_id' => '1',
        'First_Name' => 'Test User',
        'Email' => 'test@example.com',
        'Employee' => $phone,
        'Status' => 'Interview Stage',
        'Location' => 'Kuala Lumpur',
        'Source' => 'Employee Referral',
        'SourceName' => 'xRAF',
        'CreatedDate' => date('c', strtotime('-10 days')),
        'UpdatedDate' => date('c', strtotime('-2 days')),
        'daysInStage' => 2,
        'isPreviousCandidate' => false
    ]
];

// Return response
echo json_encode([
    'success' => true,
    'data' => $phone === '0123456789' ? $mockData : []
]);
?>
