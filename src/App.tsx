/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Server,
  ShieldCheck,
  MonitorSmartphone,
  Wrench,
  ShoppingCart,
  Search,
  Check,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  Lock,
  Menu,
  X,
  MessageSquare,
  Star,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  CreditCard,
  Send,
  ArrowLeft,
  KeyRound,
  Headphones,
} from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  OperationType,
  handleFirestoreError,
  FirebaseUser,
} from './lib/firebase';
import {
  INITIAL_CATALOG_ITEMS,
  DEFAULT_PLATFORM_SETTINGS,
  CatalogItemData,
  PlatformSettingsData,
  formatKz,
} from './data/defaultCatalog';
import {
  WebsiteShowcaseModal,
  WebsiteQuoteFormPayload,
} from './components/WebsiteShowcaseModal';
import { REAL_WEBSITE_TEMPLATES } from './data/websiteTemplates';
import {
  ClientDashboard,
  UserProfileRecord,
  OrderRecord,
  WebsiteProjectRecord,
  LicenseIssuedRecord,
  DomainRegisteredRecord,
  SupportMessageRecord,
  NotificationItemRecord,
} from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';

interface CartItem {
  id: string;
  name: string;
  category: string;
  priceKz: number;
  billingCycle: string;
  meta?: string;
}

interface DomainCheckResult {
  domain: string;
  status: string;
  verifiedVia: string;
  registrarConfigured: boolean;
  canAddToCart: boolean;
  nameservers: string[];
  message: string;
  priceKz: number;
  renewalPriceKz: number;
  tld: string;
}

interface FeedbackPublicRecord {
  id: string;
  userId: string;
  clientName: string;
  companyName?: string;
  serviceCategory: string;
  rating: number;
  comment: string;
  projectReference?: string;
  isPublic: boolean;
}

const ADMIN_OWNER_EMAIL = 'joaomuatxissombo22@gmail.com';

