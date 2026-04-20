# ParkWise

Supervision de parking intelligent — Projet transversal WEB ISEN AP4.

**Stack** : React + Vite (front) · Node.js / Express (back) · SQLite / Prisma · Socket.io

---

## Lancer le projet

```bash
npm run install:all   # installe les dépendances front + back
npm run dev           # démarre front (port 5173) et back (port 3002) en parallèle
```

Initialiser la base de données :

```bash
cd back && npx prisma migrate dev
```

---

## Tests

Le projet dispose de trois niveaux de tests : unitaires backend, unitaires frontend, et end-to-end.

### Vue d'ensemble

| Couche | Outil | Fichiers | Tests |
|--------|-------|----------|-------|
| T.U. Backend | Vitest + Supertest | `back/src/__tests__/` | 31 |
| T.U. Frontend | Vitest + Testing Library | `front/src/__tests__/` | 28 |
| E2E | Playwright | `e2e/tests/` | 5 parcours |

### Commandes

```bash
# Unitaires back + front en parallèle
npm run test:unit

# Unitaires back uniquement
npm run test:unit:back

# Unitaires front uniquement
npm run test:unit:front

# E2E (lance automatiquement les serveurs)
npm run test:e2e

# Tout (unitaires + E2E)
npm run test:all

# Couverture de code
cd back  && npm run test:coverage
cd front && npm run test:coverage
```

---

### Tests unitaires — Backend

**Localisation** : `back/src/__tests__/`

**Principe** : Prisma et bcrypt sont mockés (`vi.mock`), aucune base de données réelle n'est utilisée. Les tests sont rapides et entièrement isolés.

#### `middleware.test.js` — 7 tests

Teste `requireAuth` et `requireAdmin` directement, sans passer par HTTP.

| Test | Description |
|------|-------------|
| `requireAuth` | 401 si pas de header Authorization |
| `requireAuth` | 401 si header n'est pas `Bearer ...` |
| `requireAuth` | 401 si token invalide |
| `requireAuth` | 401 si token expiré |
| `requireAuth` | Injecte `req.user` et appelle `next()` si token valide |
| `requireAdmin` | 403 si `role === 'USER'` |
| `requireAdmin` | Appelle `next()` si `role === 'ADMIN'` |

#### `auth.test.js` — 8 tests

Teste `POST /api/auth/register` et `POST /api/auth/login` via Supertest.

| Endpoint | Test | Résultat attendu |
|----------|------|-----------------|
| `POST /register` | Email + password valides | 201 + token JWT |
| `POST /register` | Email manquant | 400 |
| `POST /register` | Password manquant | 400 |
| `POST /register` | Email déjà utilisé | 400 |
| `POST /login` | Credentials valides | 200 + token JWT |
| `POST /login` | Email inconnu | 401 |
| `POST /login` | Mauvais mot de passe | 401 |
| `POST /login` | Champs manquants | 400 |

#### `reservations.test.js` — 16 tests

Teste les 4 endpoints de réservation avec des tokens JWT générés pour le test.

| Endpoint | Test | Résultat attendu |
|----------|------|-----------------|
| `GET /mine` | Sans token | 401 |
| `GET /mine` | Avec token valide | 200 + liste |
| `GET /:id` | Réservation de l'utilisateur | 200 |
| `GET /:id` | Réservation d'un autre utilisateur | 404 |
| `GET /:id` | Réservation inexistante | 404 |
| `GET /:id` | ID non numérique | 400 |
| `POST /` | Créneau libre | 201 + qrToken |
| `POST /` | Créneau en conflit | 400 |
| `POST /` | Fin ≤ début | 400 |
| `POST /` | spotId manquant | 400 |
| `POST /` | Place inexistante | 400 |
| `POST /` | Sans token | 401 |
| `DELETE /:id` | Propriétaire, statut ACTIVE | 200 |
| `DELETE /:id` | Pas le propriétaire | 403 |
| `DELETE /:id` | Statut ≠ ACTIVE | 400 |
| `DELETE /:id` | Réservation inexistante | 404 |

---

### Tests unitaires — Frontend

**Localisation** : `front/src/__tests__/`

**Principe** : les modules API (`src/api/`) sont mockés via `vi.mock`. Les composants sont rendus avec `@testing-library/react` dans un environnement jsdom. React Router est fourni via `MemoryRouter`.

