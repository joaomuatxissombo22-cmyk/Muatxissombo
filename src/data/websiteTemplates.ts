export interface RealWebsiteTemplate {
  id: string;
  domainLabel: string;
  liveUrl: string;
  title: string;
  websiteType: string;
  sector: string;
  stackLabel: string;
  description: string;
  metrics: string;
  image: string;
  highlights: string[];
}

export const REAL_WEBSITE_TEMPLATES: RealWebsiteTemplate[] = [
  {
    id: 'tpl-biosfera',
    domainLabel: 'biosfera.ao',
    liveUrl: 'https://biosfera.ao',
    title: 'Biosfera.ao – Portal Institucional & Ambiental',
    websiteType: 'Sites Institucionais e Corporativos',
    sector: 'Sustentabilidade, Ambiente & Projetos em Angola',
    stackLabel: 'Domínio Oficial .AO · SSL Ativo',
    description:
      'Portal institucional moderno desenvolvido para o mercado angolano com estrutura editorial limpa, apresentação de projetos ambientais, relatórios técnicos e navegação rápida adaptada a dispositivos móveis.',
    metrics: 'Design responsivo · Otimizado para motores de busca em Angola (Google.co.ao)',
    image: '/src/assets/images/template_biosfera_ao_1795098510442.jpg',
    highlights: [
      'Identidade Institucional .AO',
      'Catálogo de Projetos & Estudos',
      'Formulário Corporativo Direto',
      'SEO Técnico Angola',
    ],
  },
  {
    id: 'tpl-alhan',
    domainLabel: 'alhan.pro',
    liveUrl: 'https://alhan.pro',
    title: 'Alhan.pro – Plataforma Profissional & Consultoria Executiva',
    websiteType: 'Portais e Plataformas Web Personalizadas',
    sector: 'Serviços Profissionais, Engenharia & Consultoria B2B',
    stackLabel: 'Domínio .PRO · Arquitetura Corporativa',
    description:
      'Template executivo de alto padrão criado sob o domínio alhan.pro, projetado para empresas de consultoria, especialistas e negócios B2B que exigem credibilidade internacional e captação qualificada de clientes.',
    metrics: 'Estrutura de alta autoridade · Integração rápida com WhatsApp e E-mail Corporativo',
    image: '/src/assets/images/template_alhan_pro_1795098510010.jpg',
    highlights: [
      'Apresentação Executiva B2B',
      'Captação de Clientes & Orçamentos',
      'Performance NVMe Cloud',
      'Design Dark/Light Profissional',
    ],
  },
  {
    id: 'tpl-luatantola',
    domainLabel: 'lutangola.co.ao',
    liveUrl: 'https://lutangola.co.ao/',
    title: 'Lutangola – Portal Empresarial & Serviços em Angola',
    websiteType: 'Sites Institucionais e Corporativos',
    sector: 'Portal Corporativo & Serviços Digitais · Angola',
    stackLabel: 'Domínio .CO.AO · Alta Conversão',
    description:
      'Template empresarial dinâmico desenvolvido para a Lutangola (lutangola.co.ao), focado em apresentação clara de serviços corporativos, posicionamento comercial em Angola, velocidade elevada e conversão direta de clientes.',
    metrics: 'Fluxo orientado a orçamentos · Responsivo para telemóveis, tablets e computadores',
    image: '/src/assets/images/template_luatantola_web_1795098511437.jpg',
    highlights: [
      'Domínio Oficial lutangola.co.ao',
      'Secções Comerciais Modulares',
      'Botão WhatsApp Direto',
      'Carregamento Ultra-Rápido',
    ],
  },
  {
    id: 'tpl-elite-hostinger',
    domainLabel: 'elite-mediumspringgreen-jaguar-09.hostingersite.com',
    liveUrl: 'https://elite-mediumspringgreen-jaguar-09.hostingersite.com/',
    title: 'Elite Showcase – Template Digital Hostinger',
    websiteType: 'Lojas Online (E-commerce Completo em Kz)',
    sector: 'Template Comercial Moderno · Cloud Hostinger',
    stackLabel: 'Hostinger Cloud · Showcase',
    description:
      'Template web moderno publicado em infraestrutura Hostinger, concebido para marcas digitais, portfólios comerciais e lojas de alto impacto visual com navegação fluida.',
    metrics: 'Ambiente demonstrativo ativo · Pronto para personalização completa com a sua marca',
    image: '/src/assets/images/template_elite_hostinger_1795098509112.jpg',
    highlights: [
      'Design Visual de Alto Impacto',
      'Alojamento Hostinger NVMe',
      'Secções de Catálogo & Ofertas',
      'Pronto para Personalizar',
    ],
  },
];

export interface RegisteredDomainPortfolio {
  domain: string;
  url: string;
  organization: string;
  sector: string;
  statusLabel: string;
}

export const REGISTERED_MUATXISSOMBO_DOMAINS: RegisteredDomainPortfolio[] = [
  {
    domain: 'muatxissombosolution.online',
    url: 'https://muatxissombosolution.online',
    organization: 'Muatxissombo Soluções Digitais',
    sector: 'Domínio Institucional · E-mail: info@muatxissombosolution.online',
    statusLabel: 'Domínio Oficial · DNS & E-mail Corporativo',
  },
  {
    domain: 'lutangola.co.ao',
    url: 'https://lutangola.co.ao/',
    organization: 'Lutangola',
    sector: 'Portal Corporativo & Serviços Empresariais · Angola',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
  {
    domain: 'biosfera.ao',
    url: 'https://biosfera.ao',
    organization: 'Biosfera – Consultoria Ambiental',
    sector: 'Sustentabilidade, Ambiente & Projetos · Angola',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
  {
    domain: 'aris-travel.com',
    url: 'https://aris-travel.com',
    organization: 'Aris Travel',
    sector: 'Agência de Viagens, Turismo & Mobilidade',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
  {
    domain: 'sunambiente.com',
    url: 'https://sunambiente.com',
    organization: 'Sun Ambiente',
    sector: 'Gestão Ambiental, Energia & Sustentabilidade',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
  {
    domain: 'academiafg.com',
    url: 'https://academiafg.com',
    organization: 'Academia FG',
    sector: 'Educação, Formação Profissional & Capacitação',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
  {
    domain: 'chinzalda.com',
    url: 'https://chinzalda.com',
    organization: 'Chinzalda',
    sector: 'Comércio Geral, Serviços & Soluções Empresariais',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
  {
    domain: 'proamb.pro',
    url: 'https://proamb.pro',
    organization: 'ProAmb',
    sector: 'Consultoria Ambiental & Engenharia Especializada',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
  {
    domain: 'tallentforge.com',
    url: 'https://tallentforge.com',
    organization: 'Tallent Forge',
    sector: 'Recrutamento, Desenvolvimento de Talentos & RH',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
  {
    domain: 'angotour.com',
    url: 'https://angotour.com',
    organization: 'AngoTour',
    sector: 'Turismo em Angola, Roteiros & Hospitalidade',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
  {
    domain: 'alhan.pro',
    url: 'https://alhan.pro',
    organization: 'Alhan Professional Services',
    sector: 'Consultoria Executiva, Tecnologia & Serviços B2B',
    statusLabel: 'Cadastrado pela Muatxissombo · SSL Ativo',
  },
];

// Alias de compatibilidade
export const REAL_WEBSITE_TEMPLATES_MAUTXISSOMBO_DOMAINS = REGISTERED_MUATXISSOMBO_DOMAINS;
