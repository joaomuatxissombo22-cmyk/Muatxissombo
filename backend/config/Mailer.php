<?php
/**
 * Muatxissombo Soluções Digitais - Serviço de E-mail Transacional SMTP (PHPMailer)
 * Suporta envio de notificações: Boas-vindas, Receção de Encomenda, Pagamento Validado,
 * Entrega Privada de Licença de Software, Website Publicado e Alerta de Renovação.
 */

declare(strict_types=1);

namespace Muatxissombo\Config;

class Mailer
{
    public static function sendTransactionalEmail(
        string $recipientEmail,
        string $recipientName,
        string $subject,
        string $htmlBody
    ): bool {
        $smtpHost = getenv('SMTP_HOST') ?: 'smtp.hostinger.com';
        $smtpPort = (int)(getenv('SMTP_PORT') ?: 465);
        $smtpUser = getenv('SMTP_USER') ?: '';
        $smtpPass = getenv('SMTP_PASS') ?: '';
        $fromName = getenv('SMTP_FROM_NAME') ?: 'Muatxissombo Soluções Digitais';

        if (empty($smtpUser) || empty($smtpPass)) {
            error_log("SMTP credentials not configured in environment. Queued notification for {$recipientEmail}");
            return false;
        }

        // Quando PHPMailer está instalado via Composer (vendor/autoload.php na Hostinger):
        if (class_exists('\PHPMailer\PHPMailer\PHPMailer')) {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host = $smtpHost;
                $mail->SMTPAuth = true;
                $mail->Username = $smtpUser;
                $mail->Password = $smtpPass;
                $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
                $mail->Port = $smtpPort;
                $mail->CharSet = 'UTF-8';

                $mail->setFrom($smtpUser, $fromName);
                $mail->addAddress($recipientEmail, $recipientName);
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body = $htmlBody;

                return $mail->send();
            } catch (\Throwable $e) {
                error_log('PHPMailer Error: ' . $e->getMessage());
                return false;
            }
        }

        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8\r\n";
        $headers .= "From: {$fromName} <{$smtpUser}>\r\n";
        return mail($recipientEmail, $subject, $htmlBody, $headers);
    }
}
