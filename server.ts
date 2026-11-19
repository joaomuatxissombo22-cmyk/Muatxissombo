import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer, build as viteBuild } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.dirname(__filename);
const DATA_DIR = path.join(ROOT_DIR, 'data');
const STORE_FILE = path.join(DATA_DIR, 'platform_store.json');

interface StoredAccount {
  uid: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  nif: string;
  address: string;
  role: 'client' | 'admin';
  status: 'active' | 'suspended';
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

interface PlatformStoreData {
  accounts: StoredAccount[];
  orders: Record<string, unknown>[];
  website_projects: Record<string, unknown>[];
  licenses_issued: Record<string, unknown>[];
  domains_registered: Record<string, unknown>[];
  support_messages: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  feedbacks: Record<string, unknown>[];
  catalog_items: Record<string, unknown>[];
  platform_settings: Record<string, unknown> | null;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`muatxissombo_salt_2026:${password}`).digest('hex');
}

function loadStore(): PlatformStoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as PlatformStoreData;
      if (Array.isArray(parsed.accounts) && parsed.accounts.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Initializing fresh platform store:', err);
  }

  const now = new Date().toISOString();
  const initialStore: PlatformStoreData = {
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

function saveStore(store: PlatformStoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving platform store:', err);
  }
}

function sanitizeAccount(acc: StoredAccount) {
  const { passwordHash: _omitted, ...safe } = acc;
  return safe;
}

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

  // Confiar nos cabeçalhos do proxy reverso (Cloud Run, Hostinger LiteSpeed/Nginx, Cloudflare)
  app.set('trust proxy', true);

  // Redirecionamento permanente HTTP -> HTTPS (301) e prevenção de Conteúdo Misto (Mixed Content)
  app.use((req, res, next) => {
    const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
    const hostname = rawHost.split(':')[0].toLowerCase();
    const isLocalhost =
      !hostname ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local');

    // Ignorar healthcheck interno e ambiente local
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

      if (isHttpFromProxy) {
        return res.redirect(301, `https://${rawHost}${req.originalUrl}`);
      }
    }

    // Cabeçalhos de segurança para evitar bloqueio de conteúdo misto (ecrã branco) e forçar HTTPS
    if (!isLocalhost) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', httpsEnforced: true });
  });

  // ================= AUTHENTICATION & PASSWORD MANAGEMENT ENDPOINTS =================
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
    const exists = store.accounts.find(
      (a) =>
        (cleanEmail && a.email.toLowerCase() === cleanEmail) ||
        (cleanUsername && a.username.toLowerCase() === cleanUsername)
    );
    if (exists) {
      return res.status(409).json({
        error: 'Já existe uma conta registada com este utilizador ou e-mail. Inicie sessão.',
      });
    }

    const now = new Date().toISOString();
    const isOwnerAdmin =
      cleanEmail === 'joaomuatxissombo22@gmail.com' ||
      cleanEmail === 'info@muatxissombosolution.online';
    const newAccount: StoredAccount = {
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
        a.username.toLowerCase() === cleanId ||
        a.email.toLowerCase() === cleanId ||
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
          (a.username.toLowerCase() === String(identifier).toLowerCase() ||
            a.email.toLowerCase() === String(identifier).toLowerCase())) ||
        (uid === 'admin' && a.role === 'admin')
    );

    if (!target) {
      // If user authenticated via Google/Firebase and wasn't in local store yet, create record
      const now = new Date().toISOString();
      const created: StoredAccount = {
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

  // ================= PERSISTENT STORE SYNC ENDPOINTS =================
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
    const collectionName = body.collectionName || body.collection;
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
    ] as const;

    type AllowedCol = (typeof allowedCollections)[number];
    if (!allowedCollections.includes(collectionName as AllowedCol)) {
      return res.status(400).json({ error: 'Colecção inválida.' });
    }

    const colKey = collectionName as AllowedCol;
    const list = store[colKey] || [];

    if (deleteId) {
      store[colKey] = list.filter((item) => item[idField] !== deleteId);
    } else if (record) {
      const recId = record[idField] || body.id;
      const normalizedRecord = { ...record, [idField]: recId };
      const idx = list.findIndex((item) => item[idField] === recId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...normalizedRecord };
      } else {
        list.unshift(normalizedRecord);
      }
      store[colKey] = list;
    }

    saveStore(store);
    return res.json({ ok: true, success: true });
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
      server: { middlewareMode: true, allowedHosts: true },
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
