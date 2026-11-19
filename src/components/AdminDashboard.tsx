import React, { useState } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  Globe,
  KeyRound,
  BarChart3,
  Mail,
  Settings,
  Headphones,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Download,
  Send,
  RefreshCw,
  LogOut,
  Server,
} from 'lucide-react';
import {
  CatalogItemData,
  formatKz,
  PlatformSettingsData,
} from '../data/defaultCatalog';
import {
  UserProfileRecord,
  OrderRecord,
  WebsiteProjectRecord,
  LicenseIssuedRecord,
  DomainRegisteredRecord,
  SupportMessageRecord,
  NotificationItemRecord,
} from './ClientDashboard';

interface AdminDashboardProps {
  adminProfile: UserProfileRecord;
  users: UserProfileRecord[];
  catalogItems: CatalogItemData[];
  orders: OrderRecord[];
  websiteProjects: WebsiteProjectRecord[];
  licensesIssued: LicenseIssuedRecord[];
  domainsRegistered: DomainRegisteredRecord[];
  supportMessages: SupportMessageRecord[];
  notifications: NotificationItemRecord[];
  platformSettings: PlatformSettingsData;
  onUpdateUserStatus: (uid: string, status: 'active' | 'suspended', role: 'client' | 'admin', name: string, phone: string, company: string) => Promise<void>;
  onSendPasswordReset: (email: string) => Promise<void>;
  onSaveCatalogItem: (item: CatalogItemData) => Promise<void>;
  onDeleteCatalogItem: (itemId: string) => Promise<void>;
  onSeedDefaultCatalog: () => Promise<void>;
  onUpdateOrder: (
    orderId: string,
    status: string,
    assignedTo: string,
    adminNotes: string,
    customerEmail: string,
    customerName: string,
    userId: string,
    orderNumber: string
  ) => Promise<void>;
  onUpdateWebsiteProject: (
    projectId: string,
    updates: Partial<WebsiteProjectRecord>
  ) => Promise<void>;
  onIssueLicense: (payload: Omit<LicenseIssuedRecord, 'id'>) => Promise<void>;
  onReplySupportMessage: (
    targetUserId: string,
    targetUserName: string,
    targetUserEmail: string,
    subject: string,
    message: string,
    ticketId?: string
  ) => Promise<void>;
  onResendNotification: (notification: NotificationItemRecord) => Promise<void>;
  onSavePlatformSettings: (settings: PlatformSettingsData) => Promise<void>;
  onLogout: () => void;
}

type AdminTab =
  | 'financeiro'
  | 'encomendas'
  | 'websites'
  | 'licencas'
  | 'produtos'
  | 'clientes'
  | 'suporte'
  | 'emails'
  | 'configuracoes';

const ORDER_STATUSES = [
  'Aguardando pagamento',
  'Pagamento em análise',
  'Pagamento confirmado',
  'Em processamento',
  'Em execução',
  'Aguardando informações do cliente',
  'Concluído',
  'Cancelado',
];

