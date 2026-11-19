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
    id: 'tpl-alhan',
    domainLabel: 'alhan.pro',
    liveUrl: 'https://alhan.pro',
    title: 'ALHAN Consultoria – Sistemas de Gestão Integrados (SGI)',
    websiteType: 'Websites para Consultorias, Contabilidade e Advocacia',
    sector: 'Consultoria ISO 9001, 14001 & 45001 · Kilamba, Luanda',
    stackLabel: 'Corporativo B2B · SSL Ativo',
    description:
      'Portal corporativo oficial desenvolvido para consultoria empresarial em Sistemas de Gestão Integrados (SGI), auditorias ISO, formação técnica e capacitação de equipas em Angola.',
    metrics: 'Arquitetura executiva B2B · Captação direta de reuniões e diagnósticos empresariais',
    image: '/src/assets/images/template_alhan_pro_1795098510010.jpg',
    highlights: [
      'Normas ISO 9001 / 14001 / 45001',
      'Portal Corporativo Executivo',
      'Solicitação de Diagnóstico',
      'Alojamento Cloud & SSL',
    ],
  },
  {
    id: 'tpl-biosfera',
    domainLabel: 'biosfera.ao',
    liveUrl: 'https://biosfera.ao',
    title: 'Biosfera – Consultoria Ambiental & Sustentabilidade',
    websiteType: 'Websites Institucionais Profissionais',
    sector: 'Consultoria Ambiental · Kilamba Q19, Luanda',
    stackLabel: 'Domínio .AO · Institucional',
    description:
      'Website institucional desenvolvido para consultoria ambiental de referência em Angola, destacando estudos de impacto ambiental, sustentabilidade corporativa e portfólio técnico.',
    metrics: 'Domínio nacional .ao · Layout institucional limpo e otimizado para pesquisas no Google',
    image: '/src/assets/images/template_biosfera_ao_1795098510442.jpg',
    highlights: [
      'Estudos de Impacto Ambiental',
      'Portfólio de Projectos',
      'Identidade Institucional Verde',
      'Integração WhatsApp & E-mail',
    ],
  },
  {
    id: 'tpl-luatantola',
    domainLabel: 'luatantola.ao.co',
    liveUrl: 'https://luatantola.ao.co',
    title: 'Luatantola – Portal Empresarial & Serviços em Angola',
    websiteType: 'Websites Empresariais de Alta Conversão',
    sector: 'Portal Corporativo & Serviços Digitais · Angola',
    stackLabel: 'Alta Conversão · Mobile-First',
    description:
      'Template empresarial dinâmico focado em apresentação clara de serviços corporativos, posicionamento comercial em Angola, velocidade elevada e conversão direta de clientes.',
    metrics: 'Fluxo orientado a orçamentos · Responsivo para telemóveis, tablets e computadores',
    image: '/src/assets/images/template_luatantola_web_1795098511437.jpg',
    highlights: [
      'Secções Comerciais Modulares',
      'Botão WhatsApp Direto',
      'SEO Regional Configurado',
      'Carregamento Ultra-Rápido',
    ],
  },
  {
    id: 'tpl-elite-hostinger',
    domainLabel: 'elite-mediumspringgreen-jaguar-09.hostingersite.com',
    liveUrl: 'http://elite-mediumspringgreen-jaguar-09.hostingersite.com/',
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
