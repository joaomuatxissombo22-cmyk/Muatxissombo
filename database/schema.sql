-- ============================================================================
-- MUATXISSOMBO SOLUÇÕES DIGITAIS – SCRIPT SQL DE CRIAÇÃO DA BASE DE DADOS
-- Compatível com MySQL 8.0+ / MariaDB 10.6+ (Hostinger Shared & Cloud Hosting)
-- Moeda: Kwanza (AOA / Kz) | Fuso Horário: Africa/Luanda
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `muatxissombo_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `muatxissombo_db`;

-- 1. TABELA DE UTILIZADORES (CLIENTES E ADMINISTRADORES)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uid` VARCHAR(128) NOT NULL UNIQUE,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(40) DEFAULT NULL,
  `company` VARCHAR(120) DEFAULT NULL,
  `nif` VARCHAR(40) DEFAULT NULL,
  `address` VARCHAR(250) DEFAULT NULL,
  `role` ENUM('client', 'admin') NOT NULL DEFAULT 'client',
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `failed_login_attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CATÁLOGO DE PRODUTOS E SERVIÇOS (WEBSITES, HOSPEDAGEM, LICENÇAS, ASSISTÊNCIA, DOMÍNIOS)
CREATE TABLE IF NOT EXISTS `catalog_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `category` ENUM('website', 'hosting', 'license', 'assistance', 'domain_tld') NOT NULL,
  `sub_category` VARCHAR(80) DEFAULT NULL,
  `name` VARCHAR(140) NOT NULL,
  `description` TEXT NOT NULL,
  `benefits_json` JSON DEFAULT NULL,
  `features_json` JSON DEFAULT NULL,
  `price_kz` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `renewal_price_kz` DECIMAL(14, 2) DEFAULT NULL,
  `billing_cycle` VARCHAR(40) DEFAULT 'Único',
  `validity_period` VARCHAR(60) DEFAULT NULL,
  `devices_count` VARCHAR(60) DEFAULT NULL,
  `license_type` VARCHAR(80) DEFAULT NULL,
  `available` TINYINT(1) NOT NULL DEFAULT 1,
  `popular` TINYINT(1) NOT NULL DEFAULT 0,
  `promo_badge` VARCHAR(60) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_catalog_category` (`category`, `available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ENCOMENDAS E PAGAMENTOS
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(40) NOT NULL UNIQUE,
  `user_id` VARCHAR(128) NOT NULL,
  `customer_name` VARCHAR(120) NOT NULL,
  `customer_email` VARCHAR(160) NOT NULL,
  `customer_phone` VARCHAR(40) DEFAULT NULL,
  `customer_company` VARCHAR(120) DEFAULT NULL,
  `items_summary` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `total_kz` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(60) NOT NULL,
  `payment_proof_name` VARCHAR(200) DEFAULT NULL,
  `payment_proof_ref` VARCHAR(500) DEFAULT NULL,
  `payment_notes` VARCHAR(500) DEFAULT NULL,
  `status` ENUM(
    'Aguardando pagamento',
    'Pagamento em análise',
    'Pagamento confirmado',
    'Em processamento',
    'Em execução',
    'Aguardando informações do cliente',
    'Concluído',
    'Cancelado'
  ) NOT NULL DEFAULT 'Aguardando pagamento',
  `assigned_to` VARCHAR(120) DEFAULT NULL,
  `admin_notes` TEXT DEFAULT NULL,
  `invoice_number` VARCHAR(60) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PROJECTOS DE CRIAÇÃO DE WEBSITES (ACOMPANHAMENTO EM TEMPO REAL)
