<?php
/**
 * Muatxissombo Soluções Digitais - Ligação Segura PDO MySQL (Hostinger PHP 8.2+)
 * Protecção nativa contra SQL Injection através de Prepared Statements estritos.
 */

declare(strict_types=1);

namespace Muatxissombo\Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: '127.0.0.1';
            $dbName = getenv('DB_NAME') ?: 'muatxissombo_db';
            $user = getenv('DB_USER') ?: '';
            $pass = getenv('DB_PASS') ?: '';

            $dsn = "mysql:host={$host};dbname={$dbName};charset=utf8mb4";

            try {
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                error_log('Database connection error: ' . $e->getMessage());
                http_response_code(500);
                exit(json_encode(['error' => 'Erro interno de ligação à base de dados.']));
            }
        }

        return self::$instance;
    }
}
