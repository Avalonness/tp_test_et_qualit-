# Shop TP — Tests & Qualité (Node/TS + Express + Postgres)

Projet réalisé en **Node.js + TypeScript**, API **Express**, base de données **PostgreSQL**.  
Architecture orientée **Clean Architecture** (ports/adapters + injection), **monolithe modulaire** (modules `catalog` / `orders`), avec une approche **use-cases** (screaming architecture).

---

## Prérequis

- **Node.js** (>= 18 recommandé)
- **npm**
- **Docker Desktop** (recommandé) ou un PostgreSQL local

---

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` à la racine (non versionné) :

```env
PORT=3000
DATABASE_URL=postgres://tp:tp@localhost:5432/tp_shop
DB_SSL=false
NODE_ENV=development
```

## Démarrer PostgreSQL (Docker)

Lancer Postgres via Docker Compose :

```bash
docker compose up -d
```

Vérifier que le conteneur tourne :

```bash
docker ps
```

## Migrations (création des tables)

Appliquer les migrations SQL :

```bash
npm run migrate
```

## Lancer l’application

Mode dev (watch) :

```bash
npm run dev
```

L’API écoute par défaut sur : [http://localhost:3000](http://localhost:3000)

### Vérification (Healthcheck)

Endpoint de santé (vérifie que l’app tourne et que Postgres répond) :

`GET /health`

Réponse attendue :

```json
{ "status": "ok" }
```

## Tests

Lancer les tests unitaires :

```bash
npm test
```

---

## User Stories (US) + Scénarios Given/When/Then

### US1 — Gestion du panier : ajout de lignes à une commande

**En tant que** client  
**Je veux** ajouter des produits à une commande (panier)  
**Afin de** préparer mon achat

#### Règles métier :

- Une commande doit contenir au moins 1 produit
- Une commande peut contenir au maximum 5 produits distincts
- Un même produit peut être ajouté au maximum 2 fois
- Si le produit est déjà présent dans la commande : la quantité est incrémentée
- Si la commande n’existe pas : elle est créée (status = `cart`)
- Si le stock est insuffisant : ajout refusé

#### Scénarios (GWT) :

- **Given** une commande inexistante et un produit en stock  
  **When** j’ajoute ce produit à la commande  
  **Then** la commande est créée en status `cart` avec une ligne `qty=1`

- **Given** une commande en status `cart` contenant une ligne produit `qty=1`  
  **When** j’ajoute le même produit  
  **Then** la quantité passe à `qty=2`

- **Given** une commande en status `cart` contenant une ligne produit `qty=2`  
  **When** j’ajoute le même produit une 3e fois  
  **Then** une erreur est retournée (max 2 fois le même produit)

- **Given** une commande en status `cart` et un produit dont le stock est insuffisant  
  **When** j’ajoute ce produit  
  **Then** une erreur est retournée (out of stock)

- **Given** une commande contenant déjà 5 produits distincts  
  **When** j’ajoute un 6e produit distinct  
  **Then** une erreur est retournée (max 5 produits distincts)

### US2 — Paiement d’une commande

**En tant que** client  
**Je veux** payer ma commande  
**Afin de** valider mon achat

#### Règles métier :

- Paiement possible uniquement si status = `cart`
- Au paiement :
    - status devient `paid`
    - `payedAt` est renseigné
    - le stock des produits est décrémenté

#### Scénarios (GWT) :

- **Given** une commande en status `cart` avec au moins une ligne  
  **When** je paye la commande  
  **Then** la commande passe en status `paid` et `payedAt` est renseigné

- **Given** une commande en status `paid` (ou `canceled`, `shipped`)  
  **When** je tente de payer  
  **Then** une erreur est retournée (paiement non autorisé)

- **Given** une commande en status `cart`  
  **When** je paye  
  **Then** le stock de chaque produit est décrémenté selon la quantité commandée

### US3 — Livraison d’une commande

**En tant que** vendeur  
**Je veux** expédier une commande  
**Afin de** déclencher la livraison

#### Règles métier :

- Livraison possible uniquement si status = `paid`
- Au passage en livraison :
    - status devient `shipped`

#### Scénarios (GWT) :

- **Given** une commande en status `paid`  
  **When** je la passe en livraison  
  **Then** la commande passe en status `shipped`

- **Given** une commande en status `cart` (ou `canceled`, `shipped`)  
  **When** je tente de la livrer  
  **Then** une erreur est retournée (livraison non autorisée)
