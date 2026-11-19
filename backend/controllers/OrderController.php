<?php
/**
 * Muatxissombo Soluções Digitais - Controlador REST de Encomendas e Pagamentos
 */

declare(strict_types=1);

namespace Muatxissombo\Controllers;

use Muatxissombo\Middleware\AuthMiddleware;
use Muatxissombo\Models\Order;

class OrderController
{
    public static function listOrders(): void
    {
        $user = AuthMiddleware::requireRole('client');
        if (($user['role'] ?? '') === 'admin') {
            echo json_encode(['orders' => Order::findAll()]);
            return;
        }
        echo json_encode(['orders' => Order::findByUser((string)$user['uid'])]);
    }
}