CREATE TABLE IF NOT EXISTS `website_projects` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(128) NOT NULL,
  `client_name` VARCHAR(120) NOT NULL,
  `client_email` VARCHAR(160) NOT NULL,
  `client_phone` VARCHAR(40) NOT NULL,
  `company_name` VARCHAR(120) NOT NULL,
  `website_type` VARCHAR(120) NOT NULL,
  `project_name` VARCHAR(140) NOT NULL,
  `description` TEXT NOT NULL,
  `desired_features` TEXT DEFAULT NULL,
  `available_budget_kz` DECIMAL(14, 2) DEFAULT 0.00,
  `desired_domain` VARCHAR(120) DEFAULT NULL,
  `needs_hosting` TINYINT(1) NOT NULL DEFAULT 1,
  `reference_notes` VARCHAR(500) DEFAULT NULL,
  `contract_date` VARCHAR(40) DEFAULT NULL,
  `estimated_deadline` VARCHAR(40) DEFAULT NULL,
  `assigned_lead` VARCHAR(120) DEFAULT NULL,
  `dev_status` ENUM(
    'Orçamento Solicitado',
    'Em Análise',
    'Proposta Enviada',
    'Aguardando Pagamento',
    'Design & Prototipagem',
    'Em Desenvolvimento',
    'Testes & Revisão',
    'Concluído & Publicado',
    'Cancelado'
  ) NOT NULL DEFAULT 'Orçamento Solicitado',
  `progress_percent` TINYINT UNSIGNED NOT NULL DEFAULT 10,
  `demo_link` VARCHAR(300) DEFAULT NULL,
  `published_link` VARCHAR(300) DEFAULT NULL,
  `access_instructions` TEXT DEFAULT NULL,
  `internal_notes` TEXT DEFAULT NULL,
  `quoted_price_kz` DECIMAL(14, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_web_projects_user` (`user_id`),
  INDEX `idx_web_projects_status` (`dev_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. LICENÇAS DE SOFTWARE EMITIDAS (NUNCA EXPOSTAS PUBLICAMENTE)
CREATE TABLE IF NOT EXISTS `licenses_issued` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_name` VARCHAR(140) NOT NULL,
  `supplier` VARCHAR(120) NOT NULL,
  `license_type` VARCHAR(80) NOT NULL,
  `validity_period` VARCHAR(60) NOT NULL,
  `devices_count` VARCHAR(40) DEFAULT '1 Dispositivo',
  `activation_key` VARCHAR(250) NOT NULL,
  `activation_instructions` TEXT NOT NULL,
  `assigned_user_id` VARCHAR(128) NOT NULL,
  `assigned_user_email` VARCHAR(160) DEFAULT NULL,
  `assigned_user_name` VARCHAR(120) DEFAULT NULL,
  `order_id` VARCHAR(128) DEFAULT NULL,
  `status` ENUM('Disponível em Stock', 'Atribuída ao Cliente', 'Expirada') NOT NULL DEFAULT 'Atribuída ao Cliente',
  `delivered_at` VARCHAR(60) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_licenses_user` (`assigned_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. DOMÍNIOS REGISTADOS E GESTÃO DE RENOVAÇÕES
CREATE TABLE IF NOT EXISTS `domains_registered` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(128) NOT NULL,
  `client_name` VARCHAR(120) NOT NULL,
  `client_email` VARCHAR(160) NOT NULL,
  `domain_name` VARCHAR(140) NOT NULL UNIQUE,
  `tld` VARCHAR(30) NOT NULL,
  `registration_price_kz` DECIMAL(14, 2) NOT NULL,
  `renewal_price_kz` DECIMAL(14, 2) NOT NULL,
  `registered_at` VARCHAR(40) DEFAULT NULL,
  `expires_at` VARCHAR(40) NOT NULL,
  `auto_renew` TINYINT(1) NOT NULL DEFAULT 1,
  `nameservers` VARCHAR(250) DEFAULT 'ns1.dns-parking.com, ns2.dns-parking.com',
  `status` ENUM('Pendente', 'Ativo', 'A Expirar', 'Expirado') NOT NULL DEFAULT 'Pendente',
  `order_id` VARCHAR(128) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_domains_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. CHAT DE SUPORTE TÉCNICO 24/7 E TICKETS
CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(128) NOT NULL,
  `user_name` VARCHAR(120) NOT NULL,
  `user_email` VARCHAR(160) NOT NULL,
  `sender_role` ENUM('client', 'admin') NOT NULL DEFAULT 'client',
  `subject` VARCHAR(160) NOT NULL,
  `message` TEXT NOT NULL,
  `ticket_status` ENUM('Aberto', 'Em Atendimento', 'Resolvido') NOT NULL DEFAULT 'Aberto',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_support_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. HISTÓRICO DE NOTIFICAÇÕES POR E-MAIL (SMTP / PHPMAILER)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(128) NOT NULL,
  `recipient_email` VARCHAR(160) NOT NULL,
  `recipient_name` VARCHAR(120) NOT NULL,
  `event_type` VARCHAR(80) NOT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `body_preview` TEXT NOT NULL,
  `delivery_channel` VARCHAR(40) NOT NULL DEFAULT 'Email & Painel',
  `status` ENUM('Enviado', 'Pendente', 'Reenviado') NOT NULL DEFAULT 'Enviado',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. PORTAL EXCLUSIVO DE FEEDBACKS E AVALIAÇÕES DE CLIENTES
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(128) NOT NULL,
  `client_name` VARCHAR(120) NOT NULL,
  `company_name` VARCHAR(120) DEFAULT NULL,
  `service_category` VARCHAR(80) NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NOT NULL,
  `project_reference` VARCHAR(120) DEFAULT NULL,
  `is_public` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. REGISTO DE ACTIVIDADES ADMINISTRATIVAS (AUDITORIA DE SEGURANÇA)
CREATE TABLE IF NOT EXISTS `admin_audit_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `admin_uid` VARCHAR(128) NOT NULL,
  `admin_email` VARCHAR(160) NOT NULL,
  `action_type` VARCHAR(80) NOT NULL,
  `target_entity` VARCHAR(80) NOT NULL,
  `target_id` VARCHAR(128) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
