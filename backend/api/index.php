<?php
/**
 * Muatxissombo Soluções Digitais - Entrypoint da API REST em PHP 8.2+ (Hostinger)
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/Mailer.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../controllers/OrderController.php';

use Muatxissombo\Middleware\AuthMiddleware;
use Muatxissombo\Controllers\OrderController;

AuthMiddleware::applySecurityHeaders();

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($uri === '/backend/api/health' && $method === 'GET') {
    echo json_encode([
        'status' => 'ok',
        'company' => 'Muatxissombo Soluções Digitais',
        'php_version' => PHP_VERSION,
    ]);
    exit;
}

if ($uri === '/backend/api/orders' && $method === 'GET') {
    OrderController::listOrders();
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint não encontrado.']);
