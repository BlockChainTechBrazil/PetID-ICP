# Installation Guide

Welcome to the PetID-ICP installation guide! Follow the steps below to set up and run the project locally.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Install Dependencies](#install-dependencies)
- [Environment Configuration](#environment-configuration)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Build for Production](#build-for-production)
- [Troubleshooting](#troubleshooting)
- [Contact](#contact)

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [DFINITY SDK (dfx)](https://internetcomputer.org/docs/current/developer-docs/quickstart/local-quickstart)
- [Git](https://git-scm.com/)

---

## Clone the Repository

```bash
git clone https://github.com/BlockChainTechBrazil/PetID-ICP.git
cd PetID-ICP
```

---

## Install Dependencies


## Quick Setup (Recommended)

To install all dependencies and set up the project automatically, simply run:

```bash
npm run initial
```

This command will:
- Install all root and frontend dependencies
- Set up the environment
- Prepare everything for development

---

## Environment Configuration

- Copy or create any required environment files (e.g., `.env`) if needed.
- Check the `README.md` or project documentation for environment variable details.

---

## Running the Backend

Make sure you have the DFINITY SDK installed and running:

```bash
dfx start --background
dfx deploy
```

---

## Running the Frontend

In a new terminal, run:

```bash
cd src/PetID_frontend
npm run dev
```

The app should be available at the address shown in the terminal (usually `http://localhost:5173`).

---

## Build for Production

To build the frontend for production:

```bash
cd src/PetID_frontend
npm run build
```

---

## Troubleshooting

- Make sure all prerequisites are installed and available in your PATH.
- If you encounter issues with `dfx`, check the official [DFINITY documentation](https://internetcomputer.org/docs/current/developer-docs/quickstart/local-quickstart).
- For Node.js or npm errors, ensure you are using a compatible version.

---

## Contact

For help, open an issue or contact the maintainers:
- [Report an Issue](https://github.com/your-repo/issues)
- [Community / Discussions](https://github.com/your-repo/discussions)
- [Contact](mailto:yourname@example.com)
   ```

6. Rode o frontend:
   ```sh
   cd src/PetID_frontend
   npm run dev
   ```

7. Acesse o sistema:
   - O endereço local será exibido no terminal (ex: http://localhost:5173)

## Observações
- Para ambiente de produção, consulte o arquivo `DEPLOY_MAINNET.md`.
- Para dúvidas ou problemas, utilize os canais de contato no README.