const WEBSITE_DEV_STATUSES = [
  'Orçamento Solicitado',
  'Em Análise',
  'Proposta Enviada',
  'Aguardando Pagamento',
  'Design & Prototipagem',
  'Em Desenvolvimento',
  'Testes & Revisão',
  'Concluído & Publicado',
  'Cancelado',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminProfile,
  users,
  catalogItems,
  orders,
  websiteProjects,
  licensesIssued,
  domainsRegistered,
  supportMessages,
  notifications,
  platformSettings,
  onUpdateUserStatus,
  onSendPasswordReset,
  onSaveCatalogItem,
  onDeleteCatalogItem,
  onSeedDefaultCatalog,
  onUpdateOrder,
  onUpdateWebsiteProject,
  onIssueLicense,
  onReplySupportMessage,
  onResendNotification,
  onSavePlatformSettings,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('encomendas');
  const [bannerMsg, setBannerMsg] = useState('');

  // Catalog form state
  const [editingItem, setEditingItem] = useState<CatalogItemData>({
    id: '',
    category: 'website',
    subCategory: 'Empresas & B2B',
    name: '',
    description: '',
    priceKz: 185000,
    renewalPriceKz: 0,
    billingCycle: 'Projecto Chave-na-Mão',
    validityPeriod: '12 Meses',
    devicesCount: '1 Utilizador',
    licenseType: 'Subscrição Oficial',
    available: true,
    popular: false,
    promoBadge: '',
  });

  // License Issue form state
  const [licProductName, setLicProductName] = useState('Microsoft 365 Business Standard');
  const [licSupplier, setLicSupplier] = useState('Microsoft CSP Oficial Angola');
  const [licType, setLicType] = useState('Licença Corporativa Microsoft CSP');
  const [licValidity, setLicValidity] = useState('12 Meses (1 Ano)');
  const [licDevices, setLicDevices] = useState('1 Utilizador (5 Dispositivos)');
  const [licKey, setLicKey] = useState('');
  const [licInstructions, setLicInstructions] = useState(
    '1. Aceda a https://setup.office.com\n2. Inicie sessão com a sua conta Microsoft corporativa ou pessoal.\n3. Introduza a chave de ativação privada acima e descarregue o instalador oficial.'
  );
  const [licUserId, setLicUserId] = useState('');
  const [licOrderId, setLicOrderId] = useState('');

  // Support reply state
  const [replyText, setReplyText] = useState('');
  const [selectedSupportMsg, setSelectedSupportMsg] = useState<SupportMessageRecord | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<PlatformSettingsData>(platformSettings);

  // Financial Metrics (Section 7 - Gestão Financeira)
  const paidOrders = orders.filter((o) =>
    ['Pagamento confirmado', 'Em processamento', 'Em execução', 'Concluído'].includes(o.status)
  );
  const pendingOrders = orders.filter((o) =>
    ['Aguardando pagamento', 'Pagamento em análise', 'Aguardando informações do cliente'].includes(o.status)
  );
  const totalSalesKz = paidOrders.reduce((acc, o) => acc + (Number(o.totalKz) || 0), 0);
  const pendingSalesKz = pendingOrders.reduce((acc, o) => acc + (Number(o.totalKz) || 0), 0);

  const revenueByCategory = paidOrders.reduce<Record<string, number>>((acc, ord) => {
    const cat = ord.category || 'Outros';
    acc[cat] = (acc[cat] || 0) + (Number(ord.totalKz) || 0);
    return acc;
  }, {});

  const handleExportFinancialCsv = () => {
    const headers = [
      'Pedido',
      'Cliente',
      'Email',
      'Categoria',
      'Resumo',
      'Metodo_Pagamento',
      'Estado',
      'Total_Kz',
    ];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      o.customerEmail,
      `"${(o.category || '').replace(/"/g, '""')}"`,
      `"${(o.itemsSummary || '').replace(/"/g, '""')}"`,
      `"${(o.paymentMethod || '').replace(/"/g, '""')}"`,
      o.status,
      o.totalKz,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Financeiro_Muatxissombo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id =
      editingItem.id.trim() ||
      `${editingItem.category}-${Date.now().toString(36)}`;
    await onSaveCatalogItem({
      ...editingItem,
      id,
      priceKz: Number(editingItem.priceKz) || 0,
      renewalPriceKz: Number(editingItem.renewalPriceKz) || 0,
    });
    setEditingItem({
      id: '',
      category: 'website',
      subCategory: '',
      name: '',
      description: '',
      priceKz: 185000,
      renewalPriceKz: 0,
      billingCycle: 'Projecto Chave-na-Mão',
      validityPeriod: '12 Meses',
      devicesCount: '1 Utilizador',
      licenseType: 'Subscrição Oficial',
      available: true,
      popular: false,
      promoBadge: '',
    });
    setBannerMsg('Produto / serviço guardado no catálogo com sucesso.');
  };

  const handleIssueLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.uid === licUserId) || users[0];
    if (!targetUser || !licKey.trim()) {
      setBannerMsg('Selecione um cliente registado e insira a chave de ativação original.');
      return;
    }

    await onIssueLicense({
      productName: licProductName,
      supplier: licSupplier,
      licenseType: licType,
      validityPeriod: licValidity,
      devicesCount: licDevices,
      activationKey: licKey.trim(),
      activationInstructions: licInstructions.trim(),
      assignedUserId: targetUser.uid,
      assignedUserEmail: targetUser.email,
      assignedUserName: targetUser.name,
      orderId: licOrderId || 'Entrega Direta',
      status: 'Atribuída ao Cliente',
      deliveredAt: new Date().toLocaleDateString('pt-AO'),
    });
    setLicKey('');
    setBannerMsg(
      `Licença associada a ${targetUser.name} e enviada automaticamente por e-mail privado!`
    );
  };

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'encomendas', label: 'Gestão de Encomendas', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'websites', label: 'Projetos de Websites', icon: <Globe className="w-4 h-4" /> },
    { id: 'licencas', label: 'Gestão de Licenças', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'produtos', label: 'Produtos & Preços (Kz)', icon: <Package className="w-4 h-4" /> },
    { id: 'clientes', label: 'Gestão de Clientes', icon: <Users className="w-4 h-4" /> },
    { id: 'financeiro', label: 'Gestão Financeira', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'suporte', label: 'Chat Suporte 24/7', icon: <Headphones className="w-4 h-4" /> },
    { id: 'emails', label: 'Notificações E-mail', icon: <Mail className="w-4 h-4" /> },
    { id: 'configuracoes', label: 'Configurações & Hostinger', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-200 shrink-0 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="px-3 py-2 border-b border-slate-800">
            <div className="text-xs text-[#28A9E0] font-semibold">
              Painel Administrativo · Controlo Total
            </div>
            <div className="text-sm font-bold text-white truncate mt-0.5">{adminProfile.name}</div>
            <div className="text-xs text-slate-400 truncate">{adminProfile.email}</div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setBannerMsg('');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-[#0B5ED7] text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 mt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl space-y-6">
        {bannerMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
            <span>{bannerMsg}</span>
            <button
              type="button"
              onClick={() => setBannerMsg('')}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Fechar
            </button>
          </div>
        )}

        {/* 1. GESTÃO DE ENCOMENDAS E PAGAMENTOS */}
        {activeTab === 'encomendas' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Gestão de Encomendas e Validação de Pagamentos
              </h1>
              <p className="text-xs text-slate-600">
                Valide comprovativos bancários / Multicaixa Express, altere estados do serviço e envie notificações automáticas por e-mail ao cliente.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                Ainda não foram recebidas novas encomendas.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <OrderAdminCard
                    key={ord.id}
                    order={ord}
                    onSave={async (status, assignedTo, adminNotes) => {
                      await onUpdateOrder(
                        ord.id,
                        status,
                        assignedTo,
                        adminNotes,
                        ord.customerEmail,
                        ord.customerName,
                        ord.userId,
                        ord.orderNumber
                      );
                      setBannerMsg(
                        `Encomenda ${ord.orderNumber} atualizada para "${status}" e notificação enviada a ${ord.customerEmail}.`
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. GESTÃO DE CRIAÇÃO DE WEBSITES */}
        {activeTab === 'websites' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Gestão Exclusiva de Projetos de Criação de Websites
              </h1>
              <p className="text-xs text-slate-600">
                Atualize o estado de desenvolvimento, percentagem de conclusão, prazos, links de demonstração e link publicado. Cada atualização dispara notificação por e-mail ao cliente.
              </p>
            </div>

            {websiteProjects.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                Nenhum pedido de criação de website recebido até ao momento.
              </div>
            ) : (
              <div className="space-y-4">
                {websiteProjects.map((proj) => (
                  <WebsiteProjectAdminCard
                    key={proj.id}
                    project={proj}
                    onSave={async (updates) => {
                      await onUpdateWebsiteProject(proj.id, updates);
                      setBannerMsg(
                        `Projeto "${proj.projectName}" atualizado e cliente notificado por e-mail sobre a etapa "${updates.devStatus}".`
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. GESTÃO DE LICENÇAS */}
        {activeTab === 'licencas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleIssueLicenseSubmit}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 h-fit"
            >
              <h2 className="text-base font-bold text-slate-900">
                Emitir e Entregar Licença de Software
              </h2>
              <p className="text-xs text-slate-500">
                A chave nunca fica pública na loja; é entregue de forma privada na conta do cliente e por e-mail.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Associar ao Cliente *
                </label>
                <select
                  value={licUserId || users[0]?.uid || ''}
                  onChange={(e) => setLicUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  {users.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Produto Software *
                </label>
                <input
                  type="text"
                  required
                  value={licProductName}
                  onChange={(e) => setLicProductName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Fornecedor</label>
                  <input
                    type="text"
                    required
                    value={licSupplier}
                    onChange={(e) => setLicSupplier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Validade</label>
                  <input
                    type="text"
                    required
                    value={licValidity}
                    onChange={(e) => setLicValidity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo de Licença
                </label>
                <input
                  type="text"
                  required
                  value={licType}
                  onChange={(e) => setLicType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Chave de Ativação / Credencial Privada *
                </label>
                <input
                  type="text"
                  required
                  value={licKey}
                  onChange={(e) => setLicKey(e.target.value)}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  className="w-full px-3 py-2 text-xs font-mono-tabular border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Instruções de Ativação *
                </label>
                <textarea
                  rows={3}
                  required
                  value={licInstructions}
                  onChange={(e) => setLicInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
              >
                Registar e Enviar Licença por E-mail
              </button>
            </form>

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Histórico de Entregas de Licenças ({licensesIssued.length})
              </h2>
              {licensesIssued.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma licença emitida até ao momento.</p>
              ) : (
                <div className="space-y-3">
                  {licensesIssued.map((lic) => (
                    <div
                      key={lic.id}
                      className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">{lic.productName}</div>
                        <div className="text-slate-500">
                          Cliente: {lic.assignedUserName || lic.assignedUserEmail} · Fornecedor:{' '}
                          {lic.supplier} · Validade: {lic.validityPeriod}
                        </div>
                        <div className="font-mono-tabular text-slate-700">
                          Chave: {lic.activationKey}
                        </div>
                      </div>
                      <div className="text-right font-mono-tabular shrink-0">
                        <div className="text-emerald-700 font-semibold">{lic.status}</div>
                        <div className="text-slate-400">{lic.deliveredAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. GESTÃO DE PRODUTOS E SERVIÇOS */}
        {activeTab === 'produtos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleSaveProductSubmit}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 h-fit"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  {editingItem.id ? 'Editar Produto / Serviço' : 'Criar Novo Produto / Serviço'}
                </h2>
                {editingItem.id && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem({
                        id: '',
                        category: 'website',
                        subCategory: '',
                        name: '',
                        description: '',
                        priceKz: 150000,
                        renewalPriceKz: 0,
                        billingCycle: 'Anual',
                        available: true,
                      })
                    }
                    className="text-xs text-[#0B5ED7] hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Categoria *</label>
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      category: e.target.value as CatalogItemData['category'],
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  <option value="website">Criação de Websites</option>
                  <option value="domain_tld">Extensão de Domínio</option>
                  <option value="hosting">Plano de Hospedagem</option>
                  <option value="license">Licença de Software</option>
                  <option value="assistance">Assistência Informática</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome do Produto / Serviço *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Preço em Kz (AOA) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingItem.priceKz}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, priceKz: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs font-mono-tabular border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Renovação (Kz)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingItem.renewalPriceKz || 0}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, renewalPriceKz: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs font-mono-tabular border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descrição *</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-4 text-xs">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingItem.available}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, available: e.target.checked })
                    }
                  />
                  Disponível na Loja
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.popular)}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, popular: e.target.checked })
                    }
                  />
                  Destaque / Promoção
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
              >
                Guardar Produto no Catálogo
              </button>
            </form>

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Catálogo Ativo ({catalogItems.length} itens)
                </h2>
                <button
                  type="button"
                  onClick={async () => {
                    await onSeedDefaultCatalog();
                    setBannerMsg('Catálogo oficial sincronizado na base de dados.');
                  }}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200"
                >
                  Sincronizar Catálogo Padrão na Base de Dados
                </button>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {catalogItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-lg p-3.5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="text-slate-500">
                        {item.category} · {item.available ? 'Disponível' : 'Indisponível'}
                      </div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="font-mono-tabular font-semibold text-[#0B5ED7]">
                        {formatKz(item.priceKz)}
                        {item.renewalPriceKz ? ` · Renovação: ${formatKz(item.renewalPriceKz)}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="p-2 text-slate-600 hover:text-[#0B5ED7] hover:bg-slate-100 rounded-lg"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCatalogItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. GESTÃO DE CLIENTES */}
        {activeTab === 'clientes' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Clientes Registados ({users.length})
            </h2>
            {users.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum cliente registado até ao momento.</p>
            ) : (
              <div className="space-y-3">
                {users.map((u) => {
                  const userOrders = orders.filter((o) => o.userId === u.uid);
                  return (
                    <div
                      key={u.uid}
                      className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                        <div className="text-slate-600">
                          {u.email} · Tel: {u.phone || 'N/A'} · Empresa: {u.company || 'Particular'}
                        </div>
                        <div className="text-slate-500">
                          Estado: <strong>{u.status}</strong> · Perfil: <strong>{u.role}</strong> ·
                          Compras realizadas:{' '}
                          <span className="font-mono-tabular font-semibold">
                            {userOrders.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            const nextStatus = u.status === 'active' ? 'suspended' : 'active';
                            await onUpdateUserStatus(
                              u.uid,
                              nextStatus,
                              u.role,
                              u.name,
                              u.phone || '',
                              u.company || ''
                            );
                            setBannerMsg(`Estado da conta de ${u.name} alterado para ${nextStatus}.`);
                          }}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200"
                        >
                          {u.status === 'active' ? 'Suspender Conta' : 'Reativar Conta'}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await onSendPasswordReset(u.email);
                            setBannerMsg(
                              `Procedimento seguro de redefinição de palavra-passe enviado para ${u.email}.`
                            );
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-[#0B5ED7] font-medium rounded-lg hover:bg-blue-100"
                        >
                          Redefinir Credenciais (E-mail)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. GESTÃO FINANCEIRA */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Gestão Financeira e Relatórios em Kwanzas (AOA)
                </h1>
                <p className="text-xs text-slate-600">
                  Controlo de receitas confirmadas, encomendas pendentes e desempenho por categoria.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportFinancialCsv}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório Financeiro (CSV)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Total de Vendas Confirmadas</div>
                <div className="text-2xl font-bold text-emerald-700 font-mono-tabular mt-1">
                  {formatKz(totalSalesKz)}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Receita em Análise / Pendente</div>
                <div className="text-2xl font-bold text-amber-600 font-mono-tabular mt-1">
                  {formatKz(pendingSalesKz)}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Encomendas Pagas</div>
                <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
                  {paidOrders.length}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Encomendas Pendentes</div>
                <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
                  {pendingOrders.length}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Receitas por Categoria</h2>
              {Object.keys(revenueByCategory).length === 0 ? (
                <p className="text-xs text-slate-500">
                  As receitas por categoria serão apresentadas assim que os pagamentos forem confirmados.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(revenueByCategory).map(([cat, val]) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs"
                    >
                      <span className="font-medium text-slate-800">{cat}</span>
                      <span className="font-mono-tabular font-bold text-slate-900">
                        {formatKz(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. SUPORTE TÉCNICO 24/7 (ADMIN) */}
        {activeTab === 'suporte' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Mensagens de Suporte Recebidas ({supportMessages.length})
              </h2>
              {supportMessages.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhum pedido de suporte pendente.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {supportMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedSupportMsg(msg)}
                      className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        selectedSupportMsg?.id === msg.id
                          ? 'border-[#0B5ED7] bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="font-bold text-slate-900">
                          {msg.userName} ({msg.senderRole})
                        </span>
                        <span>{msg.ticketStatus}</span>
                      </div>
                      <div className="font-semibold text-slate-800">{msg.subject}</div>
                      <p className="text-slate-600 mt-1">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 h-fit">
              <h2 className="text-base font-bold text-slate-900">Responder ao Cliente</h2>
              {selectedSupportMsg ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!replyText.trim()) return;
                    await onReplySupportMessage(
                      selectedSupportMsg.userId,
                      selectedSupportMsg.userName,
                      selectedSupportMsg.userEmail,
                      `Re: ${selectedSupportMsg.subject}`,
                      replyText,
                      selectedSupportMsg.id
                    );
                    setReplyText('');
                    setBannerMsg('Resposta enviada para o painel e e-mail do cliente.');
                  }}
                  className="space-y-4"
                >
                  <div className="text-xs text-slate-600">
                    Para: <strong>{selectedSupportMsg.userName}</strong> (
                    {selectedSupportMsg.userEmail})
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escreva a resposta técnica ou orientação comercial..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
                  >
                    Enviar Resposta Técnica
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-500">
                  Selecione uma mensagem na lista ao lado para responder ao cliente.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 8. GESTÃO DE E-MAILS E NOTIFICAÇÕES */}
        {activeTab === 'emails' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Centro de Notificações por E-mail (SMTP / PHPMailer)
            </h2>
            <p className="text-xs text-slate-600">
              Histórico completo de comunicações automáticas enviadas após registo, compra, validação de pagamento, entrega de licença e publicação de website.
            </p>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhuma comunicação registada.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="text-slate-500">
                        Evento: <strong className="text-[#0B5ED7]">{n.eventType}</strong> · Para:{' '}
                        {n.recipientName} ({n.recipientEmail}) · Estado: {n.status}
                      </div>
                      <div className="font-bold text-slate-900">{n.subject}</div>
                      <p className="text-slate-600">{n.bodyPreview}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await onResendNotification(n);
                        setBannerMsg(`Comunicação reenviada para ${n.recipientEmail}.`);
                      }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 shrink-0"
                    >
                      Reenviar E-mail
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. CONFIGURAÇÕES DA PLATAFORMA & PACOTE HOSTINGER */}
        {activeTab === 'configuracoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onSavePlatformSettings(settingsForm);
                setBannerMsg('Configurações corporativas, pagamentos e SMTP atualizados.');
              }}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <h2 className="text-base font-bold text-slate-900">
                Contactos, Coordenadas Bancárias e SMTP
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={settingsForm.companyName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phoneWhatsapp}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phoneWhatsapp: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Endereço Físico</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="text"
                    value={settingsForm.corporateEmail}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, corporateEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Horário de Atendimento
                  </label>
                  <input
                    type="text"
                    value={settingsForm.businessHours}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, businessHours: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Banco Principal</label>
                  <input
                    type="text"
                    value={settingsForm.bankName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">IBAN (AO06...)</label>
                  <input
                    type="text"
                    value={settingsForm.iban}
                    onChange={(e) => setSettingsForm({ ...settingsForm, iban: e.target.value })}
                    className="w-full px-3 py-2 font-mono-tabular border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Multicaixa Express
                  </label>
                  <input
                    type="text"
                    value={settingsForm.multicaixaExpressNumber}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        multicaixaExpressNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 font-mono-tabular border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Servidor SMTP</label>
                  <input
                    type="text"
                    value={settingsForm.smtpHost}
                    onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                    className="w-full px-3 py-2 font-mono-tabular border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
              >
                Guardar Configurações da Plataforma
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 h-fit">
              <h2 className="text-base font-bold text-slate-900">
                Arquitetura Pronta para Publicação na Hostinger
              </h2>
              <p className="text-xs text-slate-600">
                O repositório inclui toda a estrutura recomendada para planos de alojamento partilhado ou Cloud da Hostinger sem necessidade de Node.js permanentemente ativo:
              </p>
              <ul className="text-xs text-slate-700 space-y-2 font-mono-tabular bg-slate-50 p-4 rounded-lg border border-slate-200">
                <li>/database/schema.sql (Script MySQL 8.0+ com 10 tabelas)</li>
                <li>/backend/config/database.php (PDO Prepared Statements)</li>
                <li>/backend/config/Mailer.php (SMTP + PHPMailer)</li>
                <li>/backend/middleware/AuthMiddleware.php (RBAC, XSS, Sessões)</li>
                <li>/backend/controllers/OrderController.php</li>
                <li>/backend/models/Order.php</li>
                <li>/backend/api/index.php (REST API PHP 8.2+)</li>
                <li>/backend/uploads/.htaccess (Bloqueio de execução de scripts)</li>
                <li>/HOSTINGER_DEPLOY.md (Manual passo-a-passo hPanel)</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Subcomponent for Order management row
const OrderAdminCard: React.FC<{
  order: OrderRecord;
  onSave: (status: string, assignedTo: string, adminNotes: string) => Promise<void>;
}> = ({ order, onSave }) => {
  const [status, setStatus] = useState(order.status);
  const [assignedTo, setAssignedTo] = useState(order.assignedTo || 'Equipa Técnica Luanda');
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');
  const [saving, setSaving] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <div className="text-xs text-slate-500 font-mono-tabular">
            Pedido <strong>{order.orderNumber}</strong> · Categoria: {order.category} · Método:{' '}
            {order.paymentMethod}
          </div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">{order.itemsSummary}</div>
          <div className="text-xs text-slate-600 mt-0.5">
            Cliente: <strong>{order.customerName}</strong> ({order.customerEmail}){' '}
            {order.customerPhone ? `· Tel: ${order.customerPhone}` : ''}
          </div>
        </div>
        <div className="text-right font-mono-tabular">
          <div className="text-lg font-bold text-slate-900">{formatKz(order.totalKz)}</div>
          {order.paymentProofRef && (
            <div className="text-xs text-emerald-700 font-semibold">
              Comprovativo: {order.paymentProofName || 'Anexado'} (Ref: {order.paymentProofRef})
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Estado da Encomenda</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
          >
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Atribuir Tarefa / Técnico</label>
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Observações ao Cliente</label>
          <input
            type="text"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Ex.: Pagamento validado, licença enviada..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(status, assignedTo, adminNotes);
            } finally {
              setSaving(false);
            }
          }}
          className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] disabled:opacity-50"
        >
          {saving ? 'A Guardar...' : 'Guardar Alterações & Notificar Cliente'}
        </button>
      </div>
    </div>
  );
};

// Subcomponent for Website Project management row
const WebsiteProjectAdminCard: React.FC<{
  project: WebsiteProjectRecord;
  onSave: (updates: Partial<WebsiteProjectRecord>) => Promise<void>;
}> = ({ project, onSave }) => {
  const [devStatus, setDevStatus] = useState(project.devStatus);
  const [progressPercent, setProgressPercent] = useState(project.progressPercent);
  const [assignedLead, setAssignedLead] = useState(
    project.assignedLead || 'Eng. João Muatxissombo'
  );
  const [estimatedDeadline, setEstimatedDeadline] = useState(
    project.estimatedDeadline || '15 Dias Úteis'
  );
  const [quotedPriceKz, setQuotedPriceKz] = useState(
    project.quotedPriceKz || project.availableBudgetKz || 265000
  );
  const [demoLink, setDemoLink] = useState(project.demoLink || '');
  const [publishedLink, setPublishedLink] = useState(project.publishedLink || '');
  const [accessInstructions, setAccessInstructions] = useState(project.accessInstructions || '');
  const [internalNotes, setInternalNotes] = useState(project.internalNotes || '');
  const [saving, setSaving] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <div className="text-xs text-slate-500">
            Cliente: <strong>{project.clientName}</strong> ({project.clientEmail} ·{' '}
            {project.clientPhone}) · Empresa: <strong>{project.companyName}</strong>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            {project.projectName} ({project.websiteType})
          </h3>
          <p className="text-xs text-slate-600 mt-1">{project.description}</p>
          {project.desiredFeatures && (
            <div className="text-xs text-slate-500 mt-1">
              Funcionalidades pedidas: {project.desiredFeatures}
            </div>
          )}
        </div>
        <div className="text-right font-mono-tabular">
          <div className="text-xs text-slate-500">Domínio: {project.desiredDomain || 'N/A'}</div>
          <div className="text-sm font-bold text-[#0B5ED7]">{formatKz(quotedPriceKz)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Estado do Desenvolvimento</label>
          <select
            value={devStatus}
            onChange={(e) => {
              const st = e.target.value;
              setDevStatus(st);
              const idx = WEBSITE_DEV_STATUSES.indexOf(st);
              if (idx >= 0 && st !== 'Cancelado') {
                setProgressPercent(Math.min(100, Math.round(((idx + 1) / 8) * 100)));
              }
            }}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
          >
            {WEBSITE_DEV_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Progresso (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={progressPercent}
            onChange={(e) => setProgressPercent(Number(e.target.value))}
            className="w-full px-3 py-2 font-mono-tabular border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Responsável pelo Projeto</label>
          <input
            type="text"
            value={assignedLead}
            onChange={(e) => setAssignedLead(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Prazo Previsto</label>
          <input
            type="text"
            value={estimatedDeadline}
            onChange={(e) => setEstimatedDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Orçamento Final (Kz)</label>
          <input
            type="number"
            min={0}
            value={quotedPriceKz}
            onChange={(e) => setQuotedPriceKz(Number(e.target.value))}
            className="w-full px-3 py-2 font-mono-tabular border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Link de Demonstração</label>
          <input
            type="url"
            value={demoLink}
            onChange={(e) => setDemoLink(e.target.value)}
            placeholder="https://demo.muatxissombo.ao/..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Link do Website Publicado</label>
          <input
            type="url"
            value={publishedLink}
            onChange={(e) => setPublishedLink(e.target.value)}
            placeholder="https://www.cliente.co.ao"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Observações Internas</label>
          <input
            type="text"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block font-medium text-slate-700 mb-1">
            Instruções de Acesso e Entrega ao Cliente (Enviadas por E-mail e Painel)
          </label>
          <textarea
            rows={2}
            value={accessInstructions}
            onChange={(e) => setAccessInstructions(e.target.value)}
            placeholder="Painel WP/Admin, credenciais iniciais e manual de utilização..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({
                devStatus,
                progressPercent,
                assignedLead,
                estimatedDeadline,
                quotedPriceKz,
                demoLink,
                publishedLink,
                accessInstructions,
                internalNotes,
              });
            } finally {
              setSaving(false);
            }
          }}
          className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] disabled:opacity-50"
        >
          {saving ? 'A Atualizar...' : 'Atualizar Etapa do Website & Enviar E-mail'}
        </button>
      </div>
    </div>
  );
};
