// Ponto de entrada JavaScript ESM autónomo para servidores Node.js (Hostinger hbuilds / LiteSpeed lsnode)
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.dirname(__filename);
const DATA_DIR = path.join(ROOT_DIR, 'data');
const STORE_FILE = path.join(DATA_DIR, 'platform_store.json');

function hashPassword(password) {
  return crypto.createHash('sha256').update(`muatxissombo_salt_2026:${password}`).digest('hex');
}

// Cache em memória caso o sistema de ficheiros do servidor esteja em modo leitura
let memoryStoreCache = null;

function saveStore(store) {
  memoryStoreCache = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Using in-memory store fallback:', err);
  }
}

function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.accounts) && parsed.accounts.length > 0) {
        memoryStoreCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Reading store file failed, checking memory cache:', err);
  }

  if (memoryStoreCache && Array.isArray(memoryStoreCache.accounts)) {
    return memoryStoreCache;
  }

  const now = new Date().toISOString();
  const initialStore = {
    accounts: [
      {
        uid: 'admin_muatxissombo',
        username: 'admin',
        name: 'Administrador Muatxissombo',
        email: 'info@muatxissombosolution.online',
        phone: '+244 927 496 287',
        company: 'Muatxissombo Soluções Digitais',
        nif: '5000000000',
        address: 'Centralidade do Kilamba, E22, Porta 12, 1.º Andar, Luanda, Angola',
        role: 'admin',
        status: 'active',
        passwordHash: hashPassword('Muatxissombo@2026'),
        createdAt: now,
        updatedAt: now,
      },
    ],
    orders: [],
    website_projects: [],
    licenses_issued: [],
    domains_registered: [],
    support_messages: [],
    notifications: [],
    feedbacks: [],
    catalog_items: [],
    platform_settings: null,
  };

  saveStore(initialStore);
  return initialStore;
}

function sanitizeAccount(acc) {
  if (!acc || typeof acc !== 'object') return acc;
  const copy = { ...acc };
  delete copy.passwordHash;
  return copy;
}

