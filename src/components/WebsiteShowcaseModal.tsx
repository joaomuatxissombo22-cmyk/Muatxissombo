import React, { useState } from 'react';
import {
  Globe,
  Check,
  ArrowRight,
  ExternalLink,
  X,
} from 'lucide-react';
import { CatalogItemData, formatKz } from '../defaultCatalog';
import { REAL_WEBSITE_TEMPLATES } from '../websiteTemplates';

export interface WebsiteQuoteFormPayload {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  websiteType: string;
  companyName: string;
  projectName: string;
  description: string;
  desiredFeatures: string;
  availableBudgetKz: number;
  desiredDomain: string;
  needsHosting: boolean;
  referenceNotes: string;
}

interface WebsiteShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedType?: string;
  preselectedReference?: string;
  websiteServices: CatalogItemData[];
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  defaultCompany?: string;
  onSubmitQuote: (payload: WebsiteQuoteFormPayload) => Promise<void>;
}

const SUPPLEMENTARY_EXAMPLES = [
  {
    id: 'ex-ecommerce',
    domainLabel: 'loja.kilambaelectro.co.ao',
    liveUrl: '',
    type: 'Lojas Online (E-commerce Completo em Kz)',
    title: 'Kilamba Electro & Tecnologia – Loja Online AOA',
    sector: 'Retalho Electrónico · Pagamento Multicaixa Express',
    metrics: 'Checkout em Kwanzas (AOA) com cálculo de entrega e gestão de stock',
    image: '/src/assets/images/service_ecommerce_aoa_1795098510519.jpg',
    highlights: ['Catálogo em Kwanzas', 'Multicaixa Express & IBAN', 'Fatura Automática', 'Controlo de Stock'],
  },
  {
    id: 'ex-custom-portal',
    domainLabel: 'portal.grupoatlas.co.ao',
    liveUrl: '',
    type: 'Portais e Plataformas Web Personalizadas',
    title: 'Grupo Atlas – Portal de Serviços & Área de Clientes',
    sector: 'Engenharia, Saúde & Serviços Corporativos',
    metrics: 'Arquitetura multi-utilizador com painéis privados e notificações por e-mail',
    image: '/src/assets/images/hero_cloud_agency_1795098510527.jpg',
    highlights: ['Área Privada de Clientes', 'Painel Administrativo', 'Pré-Marcações 24/7', 'Relatórios & Faturas'],
  },
];

const SHOWCASE_EXAMPLES = [
  ...REAL_WEBSITE_TEMPLATES.map((tpl) => ({
    id: tpl.id,
    domainLabel: tpl.domainLabel,
    liveUrl: tpl.liveUrl,
    type: tpl.websiteType,
    title: tpl.title,
    sector: tpl.sector,
    metrics: tpl.metrics,
    image: tpl.image,
    highlights: tpl.highlights,
  })),
  ...SUPPLEMENTARY_EXAMPLES,
];

const DESIRED_FEATURE_OPTIONS = [
  'Design Responsivo (PC, Tablet e Telemóvel)',
  'Botão de Atendimento WhatsApp Direto',
  'Otimização SEO para Google em Angola',
  'Contas de E-mail Corporativo (@suaempresa)',
  'Loja Online com Pagamentos em Kwanzas (Kz)',
  'Sistema de Marcação / Agendamento Online',
  'Área Restrita de Clientes / Portal',
  'Painel Administrativo de Gestão de Conteúdos',
  'Blog / Notícias Institucionais',
  'Multi-idioma (Português / Inglês / Francês)',
];

