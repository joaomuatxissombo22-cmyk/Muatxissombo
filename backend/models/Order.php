<?php
/**
 * Muatxissombo Soluções Digitais - Modelo de Encomendas e Projectos Web
 */

declare(strict_types=1);

namespace Muatxissombo\Models;

use Muatxissombo\Config\Database;
use PDO;

class Order
{
    public static function findByUser(string $userId): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM orders WHERE user_id = :uid ORDER BY created_at DESC');
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function findAll(): array
    {
        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM orders ORDER BY created_at DESC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
