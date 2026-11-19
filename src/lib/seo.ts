export type SeoRouteKey =
  | 'inicio'
  | 'criacao-sites'
  | 'dominios'
  | 'hospedagem'
  | 'licencas'
  | 'assistencia'
  | 'sobre'
  | 'contactos'
  | 'client'
  | 'admin'
  | 'auth';

interface SeoPreset {
  title: string;
  description: string;
  robots?: string;
  sectionParam?: string;
}

const DEFAULT_SEO: SeoPreset = {
  title: 'Muatxissombo Soluções Digitais | Websites, Domínios e TI',
  description:
    'Criação de websites profissionais, domínios .ao e .com, hospedagem, licenças Microsoft 365, antivírus e suporte TI em Angola e no mundo.',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

const SEO_PRESETS: Record<SeoRouteKey, SeoPreset> = {
  inicio: DEFAULT_SEO,
  'criacao-sites': {
    title: 'Criação de Websites e Lojas Online | Muatxissombo Angola',
    description:
      'Desenvolvimento de websites institucionais, lojas online em AOA/USD e sistemas de gestão para empresas em Angola e no mundo. Peça orçamento.',
    sectionParam: 'criacao-sites',
  },
  dominios: {
    title: 'Registo de Domínios .ao, .co.ao e .com | Muatxissombo',
    description:
      'Verifique a disponibilidade em tempo real e registe domínios nacionais (.ao, .co.ao) e internacionais (.com, .pro, .online) com DNS seguro.',
    sectionParam: 'dominios',
  },
  hospedagem: {
    title: 'Hospedagem Web NVMe e E-mail Corporativo | Muatxissombo',
    description:
      'Planos de alojamento web de alta velocidade com SSL grátis, backups e e-mail profissional para projetos em Angola e em todo o mundo.',
    sectionParam: 'hospedagem',
  },
  licencas: {
    title: 'Licenças Originais Microsoft 365 e Antivírus | Muatxissombo',
    description:
      'Compre licenças originais Microsoft 365, Defender, ESET, Kaspersky e Bitdefender com envio digital imediato para Angola e exterior.',
    sectionParam: 'licencas',
  },
  assistencia: {
    title: 'Assistência Informática Luanda e Remota Mundial | Muatxissombo',
    description:
      'Instalação de Windows 10/11, remoção de malware, Office, e-mail corporativo e suporte TI presencial em Luanda ou remoto mundial 24/7.',
    sectionParam: 'assistencia',
  },
  sobre: {
    title: 'Sobre a Muatxissombo Soluções Digitais | Angola e Mundo',
    description:
      'Conheça a Muatxissombo Soluções Digitais no Kilamba, Luanda: equipa especializada em engenharia web, cloud, domínios e licenciamento.',
    sectionParam: 'sobre',
  },
  contactos: {
    title: 'Contactos e Orçamentos | Muatxissombo Soluções Digitais',
    description:
      'Fale connosco em Luanda (+244 927 496 287 / info@muatxissombosolution.online) para websites, domínios, hospedagem e assistência TI global.',
    sectionParam: 'contactos',
  },
  client: {
    title: 'Área do Cliente | Muatxissombo Soluções Digitais',
    description:
      'Acompanhe pedidos, faturas, domínios registados, licenças Microsoft 365 e projetos web na Área do Cliente Muatxissombo.',
    robots: 'noindex, nofollow',
  },
  admin: {
    title: 'Painel Administrativo | Muatxissombo Soluções Digitais',
    description: 'Gestão operacional e comercial da plataforma Muatxissombo Soluções Digitais.',
    robots: 'noindex, nofollow',
  },
  auth: {
    title: 'Entrar ou Criar Conta | Muatxissombo Soluções Digitais',
    description:
      'Aceda à sua conta de cliente Muatxissombo para gerir serviços web, domínios, hospedagem e licenças de software.',
    robots: 'noindex, nofollow',
  },
};

function upsertMeta(attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function applyPageSeo(route: SeoRouteKey = 'inicio') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const preset = SEO_PRESETS[route] || DEFAULT_SEO;
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const canonicalUrl = preset.sectionParam ? `${baseUrl}?section=${preset.sectionParam}` : baseUrl;
  const shareImageUrl = `${window.location.origin}/assets/aistudio/LOGO_MUATXISSOMBO-02_2ea0c22e.png`;

  document.title = preset.title;
  upsertMeta('name', 'description', preset.description);
  upsertMeta(
    'name',
    'robots',
    preset.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  );

  upsertLink('canonical', canonicalUrl);
  upsertLink('alternate', canonicalUrl, 'pt-AO');
  upsertLink('alternate', canonicalUrl, 'pt-PT');
  upsertLink('alternate', canonicalUrl, 'pt-BR');
  upsertLink('alternate', canonicalUrl, 'pt');
  upsertLink('alternate', canonicalUrl, 'x-default');

  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:title', preset.title);
  upsertMeta('property', 'og:description', preset.description);
  upsertMeta('property', 'og:image', shareImageUrl);

  upsertMeta('name', 'twitter:title', preset.title);
  upsertMeta('name', 'twitter:description', preset.description);
  upsertMeta('name', 'twitter:image', shareImageUrl);
}
