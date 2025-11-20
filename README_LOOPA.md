# Loopa Pro - Frontend Angular

Application web professionnelle pour la gestion des restaurants via Loopa.

## 🎨 Design System

L'application suit strictement les guidelines UI de Loopa :

### Couleurs
- **Primary (Violet)** : `#9333ea` - Pour les actions principales
- **Secondary (Ambre)** : `#f59e0b` - Pour les actions secondaires
- **Fond neutre** : `#f9fafb` - Fond principal de l'app

### Layout
- **Sidebar gauche** : Violet foncé (#6b21a8 → #581c87)
- **Largeur sidebar** : 280px
- **Header** : 72px de hauteur
- **Contenu** : Fond neutre (#f9fafb)

### Components
- **Cards** : Coins arrondis 16px minimum, ombre légère
- **Boutons** : Border radius 12px, transitions lisses
- **Loader** : Animation infinity (∞) signature Loopa

## 🚀 Démarrage

### Prérequis
- Node.js 18+
- npm 9+
- L'API Loopa doit tourner sur `http://localhost:3000`

### Installation

```bash
npm install
```

### Développement

```bash
npm start
```

L'application sera disponible sur `http://localhost:4200`

### Build Production

```bash
npm run build
```

Les fichiers buildés seront dans le dossier `dist/`

## 📁 Structure du Projet

```
src/app/
├── core/                      # Services et composants core
│   ├── guards/
│   │   └── auth.guard.ts     # Protection des routes
│   ├── layout/
│   │   ├── sidebar/          # Sidebar violette avec navigation
│   │   ├── header/           # Header simple avec titre
│   │   └── main-layout/      # Layout principal
│   ├── models/
│   │   └── user.model.ts     # Modèles TypeScript
│   └── services/
│       ├── api.service.ts    # Communication avec l'API
│       └── auth.service.ts   # Gestion auth (magic link)
├── shared/                    # Composants réutilisables
│   └── components/
│       └── loader/           # Loader infinity Loopa
├── features/                  # Pages de l'application
│   ├── auth/
│   │   ├── login/           # Page connexion magic link
│   │   └── verify/          # Vérification du token
│   ├── dashboard/           # Dashboard principal
│   ├── merchants/           # Gestion des restaurants
│   ├── menus/               # Gestion des menus
│   ├── orders/              # Gestion des commandes
│   ├── tables/              # Gestion des tables
│   ├── qrcodes/             # Génération QR codes
│   └── users/               # Gestion utilisateurs
└── app.routes.ts            # Configuration routing
```

## 🔐 Authentification

L'application utilise le système de **magic link** :

1. L'utilisateur entre son email
2. Un lien magique est envoyé par email (via Mailjet)
3. Le lien redirige vers `/auth/verify?token=...`
4. Le token est vérifié et l'utilisateur est connecté
5. Session stockée dans `localStorage`

### Flow d'authentification

```typescript
// 1. Demander un magic link
POST /users/auth/request-magic-link
Body: { email: "user@example.com" }

// 2. Vérifier le token (après clic sur le lien)
POST /users/auth/verify
Body: { token: "abc123..." }

// 3. Utilisateur connecté et redirigé vers /dashboard
```

## 🛣️ Routing

### Routes publiques
- `/auth/login` - Page de connexion
- `/auth/verify` - Vérification magic link

### Routes protégées (nécessitent authentification)
- `/dashboard` - Dashboard principal
- `/merchants` - Gestion des restaurants (owner/manager uniquement)
- `/menus` - Gestion des menus
- `/orders` - Gestion des commandes
- `/tables` - Gestion des tables
- `/qrcodes` - Génération de QR codes
- `/users` - Gestion des utilisateurs (owner uniquement)

## 🎯 Fonctionnalités

### Dashboard
- **Vue d'ensemble** avec statistiques en temps réel
- **4 cards statistiques** : Restaurants, Menus, Commandes, Tables
- **Quick actions** pour accéder rapidement aux fonctionnalités
- **Animation fade-in** au chargement

### Sidebar
- **Navigation principale** avec icônes émoji
- **Filtrage par rôles** (certaines options visibles uniquement pour owner/manager)
- **Informations utilisateur** en bas avec avatar
- **Bouton déconnexion**
- **Indicateur de route active**

### Magic Link Auth
- **Page de login élégante** avec gradient violet
- **Formulaire simple** : juste un email
- **Feedback visuel** pendant l'envoi
- **Message de succès** avec instructions
- **Page de vérification** avec états (loading/success/error)

## 🎨 Styles Globaux

Les styles sont définis dans `src/styles.css` avec :

- **CSS Variables** pour toutes les couleurs Loopa
- **Classes utilitaires** (`.btn`, `.card`, `.badge`, etc.)
- **Animations** (`.fade-in`, `.spin`, `.pulse`)
- **Grille** et **flexbox helpers**
- **Responsive design**

### Utilisation des styles

```html
<!-- Bouton primary violet -->
<button class="btn btn-primary">
  <span>✨</span> Action
</button>

<!-- Card avec hover effect -->
<div class="card">
  <h3 class="card-title">
    <span class="icon">🏪</span> Titre
  </h3>
  <p class="card-content">Contenu...</p>
</div>

<!-- Badge -->
<span class="badge badge-violet">Owner</span>

<!-- Loader infinity -->
<app-loader [fullscreen]="true" [message]="'Chargement...'"></app-loader>
```

## 📡 Services

### ApiService
Service centralisé pour toutes les requêtes HTTP vers l'API Loopa.

```typescript
// Exemple d'utilisation
constructor(private api: ApiService) {}

ngOnInit() {
  // Récupérer les merchants
  this.api.getMerchants().subscribe(merchants => {
    console.log(merchants);
  });

  // Créer une table
  this.api.createTable({
    merchant: '123',
    number: 'A1'
  }).subscribe(table => {
    console.log('Table créée:', table);
  });
}
```

### AuthService
Service pour gérer l'authentification et l'état utilisateur.

```typescript
// Accéder à l'utilisateur connecté
const user = this.authService.currentUser();

// Vérifier si authentifié
if (this.authService.isAuthenticated()) {
  // ...
}

// Vérifier un rôle
if (this.authService.hasRole('owner')) {
  // ...
}

// Déconnexion
this.authService.logout();
```

## 🎭 Animations

### Loader Infinity
Animation signature de Loopa en forme de ∞ (infinity)

```typescript
<app-loader
  [fullscreen]="true"  // Plein écran ou inline
  [message]="'Loading...'"  // Message optionnel
></app-loader>
```

### Fade In
Toutes les pages ont une animation `fade-in` au chargement

```html
<div class="page fade-in">
  <!-- Contenu -->
</div>
```

## 🔒 Guards

### AuthGuard
Protège les routes nécessitant une authentification.

```typescript
// Dans app.routes.ts
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]  // ← Protection
}
```

Si l'utilisateur n'est pas connecté, il est redirigé vers `/auth/login` avec l'URL de retour.

## 📱 Responsive Design

L'application est responsive et s'adapte aux différentes tailles d'écran :

- **Desktop** (>1024px) : Sidebar fixe + contenu principal
- **Tablet** (768px-1024px) : Layout optimisé
- **Mobile** (<768px) : Navigation adaptée

## 🚧 TODO / Prochaines Fonctionnalités

- [ ] Implémenter les pages CRUD complètes pour chaque ressource
- [ ] Ajouter la gestion temps réel des commandes (WebSocket)
- [ ] Système de notifications in-app
- [ ] Mode sombre
- [ ] Impression des QR codes
- [ ] Export PDF des menus
- [ ] Analytics et rapports
- [ ] Gestion des images pour les items
- [ ] Multi-langue (FR/EN)

## 🐛 Debugging

### Problèmes courants

**L'API n'est pas accessible**
```bash
# Vérifier que l'API tourne sur le bon port
curl http://localhost:3000/merchant

# Si l'API est sur un autre port, modifier src/app/core/services/api.service.ts
private readonly API_URL = 'http://localhost:VOTRE_PORT';
```

**Erreur CORS**
```typescript
// Vérifier que l'API a CORS activé
// Dans loopa-api/src/main.ts
app.enableCors();
```

**Token expiré**
- Les magic links expirent après 10 minutes
- Demander un nouveau lien si nécessaire

## 📚 Technologies

- **Angular 17** - Framework frontend
- **TypeScript 5.3** - Langage
- **RxJS 7.8** - Programmation réactive
- **Angular Material 17** - Components UI (icons)
- **Standalone Components** - Architecture moderne Angular

## 🤝 Contribution

1. Suivre les guidelines UI de Loopa
2. Utiliser les composants et styles existants
3. Respecter l'architecture en place
4. Tester les changements avant commit

## 📄 License

Propriétaire - Loopa © 2024
