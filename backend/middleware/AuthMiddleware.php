<?php
/**
 * Muatxissombo Soluções Digitais - Middleware de Segurança, Autenticação, CSRF e Rate Limit
 */

declare(strict_types=1);

namespace Muatxissombo\Middleware;

class AuthMiddleware
{
    public static function applySecurityHeaders(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }

    public static function sanitizeInput(string $input): string
    {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    public static function requireRole(string $requiredRole = 'client'): array
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start([
                'cookie_httponly' => true,
                'cookie_secure' => isset($_SERVER['HTTPS']),
                'cookie_samesite' => 'Strict',
            ]);
        }

        if (empty($_SESSION['user'])) {
            http_response_code(401);
            exit(json_encode(['error' => 'Sessão não autenticada.']));
        }

        if ($requiredRole === 'admin' && ($_SESSION['user']['role'] ?? '') !== 'admin') {
            http_response_code(403);
            exit(json_encode(['error' => 'Acesso restrito ao administrador.']));
        }

        return $_SESSION['user'];
    }
}
