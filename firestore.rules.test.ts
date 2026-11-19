/**
 * Firestore Security Rules Specification Test Suite
 * Verifies that all Dirty Dozen payloads return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  authUid: string | null;
  emailVerified: boolean;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const dirtyDozenTests: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Privilege Escalation on User Creation',
    collection: 'users/user_1',
    operation: 'create',
    authUid: 'user_1',
    emailVerified: true,
    payload: { uid: 'user_1', name: 'Attacker', email: 'a@b.com', role: 'admin', status: 'active' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Identity Spoofing on Order Creation',
    collection: 'orders/ord_1',
    operation: 'create',
    authUid: 'user_a',
    emailVerified: true,
    payload: { userId: 'user_b', orderNumber: 'MX-100', totalKz: 50000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on User Profile',
    collection: 'users/user_1',
    operation: 'update',
    authUid: 'user_1',
    emailVerified: true,
    payload: { name: 'Valid', isSuperAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Unauthorized License Key Scraping',
    collection: 'licenses_issued/lic_1',
    operation: 'get',
    authUid: 'other_user',
    emailVerified: true,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Client Attempting to Mint License Key',
    collection: 'licenses_issued/lic_2',
    operation: 'create',
    authUid: 'user_1',
    emailVerified: true,
    payload: { productName: 'Microsoft 365', activationKey: 'XXXX-XXXX' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Client Self-Approving Order Payment Status',
    collection: 'orders/ord_1',
    operation: 'update',
    authUid: 'user_1',
    emailVerified: true,
    payload: { status: 'Pagamento confirmado' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Mutating Terminal Completed Order',
    collection: 'orders/ord_completed',
    operation: 'update',
    authUid: 'user_1',
    emailVerified: true,
    payload: { paymentNotes: 'Modified after completion' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Oversized String Denial of Wallet on Website Project',
    collection: 'website_projects/proj_1',
    operation: 'create',
    authUid: 'user_1',
    emailVerified: true,
    payload: { description: 'X'.repeat(5000) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Path Variable ID Poisoning',
    collection: 'orders/bad$id!@#',
    operation: 'create',
    authUid: 'user_1',
    emailVerified: true,
    payload: { userId: 'user_1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Client Forged Timestamp on Feedback',
    collection: 'feedbacks/fb_1',
    operation: 'create',
    authUid: 'user_1',
    emailVerified: true,
    payload: { userId: 'user_1', rating: 5, comment: 'Great', createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unverified Email Attempting Admin Write',
    collection: 'catalog_items/item_1',
    operation: 'create',
    authUid: 'spoof_admin',
    emailVerified: false,
    payload: { name: 'Fake Item', priceKz: 0 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Regular Client Tampering with Catalog Prices',
    collection: 'catalog_items/item_1',
    operation: 'update',
    authUid: 'user_1',
    emailVerified: true,
    payload: { priceKz: 1 },
    expectedResult: 'PERMISSION_DENIED',
  },
];
