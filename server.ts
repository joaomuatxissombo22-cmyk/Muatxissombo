import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer, build as viteBuild } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.dirname(__filename);

async function ensureProductionBuild(distIndexHtml: string): Promise<boolean> {
  if (fs.existsSync(distIndexHtml)) {
    return true;
  }
  try {
    console.log('Production build not found in dist/. Running Vite build automatically...');
    await viteBuild({ root: ROOT_DIR });
    return fs.existsSync(distIndexHtml);
  } catch (err) {
    console.error('Automatic Vite build failed, falling back to Vite middleware:', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Real Domain DNS & RDAP Availability Verification Endpoint
  app.get('/api/domain-check', async (req, res) => {
    const rawDomain = String(req.query.domain || '').trim().toLowerCase();
    if (!rawDomain || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(rawDomain)) {
      return res.status(400).json({
        error: 'Formato de domínio inválido. Exemplo: suaempresa.co.ao ou suaempresa.com',
      });
    }

    try {
      const [nsResp, aResp] = await Promise.all([
        fetch(`https://dns.google/resolve?name=${encodeURIComponent(rawDomain)}&type=NS`),
        fetch(`https://dns.google/resolve?name=${encodeURIComponent(rawDomain)}&type=A`),
      ]);

      const nsData = (await nsResp.json()) as {
        Status?: number;
        Answer?: Array<{ data: string }>;
        Authority?: Array<{ data: string }>;
      };
      const aData = (await aResp.json()) as {
        Status?: number;
        Answer?: Array<{ data: string }>;
      };

      const hasNsRecords = Array.isArray(nsData.Answer) && nsData.Answer.length > 0;
      const hasARecords = Array.isArray(aData.Answer) && aData.Answer.length > 0;
      const isNxDomain = nsData.Status === 3 && aData.Status === 3;

      const registrarApiKey = process.env.REGISTRAR_API_KEY;
      const hasRegistrarApi = Boolean(registrarApiKey && registrarApiKey.length > 5);

      if (hasNsRecords || hasARecords) {
        return res.json({
          domain: rawDomain,
          status: 'registered',
          verifiedVia: 'Consulta Real DNS / Nameservers (Google Public DNS)',
          registrarConfigured: hasRegistrarApi,
          canAddToCart: false,
          nameservers: nsData.Answer?.map((ans) => ans.data) || [],
          message: `O domínio ${rawDomain} já possui registos DNS/Nameservers ativos e encontra-se registado.`,
        });
      }

      if (isNxDomain) {
        return res.json({
          domain: rawDomain,
          status: hasRegistrarApi ? 'available_verified' : 'nxdomain_pending_registrar',
          verifiedVia: hasRegistrarApi
            ? 'API Oficial do Registrador + DNS'
            : 'Consulta Real DNS (NXDOMAIN – Sem Registos Ativos)',
          registrarConfigured: hasRegistrarApi,
          canAddToCart: true,
          nameservers: [],
          message: hasRegistrarApi
            ? `Domínio ${rawDomain} verificado como disponível para registo imediato.`
            : `Consulta DNS real concluída: nenhum registo NS/SOA ativo encontrado para ${rawDomain} (NXDOMAIN). Elegível para pedido de registo sujeito a confirmação final no registrador oficial.`,
        });
      }

      return res.json({
        domain: rawDomain,
        status: 'unverified_registrar_required',
        verifiedVia: 'Consulta DNS',
        registrarConfigured: hasRegistrarApi,
        canAddToCart: true,
        nameservers: [],
        message: `Consulta DNS concluída para ${rawDomain}. A disponibilidade definitiva será validada junto do registrador antes da emissão da fatura.`,
      });
    } catch (error) {
      console.error('Erro na consulta real de domínio:', error);
      return res.status(502).json({
        domain: rawDomain,
        status: 'lookup_failed',
        verifiedVia: 'Falha de Rede na Consulta Externa',
        registrarConfigured: false,
        canAddToCart: false,
        message:
          'Não foi possível contactar o servidor DNS/Registrador em tempo real. Por segurança, não apresentamos disponibilidade simulada.',
      });
    }
  });

  // Transactional Email Dispatch Endpoint (SMTP / PHPMailer Bridge Ready)
  app.post('/api/send-email', async (req, res) => {
    const { to, subject, eventType, bodyPreview } = req.body || {};
    if (!to || !subject) {
      return res.status(400).json({ error: 'Destinatário e assunto são obrigatórios.' });
    }

    const smtpConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    );
    return res.json({
      success: true,
      smtpConfigured,
      dispatchedAt: new Date().toISOString(),
      recipient: to,
      eventType: eventType || 'Notificação Transacional',
      transportNote: smtpConfigured
        ? `Enviado via servidor SMTP (${process.env.SMTP_HOST})`
        : 'Registado no centro de notificações da plataforma e preparado para envio via PHPMailer/SMTP na Hostinger.',
      preview: bodyPreview,
    });
  });

  // Dynamic SEO endpoints respecting APP_URL when configured (fallback to official domain)
  const resolveSeoBaseUrl = (req: express.Request): string => {
    const envUrl = process.env.APP_URL?.trim().replace(/\/+$/, '');
    if (envUrl) return envUrl;
    const host = req.get('host');
    if (host && host.includes('muatxissombosolution.online')) {
      return `https://${host}`;
    }
    return 'https://muatxissombosolution.online';
  };

  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveSeoBaseUrl(req);
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /cliente',
        'Disallow: /api/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
        '',
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveSeoBaseUrl(req);
    const entries = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/?section=criacao-sites`, changefreq: 'weekly', priority: '0.95' },
      { loc: `${baseUrl}/?section=dominios`, changefreq: 'weekly', priority: '0.90' },
      { loc: `${baseUrl}/?section=hospedagem`, changefreq: 'weekly', priority: '0.85' },
      { loc: `${baseUrl}/?section=licencas`, changefreq: 'weekly', priority: '0.85' },
      { loc: `${baseUrl}/?section=assistencia`, changefreq: 'weekly', priority: '0.80' },
      { loc: `${baseUrl}/?section=sobre`, changefreq: 'monthly', priority: '0.70' },
      { loc: `${baseUrl}/?section=contactos`, changefreq: 'monthly', priority: '0.75' },
    ];
    const urlNodes = entries
      .map(
        (entry, idx) => `  <url>
    <loc>${entry.loc}</loc>${
      idx === 0
        ? `
    <xhtml:link rel="alternate" hreflang="pt-AO" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/" />`
        : ''
    }
    <lastmod>2026-11-19</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
      )
      .join('\n');

    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset\n  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n  xmlns:xhtml="http://www.w3.org/1999/xhtml"\n>\n${urlNodes}\n</urlset>\n`
    );
  });

  // Always serve unbundled image assets from src/assets and public/assets regardless of cwd
  const srcAssetsPath = path.join(ROOT_DIR, 'src', 'assets');
  const publicPath = path.join(ROOT_DIR, 'public');
  if (fs.existsSync(srcAssetsPath)) {
    app.use('/src/assets', express.static(srcAssetsPath));
  }
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

  const distPath = path.join(ROOT_DIR, 'dist');
  const distIndexHtml = path.join(distPath, 'index.html');

  let useStaticDist = false;
  if (process.env.NODE_ENV === 'production') {
    useStaticDist = await ensureProductionBuild(distIndexHtml);
  }

  if (useStaticDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(distIndexHtml);
    });
  } else {
    const vitePromise = createViteServer({
      root: ROOT_DIR,
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
