# PetID - Blockchain Pet Registry

<p align="center">
  <img src="./src/PetID_frontend/src/assets/logo/logo-readme.png" alt="PetID Logo" width="320"/>
</p>

---

## 📑 Table of Contents

- [🔗 Important Links](#-important-links)
- [🏗️ Project Architecture](#-project-architecture)
- [🎯 About the Project](#-about-the-project)
- [🌟 Why use PetID?](#-why-use-petid)
- [✨ Key Features](#-key-features)
- [🧩 Problem Statement](#-problem-statement)
- [🛠️ Technologies Used](#-technologies-used)
- [📍 Roadmap](#-roadmap)
- [🗺️ Usage Flow](#-usage-flow)
- [👥 Team](#-team)

---


## 🔗 Important Links

- 🚀 [Site Deployed]()
- 📽️ [Pitch Deck](https://youtu.be/tmdy4uaNCxg?si=440uTCxs1yxxTZNM)
- 📽️ [Pitch PDF](https://drive.google.com/drive/folders/1Mq_lUkY5O1Bzly3CMVugFU6GfIQWleaf?usp=drive_link)
- 🚀 [Live Demo]()
- 🛠️ [Installation Guide](https://github.com/BlockChainTechBrazil/PetID-ICP/install.md)
- ✉️ [Contact](mailto:contato.blockchaintech.br@gmail.com)
---


## ⚡ Project Progress

### l - Qualification Round
- Project ideation and defining the problem the client faces  
- Market research and analysis of similar solutions  
- Beginning of visual identity ideation  
- Initial development of core smart contracts and first parts of the code 

### ll - Nation Round
- Frontend improvements and UI enhancements  
- Addition of the core application functionality: transforming pets into NFTs with strategic information stored  
- Integration with the ICP blockchain  
- Use of IPFS for image storage  
- Creation of mobile responsiveness  
- Development of a Progressive Web App (PWA)  
- Preparation of initial project documentation  
- Creation of Pitch Deck, Demo Video, and detailed Documentation

### III - Regional Round
- Iconography improvement
- Frontend (UI/UX improvements)
- Pet Document (option to download as PDF)
- Medical Records Document and Interface
- Vaccination Records Document and Interface

### IV - Final Rounnd
- Frontend (UI/UX improvements)
- DIP 721 Standard ICP NFT
- Location & Clinics
- Pet Documentation UI/UX improvements
- Community and events fully on-chain
- AI Assistant on-chain
- Complete migration from IPFS to ICP Asset  Storage


## 🏗️ Project Architecture

### **📁 Directory Structure**
```
PetID-ICP/
├── src/                              # Core source code
│   ├── PetID_backend/               # Motoko backend (canister logic)
│   │   ├── main.mo                  # Main Motoko source file with DIP721 NFT logic
│   │   └── PetID_backend.did        # Candid interface definition
│   ├── PetID_frontend/              # Frontend application (React + Vite)
│   │   ├── public/                  # Static public assets
│   │   │   ├── .ic-assets.json5     # IC asset configuration and CSP
│   │   │   └── ...                  # Icons, manifest, favicon
│   │   ├── src/
│   │   │   ├── componentes/         # Reusable UI components
│   │   │   │   ├── profile/         # Profile dashboard components
│   │   │   │   │   ├── ChatIAPanel.jsx          # AI Assistant on-chain
│   │   │   │   │   ├── CommunityPanel.jsx       # Community & Events
│   │   │   │   │   ├── GenealogyPanel.jsx       # Pet family tree
│   │   │   │   │   ├── MapPanel.jsx             # Location services
│   │   │   │   │   ├── MedicalPanel.jsx         # Health records
│   │   │   │   │   └── NFTPetsPanel.jsx         # NFT management
│   │   │   │   ├── ICPImage.jsx                 # ICP Asset loader
│   │   │   │   └── ...                          # Other UI components
│   │   │   ├── context/             # React contexts
│   │   │   │   └── AuthContext.jsx  # Authentication & ICP integration
│   │   │   ├── locales/             # i18n translation files
│   │   │   │   ├── en/, es/, pt/    # Language-specific translations
│   │   │   └── ...                  # Pages, hooks, routes
│   │   └── ...                      # Config files (Vite, Tailwind, etc.)
│   └── declarations/                # Generated canister interfaces
│       ├── internet_identity/       # Internet Identity type declarations
│       ├── PetID_backend/           # Backend canister declarations  
│       └── PetID_frontend/          # Frontend canister declarations
├── deps/                            # Project dependencies
│   ├── candid/                      # External candid interface files
│   └── ...                          # Dependency management files
├── dfx.json                         # DFINITY project configuration
├── canister_ids.json                # Canister IDs for different networks
└── ...                              # Root config files
```

### **🔧 Technical Architecture**

#### **Backend (Motoko)**
- **Language**: Motoko → `src/PetID_backend/main.mo`
- **NFT Standard**: DIP721 compliance with full TokenMetadata implementation
- **Canister ID**: `uxrrr-q7777-77774-qaaaq-cai` (local development)
- **Interface**: Candid type definitions → `PetID_backend.did`

#### **Frontend (React + Vite)**
- **Framework**: React 18 with modern hooks and context API
- **Build Tool**: Vite for ultra-fast development and optimized production builds
- **Authentication**: Internet Identity integration via `@dfinity/agent`
- **Styling**: Tailwind CSS with dark/light theme support

#### **Storage Architecture**
- **ICP Asset Storage**: Native blockchain storage (migrated from IPFS)
- **Image Loading**: Custom `ICPImage` component for on-chain assets
- **Offline Caching**: LocalStorage for improved performance and offline access

#### **Deployment**
- **Development**: Local replica via DFX framework
- **Asset Canister**: `u6s2n-gx777-77774-qaaba-cai` for frontend deployment
- **Network**: Internet Computer Protocol mainnet and local development

## 🎯 About the Project

**PetID** is a comprehensive decentralized pet management ecosystem built on the Internet Computer Protocol (ICP) that revolutionizes how pet owners document, track, and manage their pets' entire lifecycle. This blockchain-powered platform combines DIP721 NFT technology, native ICP asset storage, and AI-powered features to create an immutable digital identity system for pets.

### **🔧 Core Technical Features:**
- **DIP721 NFT Standard**: Each pet becomes a unique, blockchain-verified NFT with complete ownership and transfer capabilities
- **ICP Asset Storage**: Native on-chain storage eliminating external dependencies (migrated from IPFS)
- **AI Assistant Integration**: On-chain artificial intelligence providing personalized pet care recommendations
- **Internet Identity Auth**: Passwordless, decentralized authentication system
- **Progressive Web App**: Full offline capabilities with service worker implementation
- **Multi-language Support**: Complete internationalization (Portuguese, English, Spanish)

### **🎯 Real-World Applications:**
- **Pet Registration**: Official blockchain-based pet identification
- **Medical Records**: Immutable veterinary history and vaccination tracking
- **Lost Pet Recovery**: Verifiable ownership proof for missing pets
- **Breeding Documentation**: Genealogical tracking with family tree visualization
- **Insurance Claims**: Tamper-proof medical history for pet insurance
- **Cross-Border Travel**: International pet documentation with blockchain verification

---

## 🌟 Why use PetID?

- **🔒 Blockchain Security**: Immutable and cryptographically secure data
- **🌍 Decentralized**: No dependency on centralized servers
- **📱 Complete PWA**: Works as a native app on any device
- **🔐 Web3 Authentication**: Via Internet Identity - no passwords, maximum security
- **🌐 Multilingual**: Support for Portuguese, English, and Spanish
- **📸 ICP Asset Storage**: Native storage for pet photos inside the canister

---

## ✨ Key Features

### 🏆 **NFT Pet Registration (DIP721 Compliant)**
- Transform pets into unique blockchain assets with verifiable ownership
- Complete DIP721 standard implementation for ICP ecosystem compatibility
- Immutable pet data including photos, medical records, and ownership history
- Smart contract-based ownership transfer and breeding documentation

### 🤖 **AI Assistant On-Chain**
- Blockchain-integrated artificial intelligence for personalized pet care
- Real-time recommendations based on your pet's on-chain medical history
- Dual-mode operation: On-chain AI + OpenAI GPT-4 fallback
- Chat history stored permanently on the blockchain

### 🏥 **Medical Records Management**
- Digital vaccination card with blockchain verification
- Complete veterinary history with timestamp integrity
- Appointment scheduling and reminder system
- Insurance-ready documentation with tamper-proof records

### 🌳 **Pet Genealogy & Breeding**
- Interactive family tree visualization using React Flow
- Parent-offspring relationship tracking with blockchain verification
- Breeding history and lineage documentation
- Genetic heritage mapping for pedigreed animals

### 👥 **Community & Social Platform**
- Pet owner networking with event calendar
- Community posts, tips, and local meetups
- Comment and interaction system for pet care knowledge sharing
- Regional groups and breed-specific communities

### 📍 **Location & Clinic Services**
- Google Maps integration for veterinary clinic discovery
- Geographic tracking and route history
- Local pet service provider directory
- Emergency clinic locator with real-time availability

### 📱 **Progressive Web App (PWA)**
- Full offline functionality with service worker implementation
- Installable on any device (iOS, Android, Desktop)
- Push notifications for appointments and community updates
- Cross-platform compatibility with native app experience

### 🌍 **Complete Internationalization**
- **Portuguese** - Primary language with regional variations
- **English** - Full feature support for global users  
- **Spanish** - Complete localization for Latin American markets
- Automatic browser language detection with manual override

### 📄 **Document Generation & Sharing**
- Official pet ID cards with blockchain verification QR codes
- PDF export for medical records and vaccination certificates
- Public profile sharing for lost pet recovery
- Printable documentation for travel and legal purposes

### 🔐 **Enterprise-Grade Security**
- Internet Identity integration for passwordless authentication
- End-to-end encryption for sensitive medical data
- Blockchain immutability preventing data tampering
- Decentralized architecture eliminating single points of failure

---

## 🔌 External Integrations & APIs

### **🗺️ Google Maps API**
- **Purpose**: Veterinary clinic location services and mapping functionality
- **Implementation**: Integrated via `MapPanel.jsx` component
- **Features**: Clinic search, directions, location-based recommendations
- **Security**: API key management via environment variables

### **🤖 On-Chain AI Assistant**
- **Architecture**: Direct integration with ICP canister backend
- **Implementation**: `ChatIAPanel.jsx` with dual operation modes
- **Features**: 
  - Pet health consultation and advice
  - Medical record analysis
  - Community interaction assistance
  - Multi-language support (PT/EN/ES)
- **Data**: All conversations stored on-chain for transparency

### **🌐 Internet Identity (II)**
- **Purpose**: Passwordless, decentralized authentication
- **Benefits**: No traditional login credentials, enhanced privacy
- **Integration**: `AuthContext.jsx` with session management
- **Security**: Cryptographic identity management on ICP

### **🖼️ ICP Asset Storage**
- **Purpose**: Decentralized image and media storage
- **Implementation**: Native ICP storage replacing IPFS dependencies
- **Component**: Custom `ICPImage.jsx` for efficient asset loading
- **Benefits**: Complete on-chain storage, no external dependencies

### **🔥 Firebase (Optional Analytics)**
- **Purpose**: Optional user analytics and performance monitoring
- **Configuration**: `firebaseConfig.js` with environment-based activation
- **Privacy**: User-controlled analytics participation

---

## 🧩 Problem Statement

Every year, millions of pets go missing because they don’t have proper or verifiable identification.
Pet owners still rely on paper records that can easily get lost or damaged.
Vets often work separately, without a simple way to share important medical information.
And when a pet goes missing, there’s no universal system to prove who owns it or to access its health history.
This lack of connection costs time, money — and sometimes even lives.

---

## 🛠️ Technologies Used

### **🔗 Blockchain & Backend**
- **Motoko**: Internet Computer's native programming language for smart contracts
- **DIP721 Standard**: NFT compliance for interoperability with ICP ecosystem
- **Internet Computer Protocol (ICP)**: Fully decentralized blockchain infrastructure
- **Candid Interface**: Type-safe communication between frontend and canisters

### **🎨 Frontend & User Experience**
- **React 18**: Modern JavaScript framework with hooks and context
- **Vite**: Ultra-fast build tool with Hot Module Replacement (HMR)
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **PWA**: Progressive Web App with service workers and offline capabilities
- **React Flow**: Interactive node-based genealogy tree visualization

### **🔐 Authentication & Security**
- **Internet Identity**: DFINITY's decentralized, passwordless authentication
- **@dfinity/agent**: Official JavaScript library for ICP communication
- **Protected Routes**: Role-based access control for sensitive operations

### **🌐 Internationalization & Data**
- **i18next**: Complete multi-language support (PT/EN/ES)
- **ICP Asset Storage**: Native blockchain storage (migrated from IPFS)
- **LocalStorage**: Client-side caching for offline-first experience

### **🤖 AI & External Services**
- **On-Chain AI**: Blockchain-integrated artificial intelligence assistant
- **Google Maps API**: Geographic services for clinic location and mapping
- **OpenAI GPT-4**: Fallback AI service for enhanced pet care recommendations

### **🛠️ Development & Deployment**
- **DFX**: DFINITY's command-line tool for canister development
- **TypeScript**: Type-safe JavaScript for better development experience
- **Git**: Version control with GitHub integration

---

### Version 2.0 (Final Round) - ✅ Completed
- [x] **DIP721 NFT Standard Implementation**
  - [x] Full DIP721 compliance in Motoko backend
  - [x] TokenMetadata structure for pet NFTs
  - [x] Mint, transfer, and ownership functions
- [x] **ICP Asset Storage Migration**
  - [x] Complete migration from IPFS to ICP native storage
  - [x] ICPImage component for asset loading
  - [x] On-chain photo storage
- [x] **AI Assistant On-Chain**
  - [x] Blockchain-integrated chat system
  - [x] Pet care recommendations based on on-chain data
  - [x] Dual mode: On-chain + OpenAI fallback
- [x] **Community & Social Platform**
  - [x] Event calendar and community posts
  - [x] Comments and interaction system
  - [x] Pet owner networking (frontend complete)
- [x] **Pet Genealogy System**
  - [x] Interactive family tree with React Flow
  - [x] Parent-offspring relationship tracking
  - [x] Lineage visualization (frontend complete)
- [x] **Location Services**
  - [x] Google Maps integration
  - [x] Veterinary clinic finder
  - [x] Geographic pet tracking (mock data)


### Version 2.1 - 🚧 In Development  
- [x] **Backend Integration for Social Features**
  - [x] On-chain community posts and events
  - [x] Blockchain-based comment system
  - [ ] Decentralized social interactions
- [x] **Enhanced Search & Filtering**
  - [x] Pet search by characteristics
  - [x] Advanced filtering options
  - [ ] Global pet registry search
- [x] **Public Profile Sharing**
  - [x] QR Code generation for pet profiles
  - [ ] Public pet information access
  - [ ] Lost pet reporting system


### Version 3.0 - 💡 Future
- [ ] **NFT Marketplace**
  - [ ] Registered pet sales
  - [ ] Creator royalties
  - [ ] Authenticity certificates
- [ ] **Geolocation**
  - [ ] Lost/found pets
  - [ ] Local help network
- [ ] PWA notifications

---

## Development & Configuration

### **📋 Prerequisites**
- **Node.js** (v18 or higher)
- **DFX** (DFINITY SDK) - v0.15.0 or higher
- **Git** for version control

### **⚡ Quick Start**

#### **1. Clone & Install**
```bash
git clone https://github.com/your-repo/PetID-ICP
cd PetID-ICP
npm install
```

#### **2. Start Local Development**
```bash
# Start local IC replica
dfx start --background

# Deploy canisters locally  
dfx deploy

# Start frontend development server
cd src/PetID_frontend
npm run dev
```

#### **3. Access Application**
- **Frontend**: `http://localhost:3000`
- **Backend Candid UI**: `http://localhost:4943/?canisterId={backend_canister_id}`

### **🔧 Environment Configuration**

#### **Required Environment Variables**
Create `.env` files in `src/PetID_frontend/`:

```env
# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Firebase (Optional)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

# ICP Configuration
VITE_DFX_NETWORK=local
VITE_CANISTER_ID_PETID_BACKEND=your_backend_canister_id
```

### **🏗️ Build & Deployment**

#### **Production Build**
```bash
# Build optimized production version
npm run build

# Deploy to IC mainnet
dfx deploy --network ic
```

#### **Local Testing**
```bash
# Run all tests
npm test

# Build and test locally
dfx deploy --network local
```

### **📱 PWA Configuration**
- **Service Worker**: Auto-generated via Vite PWA plugin
- **Manifest**: Configured in `public/manifest.json`
- **Offline Support**: Automatic caching for core functionality
- **Installation**: Available on all platforms (iOS, Android, Desktop)

---

### 🗺️ Usage Flow

### First Use
1. **Access the application**
2. **Connect via Internet Identity**
3. **Complete your profile**
4. **Register your first pet**

### Pet Registration
1. **Go to "Profile" > "My NFTs"**
2. **Click "Register New Pet"**
3. **Fill out the form:**
   - Photo upload
   - Pet name/nickname
   - Birth date
4. **Confirm registration**
5. **Pet will be saved on blockchain**

### Management (Paid Feature)
1. **Dashboard**: View all registered pets
2. **Edit**: Update information (future)
3. **Share**: Generate public QR Code 

---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <img src="./img/team/Davi.png" width="100" /><br/>
      <b>Davi Marques Oliveira</b><br/>
      Backend Developer<br/>
      <a href="mailto:contato.davimoliveira@gmail.com">Email</a> | 
      <a href="https://www.linkedin.com/in/davi-oliveira-36063a357/">LinkedIn</a>
    </td>
    <td align="center">
      <img src="img/team/Alex.png" width="100" /><br/>
      <b>Álex Joubert</b><br/>
      Frontend Developer<br/>
      <a href="mailto:lekinhoj@gmail.com">Email</a> | 
      <a href="https://www.linkedin.com/in/%C3%A1lex-joubert-5451b215b/">LinkedIn</a>
    </td>
    <td align="center">
      <img src="./img/team/Emiliano.png" width="100" /><br/>
      <b>José Emiliano</b><br/>
      Tech Leader<br/>
      <a href="mailto:Jpemiliano@gmail.com">Email</a> | 
      <a href="https://www.linkedin.com/in/jose-emiliano-004a8938/">LinkedIn</a>
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📞 Support & Contact

- **Project Repository**: [GitHub - PetID-ICP](https://github.com/your-repo/PetID-ICP)
- **Issues & Bug Reports**: [GitHub Issues](https://github.com/your-repo/PetID-ICP/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-repo/PetID-ICP/discussions)

### **Team Contact**
- **Technical Support**: blockchaintech.br@gmail.com
- **Frontend Issues**: blockchaintech.br@gmail.com 
- **Project Leadership**: Jpemiliano@gmail.com


---

<div align="center">
  <strong>🐾 Built with love for pet owners everywhere 🐾</strong><br/>
  <em>Connecting pets, owners, and communities on the blockchain</em>
</div>