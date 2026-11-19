import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Globe,
  Server,
  KeyRound,
  CreditCard,
  FileText,
  Bell,
  User,
  Headphones,
  LogOut,
  Upload,
  ExternalLink,
  CheckCircle2,
  Clock,
  RefreshCw,
  Send,
  Star,
  Plus,
  Download,
} from 'lucide-react';
import { formatKz, PlatformSettingsData } from '../defaultCatalog';

export interface UserProfileRecord {
  uid: string;
  username?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  nif?: string;
  address?: string;
  role: 'client' | 'admin';
  status: 'active' | 'suspended';
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  itemsSummary: string;
  category: string;
  totalKz: number;
  paymentMethod: string;
  paymentProofName?: string;
  paymentProofRef?: string;
  paymentNotes?: string;
  status: string;
  assignedTo?: string;
  adminNotes?: string;
  invoiceNumber?: string;
  createdAt?: unknown;
}

export interface WebsiteProjectRecord {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string;
  websiteType: string;
  projectName: string;
  description: string;
  desiredFeatures?: string;
  availableBudgetKz?: number;
  desiredDomain?: string;
  needsHosting?: boolean;
  referenceNotes?: string;
  contractDate?: string;
  estimatedDeadline?: string;
  assignedLead?: string;
  devStatus: string;
  progressPercent: number;
  demoLink?: string;
  publishedLink?: string;
  accessInstructions?: string;
  internalNotes?: string;
  quotedPriceKz?: number;
  createdAt?: unknown;
}

export interface LicenseIssuedRecord {
  id: string;
  productName: string;
  supplier: string;
  licenseType: string;
  validityPeriod: string;
  devicesCount?: string;
  activationKey: string;
  activationInstructions: string;
  assignedUserId: string;
  assignedUserEmail?: string;
  assignedUserName?: string;
  orderId?: string;
  status: string;
  deliveredAt?: string;
}

export interface DomainRegisteredRecord {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  domainName: string;
  tld: string;
  registrationPriceKz: number;
  renewalPriceKz: number;
  registeredAt?: string;
  expiresAt: string;
  autoRenew: boolean;
  nameservers?: string;
  status: string;
  orderId?: string;
}

export interface SupportMessageRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  senderRole: 'client' | 'admin';
  subject: string;
  message: string;
  ticketStatus: 'Aberto' | 'Em Atendimento' | 'Resolvido';
  createdAt?: unknown;
}

export interface NotificationItemRecord {
  id: string;
  userId: string;
  recipientEmail: string;
  recipientName: string;
  eventType: string;
  subject: string;
  bodyPreview: string;
  deliveryChannel: string;
  status: string;
  createdAt?: unknown;
}

interface ClientDashboardProps {
  profile: UserProfileRecord;
  orders: OrderRecord[];
  websiteProjects: WebsiteProjectRecord[];
  licenses: LicenseIssuedRecord[];
  domains: DomainRegisteredRecord[];
  supportMessages: SupportMessageRecord[];
  notifications: NotificationItemRecord[];
  platformSettings: PlatformSettingsData;
  onUploadPaymentProof: (
    orderId: string,
    proofName: string,
    proofRef: string,
    notes: string
  ) => Promise<void>;
  onUpdateProfile: (data: {
    name: string;
    phone: string;
    company: string;
    nif: string;
    address: string;
  }) => Promise<void>;
  onChangePassword: (
    currentPassword: string,
    newPassword: string,
    newUsername?: string
  ) => Promise<void>;
  onSendSupportMessage: (subject: string, message: string) => Promise<void>;
  onToggleDomainAutoRenew: (domainId: string, autoRenew: boolean, nameservers: string) => Promise<void>;
  onSubmitFeedback: (serviceCategory: string, rating: number, comment: string, projectReference: string) => Promise<void>;
  onRequestNewWebsite: () => void;
  onLogout: () => void;
}

type ClientTab =
  | 'visao-geral'
  | 'pedidos'
  | 'websites'
  | 'dominios'
  | 'hospedagem'
  | 'licencas'
  | 'pagamentos'
  | 'faturas'
  | 'notificacoes'
  | 'feedback'
  | 'perfil'
  | 'suporte';