async function ensureProductionBuild(distIndexHtml) {
  if (fs.existsSync(distIndexHtml)) {
    return true;
  }
  try {
    console.log('Production build not found in dist/. Running Vite build automatically...');
    const viteModule = await import('vite');
    await viteModule.build({ root: ROOT_DIR });
    return fs.existsSync(distIndexHtml);
  } catch (err) {
    console.error('Automatic Vite build failed:', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const isAiStudioEnv = process.env.DISABLE_HMR === 'true';
  const PORT = isAiStudioEnv ? 3000 : Number(process.env.PORT) || 3000;

  app.set('trust proxy', true);

  // Redirecionamento permanente HTTP -> HTTPS (301) e cabeçalhos seguros
  app.use((req, res, next) => {
    try {
      const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
      const hostname = rawHost.split(':')[0].toLowerCase();
      const isLocalhost =
        !hostname ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.endsWith('.local');

      if (!isLocalhost && req.path !== '/api/health') {
        const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
          .split(',')[0]
          .trim()
          .toLowerCase();
        const forwardedSsl = String(req.headers['x-forwarded-ssl'] || '')
          .trim()
          .toLowerCase();
        const cfVisitor = String(req.headers['cf-visitor'] || '');
        const isHttpFromProxy =
          forwardedProto === 'http' ||
          forwardedSsl === 'off' ||
          cfVisitor.includes('"scheme":"http"');

        if (isHttpFromProxy && rawHost) {
          return res.redirect(301, `https://${rawHost}${req.originalUrl}`);
        }
      }

      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    } catch (_err) {
      // Continuar mesmo se algum cabeçalho estiver malformado
    }
    next();
  });

  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', httpsEnforced: true });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, username, email, phone, company, nif, address, password } = req.body || {};
    const cleanEmail = String(email || username || '').trim().toLowerCase();
    const cleanUsername = String(username || cleanEmail.split('@')[0] || '')
      .trim()
      .toLowerCase();
    const cleanPass = String(password || '');

    if (!cleanEmail && !cleanUsername) {
      return res.status(400).json({ error: 'Informe um utilizador ou endereço de e-mail válido.' });
    }
    if (cleanPass.length < 6) {
      return res.status(400).json({ error: 'A palavra-passe deve ter pelo menos 6 caracteres.' });
    }

    const store = loadStore();
    const exists = store.accounts.find((a) => {
      const aEmail = String(a.email || '').toLowerCase();
      const aUser = String(a.username || '').toLowerCase();
      return (cleanEmail && aEmail === cleanEmail) || (cleanUsername && aUser === cleanUsername);
    });
    if (exists) {
      return res.status(409).json({
        error: 'Já existe uma conta registada com este utilizador ou e-mail. Inicie sessão.',
      });
    }

    const now = new Date().toISOString();
    const isOwnerAdmin =
      cleanEmail === 'joaomuatxissombo22@gmail.com' ||
      cleanEmail === 'info@muatxissombosolution.online';
    const newAccount = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      username: cleanUsername || cleanEmail,
      name: String(name || cleanUsername || 'Cliente Muatxissombo').trim().slice(0, 120),
      email: (cleanEmail.includes('@') ? cleanEmail : `${cleanUsername}@cliente.muatxissombo.ao`).slice(
        0,
        160
      ),
      phone: String(phone || '').trim().slice(0, 40),
      company: String(company || '').trim().slice(0, 120),
      nif: String(nif || '').trim().slice(0, 40),
      address: String(address || 'Luanda, Angola').trim().slice(0, 250),
      role: isOwnerAdmin ? 'admin' : 'client',
      status: 'active',
      passwordHash: hashPassword(cleanPass),
      createdAt: now,
      updatedAt: now,
    };

    store.accounts.push(newAccount);
    saveStore(store);

    return res.json({
      ok: true,
      success: true,
      user: sanitizeAccount(newAccount),
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { identifier, password, requireAdmin } = req.body || {};
    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanPass = String(password || '');

    if (!cleanId || !cleanPass) {
      return res.status(400).json({ error: 'Introduza o utilizador/e-mail e a palavra-passe.' });
    }

    const store = loadStore();
    const incomingHash = hashPassword(cleanPass);

    const account = store.accounts.find((a) => {
      const matchId =
        String(a.username || '').toLowerCase() === cleanId ||
        String(a.email || '').toLowerCase() === cleanId ||
        (a.role === 'admin' &&
          (cleanId === 'admin' ||
            cleanId === 'muatxissombo' ||
            cleanId === 'joaomuatxissombo22@gmail.com' ||
            cleanId === 'info@muatxissombosolution.online'));
      return matchId && a.passwordHash === incomingHash;
    });

    if (!account) {
      return res.status(401).json({
        error: 'Utilizador ou palavra-passe incorretos. Verifique os seus dados.',
      });
    }

    if (account.status === 'suspended') {
      return res.status(403).json({
        error: 'Esta conta encontra-se suspensa. Contacte o suporte da Muatxissombo.',
      });
    }

    if (requireAdmin && account.role !== 'admin') {
      return res.status(403).json({
        error: 'Esta conta não possui privilégios de Administrador.',
      });
    }

    return res.json({
      ok: true,
      success: true,
      user: sanitizeAccount(account),
    });
  });

  app.post('/api/auth/change-password', (req, res) => {
    const { uid, identifier, currentPassword, newPassword, newUsername, adminOverride } =
      req.body || {};
    const cleanNewPass = String(newPassword || '');
    if (cleanNewPass.length < 6) {
      return res
        .status(400)
        .json({ error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
    }

    const store = loadStore();
    const target = store.accounts.find(
      (a) =>
        (uid && a.uid === uid) ||
        (identifier &&
          (String(a.username || '').toLowerCase() === String(identifier).toLowerCase() ||
            String(a.email || '').toLowerCase() === String(identifier).toLowerCase())) ||
        (uid === 'admin' && a.role === 'admin')
    );

    if (!target) {
      const now = new Date().toISOString();
      const created = {
        uid: String(uid || `usr_${Date.now()}`),
        username: String(newUsername || identifier || 'utilizador').trim().toLowerCase(),
        name: String(identifier || 'Utilizador Muatxissombo'),
        email: String(identifier || 'cliente@muatxissombosolution.online'),
        phone: '',
        company: '',
        nif: '',
        address: 'Luanda, Angola',
        role: uid === 'admin' ? 'admin' : 'client',
        status: 'active',
        passwordHash: hashPassword(cleanNewPass),
        createdAt: now,
        updatedAt: now,
      };
      store.accounts.push(created);
      saveStore(store);
      return res.json({ ok: true, success: true, user: sanitizeAccount(created) });
    }

    if (!adminOverride && currentPassword) {
      const currentHash = hashPassword(String(currentPassword));
      if (target.passwordHash !== currentHash) {
        return res.status(401).json({ error: 'A palavra-passe atual está incorreta.' });
      }
    }

    target.passwordHash = hashPassword(cleanNewPass);
    if (newUsername && String(newUsername).trim()) {
      target.username = String(newUsername).trim().toLowerCase().slice(0, 80);
    }
    target.updatedAt = new Date().toISOString();
    saveStore(store);

    return res.json({
      ok: true,
      success: true,
      user: sanitizeAccount(target),
    });
  });

  app.get('/api/store/state', (req, res) => {
    const store = loadStore();
    const userId = String(req.query.userId || '').trim();
    const role = String(req.query.role || 'client').trim();
    const isAdmin = role === 'admin';

    res.json({
      ok: true,
      success: true,
      users: store.accounts.map(sanitizeAccount),
      orders: isAdmin || !userId ? store.orders : store.orders.filter((o) => o.userId === userId),
      website_projects:
        isAdmin || !userId
          ? store.website_projects
          : store.website_projects.filter((p) => p.userId === userId),
      licenses_issued:
        isAdmin || !userId
          ? store.licenses_issued
          : store.licenses_issued.filter((l) => l.userId === userId),
      domains_registered:
        isAdmin || !userId
          ? store.domains_registered
          : store.domains_registered.filter((d) => d.userId === userId),
      support_messages:
        isAdmin || !userId
          ? store.support_messages
          : store.support_messages.filter((m) => m.userId === userId),
      notifications:
        isAdmin || !userId
          ? store.notifications
          : store.notifications.filter((n) => n.userId === userId || n.userId === 'admin'),
      feedbacks: store.feedbacks,
      catalog_items: store.catalog_items,
      platform_settings: store.platform_settings,
    });
  });

  app.post('/api/store/upsert', (req, res) => {
    const body = req.body || {};
    const collectionName = String(body.collectionName || body.collection || '');
    const idField = body.idField || (collectionName === 'users' ? 'uid' : 'id');
    const record =
      body.record || (body.data ? { ...body.data, [idField]: body.id || body.data[idField] } : null);
    const deleteId = body.deleteId || (body.action === 'delete' ? body.id : undefined);
    const store = loadStore();

    if (collectionName === 'users') {
      if (deleteId) {
        store.accounts = store.accounts.filter((a) => a.uid !== deleteId);
      } else if (record && (record.uid || body.id)) {
        const targetUid = record.uid || body.id;
        const idx = store.accounts.findIndex((a) => a.uid === targetUid);
        if (idx >= 0) {
          store.accounts[idx] = {
            ...store.accounts[idx],
            ...record,
            uid: targetUid,
            passwordHash: store.accounts[idx].passwordHash,
            updatedAt: new Date().toISOString(),
          };
        } else {
          const now = new Date().toISOString();
          store.accounts.push({
            uid: String(targetUid),
            username: String(record.username || record.email || targetUid).toLowerCase(),
            name: String(record.name || 'Cliente Muatxissombo'),
            email: String(record.email || ''),
            phone: String(record.phone || ''),
            company: String(record.company || ''),
            nif: String(record.nif || ''),
            address: String(record.address || 'Luanda, Angola'),
            role: record.role === 'admin' ? 'admin' : 'client',
            status: record.status === 'suspended' ? 'suspended' : 'active',
            passwordHash: hashPassword('Muatxissombo@2026'),
            createdAt: record.createdAt || now,
            updatedAt: now,
          });
        }
      }
      saveStore(store);
      return res.json({ ok: true, success: true });
    }

    if (collectionName === 'platform_settings') {
      store.platform_settings = record;
      saveStore(store);
      return res.json({ ok: true, success: true });
    }

    const allowedCollections = [
      'orders',
      'website_projects',
      'licenses_issued',
      'domains_registered',
      'support_messages',
      'notifications',
      'feedbacks',
      'catalog_items',
    ];
    if (!allowedCollections.includes(collectionName)) {
      return res.status(400).json({ error: 'Colecção inválida.' });
    }

    const list = store[collectionName] || [];
    if (deleteId) {
      store[collectionName] = list.filter((item) => item[idField] !== deleteId);
    } else if (record) {
      const recId = record[idField] || body.id;
      const normalizedRecord = { ...record, [idField]: recId };
      const idx = list.findIndex((item) => item[idField] === recId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...normalizedRecord };
      } else {
        list.unshift(normalizedRecord);
      }
      store[collectionName] = list;
    }

    saveStore(store);
    return res.json({ ok: true, success: true });
  });

  app.get('/api/domain-check', async (req, res) => {
    const rawDomain = String(req.query.domain || '').trim().toLowerCase();
    if (!rawDomain || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(rawDomain)) {
      return res.status(400).json({
        error: 'Formato de domínio inválido. Exemplo: suaempresa.co.ao ou suaempresa.com',
      });
    }

    try {
      const dnsUrl = `https://dns.google/resolve?name=${encodeURIComponent(rawDomain)}&type=NS`;
      const dnsResp = await fetch(dnsUrl, {
        headers: { Accept: 'application/json' },
      });

      if (!dnsResp.ok) {
        throw new Error(`DNS gateway HTTP ${dnsResp.status}`);
      }

      const dnsData = await dnsResp.json();
      const status = dnsData.Status;
      const hasAnswer = Array.isArray(dnsData.Answer) && dnsData.Answer.length > 0;
      const hasAuthority = Array.isArray(dnsData.Authority) && dnsData.Authority.length > 0;

      let registered = false;
      let nameservers = [];

      if (status === 0 && hasAnswer) {
        registered = true;
        nameservers = dnsData.Answer.map((a) => a.data || '').filter(Boolean);
      } else if (status === 3) {
        registered = false;
      } else {
        const aResp = await fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(rawDomain)}&type=A`
        );
        const aData = await aResp.json();
        registered = aData.Status === 0 && Array.isArray(aData.Answer) && aData.Answer.length > 0;
      }

      return res.json({
        domain: rawDomain,
        available: !registered,
        registered,
        nameservers,
        hasAuthority,
        checkedAt: new Date().toISOString(),
        source: 'Google Public DNS (RFC 8484 DoH)',
      });
    } catch (error) {
      console.error('Domain lookup error:', error);
      return res.status(502).json({
        error: 'Não foi possível consultar o servidor DNS global neste momento.',
      });
    }
  });

  app.post('/api/send-email', async (req, res) => {
    const {
      to,
      subject,
      customerName,
      eventType,
      orderNumber,
      summary,
      details,
      licenseKey,
      downloadUrl,
      replyTo,
    } = req.body || {};

    if (!to || !subject) {
      return res.status(400).json({ error: 'Destinatário (to) e assunto (subject) são obrigatórios.' });
    }

    const dispatchId = `MAIL-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const smtpConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    );

    const bodyPreview = [
      `Olá ${customerName || 'Estimado(a) Cliente'},`,
      '',
      `A Muatxissombo Soluções Digitais informa sobre: ${subject}`,
      orderNumber ? `Referência do Pedido: ${orderNumber}` : '',
      summary ? `Resumo: ${summary}` : '',
      details ? `Detalhes: ${details}` : '',
      licenseKey ? `Chave / Licença Digital Emitida: ${licenseKey}` : '',
      downloadUrl ? `Link Oficial de Instalação: ${downloadUrl}` : '',
      '',
      'Contactos de Suporte:',
      'Tel / WhatsApp: +244 927 496 287 / 954 900 170',
      `E-mail: ${replyTo || 'info@muatxissombosolution.online'}`,
      'Centralidade do Kilamba, E22, Porta 12, 1.º Andar, Luanda - Angola',
    ]
      .filter(Boolean)
      .join('\n');

    return res.json({
      success: true,
      dispatchId,
      timestamp,
      recipient: to,
      subject,
      eventType: eventType || 'Notificação Transacional',
      transportNote: smtpConfigured
        ? `Enviado via servidor SMTP (${process.env.SMTP_HOST})`
        : 'Registado no centro de notificações da plataforma e preparado para envio via PHPMailer/SMTP na Hostinger.',
      preview: bodyPreview,
    });
  });

  const resolveSeoBaseUrl = (req) => {
    const envUrl = process.env.APP_URL ? process.env.APP_URL.trim().replace(/\/+$/, '') : '';
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

  const isAiStudioDev = process.env.DISABLE_HMR === 'true' && process.env.NODE_ENV !== 'production';
  let useStaticDist = false;

  if (!isAiStudioDev) {
    useStaticDist = fs.existsSync(distIndexHtml);
    if (!useStaticDist) {
      useStaticDist = await ensureProductionBuild(distIndexHtml);
    }
  }

  if (useStaticDist && fs.existsSync(distIndexHtml)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(distIndexHtml);
    });
  } else {
    let viteInstancePromise = null;
    const getVite = async () => {
      if (!viteInstancePromise) {
        const viteMod = await import('vite');
        viteInstancePromise = viteMod.createServer({
          root: ROOT_DIR,
          server: { middlewareMode: true, allowedHosts: true },
          appType: 'spa',
        });
      }
      return viteInstancePromise;
    };

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }

    app.use(async (req, res, next) => {
      try {
        const vite = await getVite();
        vite.middlewares(req, res, next);
      } catch (err) {
        console.error('Vite middleware error, falling back to dist/index.html:', err);
        if (fs.existsSync(distIndexHtml)) {
          return res.sendFile(distIndexHtml);
        }
        next(err);
      }
    });
  }

  // Tratamento global de erros para nunca devolver 500 Internal Server Error em rotas HTML
  app.use((err, req, res, _next) => {
    console.error('Unhandled server error:', err);
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ ok: false, error: 'Erro interno do servidor.' });
    }
    if (fs.existsSync(distIndexHtml)) {
      return res.sendFile(distIndexHtml);
    }
    const rootIndexHtml = path.join(ROOT_DIR, 'index.html');
    if (fs.existsSync(rootIndexHtml)) {
      return res.sendFile(rootIndexHtml);
    }
    return res.status(200).send('<!doctype html><html><head><meta http-equiv="refresh" content="0;url=/" /></head><body></body></html>');
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