export const WebsiteShowcaseModal: React.FC<WebsiteShowcaseModalProps> = ({
  isOpen,
  onClose,
  preselectedType,
  preselectedReference,
  websiteServices,
  defaultName = '',
  defaultEmail = '',
  defaultPhone = '',
  defaultCompany = '',
  onSubmitQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'examples'>('form');
  const [clientName, setClientName] = useState(defaultName);
  const [clientEmail, setClientEmail] = useState(defaultEmail);
  const [clientPhone, setClientPhone] = useState(defaultPhone);
  const [websiteType, setWebsiteType] = useState(
    preselectedType || websiteServices[0]?.name || 'Websites Empresariais de Alta Conversão'
  );
  const [companyName, setCompanyName] = useState(defaultCompany);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Design Responsivo (PC, Tablet e Telemóvel)',
    'Botão de Atendimento WhatsApp Direto',
    'Otimização SEO para Google em Angola',
  ]);
  const [customFeatures, setCustomFeatures] = useState('');
  const [availableBudgetKz, setAvailableBudgetKz] = useState('265000');
  const [desiredDomain, setDesiredDomain] = useState('');
  const [needsHosting, setNeedsHosting] = useState(true);
  const [referenceNotes, setReferenceNotes] = useState(preselectedReference || '');
  const [attachmentFileName, setAttachmentFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (preselectedType) {
      setWebsiteType(preselectedType);
      const matched = websiteServices.find((s) => s.name === preselectedType);
      if (matched) {
        setAvailableBudgetKz(String(matched.priceKz));
      }
    }
  }, [preselectedType, websiteServices]);

  React.useEffect(() => {
    if (isOpen) {
      if (preselectedReference !== undefined) {
        setReferenceNotes(preselectedReference);
      }
      setActiveTab('form');
    }
  }, [isOpen, preselectedReference]);

  React.useEffect(() => {
    if (defaultName && !clientName) setClientName(defaultName);
    if (defaultEmail && !clientEmail) setClientEmail(defaultEmail);
    if (defaultPhone && !clientPhone) setClientPhone(defaultPhone);
    if (defaultCompany && !companyName) setCompanyName(defaultCompany);
  }, [defaultName, defaultEmail, defaultPhone, defaultCompany]);

  if (!isOpen) return null;

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFileName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim() || !description.trim()) {
      setErrorMsg('Por favor preencha o seu nome, e-mail, telefone e a descrição do projecto.');
      return;
    }

    const combinedFeatures = [
      ...selectedFeatures,
      customFeatures.trim() ? `Adicional: ${customFeatures.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' · ')
      .slice(0, 950);

    const combinedReferences = [
      referenceNotes.trim(),
      attachmentFileName ? `Documento anexado: ${attachmentFileName}` : '',
    ]
      .filter(Boolean)
      .join(' | ')
      .slice(0, 480);

    setSubmitting(true);
    try {
      await onSubmitQuote({
        clientName: clientName.trim().slice(0, 120),
        clientEmail: clientEmail.trim().slice(0, 160),
        clientPhone: clientPhone.trim().slice(0, 40),
        websiteType: websiteType.slice(0, 120),
        companyName: (companyName.trim() || clientName.trim()).slice(0, 120),
        projectName: (projectName.trim() || `Website ${companyName.trim() || clientName.trim()}`).slice(0, 140),
        description: description.trim().slice(0, 1950),
        desiredFeatures: combinedFeatures,
        availableBudgetKz: Math.max(0, Number(availableBudgetKz) || 0),
        desiredDomain: desiredDomain.trim().slice(0, 120),
        needsHosting,
        referenceNotes: combinedReferences,
      });
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar o pedido. Verifique se iniciou sessão na sua conta.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#0B5ED7]">
              Muatxissombo Soluções Digitais · Contratação de Website Profissional
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              Solicitar Criação de Website ou Plataforma Digital
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'form'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Formulário de Contratação
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('examples')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'examples'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Galeria de Exemplos ({SHOWCASE_EXAMPLES.length})
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'examples' ? (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Templates Reais & Projectos Desenvolvidos pela Muatxissombo
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Explore os nossos portais publicados e selecione qualquer template como base para o orçamento do seu website.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SHOWCASE_EXAMPLES.map((ex) => (
                <div
                  key={ex.id}
                  className="group border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between bg-white hover:border-[#0B5ED7] hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* Browser Chrome Bar */}
                    <div className="bg-slate-900 px-3.5 py-2 flex items-center justify-between gap-2 text-[11px] font-mono-tabular text-slate-300 border-b border-slate-800">
                      <span className="truncate flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-[#28A9E0] shrink-0" />
                        <span className="truncate">{ex.domainLabel}</span>
                      </span>
                      {ex.liveUrl ? (
                        <a
                          href={ex.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#28A9E0] hover:text-white inline-flex items-center gap-1 shrink-0 font-sans font-semibold"
                        >
                          <span>Visitar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 shrink-0">Demo</span>
                      )}
                    </div>

                    {/* High-Resolution Website Preview Image */}
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={ex.image}
                        alt={ex.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/85 via-[#071426]/15 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <div className="text-[11px] font-semibold text-[#28A9E0] truncate">
                          {ex.sector}
                        </div>
                        <div className="text-sm font-bold leading-snug">{ex.title}</div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="text-xs text-slate-500">{ex.type}</div>
                      <p className="text-xs font-medium text-slate-700">{ex.metrics}</p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {ex.highlights.map((h) => (
                          <div
                            key={h}
                            className="bg-[#F4F7FB] border border-slate-200/80 rounded px-2 py-1 text-[11px] text-slate-700 truncate"
                          >
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWebsiteType(ex.type);
                        setReferenceNotes(
                          `Template de referência: ${ex.domainLabel} (${ex.title})`
                        );
                        setActiveTab('form');
                      }}
                      className="flex-1 py-2 px-3 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Usar Este Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {ex.liveUrl && (
                      <a
                        href={ex.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-[#F4F7FB] border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg hover:border-[#0B5ED7] hover:text-[#0B5ED7] transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Ver Site</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Dados do Cliente e Empresa */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                01. Identificação do Cliente ou Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome do Cliente ou Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex.: Eng. João Baptista"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome da Empresa / Instituição *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex.: Kuanza Logística Lda."
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    E-mail Profissional ou Pessoal *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@suaempresa.co.ao"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Telefone / WhatsApp (Angola) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+244 923 000 000"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Especificações do Website */}
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                02. Tipo de Website, Domínio, Hospedagem e Orçamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tipo de Website Pretendido *
                  </label>
                  <select
                    value={websiteType}
                    onChange={(e) => {
                      setWebsiteType(e.target.value);
                      const matched = websiteServices.find((s) => s.name === e.target.value);
                      if (matched) setAvailableBudgetKz(String(matched.priceKz));
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                  >
                    {websiteServices.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name} ({formatKz(service.priceKz)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome do Projecto / Marca
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ex.: Portal Corporativo Kuanza 2026"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Domínio Pretendido (Ex.: suaempresa.co.ao ou .com)
                  </label>
                  <input
                    type="text"
                    value={desiredDomain}
                    onChange={(e) => setDesiredDomain(e.target.value)}
                    placeholder="Ex.: kuanzalogistica.co.ao"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Orçamento Disponível Estimado (Kz / AOA)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={availableBudgetKz}
                    onChange={(e) => setAvailableBudgetKz(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-6 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <span className="text-xs font-medium text-slate-700">
                  Necessita de Plano de Hospedagem Web & SSL?
                </span>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      checked={needsHosting === true}
                      onChange={() => setNeedsHosting(true)}
                      className="accent-[#0B5ED7]"
                    />
                    Sim, incluir hospedagem Hostinger + SSL + E-mails
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      checked={needsHosting === false}
                      onChange={() => setNeedsHosting(false)}
                      className="accent-[#0B5ED7]"
                    />
                    Não, já possuo servidor de alojamento
                  </label>
                </div>
              </div>
            </div>

            {/* Step 3: Funcionalidades e Descrição */}
            <div className="border-t border-slate-200 pt-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                03. Funcionalidades Desejadas e Descrição do Projecto
              </h3>
              <div>
                <span className="block text-xs font-medium text-slate-700 mb-2">
                  Selecione as funcionalidades que pretende incluir:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DESIRED_FEATURE_OPTIONS.map((feat) => {
                    const active = selectedFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors flex items-center justify-between gap-2 ${
                          active
                            ? 'bg-blue-50/80 border-[#0B5ED7] text-slate-900 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{feat}</span>
                        {active && <Check className="w-3.5 h-3.5 text-[#0B5ED7] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Descrição Detalhada do Projecto e Objectivos *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as páginas pretendidas, público-alvo em Angola, produtos/serviços a destacar e prazos desejados..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Links de Referência ou Websites de Inspiração
                  </label>
                  <input
                    type="text"
                    value={referenceNotes}
                    onChange={(e) => setReferenceNotes(e.target.value)}
                    placeholder="Ex.: www.exemplo.com ou cores da marca"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Anexar Caderno de Encargos, Logótipo ou Referência
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-xs file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                  />
                  {attachmentFileName && (
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Ficheiro registado: {attachmentFileName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Após submeter, o pedido entra de imediato em análise no Painel Administrativo e poderá acompanhar cada etapa em tempo real no seu Painel do Cliente.
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0B5ED7] rounded-lg hover:bg-[#094bb0] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  {submitting ? 'A Submeter Pedido...' : 'Submeter Pedido de Website'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
