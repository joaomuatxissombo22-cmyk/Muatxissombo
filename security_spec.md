# Security Specification – Muatxissombo Soluções Digitais

## 1. Data Invariants
1. **PII Isolation (`users`, `orders`, `website_projects`, `licenses_issued`, `domains_registered`, `support_messages`, `notifications`)**: No non-owner user can read or list another customer's profile, orders, website quotes, software license keys, domains, support messages, or notifications. Only the owner (`userId == request.auth.uid`) or a verified administrator (`isAdmin()`) may access them.
2. **Activation Key Confidentiality (`licenses_issued`)**: Software license keys (`activationKey`) are never publicly readable. Only `assignedUserId == request.auth.uid` or `isAdmin()` can read a license document, and only `isAdmin()` can create or update issued licenses.
3. **Privilege Escalation Prevention (`users`, `admins`)**: Users cannot self-assign `role: 'admin'` during user creation or profile update unless they are already a verified administrator (`isAdmin()`).
4. **Strict Key & Size Enforcement**: Every collection validates required keys (`hasAll`), allowed keys (`hasOnly`), string length bounds (`.size() <= maxLength`), and server timestamps (`request.time`).
5. **Terminal State Locking (`orders`)**: Orders in terminal status (`Concluído` or `Cancelado`) cannot be modified by regular clients.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Privilege Escalation)**: Non-admin user creates `/users/{uid}` with `role: 'admin'`.
2. **Payload 2 (Identity Spoofing on Order)**: User `userA` creates `/orders/ord_1` with `userId: 'userB'`.
3. **Payload 3 (Shadow Field Injection)**: User updates `/users/{uid}` adding `{ isSuperAdmin: true }`.
4. **Payload 4 (License Key Scraping)**: Unauthenticated or non-owner user attempts `get` or `list` on `/licenses_issued`.
5. **Payload 5 (Client Creating License Key)**: Regular client attempts `create` on `/licenses_issued/lic_1`.
6. **Payload 6 (Order Status Manipulation)**: Regular client updates `/orders/ord_1` changing `status` to `'Pagamento confirmado'`.
7. **Payload 7 (Terminal Order Mutation)**: Regular client attempts to update an order whose existing `status` is `'Concluído'`.
8. **Payload 8 (Denial of Wallet / Oversized String)**: User submits a `website_projects` document with a 10,000-character `description` (exceeding `maxLength: 2000`).
9. **Payload 9 (ID Poisoning)**: Attacker targets `/orders/invalid$id!@#` with non-alphanumeric characters.
10. **Payload 10 (Timestamp Forgery)**: Client creates `/feedbacks/fb_1` with a past/future `createdAt` instead of `request.time`.
11. **Payload 11 (Unverified Email Spoof)**: User with `email_verified: false` attempts to act as admin or write to protected collections.
12. **Payload 12 (Catalog Tampering)**: Regular client attempts to update product prices in `/catalog_items/item_1`.
