# ParkWise

Système de supervision de parking intelligent — Projet transversal WEB ISEN AP4.

Réservez une place, suivez la disponibilité en direct et laissez-vous guider jusqu'à votre emplacement via un QR code.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancer le projet](#lancer-le-projet)
- [Structure du projet](#structure-du-projet)
- [Rôles utilisateurs](#rôles-utilisateurs)
- [Routes API](#routes-api)
- [Tests](#tests)

---

## Fonctionnalités

**Utilisateur**
- Inscription / connexion avec JWT
- Consultation des parkings disponibles en temps réel
- Réservation d'une place avec choix de créneau
- QR code d'accès généré automatiquement
- Page de guidage visuelle (plan SVG + chemin animé vers la place)
- Annulation de réservation
- Application installable (PWA)

**Administrateur**
- Gestion CRUD des parkings
- Éditeur visuel de la carte des places (positionnement drag & drop)
- Tableau de bord statistiques (taux d'occupation, réservations sur 30 jours)
- Accès protégé par rôle

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite + CSS Modules |
| Backend | Node.js + Express |
| Base de données | SQLite via Prisma ORM |
| Authentification | JWT (jsonwebtoken) |
| PWA | vite-plugin-pwa + Workbox |
| Tests unitaires | Vitest + Supertest + Testing Library |
| Tests E2E | Playwright |

---

## Prérequis

- **Node.js** >= 18
- **npm** >= 9
- Git

Vérifier les versions :

```bash
node -v
npm -v
```

---

## Installation

### 1. Cloner le dépôt

```bash
git clone git@github.com:theomrn/reactPark.git
cd reactPark
```

### 2. Installer les dépendances

```bash
npm run install:all
```

Cela installe les dépendances du backend et du frontend en une commande.

### 3. Configurer l'environnement

Créer le fichier `.env` du backend :

```bash
cp back/.env.example back/.env   # si le fichier existe
# ou créer manuellement :
```

```env
# back/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre_secret_jwt_ici"
PORT=3002
```

> **Important** : remplacer `votre_secret_jwt_ici` par une chaîne aléatoire longue en production.

### 4. Initialiser la base de données

```bash
cd back
npx prisma migrate dev
cd ..
```

Cela crée le fichier SQLite et applique toutes les migrations.

### 5. (Optionnel) Créer un compte administrateur

Après avoir démarré le backend, enregistrez un compte via l'API puis passez son rôle en `ADMIN` directement en base :

```bash
cd back
npx prisma studio
```

Dans l'interface Prisma Studio, modifiez le champ `role` de l'utilisateur souhaité : `USER` → `ADMIN`.

---

## Configuration

### Variables d'environnement — Backend (`back/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Chemin vers le fichier SQLite | `file:./dev.db` |
| `JWT_SECRET` | Clé secrète pour signer les tokens | `mon_secret_32_chars` |
| `PORT` | Port du serveur Express | `3002` |

### Proxy frontend

Le frontend Vite est configuré pour proxifier `/api` vers `http://localhost:3002` en développement (`front/vite.config.js`). Aucune configuration supplémentaire n'est nécessaire.

---

## Lancer le projet

### Développement (front + back simultanément)

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3002 |

### Séparément

```bash
# Backend uniquement
cd back && npm run dev

# Frontend uniquement
cd front && npm run dev
```

### Production

```bash
# Build du frontend
cd front && npm run build

# Démarrer le backend
cd back && npm start
```

---

## Structure du projet

```
reactPark/
├── back/                        # API REST Express
│   ├── prisma/
│   │   ├── schema.prisma        # Schéma de la base de données
│   │   └── migrations/          # Historique des migrations
│   ├── src/
│   │   ├── app.js               # Application Express (sans listen)
│   │   ├── index.js             # Point d'entrée (listen)
│   │   ├── routes/
│   │   │   ├── auth.js          # POST /api/auth/register|login
│   │   │   ├── parkings.js      # CRUD /api/parkings
│   │   │   ├── reservations.js  # CRUD /api/reservations
│   │   │   ├── guide.js         # GET /api/guide/:token
│   │   │   └── stats.js         # GET /api/stats (admin)
│   │   ├── middleware/
│   │   │   └── auth.js          # requireAuth, requireAdmin
│   │   └── lib/
│   │       ├── prisma.js        # Instance Prisma Client
│   │       └── asyncHandler.js  # Wrapper async pour Express
│   └── src/__tests__/           # Tests unitaires backend
│
├── front/                       # Application React
│   ├── public/                  # Assets statiques + icônes PWA
│   └── src/
│       ├── api/                 # Appels HTTP (axios)
│       ├── components/          # Composants réutilisables
│       │   ├── Navbar/
│       │   ├── ConfirmModal/
│       │   └── PWAInstallBanner/
│       ├── context/
│       │   └── AuthContext.jsx  # Contexte auth (user, login, logout)
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── GuidancePage.jsx # Plan visuel SVG + guidage
│       │   ├── user/            # Pages espace utilisateur
│       │   └── admin/           # Pages backoffice admin
│       ├── constants/
│       └── hooks/
│
├── e2e/                         # Tests end-to-end Playwright
│   ├── playwright.config.js
│   ├── fixtures/
│   └── tests/
│
├── package.json                 # Scripts racine (dev, test)
└── README.md
```

---

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| **USER** | Parcourir les parkings, réserver, voir ses réservations, utiliser le guidage |
| **ADMIN** | Tout le backoffice : gestion parkings, carte visuelle, statistiques |

Le rôle par défaut à l'inscription est `USER`. Seul un accès direct à la base (Prisma Studio) permet de promouvoir un compte en `ADMIN`.

---

## Routes API

### Authentification

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/auth/register` | — | Créer un compte |
| `POST` | `/api/auth/login` | — | Se connecter |

### Parkings

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/parkings` | — | Liste des parkings avec disponibilités |
| `GET` | `/api/parkings/:id` | — | Détail d'un parking + places |
| `POST` | `/api/parkings` | Admin | Créer un parking |
| `PUT` | `/api/parkings/:id` | Admin | Modifier nom / adresse |
| `PUT` | `/api/parkings/:id/map` | Admin | Mettre à jour la carte des places |
| `DELETE` | `/api/parkings/:id` | Admin | Supprimer un parking |

### Réservations

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/reservations/mine` | User | Mes réservations |
| `GET` | `/api/reservations/:id` | User | Détail d'une réservation |
| `POST` | `/api/reservations` | User | Créer une réservation |
| `DELETE` | `/api/reservations/:id` | User | Annuler une réservation |

### Guidage & Stats

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/guide/:token` | — | Données de guidage via QR token |
| `GET` | `/api/stats/parkings` | Admin | Taux d'occupation par parking |
| `GET` | `/api/stats/reservations` | Admin | Réservations sur 30 jours |

---

## Tests

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

# Unitaires backend uniquement
npm run test:unit:back

# Unitaires frontend uniquement
npm run test:unit:front

# E2E (démarre automatiquement les serveurs)
npm run test:e2e

# Tout (unitaires + E2E)
npm run test:all

# Couverture de code
cd back  && npm run test:coverage
cd front && npm run test:coverage
```

### Tests unitaires — Backend (`back/src/__tests__/`)

Prisma et bcrypt sont mockés — aucune base de données n'est utilisée.

| Fichier | Cas testés |
|---------|-----------|
| `middleware.test.js` | `requireAuth` (5 cas) + `requireAdmin` (2 cas) |
| `auth.test.js` | `POST /register` (4 cas) + `POST /login` (4 cas) |
| `reservations.test.js` | GET mine/id, POST, DELETE — 16 cas |

### Tests unitaires — Frontend (`front/src/__tests__/`)

Les modules API sont mockés. Composants rendus avec `MemoryRouter`.

| Fichier | Cas testés |
|---------|-----------|
| `AuthContext.test.jsx` | login, logout, persistance localStorage |
| `Navbar.test.jsx` | affichage selon rôle USER / ADMIN / non connecté |
| `ParkingDetail.test.jsx` | presets durée, badge, sélection place, validation |
| `ReservationDetail.test.jsx` | affichage données, liens, QR, erreur API |

### Tests E2E — Playwright (`e2e/tests/`)

Les serveurs sont démarrés automatiquement avant les tests.

> Pour les tests admin (`admin.spec.js`), un compte `admin@parkwise.fr` / `Admin1234!` doit exister en base.

| Fichier | Parcours couverts |
|---------|------------------|
| `auth.spec.js` | Inscription, login valide/invalide, logout |
| `reservations.spec.js` | Parcours complet réservation + consultation liste |
| `admin.spec.js` | Accès protégé, création et modification de parking |
