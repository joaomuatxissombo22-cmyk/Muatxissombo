# Guia Completo de Instalação, Configuração e Publicação na Hostinger
## MUATXISSOMBO SOLUÇÕES DIGITAIS

Este documento reúne todas as instruções técnicas para operação e publicação da plataforma comercial da **Muatxissombo Soluções Digitais** em alojamento partilhado ou Cloud da **Hostinger**.

---

## 1. Estrutura de Pastas do Projecto
- `/src` & `/public` — Aplicação Frontend React + Vite + Tailwind CSS + Integração Real-Time.
- `/backend/api` — Endpoints REST em PHP 8.2+ compatíveis com planos partilhados Hostinger.
- `/backend/config` — Ligação PDO MySQL (`database.php`) e disparo SMTP com PHPMailer (`Mailer.php`).
- `/backend/controllers` — Controladores REST.
- `/backend/models` — Modelos de acesso a dados preparados contra SQL Injection.
- `/backend/middleware` — Segurança de cabeçalhos, sanitização XSS, sessões seguras e RBAC.
- `/backend/uploads` — Directório isolado com `.htaccess` para armazenamento seguro de comprovativos bancários / Multicaixa Express.
- `/database/schema.sql` — Script SQL completo para criação das 10 tabelas no MySQL da Hostinger.

---

## 2. Compilação e Publicação na Hostinger
1. Execute o comando de compilação para produção:
   ```bash
   npm run build
   ```
2. Aceda ao **hPanel da Hostinger** → **Gestor de Ficheiros** → pasta `public_html`.
3. Envie o conteúdo gerado na pasta `dist/` para `public_html/`.
4. Caso utilize o backend PHP/MySQL local no plano partilhado:
   - Envie a pasta `/backend` para `public_html/backend`.
   - No **hPanel** → **Bases de Dados MySQL**, crie a base de dados e importe o ficheiro `/database/schema.sql` através do **phpMyAdmin**.
   - Configure as variáveis de ambiente no ficheiro `.env` fora da raiz pública ou no `.htaccess` privado, nunca expondo palavras-passe no código público.

---

## 3. Configuração do Servidor de E-mail Corporativo (SMTP / PHPMailer)
1. No **hPanel da Hostinger** → **E-mails**, crie a conta corporativa (ex.: `suporte@muatxissombo.ao` ou `comercial@muatxissombo.ao`).
2. Configure os parâmetros SMTP no ficheiro `.env`:
   - `SMTP_HOST="smtp.hostinger.com"`
   - `SMTP_PORT="465"` (SSL/TLS)
   - `SMTP_USER="suporte@muatxissombo.ao"`
   - `SMTP_PASS="<definido-no-painel-seguro>"`
   - `SMTP_FROM_NAME="Muatxissombo Soluções Digitais"`
3. Na Hostinger, instale o PHPMailer via SSH ou Composer (`composer require phpmailer/phpmailer`).

---

## 4. Criação Segura da Primeira Conta de Administrador
- **Sem Credenciais Padrão Públicas**: Nenhuma palavra-passe estática está escrita no código.
- **No Ambiente Cloud / Firebase**: A conta proprietária (`joaomuatxissombo22@gmail.com`) é reconhecida automaticamente após autenticação verificada com Google Sign-In, podendo promover outros administradores na colecção `/admins/{uid}` através do Painel Administrativo.
- **No Ambiente MySQL (Hostinger)**: Após criar a sua conta no portal, aceda ao **phpMyAdmin** na Hostinger e execute:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'joaomuatxissombo22@gmail.com' LIMIT 1;
  ```