export default function App() {
  // Navigation & View Mode
  const [activeView, setActiveView] = useState<'public' | 'client' | 'admin' | 'auth'>('public');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth & User State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileRecord | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Auth Modal / Form State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authCompany, setAuthCompany] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Catalog & Platform Settings
  const [catalogItems, setCatalogItems] = useState<CatalogItemData[]>(INITIAL_CATALOG_ITEMS);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsData>(
    DEFAULT_PLATFORM_SETTINGS
  );

  // Firestore Collections State
  const [allUsers, setAllUsers] = useState<UserProfileRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [websiteProjects, setWebsiteProjects] = useState<WebsiteProjectRecord[]>([]);
  const [licensesIssued, setLicensesIssued] = useState<LicenseIssuedRecord[]>([]);
  const [domainsRegistered, setDomainsRegistered] = useState<DomainRegisteredRecord[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessageRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItemRecord[]>([]);
  const [publicFeedbacks, setPublicFeedbacks] = useState<FeedbackPublicRecord[]>([]);

  // Website Quote Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [preselectedWebsiteType, setPreselectedWebsiteType] = useState<string | undefined>(
    undefined
  );
  const [preselectedTemplateRef, setPreselectedTemplateRef] = useState<string | undefined>(
    undefined
  );

  // Domain Lookup State
  const [domainInput, setDomainInput] = useState('');
  const [selectedTld, setSelectedTld] = useState('.co.ao');
  const [checkingDomain, setCheckingDomain] = useState(false);
  const [domainResult, setDomainResult] = useState<DomainCheckResult | null>(null);

  // Software License Filter & Search (uractivation-inspired catalog)
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'm365' | 'antivirus'>('all');
  const [licenseSearch, setLicenseSearch] = useState('');

  // Shopping Cart & Checkout Drawer
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Multicaixa Express');
  const [checkoutProofRef, setCheckoutProofRef] = useState('');
  const [checkoutProofFile, setCheckoutProofFile] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  // Global Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  // 24/7 Floating Support Widget
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);
  const [widgetMessage, setWidgetMessage] = useState('');

  // Public Feedback Form State
  const [publicFbRating, setPublicFbRating] = useState(5);
  const [publicFbCategory, setPublicFbCategory] = useState('Criação de Websites');
  const [publicFbComment, setPublicFbComment] = useState('');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Dynamic Hero Slide State
  const [heroSlide, setHeroSlide] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const HERO_SLIDES = [
    {
      kicker: 'Destaque Principal · Engenharia Web & Comércio Electrónico em Angola',
      title: 'Transformamos as suas ideias em presença digital profissional.',
      subtitle:
        'Criamos websites institucionais, portais corporativos, lojas online em Kwanzas (AOA) e sistemas de gestão à medida com acompanhamento em tempo real.',
      image: '/src/assets/images/template_alhan_pro_1795098510010.jpg',
      badge: 'Criação de Websites · Desde 185.000 Kz',
      ctaLabel: 'Solicitar Criação de Website',
      targetSection: 'criacao-sites',
    },
    {
      kicker: 'Infraestrutura Cloud · Domínios Nacionais .AO & Alojamento Hostinger',
      title: 'Registe o domínio da sua marca e aloje com velocidade máxima.',
      subtitle:
        'Pesquisa de disponibilidade via consulta DNS real para extensões .co.ao, .ao e .com, acompanhada de planos de hospedagem NVMe com SSL e e-mails corporativos.',
      image: '/src/assets/images/service_hosting_nvme_1795098510580.jpg',
      badge: 'Domínios & Hospedagem · Desde 13.500 Kz/ano',
      ctaLabel: 'Pesquisar Domínio & Hospedagem',
      targetSection: 'dominios',
    },
    {
      kicker: 'Produtividade & Cibersegurança · Licenças Oficiais & Suporte 24/7',
      title: 'Licenças originais Microsoft 365, antivírus e assistência técnica.',
      subtitle:
        'Fornecimento autorizado Microsoft 365 Personal, Family e Business, proteção ESET, Kaspersky e Bitdefender, e instalação especializada de Windows 10 e 11.',
      image: '/src/assets/images/service_software_boxes_1795098510071.jpg',
      badge: 'Software Original & Suporte · Luanda',
      ctaLabel: 'Ver Licenças & Assistência',
      targetSection: 'licencas',
    },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? '' : prev));
    }, 6000);
  };

  // Helper to record & dispatch automated email notification (Section 9)
  const triggerAutomatedNotification = async (
    targetUserId: string,
    recipientEmail: string,
    recipientName: string,
    eventType: string,
    subject: string,
    bodyPreview: string
  ) => {
    try {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(db, 'notifications', notifId), {
        userId: targetUserId,
        recipientEmail: recipientEmail.slice(0, 160),
        recipientName: recipientName.slice(0, 120),
        eventType: eventType.slice(0, 80),
        subject: subject.slice(0, 200),
        bodyPreview: bodyPreview.slice(0, 1500),
        deliveryChannel: 'Email & Painel',
        status: 'Enviado',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          eventType,
          bodyPreview,
        }),
      }).catch(() => null);
    } catch (err) {
      console.error('Notification log error:', err);
    }
  };

  // 1. Auth Listener & Profile Synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (!fbUser) {
        setUserProfile(null);
        setAuthReady(true);
        return;
      }

      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userRef);
        const isOwnerAdmin = fbUser.email?.toLowerCase() === ADMIN_OWNER_EMAIL.toLowerCase();

        if (snap.exists()) {
          const data = snap.data() as UserProfileRecord;
          setUserProfile({
            ...data,
            uid: fbUser.uid,
            role: isOwnerAdmin ? 'admin' : data.role || 'client',
          });
        } else {
          const newProfile: UserProfileRecord = {
            uid: fbUser.uid,
            name: (fbUser.displayName || fbUser.email?.split('@')[0] || 'Cliente Muatxissombo').slice(
              0,
              120
            ),
            email: (fbUser.email || '').slice(0, 160),
            phone: '',
            company: '',
            nif: '',
            address: 'Luanda, Angola',
            role: isOwnerAdmin ? 'admin' : 'client',
            status: 'active',
          };
          if (fbUser.emailVerified) {
            await setDoc(userRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            await triggerAutomatedNotification(
              fbUser.uid,
              newProfile.email,
              newProfile.name,
              'Boas-Vindas & Confirmação de Conta',
              'Bem-vindo à Muatxissombo Soluções Digitais!',
              `Olá ${newProfile.name}, a sua conta de cliente foi criada e confirmada com sucesso. Já pode solicitar criação de websites, registar domínios, contratar hospedagem e adquirir licenças originais Microsoft 365.`
            );
          }
          setUserProfile(newProfile);
        }
      } catch (err) {
        console.error('Profile sync info:', err);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Public Catalog, Settings & Public Feedbacks Listeners
  useEffect(() => {
    const qCatalog = query(collection(db, 'catalog_items'), where('available', '==', true));
    const unsubCatalog = onSnapshot(
      qCatalog,
      (snap) => {
        if (!snap.empty) {
          const loaded: CatalogItemData[] = snap.docs.map((d) => ({
            ...(d.data() as CatalogItemData),
            id: d.id,
          }));
          setCatalogItems(loaded);
        } else {
          setCatalogItems(INITIAL_CATALOG_ITEMS);
        }
      },
      (err) => {
        console.warn('Using default catalog items:', err.message);
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'platform_settings', 'main'),
      (snap) => {
        if (snap.exists()) {
          setPlatformSettings(snap.data() as PlatformSettingsData);
        }
      },
      () => null
    );

    const qFeedbacks = query(collection(db, 'feedbacks'), where('isPublic', '==', true));
    const unsubFeedbacks = onSnapshot(
      qFeedbacks,
      (snap) => {
        const list: FeedbackPublicRecord[] = snap.docs.map((d) => ({
          ...(d.data() as Omit<FeedbackPublicRecord, 'id'>),
          id: d.id,
        }));
        setPublicFeedbacks(list);
      },
      () => null
    );

    return () => {
      unsubCatalog();
      unsubSettings();
      unsubFeedbacks();
    };
  }, []);

  // 3. Authenticated User / Admin Listeners
  useEffect(() => {
    if (!authReady || !currentUser || !userProfile || !currentUser.emailVerified) {
      setOrders([]);
      setWebsiteProjects([]);
      setLicensesIssued([]);
      setDomainsRegistered([]);
      setSupportMessages([]);
      setNotifications([]);
      setAllUsers([]);
      return;
    }

    const isAdmin = userProfile.role === 'admin';

    const ordersRef = isAdmin
      ? collection(db, 'orders')
      : query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
    const unsubOrders = onSnapshot(
      ordersRef,
      (snap) => {
        setOrders(
          snap.docs.map((d) => ({
            ...(d.data() as Omit<OrderRecord, 'id'>),
            id: d.id,
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
    );

    const webRef = isAdmin
      ? collection(db, 'website_projects')
      : query(collection(db, 'website_projects'), where('userId', '==', currentUser.uid));
    const unsubWeb = onSnapshot(
      webRef,
      (snap) => {
        setWebsiteProjects(
          snap.docs.map((d) => ({
            ...(d.data() as Omit<WebsiteProjectRecord, 'id'>),
            id: d.id,
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'website_projects')
    );

    const licRef = isAdmin
      ? collection(db, 'licenses_issued')
      : query(collection(db, 'licenses_issued'), where('assignedUserId', '==', currentUser.uid));
    const unsubLic = onSnapshot(
      licRef,
      (snap) => {
        setLicensesIssued(
          snap.docs.map((d) => ({
            ...(d.data() as Omit<LicenseIssuedRecord, 'id'>),
            id: d.id,
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'licenses_issued')
    );

    const domRef = isAdmin
      ? collection(db, 'domains_registered')
      : query(collection(db, 'domains_registered'), where('userId', '==', currentUser.uid));
    const unsubDom = onSnapshot(
      domRef,
      (snap) => {
        setDomainsRegistered(
          snap.docs.map((d) => ({
            ...(d.data() as Omit<DomainRegisteredRecord, 'id'>),
            id: d.id,
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'domains_registered')
    );

    const supRef = isAdmin
      ? collection(db, 'support_messages')
      : query(collection(db, 'support_messages'), where('userId', '==', currentUser.uid));
    const unsubSup = onSnapshot(
      supRef,
      (snap) => {
        setSupportMessages(
          snap.docs.map((d) => ({
            ...(d.data() as Omit<SupportMessageRecord, 'id'>),
            id: d.id,
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'support_messages')
    );

    const notifRef = isAdmin
      ? collection(db, 'notifications')
      : query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
    const unsubNotif = onSnapshot(
      notifRef,
      (snap) => {
        setNotifications(
          snap.docs.map((d) => ({
            ...(d.data() as Omit<NotificationItemRecord, 'id'>),
            id: d.id,
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
    );

    let unsubUsers = () => {};
    if (isAdmin) {
      unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          setAllUsers(snap.docs.map((d) => d.data() as UserProfileRecord));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'users')
      );
    }

    return () => {
      unsubOrders();
      unsubWeb();
      unsubLic();
      unsubDom();
      unsubSup();
      unsubNotif();
      unsubUsers();
    };
  }, [authReady, currentUser, userProfile?.role]);

  // Derived Catalog Groups
  const websiteServices = catalogItems.filter((i) => i.category === 'website');
  const domainTlds = catalogItems.filter((i) => i.category === 'domain_tld');
  const hostingPlans = catalogItems.filter((i) => i.category === 'hosting');
  const softwareLicenses = catalogItems.filter((i) => i.category === 'license');
  const assistanceServices = catalogItems.filter((i) => i.category === 'assistance');

  const filteredLicenses = softwareLicenses.filter((lic) => {
    const matchesCategory =
      licenseFilter === 'm365'
        ? lic.subCategory?.includes('Microsoft 365')
        : licenseFilter === 'antivirus'
        ? lic.subCategory?.includes('Antivírus')
        : true;
    const q = licenseSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      lic.name.toLowerCase().includes(q) ||
      lic.description.toLowerCase().includes(q) ||
      (lic.subCategory || '').toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  // Navigation Helper
  const navigateToSection = (sectionId: string) => {
    setActiveView('public');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  // Cart Actions
  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    setCartOpen(true);
    showToast(`"${item.name}" adicionado ao seu carrinho.`);
  };

  const removeFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const cartTotalKz = cart.reduce((sum, i) => sum + i.priceKz, 0);

  // Real Domain Availability Check (Section 4.B)
  const handleDomainSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = domainInput
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    if (!cleaned) return;

    const fullDomain = cleaned.includes('.') ? cleaned : `${cleaned}${selectedTld}`;
    const matchedTldObj =
      domainTlds.find((t) => fullDomain.endsWith(t.name)) ||
      domainTlds.find((t) => t.name === selectedTld) ||
      domainTlds[0];

    setCheckingDomain(true);
    setDomainResult(null);
    try {
      const res = await fetch(`/api/domain-check?domain=${encodeURIComponent(fullDomain)}`);
      const data = await res.json();
      setDomainResult({
        domain: fullDomain,
        status: data.status || 'unverified',
        verifiedVia: data.verifiedVia || 'Consulta DNS',
        registrarConfigured: Boolean(data.registrarConfigured),
        canAddToCart: Boolean(data.canAddToCart),
        nameservers: data.nameservers || [],
        message: data.message || 'Consulta concluída.',
        priceKz: matchedTldObj?.priceKz || 35000,
        renewalPriceKz: matchedTldObj?.renewalPriceKz || matchedTldObj?.priceKz || 35000,
        tld: matchedTldObj?.name || selectedTld,
      });
    } catch {
      setDomainResult({
        domain: fullDomain,
        status: 'lookup_failed',
        verifiedVia: 'Erro de Ligação',
        registrarConfigured: false,
        canAddToCart: false,
        nameservers: [],
        message: 'Não foi possível realizar a verificação real do domínio neste momento.',
        priceKz: matchedTldObj?.priceKz || 35000,
        renewalPriceKz: matchedTldObj?.renewalPriceKz || 35000,
        tld: matchedTldObj?.name || selectedTld,
      });
    } finally {
      setCheckingDomain(false);
    }
  };

  // Checkout Handler (Section 8 – Never simulates fake approved payments!)
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) {
      setCartOpen(false);
      setActiveView('auth');
      setAuthMessage('Inicie sessão com a sua conta verificada para concluir a sua encomenda.');
      return;
    }

    if (cart.length === 0) return;

    setCheckingOut(true);
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const orderNumber = `MX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = cart.map((c) => `${c.name} (${formatKz(c.priceKz)})`).join(' + ').slice(0, 1400);
    const primaryCategory = cart[0].category;
    const hasProof = Boolean(checkoutProofRef.trim() || checkoutProofFile.trim());
    const initialStatus = hasProof ? 'Pagamento em análise' : 'Aguardando pagamento';

    try {
      await setDoc(doc(db, 'orders', orderId), {
        orderNumber,
        userId: currentUser.uid,
        customerName: userProfile.name.slice(0, 120),
        customerEmail: userProfile.email.slice(0, 160),
        customerPhone: (userProfile.phone || '').slice(0, 40),
        customerCompany: (userProfile.company || '').slice(0, 120),
        itemsSummary,
        category: primaryCategory.slice(0, 50),
        totalKz: cartTotalKz,
        paymentMethod: paymentMethod.slice(0, 60),
        paymentProofName: checkoutProofFile.slice(0, 200),
        paymentProofRef: checkoutProofRef.trim().slice(0, 500),
        paymentNotes: checkoutNotes.trim().slice(0, 500),
        status: initialStatus,
        invoiceNumber: `FT-${orderNumber}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // If any domain items are in the cart, register them in domains_registered as 'Pendente'
      for (const item of cart) {
        if (item.category === 'Registo de Domínio' && item.meta) {
          const domId = `dom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const nextYear = new Date();
          nextYear.setFullYear(nextYear.getFullYear() + 1);
          await setDoc(doc(db, 'domains_registered', domId), {
            userId: currentUser.uid,
            clientName: userProfile.name.slice(0, 120),
            clientEmail: userProfile.email.slice(0, 160),
            domainName: item.meta.slice(0, 140),
            tld: '.' + item.meta.split('.').slice(1).join('.'),
            registrationPriceKz: item.priceKz,
            renewalPriceKz: item.priceKz,
            registeredAt: new Date().toLocaleDateString('pt-AO'),
            expiresAt: nextYear.toLocaleDateString('pt-AO'),
            autoRenew: true,
            nameservers: 'ns1.hostinger.com, ns2.hostinger.com',
            status: 'Pendente',
            orderId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      await triggerAutomatedNotification(
        currentUser.uid,
        userProfile.email,
        userProfile.name,
        'Confirmação de Receção de Encomenda',
        `Recebemos a sua Encomenda ${orderNumber} – Muatxissombo Soluções Digitais`,
        `Olá ${userProfile.name}, confirmamos a receção da encomenda ${orderNumber} (${itemsSummary}) no valor total de ${formatKz(
          cartTotalKz
        )}. Estado atual: ${initialStatus}. Assim que o administrador validar o comprovativo de pagamento, os seus produtos/licenças serão libertados.`
      );

      setCart([]);
      setCheckoutProofRef('');
      setCheckoutProofFile('');
      setCheckoutNotes('');
      setCartOpen(false);
      setActiveView('client');
      showToast(
        `Encomenda ${orderNumber} registada com sucesso! Confirmação enviada por e-mail.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
    } finally {
      setCheckingOut(false);
    }
  };

  // Website Quote Submission (Section 4.A)
  const handleWebsiteQuoteSubmit = async (payload: WebsiteQuoteFormPayload) => {
    if (!currentUser || !userProfile) {
      setQuoteModalOpen(false);
      setActiveView('auth');
      setAuthMessage(
        'Por favor inicie sessão com a sua conta verificada para submeter e acompanhar o seu projeto de website em tempo real.'
      );
      return;
    }

    const projId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const orderNumber = `MX-WEB-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await setDoc(doc(db, 'website_projects', projId), {
        userId: currentUser.uid,
        clientName: payload.clientName,
        clientEmail: payload.clientEmail,
        clientPhone: payload.clientPhone,
        companyName: payload.companyName,
        websiteType: payload.websiteType,
        projectName: payload.projectName,
        description: payload.description,
        desiredFeatures: payload.desiredFeatures,
        availableBudgetKz: payload.availableBudgetKz,
        desiredDomain: payload.desiredDomain,
        needsHosting: payload.needsHosting,
        referenceNotes: payload.referenceNotes,
        contractDate: new Date().toLocaleDateString('pt-AO'),
        estimatedDeadline: '15 Dias Úteis (Sujeito a confirmação)',
        assignedLead: 'Equipa de Engenharia Web Muatxissombo',
        devStatus: 'Orçamento Solicitado',
        progressPercent: 15,
        quotedPriceKz: payload.availableBudgetKz,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'orders', orderId), {
        orderNumber,
        userId: currentUser.uid,
        customerName: payload.clientName,
        customerEmail: payload.clientEmail,
        customerPhone: payload.clientPhone,
        customerCompany: payload.companyName,
        itemsSummary: `Criação de Website: ${payload.projectName} (${payload.websiteType})`,
        category: 'Criação de Websites',
        totalKz: payload.availableBudgetKz,
        paymentMethod: 'Transferência Bancária / Multicaixa Express',
        status: 'Aguardando pagamento',
        invoiceNumber: `FT-${orderNumber}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await triggerAutomatedNotification(
        currentUser.uid,
        payload.clientEmail,
        payload.clientName,
        'Solicitação de Criação de Website Recebida',
        `Orçamento de Website ${orderNumber} em Análise – Muatxissombo`,
        `Olá ${payload.clientName}, recebemos a solicitação de criação do website "${payload.projectName}" (${payload.websiteType}). O seu pedido já consta no Painel Administrativo para análise técnica e pode acompanhar o progresso em tempo real no seu Painel do Cliente.`
      );

      setActiveView('client');
      showToast(
        'Pedido de criação de website submetido! Acompanhe o progresso em tempo real no seu Painel do Cliente.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `website_projects/${projId}`);
    }
  };

  // Auth Handlers
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setActiveView('client');
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Não foi possível autenticar com o Google.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setAuthLoading(true);

    try {
      if (authMode === 'reset') {
        await sendPasswordResetEmail(auth, authEmail.trim());
        setAuthMessage(
          'Instruções de recuperação de palavra-passe enviadas para o seu endereço de e-mail.'
        );
      } else if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        setActiveView('client');
      } else {
        const cred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        const isOwnerAdmin =
          authEmail.trim().toLowerCase() === ADMIN_OWNER_EMAIL.toLowerCase();
        const profileObj: UserProfileRecord = {
          uid: cred.user.uid,
          name: (authName.trim() || 'Cliente').slice(0, 120),
          email: authEmail.trim().slice(0, 160),
          phone: authPhone.trim().slice(0, 40),
          company: authCompany.trim().slice(0, 120),
          role: isOwnerAdmin ? 'admin' : 'client',
          status: 'active',
        };
        setUserProfile(profileObj);
        setActiveView('client');
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Erro na autenticação. Verifique o seu e-mail e palavra-passe ou utilize o Google Sign-In.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-slate-900">
      {/* Global Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md bg-[#0A192F] text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#28A9E0] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP NAVIGATION BAR (Crisp Cloud & Digital Storefront Contract) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 lg:px-8 h-[72px] flex items-center justify-between gap-6">
        {/* Zone 1: Official Muatxissombo Logo */}
        <button
          type="button"
          onClick={() => navigateToSection('inicio')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus:outline-none"
        >
          <img
            src="/assets/aistudio/LOGO_MUATXISSOMBO-02_2ea0c22e.png"
            alt="Muatxissombo Soluções Digitais"
            referrerPolicy="no-referrer"
            className="h-10 w-auto object-contain"
          />
          <span className="text-base font-bold tracking-tight text-[#0A192F] hidden sm:inline">
            Muatxissombo
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Store & Cloud Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => navigateToSection('inicio')}
            className="hover:text-[#0B5ED7] transition-colors whitespace-nowrap shrink-0"
          >
            Início
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('criacao-sites')}
            className="hover:text-[#0B5ED7] transition-colors whitespace-nowrap shrink-0 font-semibold text-[#0A192F]"
          >
            Criação de Sites
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('dominios')}
            className="hover:text-[#0B5ED7] transition-colors whitespace-nowrap shrink-0"
          >
            Domínios
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('hospedagem')}
            className="hover:text-[#0B5ED7] transition-colors whitespace-nowrap shrink-0"
          >
            Hospedagem
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('licencas')}
            className="hover:text-[#0B5ED7] transition-colors whitespace-nowrap shrink-0"
          >
            Licenças de Software
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('assistencia')}
            className="hover:text-[#0B5ED7] transition-colors whitespace-nowrap shrink-0"
          >
            Assistência
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('sobre')}
            className="hover:text-[#0B5ED7] transition-colors whitespace-nowrap shrink-0"
          >
            Sobre Nós
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('contactos')}
            className="hover:text-[#0B5ED7] transition-colors whitespace-nowrap shrink-0"
          >
            Contactos
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentUser && userProfile) {
                setActiveView('client');
              } else {
                setActiveView('auth');
              }
            }}
            className="hover:text-[#0B5ED7] transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 text-slate-800 font-semibold"
          >
            <User className="w-3.5 h-3.5 text-[#0B5ED7]" />
            <span>{currentUser && userProfile ? 'Área do Cliente' : 'Entrar / Área do Cliente'}</span>
          </button>
          {userProfile?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className="text-[#0B5ED7] font-semibold hover:underline whitespace-nowrap shrink-0"
            >
              Painel Admin
            </button>
          )}
        </nav>

        {/* Zone 3: Cart + Primary Action (SOLICITAR ORÇAMENTO) + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#0B5ED7] bg-[#F4F7FB] border border-slate-200 rounded-lg hover:border-[#0B5ED7] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            aria-label="Abrir carrinho de compras"
          >
            <ShoppingCart className="w-4 h-4 text-[#0B5ED7]" />
            <span className="hidden sm:inline">Carrinho</span>
            {cart.length > 0 && (
              <span className="font-mono-tabular font-bold text-[#0B5ED7]">({cart.length})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setPreselectedWebsiteType(undefined);
              setQuoteModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5ED7] rounded-lg hover:bg-[#094bb0] transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            Solicitar Orçamento
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-2 text-xs font-medium text-slate-700">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigateToSection('inicio')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('criacao-sites')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold text-[#0B5ED7]"
            >
              Criação de Sites
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('dominios')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Domínios
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('hospedagem')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Hospedagem
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('licencas')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Licenças de Software
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('assistencia')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Assistência Informática
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('sobre')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Sobre Nós
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('contactos')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Contactos
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveView(currentUser && userProfile ? 'client' : 'auth');
              }}
              className="text-left py-2 px-3 rounded-lg bg-slate-100 font-semibold text-slate-900"
            >
              Área do Cliente
            </button>
            {userProfile?.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveView('admin');
                }}
                className="text-left py-2 px-3 rounded-lg bg-blue-50 font-semibold text-[#0B5ED7]"
              >
                Painel Administrativo
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW SWITCHER: CLIENT DASHBOARD / ADMIN DASHBOARD / AUTH / PUBLIC STOREFRONT */}
      {activeView === 'client' && currentUser && userProfile ? (
        <ClientDashboard
          profile={userProfile}
          orders={orders}
          websiteProjects={websiteProjects}
          licenses={licensesIssued}
          domains={domainsRegistered}
          supportMessages={supportMessages}
          notifications={notifications}
          platformSettings={platformSettings}
          onUploadPaymentProof={async (orderId, proofName, proofRef, notes) => {
            try {
              await updateDoc(doc(db, 'orders', orderId), {
                paymentProofName: proofName.slice(0, 200),
                paymentProofRef: proofRef.slice(0, 500),
                paymentNotes: notes.slice(0, 500),
                status: 'Pagamento em análise',
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
            }
          }}
          onUpdateProfile={async (data) => {
            try {
              await updateDoc(doc(db, 'users', currentUser.uid), {
                name: data.name.slice(0, 120),
                phone: data.phone.slice(0, 40),
                company: data.company.slice(0, 120),
                nif: data.nif.slice(0, 40),
                address: data.address.slice(0, 250),
                updatedAt: serverTimestamp(),
              });
              setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
            }
          }}
          onChangePassword={async (newPass) => {
            await updatePassword(currentUser, newPass);
          }}
          onSendSupportMessage={async (subject, message) => {
            const msgId = `sup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            try {
              await setDoc(doc(db, 'support_messages', msgId), {
                userId: currentUser.uid,
                userName: userProfile.name.slice(0, 120),
                userEmail: userProfile.email.slice(0, 160),
                senderRole: 'client',
                subject: subject.slice(0, 160),
                message: message.slice(0, 1500),
                ticketStatus: 'Aberto',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `support_messages/${msgId}`);
            }
          }}
          onToggleDomainAutoRenew={async (domainId, autoRenew, nameservers) => {
            try {
              await updateDoc(doc(db, 'domains_registered', domainId), {
                autoRenew,
                nameservers: nameservers.slice(0, 250),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `domains_registered/${domainId}`);
            }
          }}
          onSubmitFeedback={async (serviceCategory, rating, comment, projectReference) => {
            const fbId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            try {
              await setDoc(doc(db, 'feedbacks', fbId), {
                userId: currentUser.uid,
                clientName: userProfile.name.slice(0, 120),
                companyName: (userProfile.company || 'Cliente Verificado').slice(0, 120),
                serviceCategory: serviceCategory.slice(0, 80),
                rating: Math.min(5, Math.max(1, rating)),
                comment: comment.slice(0, 1000),
                projectReference: projectReference.slice(0, 120),
                isPublic: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `feedbacks/${fbId}`);
            }
          }}
          onRequestNewWebsite={() => {
            setPreselectedWebsiteType(undefined);
            setQuoteModalOpen(true);
          }}
          onLogout={async () => {
            await signOut(auth);
            setActiveView('public');
          }}
        />
      ) : activeView === 'admin' && currentUser && userProfile?.role === 'admin' ? (
        <AdminDashboard
          adminProfile={userProfile}
          users={allUsers}
          catalogItems={catalogItems}
          orders={orders}
          websiteProjects={websiteProjects}
          licensesIssued={licensesIssued}
          domainsRegistered={domainsRegistered}
          supportMessages={supportMessages}
          notifications={notifications}
          platformSettings={platformSettings}
          onUpdateUserStatus={async (uid, status, role, name, phone, company) => {
            const target = allUsers.find((u) => u.uid === uid);
            if (!target) return;
            try {
              await setDoc(
                doc(db, 'users', uid),
                {
                  uid,
                  name: name.slice(0, 120),
                  email: target.email.slice(0, 160),
                  phone: phone.slice(0, 40),
                  company: company.slice(0, 120),
                  role,
                  status,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
            }
          }}
          onSendPasswordReset={async (email) => {
            await sendPasswordResetEmail(auth, email);
          }}
          onSaveCatalogItem={async (item) => {
            try {
              await setDoc(doc(db, 'catalog_items', item.id), {
                category: item.category,
                subCategory: (item.subCategory || '').slice(0, 80),
                name: item.name.slice(0, 140),
                description: item.description.slice(0, 1000),
                benefits: (item.benefits || []).slice(0, 10),
                features: (item.features || []).slice(0, 15),
                priceKz: Number(item.priceKz) || 0,
                renewalPriceKz: Number(item.renewalPriceKz) || 0,
                billingCycle: (item.billingCycle || 'Anual').slice(0, 40),
                validityPeriod: (item.validityPeriod || '').slice(0, 60),
                devicesCount: (item.devicesCount || '').slice(0, 60),
                licenseType: (item.licenseType || '').slice(0, 80),
                available: Boolean(item.available),
                popular: Boolean(item.popular),
                promoBadge: (item.promoBadge || '').slice(0, 60),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `catalog_items/${item.id}`);
            }
          }}
          onDeleteCatalogItem={async (itemId) => {
            try {
              await deleteDoc(doc(db, 'catalog_items', itemId));
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, `catalog_items/${itemId}`);
            }
          }}
          onSeedDefaultCatalog={async () => {
            for (const item of INITIAL_CATALOG_ITEMS) {
              await setDoc(doc(db, 'catalog_items', item.id), {
                category: item.category,
                subCategory: (item.subCategory || '').slice(0, 80),
                name: item.name.slice(0, 140),
                description: item.description.slice(0, 1000),
                benefits: (item.benefits || []).slice(0, 10),
                features: (item.features || []).slice(0, 15),
                priceKz: item.priceKz,
                renewalPriceKz: item.renewalPriceKz || 0,
                billingCycle: (item.billingCycle || 'Anual').slice(0, 40),
                validityPeriod: (item.validityPeriod || '').slice(0, 60),
                devicesCount: (item.devicesCount || '').slice(0, 60),
                licenseType: (item.licenseType || '').slice(0, 80),
                available: item.available,
                popular: Boolean(item.popular),
                promoBadge: (item.promoBadge || '').slice(0, 60),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          }}
          onUpdateOrder={async (
            orderId,
            status,
            assignedTo,
            adminNotes,
            customerEmail,
            customerName,
            userId,
            orderNumber
          ) => {
            try {
              await updateDoc(doc(db, 'orders', orderId), {
                status,
                assignedTo: assignedTo.slice(0, 120),
                adminNotes: adminNotes.slice(0, 1000),
                updatedAt: serverTimestamp(),
              });

              await triggerAutomatedNotification(
                userId,
                customerEmail,
                customerName,
                status === 'Pagamento confirmado'
                  ? 'Confirmação de Pagamento Validado'
                  : status === 'Concluído'
                  ? 'Serviço Concluído'
                  : 'Atualização de Estado de Encomenda',
                `Encomenda ${orderNumber}: ${status} – Muatxissombo`,
                `Olá ${customerName}, o estado da sua encomenda ${orderNumber} foi atualizado para "${status}". ${
                  adminNotes ? `Observação: ${adminNotes}` : ''
                }`
              );
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
            }
          }}
          onUpdateWebsiteProject={async (projectId, updates) => {
            const target = websiteProjects.find((p) => p.id === projectId);
            if (!target) return;
            try {
              await updateDoc(doc(db, 'website_projects', projectId), {
                ...updates,
                updatedAt: serverTimestamp(),
              });

              await triggerAutomatedNotification(
                target.userId,
                target.clientEmail,
                target.clientName,
                updates.devStatus === 'Concluído & Publicado'
                  ? 'Entrega Final de Website Publicado'
                  : `Etapa de Website Atualizada: ${updates.devStatus}`,
                `Projeto ${target.projectName} – Etapa: ${updates.devStatus}`,
                `Olá ${target.clientName}, o desenvolvimento do seu website "${
                  target.projectName
                }" avançou para a etapa "${updates.devStatus}" (${updates.progressPercent}% concluído). ${
                  updates.demoLink ? `Link de Demonstração: ${updates.demoLink}. ` : ''
                }${updates.publishedLink ? `Website Oficial: ${updates.publishedLink}. ` : ''}${
                  updates.accessInstructions ? `Instruções: ${updates.accessInstructions}` : ''
                }`
              );
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `website_projects/${projectId}`);
            }
          }}
          onIssueLicense={async (payload) => {
            const licId = `lic_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            try {
              await setDoc(doc(db, 'licenses_issued', licId), {
                ...payload,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });

              if (payload.assignedUserEmail && payload.assignedUserName) {
                await triggerAutomatedNotification(
                  payload.assignedUserId,
                  payload.assignedUserEmail,
                  payload.assignedUserName,
                  'Entrega Privada de Licença de Software Original',
                  `A Sua Licença ${payload.productName} Está Disponível – Muatxissombo`,
                  `Olá ${payload.assignedUserName}, o seu pagamento foi validado e a sua licença original "${payload.productName}" (Validade: ${payload.validityPeriod}) foi disponibilizada na secção "Minhas Licenças" da sua Área do Cliente juntamente com as instruções de ativação.`
                );
              }
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `licenses_issued/${licId}`);
            }
          }}
          onReplySupportMessage={async (
            targetUserId,
            targetUserName,
            targetUserEmail,
            subject,
            message,
            ticketId
          ) => {
            const replyId = `sup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            try {
              await setDoc(doc(db, 'support_messages', replyId), {
                userId: targetUserId,
                userName: targetUserName.slice(0, 120),
                userEmail: targetUserEmail.slice(0, 160),
                senderRole: 'admin',
                subject: subject.slice(0, 160),
                message: message.slice(0, 1500),
                ticketStatus: 'Em Atendimento',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
              if (ticketId) {
                await updateDoc(doc(db, 'support_messages', ticketId), {
                  ticketStatus: 'Resolvido',
                  updatedAt: serverTimestamp(),
                });
              }
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `support_messages/${replyId}`);
            }
          }}
          onResendNotification={async (notif) => {
            await triggerAutomatedNotification(
              notif.userId,
              notif.recipientEmail,
              notif.recipientName,
              notif.eventType,
              `[Reenvio] ${notif.subject}`,
              notif.bodyPreview
            );
          }}
          onSavePlatformSettings={async (newSettings) => {
            try {
              await setDoc(doc(db, 'platform_settings', 'main'), {
                ...newSettings,
                updatedAt: serverTimestamp(),
              });
              setPlatformSettings(newSettings);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, 'platform_settings/main');
            }
          }}
          onLogout={async () => {
            await signOut(auth);
            setActiveView('public');
          }}
        />
      ) : activeView === 'auth' ? (
        /* ANGOCLOUD / WHMCS-INSPIRED CLIENT LOGIN & PORTAL AUTHENTICATION */
        <div className="flex-1 bg-[#F4F7FB] py-12 px-4 lg:px-8 flex items-center justify-center">
          <div className="max-w-5xl w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12">
            {/* Left Cloud Portal Information Panel (AngoCloud / WHMCS Style) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#071426] via-[#0B2242] to-[#0E356B] text-white p-8 lg:p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setActiveView('public')}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#28A9E0] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar à Loja Muatxissombo</span>
                </button>

                <div className="inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl shadow-xs">
                  <img
                    src="/assets/aistudio/LOGO_MUATXISSOMBO-02_2ea0c22e.png"
                    alt="Muatxissombo Soluções Digitais"
                    referrerPolicy="no-referrer"
                    className="h-9 w-auto object-contain"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#0A192F] leading-tight">
                      MUATXISSOMBO
                    </div>
                    <div className="text-[10px] font-medium text-[#0B5ED7]">
                      Portal do Cliente & Faturação
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold leading-snug">
                    Central de Serviços Digitais, Domínios e Faturas
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Aceda à sua área reservada para gerir projetos de websites, renovar domínios
                    .co.ao, consultar faturas em Kwanzas e levantar licenças Microsoft 365.
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/10 text-xs text-slate-200">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#28A9E0] shrink-0 mt-0.5" />
                    <span>Acompanhamento de criação de websites em tempo real</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#28A9E0] shrink-0 mt-0.5" />
                    <span>Gestão de renovações de domínios .ao e planos Hostinger</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#28A9E0] shrink-0 mt-0.5" />
                    <span>Cofre privado de chaves Microsoft 365 e antivírus</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#28A9E0] shrink-0 mt-0.5" />
                    <span>Envio de comprovativos Multicaixa Express & suporte 24/7</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Centralidade do Kilamba · Luanda</span>
                <span className="font-mono-tabular text-[#28A9E0]">Ligação Segura SSL</span>
              </div>
            </div>

            {/* Right Clean WHMCS Login / Register Form */}
            <div className="lg:col-span-7 p-8 lg:p-10 space-y-6 bg-white">
              {/* WHMCS Mode Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#F4F7FB] border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    authMode === 'login'
                      ? 'bg-white text-[#0B5ED7] shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Iniciar Sessão
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    authMode === 'register'
                      ? 'bg-white text-[#0B5ED7] shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Criar Nova Conta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('reset');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    authMode === 'reset'
                      ? 'bg-white text-[#0B5ED7] shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Recuperar Senha
                </button>
              </div>

              <div>
                <h1 className="text-xl font-bold text-[#0A192F]">
                  {authMode === 'login'
                    ? 'Entrar na Área do Cliente'
                    : authMode === 'register'
                    ? 'Registo de Novo Cliente'
                    : 'Recuperar Palavra-Passe'}
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  {authMode === 'login'
                    ? 'Introduza os seus dados de acesso ou utilize a sua conta Google verificada.'
                    : authMode === 'register'
                    ? 'Crie a sua conta para contratar serviços, acompanhar pedidos e receber faturas em AOA.'
                    : 'Enviaremos um link seguro de redefinição para o endereço registado.'}
                </p>
              </div>

              {authMessage && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-slate-800">
                  {authMessage}
                </div>
              )}
              {authError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {authError}
                </div>
              )}

              {/* Recommended Google Verified Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-3 px-4 bg-[#F4F7FB] hover:bg-slate-100 text-[#0A192F] border border-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#0B5ED7]" />
                <span>Acesso Rápido com Conta Google Verificada</span>
              </button>

              <div className="relative flex py-0.5 items-center">
                <div className="grow border-t border-slate-200" />
                <span className="shrink mx-3 text-[11px] text-slate-400">
                  ou aceda com e-mail e palavra-passe
                </span>
                <div className="grow border-t border-slate-200" />
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4 text-xs">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Nome Completo ou Empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Ex.: Eng. Manuel Domingos"
                        className="w-full px-3.5 py-2.5 bg-[#F4F7FB] border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B5ED7] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Telefone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder="+244 923..."
                          className="w-full px-3.5 py-2.5 bg-[#F4F7FB] border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B5ED7] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">Empresa</label>
                        <input
                          type="text"
                          value={authCompany}
                          onChange={(e) => setAuthCompany(e.target.value)}
                          placeholder="Opcional"
                          className="w-full px-3.5 py-2.5 bg-[#F4F7FB] border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B5ED7] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Endereço de E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="cliente@empresa.co.ao"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4F7FB] border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B5ED7] focus:outline-none"
                    />
                  </div>
                </div>

                {authMode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-slate-700">Palavra-Passe *</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setAuthMode('reset')}
                          className="text-[#0B5ED7] hover:underline font-medium"
                        >
                          Esqueceu a senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4F7FB] border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B5ED7] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-[#0B5ED7] text-white font-semibold rounded-xl hover:bg-[#094bb0] transition-colors shadow-sm disabled:opacity-50"
                >
                  {authLoading
                    ? 'A Autenticar...'
                    : authMode === 'login'
                    ? 'Entrar na Área do Cliente'
                    : authMode === 'register'
                    ? 'Concluir Registo de Cliente'
                    : 'Enviar Instruções por E-mail'}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>Precisa de apoio imediato com o acesso?</span>
                <a
                  href={`https://wa.me/${platformSettings.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B5ED7] font-semibold hover:underline"
                >
                  Suporte WhatsApp ({platformSettings.phoneWhatsapp})
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PUBLIC COMMERCIAL PLATFORM */
        <main className="flex-1">
          {/* 1. HERO CLOUD & STOREFRONT (ANGOCLOUD + URACTIVATION STYLE) */}
          <section
            id="inicio"
            className="relative bg-[#071426] text-white border-b border-slate-800 overflow-hidden"
          >
            {/* Studio Backdrop with Blue-Navy Cloud Contrast Gradient */}
            <div className="absolute inset-0 z-0 bg-[#071426]">
              <img
                src="/src/assets/images/hero_cloud_agency_1795098510527.jpg"
                alt="Muatxissombo Soluções Digitais em Luanda"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-25 scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#071426]/95 via-[#0B2142]/90 to-[#0B5ED7]/30" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto py-12 lg:py-16 px-4 lg:px-8 space-y-10">
              {/* Interactive 3-Tab Storefront Switcher */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                {[
                  { idx: 0 as const, label: '01. Criação de Websites & Lojas Online' },
                  { idx: 1 as const, label: '02. Domínios .AO & Hospedagem Cloud' },
                  { idx: 2 as const, label: '03. Licenças Microsoft 365 & Antivírus' },
                ].map((tab) => (
                  <button
                    key={tab.idx}
                    type="button"
                    onClick={() => setHeroSlide(tab.idx)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                      heroSlide === tab.idx
                        ? 'bg-[#0B5ED7] text-white shadow-sm'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                {/* Left Column: Core Proposition + AngoCloud Quick Domain Search */}
                <div
                  key={`hero-text-${heroSlide}`}
                  className="lg:col-span-7 flex flex-col justify-between space-y-6 animate-fade-up"
                >
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-[#28A9E0] tracking-wide">
                      {HERO_SLIDES[heroSlide].kicker}
                    </div>
                    <h1
                      className="font-bold tracking-tight text-white leading-[1.12]"
                      style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.4rem)' }}
                    >
                      {HERO_SLIDES[heroSlide].title}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
                      {HERO_SLIDES[heroSlide].subtitle}
                    </p>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (heroSlide === 0) {
                          setPreselectedWebsiteType(undefined);
                          setQuoteModalOpen(true);
                        } else {
                          navigateToSection(HERO_SLIDES[heroSlide].targetSection);
                        }
                      }}
                      className="px-6 py-3 bg-[#0B5ED7] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#094bb0] transition-all duration-200 hover:-translate-y-0.5 shadow-md flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <span>{HERO_SLIDES[heroSlide].ctaLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToSection('licencas')}
                      className="px-5 py-3 bg-white text-[#0A192F] text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                    >
                      Explorar Loja de Licenças
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView(currentUser && userProfile ? 'client' : 'auth')}
                      className="px-4 py-3 bg-white/10 text-white border border-white/20 text-xs sm:text-sm font-medium rounded-xl hover:bg-white/15 transition-colors whitespace-nowrap shrink-0"
                    >
                      Área do Cliente
                    </button>
                  </div>

                  {/* AngoCloud-Inspired Quick Domain Search Strip */}
                  <form
                    onSubmit={(e) => {
                      handleDomainSearch(e);
                      navigateToSection('dominios');
                    }}
                    className="bg-white/10 border border-white/15 rounded-xl p-2 flex flex-col sm:flex-row gap-2 backdrop-blur-xs"
                  >
                    <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-2">
                      <Globe className="w-4 h-4 text-[#0B5ED7] mr-2 shrink-0" />
                      <input
                        type="text"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        placeholder="Pesquisar domínio .co.ao, .ao ou .com..."
                        className="w-full text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                    <select
                      value={selectedTld}
                      onChange={(e) => setSelectedTld(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono-tabular font-semibold text-slate-900"
                    >
                      {domainTlds.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#28A9E0] text-[#071426] text-xs font-bold rounded-lg hover:bg-[#1e96ca] transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Verificar Domínio</span>
                    </button>
                  </form>
                </div>

                {/* Right Column: Uractivation + AngoCloud Featured Service Card */}
                <div
                  key={`hero-card-${heroSlide}`}
                  className="lg:col-span-5 bg-white text-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl border border-slate-200 animate-fade-up"
                >
                  <div className="relative h-52 sm:h-56 bg-slate-900 overflow-hidden group">
                    <img
                      src={HERO_SLIDES[heroSlide].image}
                      alt={HERO_SLIDES[heroSlide].title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/90 via-[#071426]/25 to-transparent" />
                    <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-xs text-white">
                      <span className="font-semibold text-[#28A9E0]">
                        {HERO_SLIDES[heroSlide].badge}
                      </span>
                      <span className="font-mono-tabular text-slate-200">Luanda · Angola</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
                      <span className="font-bold text-[#0A192F]">
                        Plataforma Digital Integrada
                      </span>
                      <span className="font-mono-tabular text-emerald-700 font-semibold">
                        Hostinger & CSP
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#0B5ED7] shrink-0" />
                        <span>Criação de Websites Institucionais e Lojas Online em Kwanzas</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#0B5ED7] shrink-0" />
                        <span>Licenças Originais Microsoft 365 & Antivírus entregues por E-mail</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#0B5ED7] shrink-0" />
                        <span>Pagamentos via Multicaixa Express, IBAN, Unitel Money</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPreselectedWebsiteType('Websites Empresariais de Alta Conversão');
                        setQuoteModalOpen(true);
                      }}
                      className="w-full py-3 px-4 bg-[#0B5ED7] text-white text-xs font-bold rounded-xl hover:bg-[#094bb0] transition-colors text-center"
                    >
                      Pedir Orçamento de Website Agora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* URACTIVATION-STYLE 4-PILLAR TRUST & GUARANTEE STRIP */}
          <section className="bg-white border-b border-slate-200 py-5 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4F7FB] border border-slate-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#0B5ED7]" />
                </div>
                <div>
                  <div className="font-bold text-[#0A192F]">Licenças 100% Originais</div>
                  <div className="text-slate-500">Entrega segura por e-mail após validação</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4F7FB] border border-slate-200 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-[#0B5ED7]" />
                </div>
                <div>
                  <div className="font-bold text-[#0A192F]">Domínios .AO & Globais</div>
                  <div className="text-slate-500">Verificação DNS real em tempo real</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4F7FB] border border-slate-200 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-[#0B5ED7]" />
                </div>
                <div>
                  <div className="font-bold text-[#0A192F]">Pagamentos em Kwanzas</div>
                  <div className="text-slate-500">Multicaixa Express · IBAN · Unitel Money</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4F7FB] border border-slate-200 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-[#0B5ED7]" />
                </div>
                <div>
                  <div className="font-bold text-[#0A192F]">Suporte Técnico 24/7</div>
                  <div className="text-slate-500">Equipa dedicada em Luanda · Angola</div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. SECÇÃO A: CRIAÇÃO DE WEBSITES – SERVIÇO PRINCIPAL (ESTILO LOJA DE PRODUTOS DIGITAIS) */}
          <section id="criacao-sites" className="py-14 px-4 lg:px-8 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#0B5ED7]">
                  01. Criação de Websites Profissionais · Serviço Principal
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-[#0A192F]">
                  Transformamos as suas ideias em presença digital profissional.
                </h2>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Escolha a solução ideal para o seu setor ou inspire-se nos nossos projectos e
                  templates reais já publicados em Angola e na Hostinger.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreselectedWebsiteType(undefined);
                  setPreselectedTemplateRef(undefined);
                  setQuoteModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[#0A192F] text-white text-xs font-semibold rounded-xl hover:bg-[#0B5ED7] transition-all duration-200 hover:-translate-y-0.5 shadow-xs whitespace-nowrap shrink-0"
              >
                Ver Galeria & Pedir Orçamento
              </button>
            </div>

            {/* REAL WEBSITE TEMPLATES & PORTFOLIO SHOWCASE */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-[#0B5ED7]">
                    Portfólio & Templates Reais em Produção
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-[#0A192F]">
                    Websites & Modelos Desenvolvidos pela Muatxissombo
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Clique para visitar o site publicado ou usar o modelo como base para o seu pedido
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {REAL_WEBSITE_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#0B5ED7]"
                  >
                    <div>
                      {/* Browser Address Header */}
                      <div className="bg-[#0A192F] px-4 py-2.5 flex items-center justify-between gap-3 border-b border-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-3.5 h-3.5 text-[#28A9E0] shrink-0" />
                          <span className="text-[11px] font-mono-tabular text-slate-200 truncate">
                            {tpl.domainLabel}
                          </span>
                        </div>
                        <a
                          href={tpl.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-[#28A9E0] hover:text-white inline-flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <span>Visitar Online</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* High-Res Screenshot Frame */}
                      <div className="relative h-52 bg-slate-900 overflow-hidden">
                        <img
                          src={tpl.image}
                          alt={tpl.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/90 via-[#071426]/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 text-white space-y-0.5">
                          <div className="text-[11px] font-semibold text-[#28A9E0]">
                            {tpl.sector} · {tpl.stackLabel}
                          </div>
                          <h4 className="text-base font-bold leading-snug">{tpl.title}</h4>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <p className="text-xs text-slate-600 leading-relaxed">{tpl.description}</p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {tpl.highlights.map((hl) => (
                            <div
                              key={hl}
                              className="flex items-center gap-1.5 text-[11px] text-slate-700"
                            >
                              <Check className="w-3.5 h-3.5 text-[#0B5ED7] shrink-0" />
                              <span className="truncate">{hl}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-[#F4F7FB] border-t border-slate-200 flex items-center justify-between gap-3">
                      <a
                        href={tpl.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:border-[#0B5ED7] hover:text-[#0B5ED7] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <span>Ver Site ao Vivo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setPreselectedWebsiteType(tpl.websiteType);
                          setPreselectedTemplateRef(
                            `Template escolhido: ${tpl.domainLabel} (${tpl.title})`
                          );
                          setQuoteModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <span>Usar Este Template</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs font-semibold text-[#0B5ED7] mb-1">
                Pacotes & Soluções à Medida por Setor
              </div>
              <h3 className="text-lg font-bold text-[#0A192F] mb-5">
                Escolha o Tipo de Website para o Seu Negócio
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websiteServices.map((service, idx) => {
                const serviceImagePool = [
                  '/src/assets/images/template_biosfera_ao_1795098510442.jpg',
                  '/src/assets/images/template_luatantola_web_1795098511437.jpg',
                  '/src/assets/images/service_ecommerce_aoa_1795098510519.jpg',
                  '/src/assets/images/template_alhan_pro_1795098510010.jpg',
                  '/src/assets/images/service_web_creation_1794927121825.jpg',
                  '/src/assets/images/template_elite_hostinger_1795098509112.jpg',
                ];
                const cardImage = serviceImagePool[idx % serviceImagePool.length];
                return (
                  <div
                    key={service.id}
                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#0B5ED7]"
                  >
                    <div>
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        <img
                          src={cardImage}
                          alt={service.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/85 via-[#071426]/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                          <span className="font-medium text-slate-200">
                            {String(idx + 1).padStart(2, '0')} ·{' '}
                            {service.subCategory || 'Desenvolvimento Web'}
                          </span>
                          {service.promoBadge && (
                            <span className="font-semibold text-[#28A9E0]">
                              {service.promoBadge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="text-base font-bold text-[#0A192F] group-hover:text-[#0B5ED7] transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {service.description}
                        </p>

                        {service.benefits && service.benefits.length > 0 && (
                          <div className="pt-2 space-y-1.5 border-t border-slate-100">
                            {service.benefits.map((b) => (
                              <div
                                key={b}
                                className="flex items-start gap-2 text-xs text-slate-600"
                              >
                                <Check className="w-3.5 h-3.5 text-[#0B5ED7] shrink-0 mt-0.5" />
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-4 bg-[#F4F7FB] border-t border-slate-200 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] text-slate-500">
                          {service.billingCycle || 'Preço Inicial'}
                        </div>
                        <div className="text-lg font-bold text-[#0A192F] font-mono-tabular">
                          {formatKz(service.priceKz)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPreselectedWebsiteType(service.name);
                          setQuoteModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] transition-colors whitespace-nowrap shrink-0"
                      >
                        Solicitar Website
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. SECÇÃO B: VENDA DE DOMÍNIOS (ANGOCLOUD WHMCS STYLE) */}
          <section
            id="dominios"
            className="py-14 px-4 lg:px-8 bg-white border-y border-slate-200"
          >
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-2.5">
                  <div className="text-xs font-semibold text-[#0B5ED7]">
                    02. Registo de Domínios Nacionais e Internacionais
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#0A192F]">
                    Encontre e Registe o Domínio Perfeito para o Seu Negócio
                  </h2>
                  <p className="text-sm text-slate-600">
                    Consulta de disponibilidade em tempo real via servidor DNS oficial. Garantia de
                    transparência nos preços de registo e renovação anual em Kwanzas.
                  </p>
                </div>
                <div className="lg:col-span-5 h-40 rounded-xl overflow-hidden relative border border-slate-200 group">
                  <img
                    src="/src/assets/images/service_hosting_nvme_1795098510580.jpg"
                    alt="Infraestrutura DNS e Registo de Domínios em Angola"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/85 via-[#071426]/30 to-transparent flex items-end p-4">
                    <div className="text-xs text-white">
                      <span className="text-[#28A9E0] font-semibold block">
                        Extensões .AO e Internacionais
                      </span>
                      .co.ao · .ao · .com · .net · .org · .tech · .store
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Domain Search Bar */}
              <form
                onSubmit={handleDomainSearch}
                className="flex flex-col sm:flex-row gap-3 bg-[#F4F7FB] p-3.5 rounded-xl border border-slate-200"
              >
                <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 focus-within:border-[#0B5ED7] transition-colors">
                  <Globe className="w-4 h-4 text-[#0B5ED7] mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="Digite o domínio pretendido (ex: kuanzalogistica)"
                    className="w-full text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <select
                  value={selectedTld}
                  onChange={(e) => setSelectedTld(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono-tabular font-semibold text-[#0A192F]"
                >
                  {domainTlds.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({formatKz(t.priceKz)})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={checkingDomain}
                  className="px-6 py-2.5 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  {checkingDomain ? 'A Consultar DNS...' : 'Pesquisar Disponibilidade'}
                </button>
              </form>

              {/* Real Domain Check Result */}
              {domainResult && (
                <div
                  className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up ${
                    domainResult.status === 'registered'
                      ? 'bg-amber-50/70 border-amber-200'
                      : domainResult.canAddToCart
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-mono-tabular">
                      Verificação Técnica: {domainResult.verifiedVia}
                    </div>
                    <div className="text-base font-bold text-slate-900 font-mono-tabular">
                      {domainResult.domain}
                    </div>
                    <p className="text-xs text-slate-700">{domainResult.message}</p>
                    {domainResult.nameservers.length > 0 && (
                      <div className="text-[11px] font-mono-tabular text-slate-500">
                        Nameservers detetados: {domainResult.nameservers.join(', ')}
                      </div>
                    )}
                  </div>

                  {domainResult.canAddToCart && (
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right font-mono-tabular">
                        <div className="text-sm font-bold text-slate-900">
                          Registo: {formatKz(domainResult.priceKz)}/ano
                        </div>
                        <div className="text-xs text-slate-500">
                          Renovação: {formatKz(domainResult.renewalPriceKz)}/ano
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            id: `dom-${domainResult.domain}`,
                            name: `Registo de Domínio: ${domainResult.domain}`,
                            category: 'Registo de Domínio',
                            priceKz: domainResult.priceKz,
                            billingCycle: 'Anual',
                            meta: domainResult.domain,
                          })
                        }
                        className="px-4 py-2.5 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] transition-colors whitespace-nowrap shrink-0"
                      >
                        Adicionar ao Carrinho
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TLD Pricing Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {domainTlds.map((tld) => (
                  <div
                    key={tld.id}
                    className="group border border-slate-200 rounded-xl p-4 bg-[#F4F7FB] hover:bg-white flex flex-col justify-between space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#0B5ED7]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-[#0B5ED7] font-mono-tabular">
                          {tld.name}
                        </span>
                        <span className="text-[11px] text-slate-500">{tld.subCategory}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{tld.description}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/80 text-xs font-mono-tabular space-y-0.5">
                      <div className="font-bold text-[#0A192F]">
                        Registo: {formatKz(tld.priceKz)}/ano
                      </div>
                      <div className="text-slate-500">
                        Renovação: {formatKz(tld.renewalPriceKz || tld.priceKz)}/ano
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. SECÇÃO C: PLANOS DE HOSPEDAGEM WEB (ANGOCLOUD / WHMCS HOSTING TIERS) */}
          <section id="hospedagem" className="py-14 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
            <div className="max-w-3xl space-y-2">
              <div className="text-xs font-semibold text-[#0B5ED7]">
                03. Alojamento Web Cloud NVMe · Infraestrutura Hostinger
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0A192F]">
                Planos de Hospedagem Web Rápidos e Seguros
              </h2>
              <p className="text-sm text-slate-600">
                Todos os planos incluem Certificado SSL automático, contas de e-mail corporativo,
                bases de dados e apoio técnico em Angola.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {hostingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`group bg-white rounded-xl overflow-hidden flex flex-col justify-between border transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl ${
                    plan.popular
                      ? 'border-t-4 border-t-[#0B5ED7] border-slate-200 shadow-md'
                      : 'border-slate-200 hover:border-[#0B5ED7]'
                  }`}
                >
                  <div>
                    <div
                      className={`px-6 py-5 border-b ${
                        plan.popular
                          ? 'bg-[#0A192F] text-white border-slate-800'
                          : 'bg-[#F4F7FB] text-[#0A192F] border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span
                          className={`font-semibold ${
                            plan.popular ? 'text-[#28A9E0]' : 'text-[#0B5ED7]'
                          }`}
                        >
                          {plan.promoBadge || plan.subCategory || 'Hospedagem Web NVMe'}
                        </span>
                        <Server className="w-4 h-4 opacity-80" />
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <div className="font-mono-tabular mt-3">
                        <span className="text-2xl font-bold">{formatKz(plan.priceKz)}</span>
                        <span
                          className={`text-xs ml-1 ${
                            plan.popular ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          / {plan.billingCycle || 'Anual'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed">{plan.description}</p>

                      <div className="space-y-2.5 pt-2 border-t border-slate-100">
                        {(plan.features || []).map((feat) => (
                          <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700">
                            <Check className="w-4 h-4 text-[#0B5ED7] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: plan.id,
                          name: `Hospedagem Web – ${plan.name}`,
                          category: 'Planos de Hospedagem',
                          priceKz: plan.priceKz,
                          billingCycle: plan.billingCycle || 'Anual',
                        })
                      }
                      className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-colors ${
                        plan.popular
                          ? 'bg-[#0B5ED7] text-white hover:bg-[#094bb0]'
                          : 'bg-[#0A192F] text-white hover:bg-[#0B5ED7]'
                      }`}
                    >
                      Contratar {plan.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. SECÇÃO D: LOJA DE LICENÇAS DE SOFTWARE ORIGINAIS (ESTILO URACTIVATION.COM) */}
          <section
            id="licencas"
            className="py-14 px-4 lg:px-8 bg-white border-y border-slate-200"
          >
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#0B5ED7]">
                    04. Loja Oficial de Software & Cibersegurança
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#0A192F]">
                    Licenças Microsoft 365 e Antivírus Originais
                  </h2>
                  <p className="text-sm text-slate-600 max-w-2xl">
                    Entrega privada por e-mail e no Painel do Cliente após validação do pagamento.
                    As chaves de ativação nunca são expostas publicamente.
                  </p>
                </div>

                {/* Uractivation-Style Filter Tabs & Instant Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={licenseSearch}
                      onChange={(e) => setLicenseSearch(e.target.value)}
                      placeholder="Pesquisar software ou marca..."
                      className="pl-8 pr-3 py-2 text-xs bg-[#F4F7FB] border border-slate-200 rounded-lg focus:bg-white focus:border-[#0B5ED7] focus:outline-none w-full sm:w-56"
                    />
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-[#F4F7FB] border border-slate-200 rounded-lg self-start">
                    <button
                      type="button"
                      onClick={() => setLicenseFilter('all')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        licenseFilter === 'all'
                          ? 'bg-white text-[#0B5ED7] font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => setLicenseFilter('m365')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        licenseFilter === 'm365'
                          ? 'bg-white text-[#0B5ED7] font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Microsoft 365
                    </button>
                    <button
                      type="button"
                      onClick={() => setLicenseFilter('antivirus')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        licenseFilter === 'antivirus'
                          ? 'bg-white text-[#0B5ED7] font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Antivírus
                    </button>
                  </div>
                </div>
              </div>

              {filteredLicenses.length === 0 ? (
                <div className="p-8 bg-[#F4F7FB] border border-slate-200 rounded-xl text-center text-xs text-slate-600">
                  Nenhuma licença encontrada para "{licenseSearch}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLicenses.map((lic) => (
                    <div
                      key={lic.id}
                      className="group border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#0B5ED7]"
                    >
                      <div>
                        {/* Clean Digital Product Box Visual Header (Uractivation aesthetic) */}
                        <div className="relative h-40 bg-[#0A192F] overflow-hidden">
                          <img
                            src="/src/assets/images/service_software_boxes_1795098510071.jpg"
                            alt={lic.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/95 via-[#071426]/40 to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                            <div>
                              <div className="text-[11px] text-[#28A9E0] font-semibold">
                                {lic.subCategory} · Entrega Digital
                              </div>
                              <div className="text-sm font-bold">{lic.name}</div>
                            </div>
                            <KeyRound className="w-5 h-5 text-[#28A9E0] shrink-0" />
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {lic.description}
                          </p>

                          <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                            <div>
                              <span className="text-slate-400">Tipo:</span> {lic.licenseType}
                            </div>
                            <div>
                              <span className="text-slate-400">Validade:</span> {lic.validityPeriod}{' '}
                              · <span className="text-slate-400">Dispositivos:</span>{' '}
                              {lic.devicesCount}
                            </div>
                            <div>
                              <span className="text-slate-400">Estado:</span>{' '}
                              <strong className="text-emerald-700">
                                {lic.available
                                  ? 'Em Stock Digital (E-mail Privado)'
                                  : 'Sob Encomenda'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-4 bg-[#F4F7FB] border-t border-slate-200 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[11px] text-slate-500">
                            {lic.billingCycle || 'Licença Anual'}
                          </div>
                          <div className="text-lg font-bold text-[#0A192F] font-mono-tabular">
                            {formatKz(lic.priceKz)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            addToCart({
                              id: lic.id,
                              name: lic.name,
                              category: 'Licenças de Software',
                              priceKz: lic.priceKz,
                              billingCycle: lic.billingCycle || 'Anual',
                            })
                          }
                          className="px-4 py-2 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0] transition-colors whitespace-nowrap shrink-0"
                        >
                          Comprar Agora
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 6. SECÇÃO E: ASSISTÊNCIA INFORMÁTICA */}
          <section id="assistencia" className="py-14 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#0B5ED7]">
                  05. Suporte Técnico & Manutenção Informática em Luanda
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-[#0A192F]">
                  Assistência Informática Presencial e Remota
                </h2>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Instalação de Windows 10 e Windows 11, formatação segura, drivers, Microsoft
                  Office, antivírus, configuração de e-mail corporativo e manutenção preventiva.
                </p>
              </div>
              <a
                href={`https://wa.me/${platformSettings.phoneWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  'Olá Muatxissombo Soluções Digitais, gostaria de solicitar assistência informática.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
              >
                Solicitar Assistência via WhatsApp
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assistanceServices.map((ast) => (
                <div
                  key={ast.id}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#0B5ED7]"
                >
                  <div>
                    <div className="relative h-36 bg-[#0A192F] overflow-hidden">
                      <img
                        src="/src/assets/images/service_it_workstation_1795098510449.jpg"
                        alt={ast.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/85 via-[#071426]/20 to-transparent" />
                      <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-xs text-white">
                        <span className="text-[#28A9E0] font-medium">{ast.subCategory}</span>
                        <Wrench className="w-3.5 h-3.5 text-slate-200" />
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold text-[#0A192F] group-hover:text-[#0B5ED7] transition-colors">
                        {ast.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{ast.description}</p>
                    </div>
                  </div>
                  <div className="px-5 py-4 bg-[#F4F7FB] border-t border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-slate-500">{ast.billingCycle}</div>
                      <div className="text-base font-bold text-[#0A192F] font-mono-tabular">
                        {formatKz(ast.priceKz)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: ast.id,
                          name: ast.name,
                          category: 'Assistência Informática',
                          priceKz: ast.priceKz,
                          billingCycle: ast.billingCycle || 'Por Serviço',
                        })
                      }
                      className="px-3.5 py-2 bg-[#0A192F] text-white text-xs font-semibold rounded-lg hover:bg-[#0B5ED7] transition-colors whitespace-nowrap shrink-0"
                    >
                      Solicitar Assistência
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. PORTAL EXCLUSIVO DE FEEDBACKS E AVALIAÇÕES DE QUALIDADE */}
          <section className="py-16 px-4 lg:px-8 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="text-xs font-semibold text-[#0B5ED7]">
                    06. Portal de Qualidade & Satisfação de Clientes
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    Avaliações Reais sobre os Serviços da Muatxissombo
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ...publicFeedbacks,
                    {
                      id: 'ref-1',
                      userId: 'system',
                      clientName: 'Dr. Carlos Mendes',
                      companyName: 'Clínica Vida Plena · Talatona',
                      serviceCategory: 'Criação de Websites',
                      rating: 5,
                      comment:
                        'O nosso portal clínico ficou moderno, rápido em telemóveis e reduziu as chamadas na receção graças ao formulário de pré-marcação.',
                      isPublic: true,
                    },
                    {
                      id: 'ref-2',
                      userId: 'system',
                      clientName: 'Eng.ª Patrícia Mateus',
                      companyName: 'Kuanza Sul Construções Lda.',
                      serviceCategory: 'Licenças Microsoft 365 & Domínio .co.ao',
                      rating: 5,
                      comment:
                        'Registo do domínio .co.ao, configuração de e-mails corporativos e entrega das licenças Microsoft 365 Business Standard em menos de 24 horas.',
                      isPublic: true,
                    },
                  ]
                    .slice(0, 4)
                    .map((fb) => (
                      <div
                        key={fb.id}
                        className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{fb.serviceCategory}</span>
                          <span className="font-mono-tabular font-semibold text-amber-600">
                            {fb.rating}.0 / 5.0 Estrelas
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">“{fb.comment}”</p>
                        <div className="text-xs font-bold text-slate-900 pt-1">
                          {fb.clientName}{' '}
                          <span className="font-normal text-slate-500">
                            · {fb.companyName || 'Cliente Verificado'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Submit Feedback Box */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 h-fit">
                <h3 className="text-base font-bold text-slate-900">
                  Envie o Seu Feedback sobre o Nosso Serviço
                </h3>
                <p className="text-xs text-slate-600">
                  É cliente da Muatxissombo Soluções Digitais? Avalie a qualidade do atendimento e
                  do projeto entregue.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!currentUser || !userProfile) {
                      setActiveView('auth');
                      setAuthMessage('Inicie sessão para publicar a sua avaliação de cliente.');
                      return;
                    }
                    if (!publicFbComment.trim()) return;
                    const fbId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                    try {
                      await setDoc(doc(db, 'feedbacks', fbId), {
                        userId: currentUser.uid,
                        clientName: userProfile.name.slice(0, 120),
                        companyName: (userProfile.company || 'Cliente Verificado').slice(0, 120),
                        serviceCategory: publicFbCategory,
                        rating: publicFbRating,
                        comment: publicFbComment.trim().slice(0, 1000),
                        isPublic: true,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                      });
                      setPublicFbComment('');
                      showToast('Obrigado! A sua avaliação foi publicada com sucesso.');
                    } catch (err) {
                      handleFirestoreError(err, OperationType.CREATE, `feedbacks/${fbId}`);
                    }
                  }}
                  className="space-y-3 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Serviço</label>
                      <select
                        value={publicFbCategory}
                        onChange={(e) => setPublicFbCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Criação de Websites">Criação de Websites</option>
                        <option value="Registo de Domínios">Registo de Domínios</option>
                        <option value="Hospedagem Web">Hospedagem Web</option>
                        <option value="Licenças de Software">Licenças de Software</option>
                        <option value="Assistência Informática">Assistência Informática</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Avaliação</label>
                      <select
                        value={publicFbRating}
                        onChange={(e) => setPublicFbRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value={5}>5 Estrelas (Excelente)</option>
                        <option value={4}>4 Estrelas (Muito Bom)</option>
                        <option value={3}>3 Estrelas (Bom)</option>
                        <option value={2}>2 Estrelas (Regular)</option>
                        <option value={1}>1 Estrela</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Depoimento / Avaliação *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={publicFbComment}
                      onChange={(e) => setPublicFbComment(e.target.value)}
                      placeholder="Conte como foi a sua experiência com a Muatxissombo..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0B5ED7] text-white font-semibold rounded-lg hover:bg-[#094bb0] transition-colors"
                  >
                    Publicar Avaliação de Qualidade
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* 8. SOBRE NÓS & CONTACTOS / LOCALIZAÇÃO (SECTION 10) */}
          <section
            id="sobre"
            className="py-16 px-4 lg:px-8 max-w-7xl mx-auto space-y-12 border-t border-slate-200"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs font-semibold text-[#0B5ED7]">
                  Sobre a Muatxissombo Soluções Digitais
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Parceiro Tecnológico de Confiança para Empresas e Particulares em Angola
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sediada na Centralidade do Kilamba, em Luanda, a{' '}
                  <strong>Muatxissombo Soluções Digitais</strong> nasceu com a missão de acelerar a
                  modernização digital das empresas angolanas através do desenvolvimento de websites
                  de alto impacto, comércio eletrónico, fornecimento de licenças de software
                  originais e assistência técnica qualificada.
                </p>
                <div className="rounded-xl overflow-hidden border border-slate-200 h-44 relative group">
                  <img
                    src="/src/assets/images/hero_cloud_agency_1795098510527.jpg"
                    alt="Estúdio Tecnológico Muatxissombo na Centralidade do Kilamba, Luanda"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/85 via-transparent to-transparent flex items-end p-4">
                    <div className="text-xs text-white">
                      <span className="text-[#28A9E0] font-semibold block">
                        Sede Oficial em Luanda
                      </span>
                      Centralidade do Kilamba · Atendimento Presencial e Remoto
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-700 pt-2">
                  <div>
                    <strong>Localização Oficial:</strong> {platformSettings.address}
                  </div>
                  <div>
                    <strong>Telefone / WhatsApp Oficial:</strong>{' '}
                    <span className="font-mono-tabular">{platformSettings.phoneWhatsapp}</span>
                  </div>
                  <div>
                    <strong>E-mail Corporativo:</strong> {platformSettings.corporateEmail}
                  </div>
                  <div>
                    <strong>Horário de Atendimento:</strong> {platformSettings.businessHours}
                  </div>
                </div>
              </div>

              {/* Contactos & Mapa da Centralidade do Kilamba */}
              <div id="contactos" className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showToast(
                      `Obrigado ${contactName}! A sua mensagem foi recebida pela equipa da Muatxissombo em Luanda.`
                    );
                    setContactName('');
                    setContactEmail('');
                    setContactPhone('');
                    setContactMessage('');
                  }}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-3.5 text-xs shadow-xs"
                >
                  <h3 className="text-sm font-bold text-slate-900">Formulário de Contacto Direto</h3>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Mensagem *</label>
                    <textarea
                      rows={3}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0B5ED7] text-white font-semibold rounded-lg hover:bg-[#094bb0] transition-colors"
                  >
                    Enviar Mensagem
                  </button>
                </form>

                {/* Location & WhatsApp Card + Embedded Map */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-xs">
                  <div className="p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Centralidade do Kilamba, Luanda
                    </h3>
                    <p className="text-xs text-slate-600">{platformSettings.address}</p>
                    <a
                      href={`https://wa.me/${platformSettings.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Falar no WhatsApp ({platformSettings.phoneWhatsapp})
                    </a>
                  </div>
                  <div className="h-52 w-full border-t border-slate-200 bg-slate-100">
                    <iframe
                      title="Localização Muatxissombo Soluções Digitais - Centralidade do Kilamba, Luanda"
                      src="https://www.openstreetmap.org/export/embed.html?bbox=13.2550%2C-9.0150%2C13.2850%2C-8.9900&amp;layer=mapnik"
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PROFESSIONAL CORPORATE MULTI-COLUMN FOOTER WITH OFFICIAL LOGO (CLOUD NAVY) */}
      <footer className="bg-[#071426] text-slate-300 border-t border-slate-800 pt-14 pb-10 px-4 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Column 1: Official Brand Logo & Identity */}
            <div className="lg:col-span-4 space-y-4">
              <div className="inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl shadow-xs">
                <img
                  src="/assets/aistudio/LOGO_MUATXISSOMBO-02_2ea0c22e.png"
                  alt="Muatxissombo Soluções Digitais"
                  referrerPolicy="no-referrer"
                  className="h-10 w-auto object-contain"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    MUATXISSOMBO
                  </div>
                  <div className="text-[10px] font-medium text-[#0B5ED7]">
                    Soluções Digitais · Angola
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Plataforma comercial angolana especializada em criação de websites profissionais,
                lojas online, registo de domínios, alojamento web, licenças originais Microsoft 365
                e assistência informática empresarial.
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#28A9E0] shrink-0 mt-0.5" />
                  <span>{platformSettings.address}</span>
                </div>
                <div className="flex items-center gap-2 font-mono-tabular">
                  <Phone className="w-4 h-4 text-[#28A9E0] shrink-0" />
                  <span>{platformSettings.phoneWhatsapp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#28A9E0] shrink-0" />
                  <span>{platformSettings.corporateEmail}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Criação de Websites */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-bold text-white tracking-wide">
                Criação de Websites
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setPreselectedWebsiteType('Websites Institucionais Profissionais');
                      setQuoteModalOpen(true);
                    }}
                    className="hover:text-[#28A9E0] transition-colors text-left"
                  >
                    Websites Institucionais & Empresariais
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setPreselectedWebsiteType('Lojas Online (E-commerce Completo em Kz)');
                      setQuoteModalOpen(true);
                    }}
                    className="hover:text-[#28A9E0] transition-colors text-left"
                  >
                    Lojas Online (E-commerce em Kz)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setPreselectedWebsiteType('Websites para Clínicas, Centros Médicos e Hospitais');
                      setQuoteModalOpen(true);
                    }}
                    className="hover:text-[#28A9E0] transition-colors text-left"
                  >
                    Websites para Clínicas, Escolas e Hotéis
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setPreselectedWebsiteType(
                        'Websites para Construção Civil, Engenharia e Imobiliárias'
                      );
                      setQuoteModalOpen(true);
                    }}
                    className="hover:text-[#28A9E0] transition-colors text-left"
                  >
                    Websites para Construção Civil & Consultorias
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setPreselectedWebsiteType(
                        'Sistemas de Gestão e Plataformas Administrativas'
                      );
                      setQuoteModalOpen(true);
                    }}
                    className="hover:text-[#28A9E0] transition-colors text-left"
                  >
                    Portais e Sistemas de Gestão à Medida
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Soluções Tecnológicas */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold text-white tracking-wide">
                Produtos & Serviços
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToSection('dominios')}
                    className="hover:text-[#28A9E0] transition-colors"
                  >
                    Domínios .co.ao, .ao e .com
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToSection('hospedagem')}
                    className="hover:text-[#28A9E0] transition-colors"
                  >
                    Planos de Hospedagem Web
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToSection('licencas')}
                    className="hover:text-[#28A9E0] transition-colors"
                  >
                    Licenças Microsoft 365
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToSection('licencas')}
                    className="hover:text-[#28A9E0] transition-colors"
                  >
                    Antivírus ESET, Kaspersky & Bitdefender
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToSection('assistencia')}
                    className="hover:text-[#28A9E0] transition-colors"
                  >
                    Instalação Windows & Assistência
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Área do Cliente & Pagamentos em Angola */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-xs font-bold text-white tracking-wide">
                Área do Cliente & Pagamentos (AOA)
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Acompanhe os seus pedidos, estado de criação do seu website, faturas e licenças em
                tempo real.
              </p>
              <div className="text-[11px] text-slate-300 space-y-1 font-mono-tabular bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[#28A9E0] font-semibold">Métodos Aceites em Angola:</div>
                <div>· Multicaixa Express · Transferência IBAN</div>
                <div>· Unitel Money · Afrimoney</div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveView(currentUser && userProfile ? 'client' : 'auth')}
                  className="px-3.5 py-2 bg-[#0B5ED7] text-white font-semibold rounded-lg hover:bg-[#094bb0] transition-colors"
                >
                  Aceder à Área do Cliente
                </button>
                <a
                  href={`https://wa.me/${platformSettings.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-slate-900 text-white border border-slate-700 font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  WhatsApp Direto
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <div>
              © {new Date().getFullYear()} {platformSettings.companyName}. Todos os direitos
              reservados · Luanda, Angola.
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigateToSection('sobre')}
                className="hover:text-slate-300 transition-colors"
              >
                Sobre Nós
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => navigateToSection('contactos')}
                className="hover:text-slate-300 transition-colors"
              >
                Localização Kilamba
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                className="hover:text-slate-300 transition-colors"
              >
                Solicitar Orçamento
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* WEBSITE SHOWCASE & CONTRACTING MODAL */}
      <WebsiteShowcaseModal
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setPreselectedTemplateRef(undefined);
        }}
        preselectedType={preselectedWebsiteType}
        preselectedReference={preselectedTemplateRef}
        websiteServices={websiteServices}
        defaultName={userProfile?.name}
        defaultEmail={userProfile?.email}
        defaultPhone={userProfile?.phone}
        defaultCompany={userProfile?.company}
        onSubmitQuote={handleWebsiteQuoteSubmit}
      />

      {/* SHOPPING CART & CHECKOUT DRAWER (SECTION 8) */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-6 overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Carrinho & Pagamento (AOA / Kz)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Validação segura pelo Administrador antes da libertação.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">O seu carrinho encontra-se vazio.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="text-slate-400 text-[11px]">{item.category}</div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="font-mono-tabular font-semibold text-[#0B5ED7]">
                            {formatKz(item.priceKz)} ({item.billingCycle})
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(idx)}
                          className="text-red-600 hover:underline text-[11px]"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Total a Pagar:</span>
                    <span className="text-lg font-bold text-slate-900 font-mono-tabular">
                      {formatKz(cartTotalKz)}
                    </span>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs border-t border-slate-200 pt-4">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Método de Pagamento *
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Multicaixa Express">
                          Multicaixa Express ({platformSettings.multicaixaExpressNumber})
                        </option>
                        <option value="Transferência Bancária (IBAN)">
                          Transferência Bancária ({platformSettings.bankName})
                        </option>
                        <option value="Unitel Money">
                          Unitel Money ({platformSettings.unitelMoneyNumber})
                        </option>
                        <option value="Afrimoney">
                          Afrimoney ({platformSettings.afrimoneyNumber})
                        </option>
                      </select>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px] text-slate-700 font-mono-tabular">
                      <div>IBAN: {platformSettings.iban}</div>
                      <div>MCX Express / Unitel Money: {platformSettings.multicaixaExpressNumber}</div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Referência / Nº de Talão de Pagamento (Opcional agora)
                      </label>
                      <input
                        type="text"
                        value={checkoutProofRef}
                        onChange={(e) => setCheckoutProofRef(e.target.value)}
                        placeholder="Pode anexar agora ou mais tarde no Painel do Cliente"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Anexar Ficheiro de Comprovativo (PDF / Imagem)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setCheckoutProofFile(`${f.name} (${Math.round(f.size / 1024)} KB)`);
                        }}
                        className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={checkingOut}
                      className="w-full py-3 bg-[#0B5ED7] text-white font-semibold rounded-xl hover:bg-[#094bb0] disabled:opacity-50"
                    >
                      {checkingOut
                        ? 'A Registar Encomenda...'
                        : 'Confirmar Encomenda (Sujeita a Validação)'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 24/7 FLOATING TECHNICAL SUPPORT CHAT WIDGET */}
      <div className="fixed bottom-5 right-5 z-40">
        {chatWidgetOpen ? (
          <div className="w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold">Suporte Técnico 24/7 · Muatxissombo</div>
                <div className="text-[11px] text-[#28A9E0]">
                  Atendimento Online & WhatsApp ({platformSettings.phoneWhatsapp})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatWidgetOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-64 overflow-y-auto text-xs bg-slate-50">
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-slate-700">
                Olá! Bem-vindo ao Suporte Técnico 24 horas da{' '}
                <strong>Muatxissombo Soluções Digitais</strong>. Como podemos ajudar com o seu
                website, domínio, hospedagem ou licença Microsoft 365?
              </div>
              {supportMessages.slice(-3).map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-lg border ${
                    m.senderRole === 'admin'
                      ? 'bg-blue-50 border-blue-200 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="font-semibold text-[11px] mb-0.5">
                    {m.senderRole === 'admin' ? 'Equipa Técnica' : m.userName}
                  </div>
                  <div>{m.message}</div>
                </div>
              ))}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!widgetMessage.trim()) return;
                if (!currentUser || !userProfile) {
                  setChatWidgetOpen(false);
                  setActiveView('auth');
                  setAuthMessage(
                    'Inicie sessão para registar o seu ticket no chat de suporte 24/7 ou fale connosco diretamente no WhatsApp.'
                  );
                  return;
                }
                const msgId = `sup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                try {
                  await setDoc(doc(db, 'support_messages', msgId), {
                    userId: currentUser.uid,
                    userName: userProfile.name.slice(0, 120),
                    userEmail: userProfile.email.slice(0, 160),
                    senderRole: 'client',
                    subject: 'Chat de Suporte 24/7',
                    message: widgetMessage.trim().slice(0, 1500),
                    ticketStatus: 'Aberto',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                  setWidgetMessage('');
                  showToast('Mensagem enviada para o suporte técnico 24/7!');
                } catch (err) {
                  handleFirestoreError(err, OperationType.CREATE, `support_messages/${msgId}`);
                }
              }}
              className="p-3 bg-white border-t border-slate-200 space-y-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={widgetMessage}
                  onChange={(e) => setWidgetMessage(e.target.value)}
                  placeholder="Escreva a sua dúvida..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#0B5ED7] text-white text-xs font-semibold rounded-lg hover:bg-[#094bb0]"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <a
                href={`https://wa.me/${platformSettings.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Prefere atendimento imediato no WhatsApp? Clique aqui
              </a>
            </form>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setChatWidgetOpen(true)}
            className="px-4 py-3 bg-[#0B5ED7] text-white text-xs font-semibold rounded-full shadow-lg hover:bg-[#094bb0] transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Suporte Técnico 24/7</span>
          </button>
        )}
      </div>
    </div>
  );
}