const WEBSITE_STAGE_STEPS = [
  'Orçamento Solicitado',
  'Em Análise',
  'Proposta Enviada',
  'Aguardando Pagamento',
  'Design & Prototipagem',
  'Em Desenvolvimento',
  'Testes & Revisão',
  'Concluído & Publicado',
];

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  profile,
  orders,
  websiteProjects,
  licenses,
  domains,
  supportMessages,
  notifications,
  platformSettings,
  onUploadPaymentProof,
  onUpdateProfile,
  onChangePassword,
  onSendSupportMessage,
  onToggleDomainAutoRenew,
  onSubmitFeedback,
  onRequestNewWebsite,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<ClientTab>('visao-geral');

  // Payment proof form state
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [proofFileName, setProofFileName] = useState('');
  const [proofRef, setProofRef] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');

  // Profile form state
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(
    profile.username || profile.email.split('@')[0] || 'cliente'
  );
  const [phone, setPhone] = useState(profile.phone || '');
  const [company, setCompany] = useState(profile.company || '');
  const [nif, setNif] = useState(profile.nif || '');
  const [address, setAddress] = useState(profile.address || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Support chat state
  const [supportSubject, setSupportSubject] = useState('Apoio Técnico / Encomenda');
  const [supportText, setSupportText] = useState('');

  // Feedback portal state
  const [fbCategory, setFbCategory] = useState('Criação de Websites');
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('');
  const [fbProjectRef, setFbProjectRef] = useState('');

  // Selected invoice for printable receipt modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderRecord | null>(null);

  // Dashboard Metrics (Section 6)
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) =>
    ['Aguardando pagamento', 'Pagamento em análise', 'Aguardando informações do cliente'].includes(o.status)
  ).length;
  const activeServices =
    orders.filter((o) => ['Pagamento confirmado', 'Em processamento', 'Em execução'].includes(o.status)).length +
    websiteProjects.filter((w) => !['Concluído & Publicado', 'Cancelado'].includes(w.devStatus)).length;
  const completedServices =
    orders.filter((o) => o.status === 'Concluído').length +
    websiteProjects.filter((w) => w.devStatus === 'Concluído & Publicado').length;
  const acquiredLicenses = licenses.length;
  const contractedDomains = domains.length;
  const hostingOrders = orders.filter(
    (o) =>
      o.category.toLowerCase().includes('hospedagem') ||
      o.itemsSummary.toLowerCase().includes('plano starter') ||
      o.itemsSummary.toLowerCase().includes('plano business') ||
      o.itemsSummary.toLowerCase().includes('plano premium')
  );

  const nextRenewalDate =
    domains.length > 0
      ? domains.map((d) => d.expiresAt).sort()[0]
      : hostingOrders.length > 0
      ? 'Renovação Anual Ativa'
      : 'Sem renovações pendentes';

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedOrderId || orders[0]?.id;
    if (!targetId || (!proofFileName && !proofRef)) return;
    setUploadingProof(true);
    try {
      await onUploadPaymentProof(
        targetId,
        proofFileName || 'Comprovativo_Bancario.pdf',
        proofRef,
        proofNotes
      );
      setProofFileName('');
      setProofRef('');
      setProofNotes('');
      setStatusFeedback('Comprovativo anexado com sucesso! O pagamento encontra-se agora em análise pelo administrador.');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile({ name, phone, company, nif, address });
    setStatusFeedback('Dados do perfil atualizados com sucesso.');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatusFeedback('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusFeedback('A confirmação da nova palavra-passe não coincide.');
      return;
    }
    setChangingPassword(true);
    try {
      await onChangePassword(currentPassword, newPassword, username.trim());
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusFeedback('Palavra-passe e credenciais do Painel do Cliente atualizadas com sucesso!');
    } catch (err) {
      setStatusFeedback(
        err instanceof Error
          ? err.message
          : 'Não foi possível alterar a palavra-passe. Verifique a senha atual.'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim()) return;
    await onSendSupportMessage(supportSubject, supportText);
    setSupportText('');
    setStatusFeedback('Mensagem enviada para a equipa de suporte técnico 24/7.');
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbComment.trim()) return;
    await onSubmitFeedback(fbCategory, fbRating, fbComment, fbProjectRef);
    setFbComment('');
    setFbProjectRef('');
    setStatusFeedback('Muito obrigado! A sua avaliação de qualidade foi registada no Portal de Feedbacks.');
  };

  const menuItems: { id: ClientTab; label: string; icon: React.ReactNode }[] = [
    { id: 'visao-geral', label: 'Visão Geral', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pedidos', label: 'Os Meus Pedidos', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'websites', label: 'Criação de Websites', icon: <Globe className="w-4 h-4" /> },
    { id: 'dominios', label: 'Meus Domínios', icon: <Globe className="w-4 h-4" /> },
    { id: 'hospedagem', label: 'Minha Hospedagem', icon: <Server className="w-4 h-4" /> },
    { id: 'licencas', label: 'Minhas Licenças', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'pagamentos', label: 'Pagamentos', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'faturas', label: 'Faturas', icon: <FileText className="w-4 h-4" /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell className="w-4 h-4" /> },
    { id: 'feedback', label: 'Avaliar Serviço (Feedback)', icon: <Star className="w-4 h-4" /> },
    { id: 'perfil', label: 'Meu Perfil & Alterar Senha', icon: <User className="w-4 h-4" /> },
    { id: 'suporte', label: 'Suporte Técnico 24/7', icon: <Headphones className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#F4F7FB] flex flex-col lg:flex-row">
      {/* Sidebar (260px - WHMCS / AngoCloud Portal Style) */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="px-3 py-3 bg-[#0A192F] text-white rounded-xl">
            <div className="text-[11px] text-[#28A9E0] font-semibold">Área do Cliente · Portal</div>
            <div className="text-sm font-bold truncate mt-0.5">{profile.name}</div>
            <div className="text-[11px] text-slate-300 truncate">{profile.email}</div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setStatusFeedback('');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-[#0B5ED7] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-[#F4F7FB] hover:text-[#0A192F]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 mt-6 border-t border-slate-200 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('perfil');
              setStatusFeedback('');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#0B5ED7] hover:bg-blue-50 rounded-lg transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            <span>Alterar Senha</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 max-w-6xl space-y-6">
        {statusFeedback && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-4 text-xs text-slate-800">
            <span>{statusFeedback}</span>
            <button
              type="button"
              onClick={() => setStatusFeedback('')}
              className="text-xs font-semibold text-[#0B5ED7] hover:underline"
            >
              Fechar
            </button>
          </div>
        )}

        {/* 1. VISÃO GERAL */}
        {activeTab === 'visao-geral' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0A192F]">
                  Painel do Cliente – Visão Geral
                </h1>
                <p className="text-sm text-slate-600">
                  Acompanhe os seus projetos web, encomendas, domínios, licenças e faturas em tempo real.
                </p>
              </div>
              <button
                type="button"
                onClick={onRequestNewWebsite}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                Solicitar Novo Website
              </button>
            </div>

            {/* 7 Key Indicators required by Section 6 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">Total de Encomendas</div>
                <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
                  {totalOrders}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">Pedidos Pendentes</div>
                <div className="text-2xl font-bold text-amber-600 font-mono-tabular mt-1">
                  {pendingOrders}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">Serviços em Execução</div>
                <div className="text-2xl font-bold text-[#0B5ED7] font-mono-tabular mt-1">
                  {activeServices}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">Serviços Concluídos</div>
                <div className="text-2xl font-bold text-emerald-600 font-mono-tabular mt-1">
                  {completedServices}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">Licenças Adquiridas</div>
                <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
                  {acquiredLicenses}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">Domínios Contratados</div>
                <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
                  {contractedDomains}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-2">
                <div className="text-xs text-slate-500">Próximas Datas de Renovação</div>
                <div className="text-sm font-semibold text-slate-900 font-mono-tabular mt-2">
                  {nextRenewalDate}
                </div>
              </div>
            </div>

            {/* Active Website Projects Snapshot */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Acompanhamento de Criação de Websites em Tempo Real
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('websites')}
                  className="text-xs font-semibold text-[#0B5ED7] hover:underline"
                >
                  Ver Detalhes Completos
                </button>
              </div>
              {websiteProjects.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-600 mb-3">
                    Ainda não tem projetos de criação de website ativos na sua conta.
                  </p>
                  <button
                    type="button"
                    onClick={onRequestNewWebsite}
                    className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
                  >
                    Solicitar Orçamento de Website
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {websiteProjects.slice(0, 2).map((proj) => (
                    <div key={proj.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{proj.projectName}</div>
                          <div className="text-xs text-slate-500">
                            {proj.websiteType} · Domínio: {proj.desiredDomain || 'A definir'}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-[#0B5ED7] font-mono-tabular">
                          Estado: {proj.devStatus} ({proj.progressPercent}%)
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0B5ED7] transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(5, proj.progressPercent))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Snapshot */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Encomendas Recentes</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('pedidos')}
                  className="text-xs font-semibold text-[#0B5ED7] hover:underline"
                >
                  Ver Todas ({orders.length})
                </button>
              </div>
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma encomenda registada até ao momento.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2.5 pr-4">Pedido</th>
                        <th className="py-2.5 pr-4">Resumo</th>
                        <th className="py-2.5 pr-4 text-right">Total</th>
                        <th className="py-2.5 pr-4">Estado</th>
                        <th className="py-2.5 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50">
                          <td className="py-3 pr-4 font-mono-tabular font-semibold text-slate-900">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 pr-4 text-slate-700 max-w-xs truncate">
                            {ord.itemsSummary}
                          </td>
                          <td className="py-3 pr-4 text-right font-mono-tabular font-semibold text-slate-900">
                            {formatKz(ord.totalKz)}
                          </td>
                          <td className="py-3 pr-4 text-slate-700">{ord.status}</td>
                          <td className="py-3 text-right">
                            {ord.status === 'Aguardando pagamento' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderId(ord.id);
                                  setActiveTab('pagamentos');
                                }}
                                className="text-[#0B5ED7] font-semibold hover:underline"
                              >
                                Enviar Comprovativo
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInvoiceOrder(ord);
                                  setActiveTab('faturas');
                                }}
                                className="text-slate-600 hover:text-slate-900 underline"
                              >
                                Ver Recibo
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. OS MEUS PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Histórico Completo de Encomendas</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-slate-500">Ainda não efetuou encomendas na plataforma.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-tabular">
                        <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                        <span>·</span>
                        <span>{ord.category}</span>
                        <span>·</span>
                        <span>Método: {ord.paymentMethod}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{ord.itemsSummary}</div>
                      <div className="text-xs text-slate-600">
                        Estado atual: <strong className="text-slate-900">{ord.status}</strong>
                        {ord.assignedTo ? ` · Responsável: ${ord.assignedTo}` : ''}
                      </div>
                      {ord.adminNotes && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2">
                          Observação Técnica: {ord.adminNotes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <div className="text-lg font-bold text-slate-900 font-mono-tabular">
                        {formatKz(ord.totalKz)}
                      </div>
                      <div className="flex items-center gap-2">
                        {ord.status === 'Aguardando pagamento' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderId(ord.id);
                              setActiveTab('pagamentos');
                            }}
                            className="px-3 py-1.5 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
                          >
                            Anexar Comprovativo
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoiceOrder(ord);
                            setActiveTab('faturas');
                          }}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200"
                        >
                          Fatura / Comprovativo
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. CRIAÇÃO DE WEBSITES (REAL-TIME TRACKER) */}
        {activeTab === 'websites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Os Meus Projetos de Criação de Websites
                </h2>
                <p className="text-xs text-slate-600">
                  Acompanhe cada etapa de engenharia, links de demonstração e entrega final do seu website.
                </p>
              </div>
              <button
                type="button"
                onClick={onRequestNewWebsite}
                className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] whitespace-nowrap shrink-0"
              >
                Solicitar Novo Website
              </button>
            </div>

            {websiteProjects.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
                <p className="text-sm text-slate-600">
                  Não existem projetos de criação de website associados à sua conta.
                </p>
                <button
                  type="button"
                  onClick={onRequestNewWebsite}
                  className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
                >
                  Preencher Formulário de Contratação
                </button>
              </div>
            ) : (
              websiteProjects.map((proj) => {
                const currentStepIdx = WEBSITE_STAGE_STEPS.indexOf(proj.devStatus);
                return (
                  <div
                    key={proj.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="text-xs text-slate-500">
                          {proj.websiteType} · Empresa: {proj.companyName}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          {proj.projectName}
                        </h3>
                      </div>
                      <div className="text-right font-mono-tabular">
                        <div className="text-xs text-slate-500">Orçamento / Valor Acordado</div>
                        <div className="text-base font-bold text-slate-900">
                          {formatKz(proj.quotedPriceKz || proj.availableBudgetKz || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Stages */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0B5ED7]">
                          Etapa Atual: {proj.devStatus}
                        </span>
                        <span className="font-mono-tabular font-semibold text-slate-700">
                          {proj.progressPercent}% Concluído
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0B5ED7] transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(5, proj.progressPercent))}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                        {WEBSITE_STAGE_STEPS.map((step, idx) => {
                          const done = currentStepIdx >= idx;
                          return (
                            <div
                              key={step}
                              className={`text-[11px] px-2.5 py-1.5 rounded border ${
                                done
                                  ? 'bg-blue-50/70 border-blue-200 text-slate-900 font-medium'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              {idx + 1}. {step}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-500 block">Domínio Pretendido:</span>
                        <strong className="text-slate-900">{proj.desiredDomain || 'A definir'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Responsável Técnico:</span>
                        <strong className="text-slate-900">
                          {proj.assignedLead || 'Equipa Engenharia Muatxissombo'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Prazo Previsto:</span>
                        <strong className="text-slate-900">
                          {proj.estimatedDeadline || 'Em definição no orçamento'}
                        </strong>
                      </div>
                    </div>

                    {/* Links de Demonstração e Website Publicado */}
                    {(proj.demoLink || proj.publishedLink || proj.accessInstructions) && (
                      <div className="border-t border-slate-200 pt-4 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          {proj.demoLink && (
                            <a
                              href={proj.demoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
                            >
                              Abrir Link de Demonstração
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {proj.publishedLink && (
                            <a
                              href={proj.publishedLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                            >
                              Abrir Website Oficial Publicado
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {proj.accessInstructions && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-950">
                            <div className="font-semibold mb-1">
                              Instruções de Acesso e Entrega Final:
                            </div>
                            <div className="whitespace-pre-line">{proj.accessInstructions}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 4. MEUS DOMÍNIOS */}
        {activeTab === 'dominios' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Meus Domínios Registados e Gestão de Renovação
            </h2>
            {domains.length === 0 ? (
              <p className="text-xs text-slate-500">
                Ainda não possui domínios ativos ou em registo na sua conta.
              </p>
            ) : (
              <div className="space-y-4">
                {domains.map((dom) => (
                  <div
                    key={dom.id}
                    className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-base font-bold text-slate-900 font-mono-tabular">
                        {dom.domainName}
                      </div>
                      <div className="text-xs text-slate-500">
                        Estado: <strong className="text-slate-900">{dom.status}</strong> · Vencimento:{' '}
                        <span className="font-mono-tabular">{dom.expiresAt}</span> · Renovação:{' '}
                        <span className="font-mono-tabular">{formatKz(dom.renewalPriceKz)}/ano</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono-tabular">
                        Nameservers: {dom.nameservers || 'ns1.hostinger.com, ns2.hostinger.com'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleDomainAutoRenew(
                            dom.id,
                            !dom.autoRenew,
                            dom.nameservers || 'ns1.hostinger.com, ns2.hostinger.com'
                          )
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          dom.autoRenew
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        Renovação Automática: {dom.autoRenew ? 'Ativa' : 'Desativada'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. MINHA HOSPEDAGEM */}
        {activeTab === 'hospedagem' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Planos de Hospedagem Web Contratados</h2>
            {hostingOrders.length === 0 ? (
              <p className="text-xs text-slate-500">
                Não existem planos de hospedagem contratados na sua conta neste momento.
              </p>
            ) : (
              <div className="space-y-3">
                {hostingOrders.map((ho) => (
                  <div
                    key={ho.id}
                    className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{ho.itemsSummary}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Pedido {ho.orderNumber} · Infraestrutura Hostinger · Estado: {ho.status}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900 font-mono-tabular">
                      {formatKz(ho.totalKz)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. MINHAS LICENÇAS DE SOFTWARE */}
        {activeTab === 'licencas' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Minhas Licenças Originais Microsoft 365 & Antivírus
              </h2>
              <p className="text-xs text-slate-600">
                As chaves de ativação e instruções privadas são disponibilizadas aqui e por e-mail exclusivamente após validação do pagamento pelo administrador.
              </p>
            </div>
            {licenses.length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhuma licença emitida para a sua conta até ao momento. Se adquiriu uma licença recentemente, aguarde a validação do comprovativo de pagamento.
              </p>
            ) : (
              <div className="space-y-4">
                {licenses.map((lic) => (
                  <div
                    key={lic.id}
                    className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{lic.productName}</h3>
                        <p className="text-xs text-slate-500">
                          {lic.licenseType} · Validade: {lic.validityPeriod} · {lic.devicesCount || '1 Dispositivo'}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">
                        {lic.status}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono-tabular text-xs">
                      <span className="text-slate-500 block text-[11px]">
                        Chave / Credencial de Ativação Privada:
                      </span>
                      <strong className="text-slate-900 select-all">{lic.activationKey}</strong>
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-line">
                      <strong>Instruções de Instalação e Ativação:</strong> {lic.activationInstructions}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. PAGAMENTOS & ENVIO DE COMPROVATIVO */}
        {activeTab === 'pagamentos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Coordenadas Oficiais de Pagamento (Angola – AOA)
              </h2>
              <p className="text-xs text-slate-600">
                Efetue o pagamento por um dos canais oficiais abaixo e anexe o comprovativo no formulário ao lado para validação pelo Administrador.
              </p>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-semibold text-slate-900">1. Transferência Bancária / IBAN</div>
                  <div className="text-slate-600 mt-1">Banco: {platformSettings.bankName}</div>
                  <div className="font-mono-tabular font-semibold text-slate-900 mt-0.5">
                    IBAN: {platformSettings.iban}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Titular: {platformSettings.companyName}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-semibold text-slate-900">2. Multicaixa Express</div>
                  <div className="font-mono-tabular text-slate-800 mt-1">
                    Número Associado: {platformSettings.multicaixaExpressNumber}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-semibold text-slate-900">3. Unitel Money & Afrimoney</div>
                  <div className="font-mono-tabular text-slate-800 mt-1">
                    Unitel Money: {platformSettings.unitelMoneyNumber} · Afrimoney: {platformSettings.afrimoneyNumber}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Anexar Comprovativo de Pagamento
              </h2>
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Não existem encomendas registadas para anexar comprovativo.
                </p>
              ) : (
                <form onSubmit={handleProofSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Selecionar Encomenda *
                    </label>
                    <select
                      value={selectedOrderId || orders[0]?.id || ''}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} – {formatKz(o.totalKz)} ({o.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Ficheiro do Comprovativo (PDF, Talão Multicaixa ou Imagem) *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setProofFileName(`${f.name} (${Math.round(f.size / 1024)} KB)`);
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-xs file:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Número de Operação / Referência Bancária *
                    </label>
                    <input
                      type="text"
                      required
                      value={proofRef}
                      onChange={(e) => setProofRef(e.target.value)}
                      placeholder="Ex.: Ref MCX 99283741 ou Operação BAI"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Observações Adicionais
                    </label>
                    <textarea
                      rows={2}
                      value={proofNotes}
                      onChange={(e) => setProofNotes(e.target.value)}
                      placeholder="Ex.: Transferência efetuada às 14h30..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={uploadingProof}
                    className="w-full py-2.5 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] disabled:opacity-50"
                  >
                    {uploadingProof ? 'A Enviar Comprovativo...' : 'Submeter Comprovativo para Validação'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 8. FATURAS E COMPROVATIVOS */}
        {activeTab === 'faturas' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">
              Faturas e Comprovativos Disponibilizados
            </h2>
            {orders.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhuma fatura emitida até ao momento.</p>
            ) : (
              <div className="space-y-4">
                {(selectedInvoiceOrder ? [selectedInvoiceOrder] : orders).map((ord) => (
                  <div key={ord.id} className="border border-slate-200 rounded-xl p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <img
                          src="/assets/aistudio/LOGO_MUATXISSOMBO-02_2ea0c22e.png"
                          alt="Muatxissombo Soluções Digitais"
                          referrerPolicy="no-referrer"
                          className="h-10 w-auto object-contain mb-2"
                        />
                        <div className="text-xs font-bold text-slate-900">
                          {platformSettings.companyName}
                        </div>
                        <div className="text-xs text-slate-500">{platformSettings.address}</div>
                        <div className="text-xs text-slate-500">
                          Tel / WhatsApp: {platformSettings.phoneWhatsapp}
                        </div>
                      </div>
                      <div className="text-right font-mono-tabular">
                        <div className="text-xs font-semibold text-[#0B5ED7]">
                          DOCUMENTO COMERCIAL / FATURA-PROFORMA
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          Nº: {ord.invoiceNumber || `FT-${ord.orderNumber}`}
                        </div>
                        <div className="text-xs text-slate-500">Estado: {ord.status}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Cliente Faturado:</span>
                        <strong className="text-slate-900">{ord.customerName}</strong>
                        <div className="text-slate-600">{ord.customerEmail}</div>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-slate-500 block">Método de Pagamento:</span>
                        <strong className="text-slate-900">{ord.paymentMethod}</strong>
                        {ord.paymentProofRef && (
                          <div className="text-slate-600 font-mono-tabular">
                            Ref. Comprovativo: {ord.paymentProofRef}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-b border-slate-200 py-3 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{ord.itemsSummary}</span>
                      <span className="font-mono-tabular font-bold text-slate-900">
                        {formatKz(ord.totalKz)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {selectedInvoiceOrder && (
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(null)}
                          className="text-xs text-slate-600 hover:underline"
                        >
                          Mostrar Todas as Faturas
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descarregar / Imprimir Fatura (PDF)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. NOTIFICAÇÕES POR E-MAIL */}
        {activeTab === 'notificacoes' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Histórico de Notificações e Comunicações por E-mail
            </h2>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhuma notificação registada até ao momento.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="border border-slate-200 rounded-lg p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-[#0B5ED7]">{n.eventType}</span>
                      <span>
                        {n.deliveryChannel} · Estado: {n.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{n.subject}</div>
                    <p className="text-xs text-slate-600 whitespace-pre-line">{n.bodyPreview}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 10. PORTAL EXCLUSIVO DE FEEDBACKS DOS UTILIZADORES */}
        {activeTab === 'feedback' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900">
              Portal Exclusivo de Avaliação de Qualidade e Feedback
            </h2>
            <p className="text-xs text-slate-600">
              Avalie a qualidade do serviço prestado pela Muatxissombo Soluções Digitais. O seu depoimento ajuda-nos a manter a excelência em Angola.
            </p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Serviço Avaliado
                  </label>
                  <select
                    value={fbCategory}
                    onChange={(e) => setFbCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Criação de Websites">Criação de Websites</option>
                    <option value="Registo de Domínios">Registo de Domínios</option>
                    <option value="Planos de Hospedagem">Planos de Hospedagem</option>
                    <option value="Licenças Microsoft 365 & Antivírus">
                      Licenças Microsoft 365 & Antivírus
                    </option>
                    <option value="Assistência Informática">Assistência Informática</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Classificação (1 a 5 Estrelas)
                  </label>
                  <select
                    value={fbRating}
                    onChange={(e) => setFbRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value={5}>5 Estrelas – Excelente</option>
                    <option value={4}>4 Estrelas – Muito Bom</option>
                    <option value={3}>3 Estrelas – Satisfatório</option>
                    <option value={2}>2 Estrelas – Regular</option>
                    <option value={1}>1 Estrela – Insatisfeito</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Referência do Projecto ou Website (Opcional)
                </label>
                <input
                  type="text"
                  value={fbProjectRef}
                  onChange={(e) => setFbProjectRef(e.target.value)}
                  placeholder="Ex.: Website Corporativo ou Pedido MX-..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  O Seu Comentário sobre o Serviço Prestado *
                </label>
                <textarea
                  rows={3}
                  required
                  value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  placeholder="Partilhe a sua experiência com o cumprimento de prazos, atendimento técnico e qualidade final..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
              >
                Enviar Avaliação de Qualidade
              </button>
            </form>
          </div>
        )}

        {/* 11. MEU PERFIL */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form
              onSubmit={handleSaveProfile}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <h2 className="text-base font-bold text-slate-900">Atualizar Dados de Cliente</h2>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Empresa / Organização
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  NIF (Número de Identificação Fiscal)
                </label>
                <input
                  type="text"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Endereço em Angola
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
              >
                Guardar Dados do Perfil
              </button>
            </form>

            <form
              onSubmit={handlePasswordSubmit}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 h-fit"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Alterar Senha do Painel do Cliente
                </h2>
                <KeyRound className="w-4 h-4 text-[#0B5ED7]" />
              </div>
              <p className="text-xs text-slate-600">
                Personalize o seu utilizador e altere a palavra-passe de acesso à Área do Cliente.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Utilizador de Acesso (User)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex.: joao.cliente"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Palavra-Passe Atual (opcional se entrou com Google)
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite a sua senha atual"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nova Palavra-Passe *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirmar Nova Palavra-Passe *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova palavra-passe"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full px-4 py-2.5 bg-[#0A192F] text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {changingPassword ? 'A Guardar Nova Senha...' : 'Atualizar Palavra-Passe do Cliente'}
              </button>
            </form>
          </div>
        )}

        {/* 12. SUPORTE TÉCNICO 24/7 */}
        {activeTab === 'suporte' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">
                  Canal Direto de Suporte Técnico 24/7
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Converse em tempo real com os especialistas da Muatxissombo Soluções Digitais.
                </p>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {supportMessages.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                      Olá {profile.name}! A nossa equipa técnica em Luanda (Centralidade do Kilamba) está disponível 24 horas por dia. Envie a sua questão abaixo.
                    </div>
                  ) : (
                    supportMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3.5 rounded-xl border text-xs ${
                          msg.senderRole === 'admin'
                            ? 'bg-blue-50/70 border-blue-200 text-slate-900 ml-6'
                            : 'bg-slate-50 border-slate-200 text-slate-800 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-semibold text-slate-800">
                            {msg.senderRole === 'admin'
                              ? 'Suporte Técnico Muatxissombo'
                              : msg.userName}
                          </span>
                          <span>Estado: {msg.ticketStatus}</span>
                        </div>
                        <div className="font-medium text-slate-900 mb-0.5">{msg.subject}</div>
                        <p className="whitespace-pre-line">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleSupportSubmit} className="border-t border-slate-200 pt-4 space-y-3">
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Assunto do pedido de suporte"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={supportText}
                    onChange={(e) => setSupportText(e.target.value)}
                    placeholder="Escreva a sua mensagem para o suporte técnico..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-slate-900">Atendimento Telefónico & WhatsApp</h3>
              <p className="text-xs text-slate-600">
                Para assistência remota imediata (AnyDesk / TeamViewer) ou urgências técnicas:
              </p>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block">Linha Direta / WhatsApp:</span>
                  <strong className="font-mono-tabular text-slate-900">
                    {platformSettings.phoneWhatsapp}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">E-mail de Suporte:</span>
                  <strong className="text-slate-900">{platformSettings.corporateEmail}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Localização Física:</span>
                  <strong className="text-slate-900">{platformSettings.address}</strong>
                </div>
              </div>
              <a
                href={`https://wa.me/${platformSettings.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
              >
                Abrir WhatsApp de Suporte
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
