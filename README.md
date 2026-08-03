# CricNova Backend

Enterprise-Grade Cricket Ecosystem & Tournament Management Engine built with Node.js, Express.js, PostgreSQL, Prisma, Redis, and BullMQ.

## 🚀 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **In-Memory Store & Queues**: Redis, BullMQ
- **Real-time Engine**: Socket.IO
- **Validation**: Zod
- **Authentication**: JWT & Bcrypt
- **Storage**: Cloudinary
- **Documentation**: Swagger / OpenAPI
- **Logging**: Winston

---

## 📁 Directory Structure

```
cricnova-backend/
├── prisma/               # Database schemas and migrations
├── src/
│   ├── config/           # Application environment configuration
│   ├── core/             # Infrastructure bootstraps (database, logger, redis, socket)
│   ├── common/           # Shared constants, enums, helpers, utils, validators
│   ├── middleware/       # Global HTTP middlewares
│   ├── modules/          # Feature-based architectural modules
│   ├── routes/           # Global application router mounting
│   ├── queues/           # BullMQ queue definitions & workers
│   ├── sockets/          # Socket.IO handlers & namespaces
│   ├── storage/          # Storage utilities (Cloudinary / File upload)
│   ├── docs/             # API Documentation specs
│   ├── app.js            # Express application bootstrap
│   └── server.js         # HTTP Server entry point
├── tests/
│   ├── unit/             # Unit test suits
│   └── integration/      # Integration test suits
├── logs/                 # System log output
├── .env.example          # Environment template
├── package.json
└── README.md
```

---

## 🛠️ Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env` and fill in your local configurations:

```bash
cp .env.example .env
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database & Prisma Client

Generate Prisma Client:

```bash
npm run prisma:generate
```

### 4. Development Server

Run the development server with live reload:

```bash
npm run dev
```

---

## 📐 Architecture Guidelines & Standards

- **Feature-Based Architecture**: All domain code is encapsulated inside `src/modules/<feature-name>`.
- **Clean Layered Separation**:
  - **Controllers**: HTTP Request/Response mapping & validation invocation only.
  - **Services**: Pure business logic execution.
  - **Repositories**: Database interactions exclusively through Prisma ORM.
- **Naming Conventions**:
  - Folders: `lowercase`
  - Variables & Functions: `camelCase`
  - Classes: `PascalCase`
  - Constants: `UPPER_CASE`