#### `AuthContext.test.jsx` — 4 tests

| Test |
|------|
| `user` est `null` par défaut |
| `login()` met à jour l'état et persiste dans `localStorage` |
| `logout()` remet `user` à `null` et vide `localStorage` |
| Restaure l'utilisateur depuis `localStorage` au montage |

#### `Navbar.test.jsx` — 9 tests

| Contexte | Test |
|----------|------|
| Non connecté | Affiche "Se connecter" |
| Non connecté | N'affiche pas "Déconnexion" |
| Role USER | Affiche "Parkings" et "Mes réservations" |
| Role USER | N'affiche pas les liens admin |
| Role USER | Affiche "Déconnexion" |
| Role ADMIN | Affiche "Gestion parkings" et "Statistiques" |
| Role ADMIN | N'affiche pas les liens USER |
| Role ADMIN | Appelle `logout()` au clic sur "Déconnexion" |

#### `ParkingDetail.test.jsx` — 9 tests

Teste la page de réservation d'une place (`/user/parkings/:id`).

| Test |
|------|
| Affiche le nom et l'adresse du parking |
| Affiche les places disponibles |
| Preset "1h" → `endDate = startDate + 1h` |
| Preset "Journée" → `endDate = startDate + 8h` |
| Le badge de durée s'affiche dynamiquement |
| Le bouton submit est désactivé sans place sélectionnée |
| Le bouton submit s'active après sélection d'une place |
| Affiche une erreur si `fin ≤ début` |
| Appelle `createReservation` avec `spotId`, `startDate`, `endDate` |

#### `ReservationDetail.test.jsx` — 6 tests

Teste la page de détail d'une réservation (`/user/reservations/:id`).

| Test |
|------|
| Affiche les données (parking, place, dates) |
| Affiche le statut "Active" pour le statut `ACTIVE` |
| Lien "← Mes réservations" pointe vers `/user/reservations` |
| Bouton "Voir le guidage" pointe vers `/guide/:qrToken` |
| Affiche le QR code avec la bonne valeur |
| Affiche un message d'erreur si l'API échoue |

---

### Tests E2E — Playwright

**Localisation** : `e2e/tests/`  
**Config** : `e2e/playwright.config.js`

Les serveurs front et back sont démarrés automatiquement par Playwright avant chaque session de test. Les tests s'exécutent sur Chromium en mode headless.

> **Prérequis** : un compte admin `admin@parkwise.fr` / `Admin1234!` doit exister en base pour les tests admin.

#### `auth.spec.js`

| Parcours |
|----------|
| Inscription → redirigé vers `/user/parkings` |
| Inscription avec email déjà utilisé → message d'erreur |
| Login valide → navbar affiche "Déconnexion" |
| Login avec mauvais mot de passe → message d'erreur |
| Logout → retour sur `/login` |

#### `reservations.spec.js`

| Parcours |
|----------|
| Accéder à la liste des parkings |
| Sélectionner un parking → voir ses places |
| Créer une réservation → voir le détail avec QR code |
| Voir la liste de mes réservations |

#### `admin.spec.js`

| Parcours |
|----------|
| Un USER ne peut pas accéder à `/admin/parkings` |
| Un visiteur non connecté est redirigé vers `/login` |
| Voir la liste des parkings (admin) |
| Créer un parking → apparaît dans la liste |
| Modifier un parking → nom mis à jour |

---

### Structure des fichiers de tests

```
reactPark/
├── back/
│   ├── src/
│   │   └── __tests__/
│   │       ├── setup.js              # Variables d'env de test (JWT_SECRET)
│   │       ├── middleware.test.js
│   │       ├── auth.test.js
│   │       └── reservations.test.js
│   └── vitest.config.js
├── front/
│   ├── src/
│   │   └── __tests__/
│   │       ├── AuthContext.test.jsx
│   │       ├── Navbar.test.jsx
│   │       ├── ParkingDetail.test.jsx
│   │       └── ReservationDetail.test.jsx
│   ├── vitest.config.js
│   └── vitest.setup.js               # jest-dom + mock localStorage
└── e2e/
    ├── playwright.config.js
    ├── fixtures/
    │   └── auth.js                   # Helper login + email unique
    └── tests/
        ├── auth.spec.js
        ├── reservations.spec.js
        └── admin.spec.js
```
