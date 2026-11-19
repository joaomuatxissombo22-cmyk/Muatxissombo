export type CatalogCategory =
  | 'website'
  | 'domain_tld'
  | 'domain'
  | 'hosting'
  | 'license'
  | 'assistance';

export interface CatalogItemData {
  id: string;
  category: CatalogCategory;
  subCategory?: string;
  name: string;
  subtitle?: string;
  description: string;
  priceKz: number;
  priceLabel?: string;
  renewalPriceKz?: number;
  billingCycle?: string;
  features?: string[];
  benefits?: string[];
  validityPeriod?: string;
  devicesCount?: string;
  licenseType?: string;
  available?: boolean;
  active?: boolean;
  popular?: boolean;
  promoBadge?: string;
  badgeText?: string;
  extension?: string;
  imageUrl?: string;
  stockKeysCount?: number;
  durationMonths?: number;
  maxActivations?: number;
  sortOrder?: number;
}

export interface PlatformSettingsData {
  companyName: string;
  slogan?: string;
  officialDomain: string;
  corporateEmail: string;
  smtpSenderEmail: string;
  emailPrimary?: string;
  emailSecondary?: string;
  phoneWhatsapp: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  whatsappNumber?: string;
  address: string;
  businessHours: string;
  businessHoursWeekdays?: string;
  businessHoursSaturday?: string;
  bankName: string;
  iban: string;
  bankIban?: string;
  bankHolder?: string;
  multicaixaExpressNumber: string;
  unitelMoneyNumber: string;
  afrimoneyNumber: string;
  smtpHost: string;
  updatedAt?: string;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsData = {
  companyName: 'Muatxissombo Soluções Digitais',
  slogan: 'Soluções Digitais Completas para Empresas, Profissionais e Particulares em Angola',
  officialDomain: 'muatxissombosolution.online',
  corporateEmail: 'info@muatxissombosolution.online',
  smtpSenderEmail: 'info@muatxissombosolution.online',
  emailPrimary: 'info@muatxissombosolution.online',
  emailSecondary: 'joaomuatxissombo22@gmail.com',
  phoneWhatsapp: '+244 927 496 287 / 954 900 170',
  phonePrimary: '927 496 287',
  phoneSecondary: '954 900 170',
  whatsappNumber: '244927496287',
  address: 'Centralidade do Kilamba, E22, Porta 12, 1.º Andar, Luanda, Angola',
  businessHours: 'Seg - Sex: 08h00 - 17h30 | Sáb: 08h30 - 13h00',
  businessHoursWeekdays: 'Segunda a Sexta: 08h00 às 17h30',
  businessHoursSaturday: 'Sábado: 08h30 às 13h00',
  bankName: 'BAI - Banco Angolano de Investimentos',
  iban: 'AO06.0040.0000.0000.0000.0000.0',
  bankIban: 'AO06.0040.0000.0000.0000.0000.0',
  bankHolder: 'Muatxissombo Soluções Digitais',
  multicaixaExpressNumber: '927 496 287',
  unitelMoneyNumber: '927 496 287',
  afrimoneyNumber: '954 900 170',
  smtpHost: 'smtp.hostinger.com:465 (SSL/TLS)',
};

export const INITIAL_CATALOG_ITEMS: CatalogItemData[] = [
  // ================= 1. CRIAÇÃO DE WEBSITES =================
  {
    id: 'web-institucional',
    category: 'website',
    subCategory: 'Empresas & Instituições',
    name: 'Sites Institucionais e Corporativos',
    subtitle: 'Presença sólida e credível para empresas, consultoras e instituições em Angola',
    description:
      'Desenvolvimento completo de website institucional moderno, rápido e adaptado a telemóveis, tablets e computadores, com identidade visual corporativa e foco na geração de contactos.',
    priceKz: 185000,
    priceLabel: 'A partir de 185.000 Kz',
    billingCycle: 'Projecto Chave-na-Mão',
    features: [
      'Design 100% responsivo (Telemóvel, Tablet e PC)',
      'Até 8 páginas estruturadas (Início, Sobre, Serviços, Portfólio, Contactos)',
      'Integração direta com WhatsApp e formulários inteligentes',
      'Otimização SEO para motores de busca em Angola (Google.co.ao)',
      'Certificado de Segurança SSL HTTPS incluído',
      'Painel de gestão simples e formação inicial',
    ],
    benefits: [
      'Design 100% responsivo (Telemóvel, Tablet e PC)',
      'Até 8 páginas estruturadas (Início, Sobre, Serviços, Portfólio, Contactos)',
      'Integração direta com WhatsApp e formulários inteligentes',
      'Otimização SEO para motores de busca em Angola (Google.co.ao)',
    ],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Mais Procurado',
    badgeText: 'Mais Procurado por Empresas',
    sortOrder: 1,
  },
  {
    id: 'web-ecommerce',
    category: 'website',
    subCategory: 'Comércio Electrónico AOA',
    name: 'Lojas Online (E-commerce Completo em Kz)',
    subtitle: 'Venda produtos e serviços 24/7 com faturação em Kwanzas (AOA)',
    description:
      'Plataforma de comércio eletrónico pronta para vender em Angola, com catálogo de produtos, carrinho de compras, gestão de encomendas, stock e pagamentos por Multicaixa Express ou Transferência.',
    priceKz: 320000,
    priceLabel: 'A partir de 320.000 Kz',
    billingCycle: 'Projecto Chave-na-Mão',
    features: [
      'Catálogo ilimitado de produtos com variações e controlo de stock',
      'Carrinho de compras e checkout otimizado em Kwanzas (Kz)',
      'Pagamentos por Multicaixa Express, Referência, Transferência IBAN e Entrega',
      'Painel administrativo completo de vendas e clientes',
      'Cálculo automático de taxas de entrega por província/município',
      'Notificações automáticas de encomendas por E-mail e WhatsApp',
    ],
    benefits: [
      'Catálogo de produtos com variações e controlo de stock',
      'Checkout otimizado em Kwanzas (Multicaixa Express e IBAN)',
      'Painel administrativo completo de vendas e clientes',
      'Notificações automáticas de encomendas por E-mail e WhatsApp',
    ],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'E-commerce AOA',
    badgeText: 'E-commerce AOA',
    sortOrder: 2,
  },
  {
    id: 'web-landing',
    category: 'website',
    subCategory: 'Campanhas & Vendas Rápidas',
    name: 'Landing Pages de Alta Conversão',
    subtitle: 'Página única focada em campanhas publicitárias, lançamentos e captação de clientes',
    description:
      'Página de alta velocidade projetada especificamente para converter visitantes de anúncios (Facebook, Instagram, Google Ads) em clientes reais via WhatsApp ou formulário.',
    priceKz: 110000,
    priceLabel: 'A partir de 110.000 Kz',
    billingCycle: 'Projecto Chave-na-Mão',
    features: [
      'Estrutura persuasiva orientada a vendas e captação de leads',
      'Carregamento ultra-rápido em redes móveis angolanas (Unitel / Africell)',
      'Botões estratégicos de chamada para ação (CTA) e WhatsApp',
      'Integração com Pixel da Meta e Google Analytics',
      'Entrega rápida pronta a anunciar',
    ],
    benefits: [
      'Estrutura persuasiva orientada a vendas e captação de leads',
      'Carregamento ultra-rápido em redes móveis (Unitel / Africell)',
      'Botões estratégicos de chamada para ação (CTA) e WhatsApp',
      'Integração com Pixel da Meta e Google Analytics',
    ],
    popular: false,
    available: true,
    active: true,
    promoBadge: 'Entrega Rápida',
    sortOrder: 3,
  },
  {
    id: 'web-portal',
    category: 'website',
    subCategory: 'Sistemas & Portais à Medida',
    name: 'Portais e Plataformas Web Personalizadas',
    subtitle: 'Sistemas web à medida, portais de notícias, academias, clínicas e intranets',
    description:
      'Engenharia de software sob medida para organizações que necessitam de área de clientes, reservas, gestão documental, portais informativos ou integrações específicas.',
    priceKz: 480000,
    priceLabel: 'Sob Orçamento (Desde 480.000 Kz)',
    billingCycle: 'Projecto Chave-na-Mão',
    features: [
      'Arquitetura personalizada com área restrita de utilizadores e níveis de acesso',
      'Base de dados segura na cloud com backups diários',
      'Dashboards operacionais, relatórios e exportação de dados',
      'Integração com APIs externas, faturação e e-mail corporativo',
      'Suporte técnico dedicado e acompanhamento evolutivo',
    ],
    benefits: [
      'Área restrita de clientes e painel de administração dedicado',
      'Base de dados segura na cloud com backups diários',
      'Dashboards operacionais, relatórios e exportação de dados',
      'Integração com APIs externas, faturação e e-mail corporativo',
    ],
    popular: false,
    available: true,
    active: true,
    promoBadge: 'Engenharia Web',
    sortOrder: 4,
  },
  {
    id: 'web-manutencao',
    category: 'website',
    subCategory: 'Suporte & Evolução Web',
    name: 'Redesign, Otimização e Manutenção de Sites',
    subtitle: 'Modernização de sites antigos, correção de erros, segurança e atualização contínua',
    description:
      'Transformamos o seu website atual num portal moderno, seguro e veloz, ou asseguramos a manutenção mensal para que a sua equipa nunca se preocupe com falhas técnicas.',
    priceKz: 45000,
    priceLabel: 'Desde 45.000 Kz / intervenção',
    billingCycle: 'Mensal / Intervenção',
    features: [
      'Renovação visual completa e adaptação a dispositivos móveis',
      'Limpeza de malware, reforço de segurança e restauro de backups',
      'Otimização de velocidade de carregamento e SEO técnico',
      'Atualização de conteúdos, banners, produtos e textos',
      'Monitorização contínua de disponibilidade (Uptime 99.9%)',
    ],
    benefits: [
      'Renovação visual completa e adaptação a dispositivos móveis',
      'Limpeza de malware, reforço de segurança e restauro de backups',
      'Otimização de velocidade de carregamento e SEO técnico',
      'Monitorização contínua de disponibilidade (Uptime 99.9%)',
    ],
    popular: false,
    available: true,
    active: true,
    promoBadge: 'Uptime 99.9%',
    sortOrder: 5,
  },

  // ================= 2. VENDA E REGISTO DE DOMÍNIOS =================
  {
    id: 'dom-co-ao',
    category: 'domain_tld',
    subCategory: 'Nacional Angola',
    name: '.co.ao',
    extension: '.co.ao',
    subtitle: 'Identidade comercial oficial para empresas em Angola',
    description: 'Registo anual oficial de domínio comercial angolano (.co.ao) com gestão DNS completa.',
    priceKz: 50000,
    renewalPriceKz: 50000,
    billingCycle: 'Anual',
    features: ['Registo Oficial Angola', 'Gestão DNS Completa', 'Proteção de Titularidade', 'Suporte Técnico Local'],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Top Angola',
    badgeText: 'Top Angola',
    sortOrder: 10,
  },
  {
    id: 'dom-ao',
    category: 'domain_tld',
    subCategory: 'Premium Angola',
    name: '.ao',
    extension: '.ao',
    subtitle: 'Domínio nacional premium de topo para marcas e instituições em Angola',
    description: 'Garanta o endereço mais prestigiado de Angola (.ao) para a sua empresa ou projeto.',
    priceKz: 50000,
    renewalPriceKz: 50000,
    billingCycle: 'Anual',
    features: ['Prestígio Nacional .AO', 'Ativação Assistida', 'Gestão DNS Avançada', 'Redirecionamento Incluído'],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Premium .AO',
    badgeText: 'Premium .AO',
    sortOrder: 11,
  },
  {
    id: 'dom-com',
    category: 'domain_tld',
    subCategory: 'Comercial Global',
    name: '.com',
    extension: '.com',
    subtitle: 'A extensão comercial mais reconhecida em todo o mundo',
    description: 'Registo imediato de domínio internacional .com com ativação rápida e painel DNS.',
    priceKz: 38000,
    renewalPriceKz: 40000,
    billingCycle: 'Anual',
    features: ['Ativação Rápida', 'Proteção de Privacidade WHOIS', 'DNS Anycast Global', 'Fácil Renovação em Kz'],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Global',
    badgeText: 'Global',
    sortOrder: 12,
  },
  {
    id: 'dom-net',
    category: 'domain_tld',
    subCategory: 'Tecnologia & Redes',
    name: '.net',
    extension: '.net',
    subtitle: 'Ideal para empresas de tecnologia, telecomunicações e serviços digitais',
    description: 'Domínio internacional .net com alta credibilidade técnica e estabilidade global.',
    priceKz: 41000,
    renewalPriceKz: 43000,
    billingCycle: 'Anual',
    features: ['Credibilidade Tecnológica', 'Gestão DNS Ilimitada', 'Proteção contra Transferência', 'Suporte 24/7'],
    popular: false,
    available: true,
    active: true,
    sortOrder: 13,
  },
  {
    id: 'dom-org',
    category: 'domain_tld',
    subCategory: 'Institucional & ONG',
    name: '.org',
    extension: '.org',
    subtitle: 'Recomendado para ONGs, associações, fundações e projetos sociais',
    description: 'Transmita confiança e transparência institucional com um domínio oficial .org.',
    priceKz: 39000,
    renewalPriceKz: 41000,
    billingCycle: 'Anual',
    features: ['Ideal para Instituições', 'Proteção WHOIS', 'Configuração de E-mail Fácil', 'Gestão DNS'],
    popular: false,
    available: true,
    active: true,
    sortOrder: 14,
  },
  {
    id: 'dom-online',
    category: 'domain_tld',
    subCategory: 'Presença Digital',
    name: '.online',
    extension: '.online',
    subtitle: 'Moderno, versátil e excelente para novos negócios digitais',
    description: 'Destaque a presença digital da sua marca com uma extensão moderna e acessível.',
    priceKz: 36000,
    renewalPriceKz: 39000,
    billingCycle: 'Anual',
    features: ['Grande Disponibilidade de Nomes', 'Ativação Rápida', 'DNS Completo', 'Suporte Local'],
    popular: false,
    available: true,
    active: true,
    sortOrder: 15,
  },
  {
    id: 'dom-pro',
    category: 'domain_tld',
    subCategory: 'Profissionais & B2B',
    name: '.pro',
    extension: '.pro',
    subtitle: 'Exclusivo para profissionais liberais, consultores, engenheiros e especialistas',
    description: 'Afirme a sua autoridade profissional na internet com a extensão .pro.',
    priceKz: 42000,
    renewalPriceKz: 44000,
    billingCycle: 'Anual',
    features: ['Imagem de Especialista', 'Proteção de Dados', 'Certificado SSL Compatível', 'Gestão DNS'],
    popular: false,
    available: true,
    active: true,
    sortOrder: 16,
  },
  {
    id: 'dom-site',
    category: 'domain_tld',
    subCategory: 'Websites & Negócios',
    name: '.site',
    extension: '.site',
    subtitle: 'Direto, memorável e económico para qualquer página web',
    description: 'Lance o seu projeto rapidamente com um endereço .site fácil de recordar.',
    priceKz: 35000,
    renewalPriceKz: 38000,
    billingCycle: 'Anual',
    features: ['Preço Económico', 'Ativação Rápida', 'Painel DNS', 'Suporte em Português'],
    popular: false,
    available: true,
    active: true,
    sortOrder: 17,
  },
  {
    id: 'dom-store',
    category: 'domain_tld',
    subCategory: 'Lojas & E-commerce',
    name: '.store',
    extension: '.store',
    subtitle: 'Perfeito para lojas online, boutiques e comércio eletrónico',
    description: 'Identifique imediatamente a sua loja virtual com a extensão internacional .store.',
    priceKz: 44000,
    renewalPriceKz: 46000,
    billingCycle: 'Anual',
    features: ['Foco em E-commerce', 'Alta Taxa de Clique', 'DNS de Alta Velocidade', 'Proteção WHOIS'],
    popular: false,
    available: true,
    active: true,
    sortOrder: 18,
  },
  {
    id: 'dom-info',
    category: 'domain_tld',
    subCategory: 'Portais & Informação',
    name: '.info',
    extension: '.info',
    subtitle: 'Indicado para portais informativos, guias e diretórios',
    description: 'Domínio .info para projetos editoriais, educativos e centros de informação.',
    priceKz: 37000,
    renewalPriceKz: 40000,
    billingCycle: 'Anual',
    features: ['Reconhecimento Global', 'Gestão DNS', 'Bloqueio de Segurança', 'Ativação Simples'],
    popular: false,
    available: true,
    active: true,
    sortOrder: 19,
  },
  {
    id: 'dom-tech',
    category: 'domain_tld',
    subCategory: 'Startups & Inovação',
    name: '.tech',
    extension: '.tech',
    subtitle: 'A escolha número 1 para startups, software houses e projetos de inovação',
    description: 'Posicione a sua empresa na vanguarda tecnológica com um endereço .tech.',
    priceKz: 46000,
    renewalPriceKz: 46000,
    billingCycle: 'Anual',
    features: ['Identidade Startup & Tech', 'DNS Global Ultra-Rápido', 'Privacidade Incluída', 'Suporte Dedicado'],
    popular: false,
    available: true,
    active: true,
    sortOrder: 20,
  },

  // ================= 3. HOSPEDAGEM WEB E SERVIDORES =================
  {
    id: 'host-essencial',
    category: 'hosting',
    subCategory: 'Iniciante & Blogs',
    name: 'Plano Essencial NVMe',
    subtitle: 'Ideal para sites institucionais, blogs, portfólios e pequenas empresas',
    description:
      'Hospedagem web ultra-rápida com discos SSD NVMe, certificado SSL gratuito e contas de e-mail corporativo para começar com total estabilidade.',
    priceKz: 35000,
    renewalPriceKz: 35000,
    priceLabel: '35.000 Kz / ano',
    billingCycle: 'Anual',
    features: [
      '1 Website Alojado com Alta Velocidade',
      '10 GB de Armazenamento SSD NVMe',
      '5 Contas de E-mail Profissional (@suaempresa)',
      'Certificado SSL Gratuito (HTTPS Seguro)',
      'Painel de Controlo cPanel / DirectAdmin em Português',
      'Backups Semanais Automáticos e Uptime 99.9%',
    ],
    popular: false,
    available: true,
    active: true,
    promoBadge: 'SSD NVMe',
    sortOrder: 30,
  },
  {
    id: 'host-empresarial',
    category: 'hosting',
    subCategory: 'Mais Escolhido por PMEs',
    name: 'Plano Empresarial Pro',
    subtitle: 'O equilíbrio perfeito de potência e e-mails para empresas angolanas em crescimento',
    description:
      'Mais recursos de processamento, memória dedicada e armazenamento NVMe para sites corporativos dinâmicos e equipas que utilizam e-mail profissional diariamente.',
    priceKz: 68000,
    renewalPriceKz: 68000,
    priceLabel: '68.000 Kz / ano',
    billingCycle: 'Anual',
    features: [
      'Até 3 Websites Alojados na Mesma Conta',
      '30 GB de Armazenamento SSD NVMe Ultra-Rápido',
      '25 Contas de E-mail Corporativo com Anti-Spam Avançado',
      'Certificado SSL Gratuito + Proteção Anti-DDoS',
      'Backups Diários Automáticos (Restauro com 1 Clique)',
      'Migração Gratuita do seu Site Atual + Suporte Prioritário',
    ],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Recomendado',
    badgeText: 'Recomendado',
    sortOrder: 31,
  },
  {
    id: 'host-premium',
    category: 'hosting',
    subCategory: 'Alta Performance & Lojas',
    name: 'Plano Corporativo / Cloud Dedicado',
    subtitle: 'Máxima performance para lojas online (E-commerce), portais de elevado tráfego e sistemas',
    description:
      'Infraestrutura de alto desempenho com recursos isolados, cache avançada LiteSpeed e máxima capacidade de e-mails para operações críticas.',
    priceKz: 135000,
    renewalPriceKz: 135000,
    priceLabel: '135.000 Kz / ano',
    billingCycle: 'Anual',
    features: [
      'Websites Ilimitados / Projetos Corporativos',
      '80 GB de Armazenamento NVMe Enterprise',
      'Contas de E-mail Corporativo Ilimitadas',
      'Recursos de CPU e RAM Isolados de Alta Performance',
      'Backups Diários Externos + Firewall WAF Dedicada',
      'Acompanhamento Técnico VIP 24/7 por Especialistas',
    ],
    popular: false,
    available: true,
    active: true,
    promoBadge: 'Cloud VIP',
    badgeText: 'Alta Performance',
    sortOrder: 32,
  },

  // ================= 4. LICENÇAS MICROSOFT 365 E ANTIVÍRUS =================
  {
    id: 'lic-m365-personal',
    category: 'license',
    subCategory: 'Microsoft 365 Oficial',
    name: 'Microsoft 365 Personal & Family (Original)',
    subtitle: 'Word, Excel, PowerPoint, Outlook e 1 TB de nuvem OneDrive por utilizador',
    description:
      'Subscrição oficial Microsoft 365 para utilização em PC Windows, Mac, Tablet e Telemóvel, com atualizações contínuas e armazenamento seguro na nuvem.',
    priceKz: 48000,
    renewalPriceKz: 48000,
    billingCycle: 'Licença Anual',
    validityPeriod: '12 Meses (1 Ano)',
    devicesCount: 'Até 5 Dispositivos (PC, Mac, Telemóvel)',
    licenseType: 'Subscrição Oficial Microsoft 365',
    durationMonths: 12,
    maxActivations: 5,
    stockKeysCount: 18,
    imageUrl: '/src/assets/images/product_m365_personal_family_1795099172472.jpg',
    features: [
      'Aplicações Oficiais: Word, Excel, PowerPoint, Outlook e OneNote',
      '1 TB (1000 GB) de Armazenamento na Nuvem OneDrive',
      'Funciona em PC, Mac, iPhone, iPad e Android',
      'Chave / Subscrição 100% Original com Ativação Garantida',
      'Suporte Remoto Gratuito para Instalação e Ativação',
    ],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Licença Oficial',
    badgeText: 'Licença Oficial',
    sortOrder: 40,
  },
  {
    id: 'lic-m365-business',
    category: 'license',
    subCategory: 'Microsoft 365 Corporativo',
    name: 'Microsoft 365 Business Standard / Apps for Business',
    subtitle: 'Produtividade corporativa completa com Teams, Exchange e aplicações Office Desktop',
    description:
      'Solução empresarial oficial da Microsoft para equipas e negócios que exigem colaboração profissional, segurança de dados e conformidade.',
    priceKz: 95000,
    renewalPriceKz: 95000,
    billingCycle: 'Licença Anual',
    validityPeriod: '12 Meses (1 Ano)',
    devicesCount: '1 Utilizador (5 Dispositivos)',
    licenseType: 'Licença Corporativa Microsoft CSP',
    durationMonths: 12,
    maxActivations: 5,
    stockKeysCount: 14,
    imageUrl: '/src/assets/images/product_m365_business_1795099172521.jpg',
    features: [
      'Versões Desktop Completas do Office para até 5 dispositivos por utilizador',
      'Microsoft Teams, SharePoint e 1 TB OneDrive Corporativo',
      'Segurança empresarial e gestão centralizada',
      'Fatura comercial emitida pela Muatxissombo Soluções Digitais',
      'Configuração assistida pela nossa equipa técnica',
    ],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Empresas',
    badgeText: 'Empresas',
    sortOrder: 41,
  },
  {
    id: 'lic-defender-endpoint',
    category: 'license',
    subCategory: 'Microsoft 365 & Antivírus Endpoint',
    name: 'Microsoft Defender para Empresas & Endpoint',
    subtitle: 'Proteção empresarial inteligente contra ransomware, phishing e ataques cibernéticos',
    description:
      'Segurança de nível empresarial da Microsoft para proteger postos de trabalho e servidores contra ameaças avançadas em tempo real.',
    priceKz: 55000,
    renewalPriceKz: 55000,
    billingCycle: 'Licença Anual',
    validityPeriod: '12 Meses (1 Ano)',
    devicesCount: '1 Endpoint / Estação de Trabalho',
    licenseType: 'Subscrição Oficial Microsoft Security',
    durationMonths: 12,
    maxActivations: 1,
    stockKeysCount: 12,
    imageUrl: '/src/assets/images/product_microsoft_defender_1795099172376.jpg',
    features: [
      'Defesa proativa contra Ransomware e Malware sem ficheiro',
      'Proteção de identidade e navegação segura contra Phishing',
      'Integração nativa com Windows 10 e Windows 11 Pro',
      'Monitorização e relatórios de segurança',
    ],
    popular: false,
    available: true,
    active: true,
    sortOrder: 42,
  },
  {
    id: 'lic-kaspersky',
    category: 'license',
    subCategory: 'Antivírus & Cibersegurança',
    name: 'Kaspersky Standard / Plus / Endpoint Security',
    subtitle: 'Proteção premiada mundialmente contra vírus, trojans, fraudes bancárias e hackers',
    description:
      'Licença original Kaspersky de 1 ano para proteção completa do seu computador ou rede empresarial, sem abrandar o desempenho do sistema.',
    priceKz: 29500,
    renewalPriceKz: 29500,
    billingCycle: 'Licença Anual',
    validityPeriod: '12 Meses (1 Ano)',
    devicesCount: '1 PC / Estação de Trabalho',
    licenseType: 'Chave Digital Original Kaspersky',
    durationMonths: 12,
    maxActivations: 1,
    stockKeysCount: 25,
    imageUrl: '/src/assets/images/product_kaspersky_antivirus_1795099172174.jpg',
    features: [
      'Antivírus em Tempo Real e Anti-Ransomware Avançado',
      'Módulo Safe Money para proteção em Homebanking e Pagamentos Online',
      'Firewall bidirecional e bloqueio de ataques de rede',
      'Chave de Ativação Oficial de 12 Meses + Guia de Instalação',
    ],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Mais Vendido',
    badgeText: 'Mais Vendido',
    sortOrder: 43,
  },
  {
    id: 'lic-eset',
    category: 'license',
    subCategory: 'Antivírus & Cibersegurança',
    name: 'ESET NOD32 Antivirus / Internet Security',
    subtitle: 'Máxima leveza, velocidade e deteção proativa para computadores novos ou antigos',
    description:
      'Reconhecido pela sua extrema eficiência e baixo consumo de memória, o ESET NOD32 protege o seu PC sem qualquer impacto na velocidade de trabalho.',
    priceKz: 28000,
    renewalPriceKz: 28000,
    billingCycle: 'Licença Anual',
    validityPeriod: '12 Meses (1 Ano)',
    devicesCount: '1 PC Windows / macOS',
    licenseType: 'Chave Digital Oficial ESET',
    durationMonths: 12,
    maxActivations: 1,
    stockKeysCount: 20,
    imageUrl: '/src/assets/images/product_eset_antivirus_1795099172513.jpg',
    features: [
      'Motor Antivírus e Anti-Spyware ultra-leve',
      'Proteção contra exploits, scripts maliciosos e pendrives infetadas',
      'Modo de apresentação e trabalho sem interrupções',
      'Licença Anual Original com entrega digital após confirmação',
    ],
    popular: false,
    available: true,
    active: true,
    sortOrder: 44,
  },
  {
    id: 'lic-bitdefender',
    category: 'license',
    subCategory: 'Antivírus & Cibersegurança',
    name: 'Bitdefender Total Security (Multi-Dispositivo)',
    subtitle: 'Blindagem total para Windows, macOS, Android e iOS numa única licença',
    description:
      'Defesa multicamada contra todas as ameaças digitais modernas, incluindo proteção de webcam, microfone e ficheiros confidenciais.',
    priceKz: 34000,
    renewalPriceKz: 34000,
    billingCycle: 'Licença Anual',
    validityPeriod: '12 Meses (1 Ano)',
    devicesCount: 'Até 3 Dispositivos (PC, Mac, Mobile)',
    licenseType: 'Subscrição Oficial Bitdefender Central',
    durationMonths: 12,
    maxActivations: 3,
    stockKeysCount: 16,
    imageUrl: '/src/assets/images/product_bitdefender_antivirus_1795099172687.jpg',
    features: [
      'Cobertura até 3 Dispositivos (PC, Mac ou Smartphone)',
      'Proteção Multi-Camada contra Ransomware e Roubo de Dados',
      'Otimizador de sistema OneClick e Proteção Wi-Fi',
      'Ativação oficial na conta Bitdefender Central',
    ],
    popular: false,
    available: true,
    active: true,
    sortOrder: 45,
  },

  // ================= 5. ASSISTÊNCIA INFORMÁTICA PRESENCIAL E REMOTA =================
  {
    id: 'ast-windows',
    category: 'assistance',
    subCategory: 'Sistemas Operativos · Presencial ou Guiado',
    name: 'Instalação e Configuração de Windows 10 e Windows 11',
    subtitle: 'Sistema operativo limpo, atualizado, rápido e configurado conforme as melhores práticas',
    description:
      'Instalação profissional de Windows 10 ou Windows 11 (Home, Pro ou Enterprise), com todas as atualizações críticas de segurança e otimização de arranque.',
    priceKz: 20000,
    billingCycle: 'Intervenção Única',
    imageUrl: '/src/assets/images/assist_windows_install_1795099778769.jpg',
    features: [
      'Instalação limpa ou atualização sem perda de compatibilidade',
      'Configuração completa de idioma, rede, segurança e contas de utilizador',
      'Otimização de serviços do sistema para máximo desempenho',
      'Disponível Presencialmente em Luanda ou Apoio Técnico Guiado',
    ],
    popular: true,
    available: true,
    active: true,
    sortOrder: 50,
  },
  {
    id: 'ast-formatacao-backup',
    category: 'assistance',
    subCategory: 'Formatação & Salvaguarda de Dados',
    name: 'Formatação Segura com Backup de Dados',
    subtitle: 'Recupere a velocidade original do seu computador sem perder documentos, fotos ou faturas',
    description:
      'Salvaguardamos previamente todos os seus ficheiros importantes, formatamos o disco, reinstalamos o sistema e devolvemos os seus dados organizados.',
    priceKz: 25000,
    billingCycle: 'Intervenção Única',
    imageUrl: '/src/assets/images/assist_backup_format_1795099780958.jpg',
    features: [
      'Cópia de segurança integral (Documentos, Ambiente de Trabalho, Fotos, E-mails)',
      'Particionamento correto de discos SSD e HDD',
      'Reinstalação de sistema e programas essenciais do dia a dia',
      'Garantia de confidencialidade e integridade dos dados',
    ],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Serviço Essencial',
    badgeText: 'Serviço Essencial',
    sortOrder: 51,
  },
  {
    id: 'ast-drivers-perifericos',
    category: 'assistance',
    subCategory: 'Periféricos, Drivers & Impressoras',
    name: 'Instalação de Drivers e Configuração de Impressoras',
    subtitle: 'Placa gráfica, som, Wi-Fi, Bluetooth, impressoras USB/Rede e scanners multifunções',
    description:
      'Resolvemos falhas de componentes que não funcionam após formatação e configuramos impressoras e scanners em rede para todo o escritório.',
    priceKz: 15000,
    billingCycle: 'Intervenção Única',
    imageUrl: '/src/assets/images/assist_drivers_printers_1795099780189.jpg',
    features: [
      'Drivers oficiais de fabricante (HP, Dell, Lenovo, Asus, Acer, Canon, Epson)',
      'Configuração de impressoras partilhadas por Wi-Fi ou cabo de rede',
      'Configuração de digitalização (Scan) direta para pasta no computador',
      'Atendimento Remoto Imediato (AnyDesk / TeamViewer) ou Presencial',
    ],
    popular: false,
    available: true,
    active: true,
    sortOrder: 52,
  },
  {
    id: 'ast-office-config',
    category: 'assistance',
    subCategory: 'Produtividade & Nuvem OneDrive',
    name: 'Instalação e Configuração do Pacote Microsoft Office',
    subtitle: 'Word, Excel, PowerPoint, Outlook e sincronização segura com OneDrive',
    description:
      'Deixamos o seu pacote de produtividade pronto a trabalhar, com modelos configurados, corretor ortográfico em Português e sincronização na nuvem.',
    priceKz: 15000,
    billingCycle: 'Intervenção Única',
    imageUrl: '/src/assets/images/assist_office_onedrive_1795099783004.jpg',
    features: [
      'Instalação completa das aplicações Office no PC ou Mac',
      'Configuração de dicionário e revisão em Português',
      'Ativação de licença e configuração de backup automático no OneDrive',
      'Suporte rápido por Acesso Remoto em minutos',
    ],
    popular: false,
    available: true,
    active: true,
    sortOrder: 53,
  },
  {
    id: 'ast-limpeza-virus',
    category: 'assistance',
    subCategory: 'Cibersegurança & Desinfeção',
    name: 'Instalação de Antivírus e Remoção Profunda de Vírus / Malware',
    subtitle: 'Eliminação de vírus de atalho, ransomware, anúncios intrusivos e lentidão extrema',
    description:
      'Desinfeção completa de computadores e pendrives infetadas, remoção de spyware e instalação de proteção antivírus ativa.',
    priceKz: 18000,
    billingCycle: 'Intervenção Única',
    imageUrl: '/src/assets/images/assist_antivirus_removal_1795099782962.jpg',
    features: [
      'Varredura profunda e eliminação de trojans, adware e vírus de pendrive',
      'Recuperação de ficheiros ocultados por vírus de atalho',
      'Instalação e parametrização de Antivírus Profissional',
      'Reforço de segurança do navegador e firewall do Windows',
    ],
    popular: false,
    available: true,
    active: true,
    sortOrder: 54,
  },
  {
    id: 'ast-softwares-especificos',
    category: 'assistance',
    subCategory: 'Software Técnico & Empresarial',
    name: 'Instalação de Softwares Essenciais e Profissionais',
    subtitle: 'Leitores PDF, compactadores, navegadores, ferramentas de gestão, engenharia e design',
    description:
      'Configuração completa das ferramentas de software necessárias para o funcionamento diário da sua empresa ou atividade profissional.',
    priceKz: 18000,
    billingCycle: 'Intervenção Única',
    imageUrl: '/src/assets/images/assist_pro_software_1795099783215.jpg',
    features: [
      'Pacote essencial (Adobe Acrobat PDF, WinRAR/7-Zip, Chrome, Zoom, Teams)',
      'Apoio na instalação de softwares técnicos, contabilísticos e académicos',
      'Verificação de requisitos de sistema e bibliotecas (Visual C++, .NET)',
      'Suporte Remoto ou Presencial',
    ],
    popular: false,
    available: true,
    active: true,
    sortOrder: 55,
  },
  {
    id: 'ast-email-corporativo',
    category: 'assistance',
    subCategory: 'Comunicação Corporativa & Outlook',
    name: 'Configuração de E-mail Corporativo (Outlook, Webmail e Telemóvel)',
    subtitle: 'Sincronize as contas @suaempresa.co.ao no computador e smartphone da sua equipa',
    description:
      'Configuração profissional de contas IMAP/SMTP/Exchange no Microsoft Outlook, Apple Mail, Android e iPhone, com assinatura digital corporativa.',
    priceKz: 15000,
    billingCycle: 'Intervenção Única',
    imageUrl: '/src/assets/images/assist_corporate_email_1795099783579.jpg',
    features: [
      'Configuração segura SSL/TLS no Microsoft Outlook e dispositivos móveis',
      'Migração e arquivo de e-mails antigos (.PST / .OST)',
      'Criação e inserção de assinatura de e-mail com logotipo da empresa',
      'Diagnóstico de entrega (SPF, DKIM e DMARC)',
    ],
    popular: false,
    available: true,
    active: true,
    sortOrder: 56,
  },
  {
    id: 'ast-manutencao-otimizacao',
    category: 'assistance',
    subCategory: 'Manutenção Preventiva & Tuning',
    name: 'Manutenção Preventiva e Otimização de Desempenho',
    subtitle: 'Acelere computadores lentos, liberte espaço em disco e evite avarias inesperadas',
    description:
      'Intervenção técnica completa para eliminar ficheiros temporários, corrigir erros de disco, otimizar memória RAM e verificar a saúde do hardware.',
    priceKz: 18000,
    billingCycle: 'Intervenção Única',
    imageUrl: '/src/assets/images/assist_pc_optimization_1795099784582.jpg',
    features: [
      'Limpeza profunda de sistema, registo e arranque do Windows',
      'Diagnóstico de saúde do disco SSD/HDD e temperatura do processador',
      'Atualização de sistema e remoção de programas desnecessários (Bloatware)',
      'Planos avulsos ou contratos mensais para parques informáticos de empresas',
    ],
    popular: false,
    available: true,
    active: true,
    sortOrder: 57,
  },
  {
    id: 'ast-remoto-imediato',
    category: 'assistance',
    subCategory: 'Acesso Remoto Seguro (AnyDesk / TeamViewer)',
    name: 'Suporte Técnico Remoto Imediato (AnyDesk / TeamViewer)',
    subtitle: 'Resolução rápida de problemas informáticos à distância em qualquer província de Angola',
    description:
      'Um técnico especialista da Muatxissombo liga-se de forma segura ao seu computador para resolver erros de software, e-mail, impressoras ou configurações na hora.',
    priceKz: 12000,
    billingCycle: 'Intervenção Remota',
    imageUrl: '/src/assets/images/assist_remote_support_1795099784252.jpg',
    features: [
      'Atendimento rápido sem necessidade de deslocação',
      'Ligação encriptada e acompanhada em tempo real pelo cliente',
      'Disponível para todas as 18 províncias de Angola',
      'Pagamento fácil via Multicaixa Express ou Transferência',
    ],
    popular: true,
    available: true,
    active: true,
    promoBadge: 'Atendimento Rápido',
    badgeText: 'Atendimento Rápido',
    sortOrder: 58,
  },
];

const OFFICIAL_DOMAIN_PRICE_MAP: Record<string, { priceKz: number; renewalPriceKz: number }> = {
  '.co.ao': { priceKz: 50000, renewalPriceKz: 50000 },
  '.ao': { priceKz: 50000, renewalPriceKz: 50000 },
  '.com': { priceKz: 38000, renewalPriceKz: 40000 },
  '.net': { priceKz: 41000, renewalPriceKz: 43000 },
  '.org': { priceKz: 39000, renewalPriceKz: 41000 },
  '.online': { priceKz: 36000, renewalPriceKz: 39000 },
  '.pro': { priceKz: 42000, renewalPriceKz: 44000 },
  '.site': { priceKz: 35000, renewalPriceKz: 38000 },
  '.store': { priceKz: 44000, renewalPriceKz: 46000 },
  '.info': { priceKz: 37000, renewalPriceKz: 40000 },
  '.tech': { priceKz: 46000, renewalPriceKz: 46000 },
};

export function normalizeDomainCatalogPrices(items: CatalogItemData[]): CatalogItemData[] {
  return items.map((item) => {
    if (item.category !== 'domain_tld' && item.category !== 'domain') return item;
    const rawExt = (item.extension || item.name || '').trim().toLowerCase();
    const ext = rawExt.startsWith('.')
      ? rawExt
      : rawExt.includes('.')
      ? `.${rawExt.split('.').slice(1).join('.')}`
      : `.${rawExt}`;
    const mapped = OFFICIAL_DOMAIN_PRICE_MAP[ext];
    if (mapped) {
      return {
        ...item,
        priceKz: mapped.priceKz,
        renewalPriceKz: mapped.renewalPriceKz,
      };
    }
    if (ext === '.ao' || ext === '.co.ao') {
      return { ...item, priceKz: 50000, renewalPriceKz: 50000 };
    }
    const clampedPrice = Math.min(46000, Math.max(35000, item.priceKz || 38000));
    const clampedRenewal = Math.min(46000, Math.max(35000, item.renewalPriceKz || clampedPrice));
    return {
      ...item,
      priceKz: clampedPrice,
      renewalPriceKz: clampedRenewal,
    };
  });
}

export function formatKz(amount: number): string {
  return `${Number(amount || 0).toLocaleString('pt-AO')} Kz`;
}
