# PetID - Blockchain Pet Registry

<p align="center">
  <img src="./img/logo_full (1).jpg" alt="PetID Logo" width="320"/>
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

- 🚀 [Site Deployed](https://nxbta-iqaaa-aaaaj-qnskq-cai.icp0.io/)
- 📽️ [Pitch Deck](https://www.youtube.com/watch?v=A0n8t9SHlDQ)
- 🚀 [Live Demo](https://www.youtube.com/watch?v=GMXVu3iZdpY)
- 🛠️ [Installation Guide](https://github.com/BlockChainTechBrazil/PetID-ICP/install.md)
- 🐞 [Report an Issue](https://github.com/BlockChainTechBrazil/PetID-ICP/issues)
- 💬 [Community / Discussions](https://github.com/BlockChainTechBrazil/PetID-ICP/discussions)
- ✉️ [Contact](mailto:contato.davimoliveira@gmail.com)
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

## 🏗️ Project architecture

```
PetID-ICP/
├── src/
│   ├── PetID_backend/           # Motoko backend (canister logic)
│   │   └── main.mo              # Main Motoko source file
│   ├── PetID_frontend/          # Frontend (React + Vite)
│   │   ├── public/
│   │   │   ├── .ic-assets.json5 # IC asset and CSP configuration
│   │   │   └── ...              # Static assets (icons, manifest, etc.)
│   │   ├── src/
│   │   │   ├── componentes/     # Reusable UI components
│   │   │   ├── pages/           # Application pages (routes)
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── data/            # Static data and image references
│   │   │   ├── locales/         # i18n translation files
│   │   │   └── ...              # Other frontend source files
│   │   ├── package.json         # Frontend dependencies and scripts
│   │   └── ...                  # Config files (Vite, Tailwind, etc.)
│   └── declarations/            # Canister interface declarations
├── deps/                        # Project dependencies and candid files
├── dfx.json                     # DFINITY project configuration
├── canister_ids.json            # Canister IDs for deployment
├── package.json                 # Root dependencies and scripts
├── README.md                    # Project documentation
└── ...                          # Other configs and docs
```

## 🎯 About the Project

**PetID** is a decentralized application built on the Internet Computer Protocol (ICP) that offers a complete pet registration and identity system. Using blockchain technology, IPFS for decentralized image storage, and Internet Identity authentication, PetID provides a secure and permanent solution for documenting and managing pet information.

---

## 🌟 Why use PetID?

- **🔒 Blockchain Security**: Immutable and cryptographically secure data
- **🌍 Decentralized**: No dependency on centralized servers
- **📱 Complete PWA**: Works as a native app on any device
- **🔐 Web3 Authentication**: Via Internet Identity - no passwords, maximum security
- **🌐 Multilingual**: Support for Portuguese, English, and Spanish
- **📸 IPFS Storage**: Decentralized storage for pet photos

---

## ✨ Key Features

### 🐕 Complete Pet Registration
- Intuitive form for registering new pets
- Photo upload with IPFS storage
- Basic data: name, birth date, photo
- Automatic linking to owner via Internet Identity

### 👤 Profile System
- Personalized dashboard for each user
- Complete list of registered pets
- Statistics and information panel
- Account settings and preferences

### 🔐 Secure Authentication
- Integration with Internet Identity
- Passwordless authentication
- Decentralized identity-based access control
- Sensitive route protection

### 📱 Progressive Web App (PWA)
- Works offline
- Installable on any device
- Push notifications (future)
- Optimized performance

### 🌍 Internationalization
- **Portuguese** - Main language
- **English** - Complete English
- **Spanish** - Complete Spanish
- Automatic browser language detection
- Manual language selector

### 🎨 Modern Interface
- Responsive design with Tailwind CSS
- Smooth and interactive animations
- Dark/light theme (future)
- Accessible components

---

## 🧩 Problem Statement

Millions of pets go missing every year, often because they lack proper identification. The pet care system is fragmented, with owners, clinics, and service providers working separately, making information hard to share. Records are usually on paper, which can be lost, damaged, or outdated. In addition, registration is often complicated and costly for many owners. These problems lead to untraceable pets, delays in medical care, and inefficient services.

---

## 🛠️ Technologies Used

- **React Frontend**: User interface with PWA capabilities
- **Motoko Backend**: Smart contract for business logic
- **Internet Identity**: Decentralized authentication system
- **IPFS**: Distributed photo storage
- **IC Network**: Blockchain infrastructure for hosting

---

## 📍 Roadmap

### Version 1.0 (MVP) - ✅ Completed
- [x] Basic pet registration system
- [x] Internet Identity authentication
- [x] Photo upload to IPFS
- [x] User dashboard
- [x] Internationalization (PT/EN/ES)
- [x] Complete PWA

### Version 1.1 - 🚧 In Development
- [ ] Search and filter system
- [ ] Pet information editing
- [ ] Public profile sharing (QR Code)
- [ ] PWA notifications

### Version 2.0 - 🎯 Planned
- [ ] **Pet Genealogy**
  - [ ] Family tree
  - [ ] Parent/offspring registry
  - [ ] Lineage history
- [ ] **Medical Records**
  - [ ] Digital vaccination card
  - [ ] Medical history
  - [ ] Appointment reminders
  - [ ] Veterinarian integration
- [ ] **Community & Social**
  - [ ] Activity feed
  - [ ] Breed/region groups
  - [ ] Friend system
  - [ ] Photo sharing

### Version 3.0 - 💡 Future
- [ ] **NFT Marketplace**
  - [ ] Registered pet sales
  - [ ] Creator royalties
  - [ ] Authenticity certificates
- [ ] **Geolocation**
  - [ ] Regional pet map
  - [ ] Lost/found pets
  - [ ] Local help network
- [ ] **AI & Machine Learning**
  - [ ] Breed recognition by photo
  - [ ] Personalized recommendations
  - [ ] Disease detection by image

---

## 🗺️ Usage Flow

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
      <img src="./img/Davi.png" width="100" /><br/>
      <b>Davi Marques Oliveira</b><br/>
      Backend Developer<br/>
      <a href="mailto:contato.davimoliveira@gmail.com">Email</a> | 
      <a href="https://www.linkedin.com/in/davi-oliveira-36063a357/">LinkedIn</a>
    </td>
    <td align="center">
      <img src="img/Alex.png" width="100" /><br/>
      <b>Álex Joubert</b><br/>
      Frontend Developer<br/>
      <a href="mailto:lekinhoj@gmail.com">Email</a> | 
      <a href="https://www.linkedin.com/in/%C3%A1lex-joubert-5451b215b/">LinkedIn</a>
    </td>
    <td align="center">
      <img src="./img/Emiliano.png" width="100" /><br/>
      <b>José Emiliano</b><br/>
      Tech Leader<br/>
      <a href="mailto:Jpemiliano@gmail.com">Email</a> | 
      <a href="https://www.linkedin.com/in/jose-emiliano-004a8938/">LinkedIn</a>
    </td>
  </tr>
</table>