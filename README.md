# PetID - ICP (Internet Computer Protocol)

Um sistema descentralizado para registro e gestão de identificação de pets usando blockchain ICP com Internet Identity para autenticação.

## 🚀 Características

- **Blockchain ICP**: Utiliza o Internet Computer Protocol para armazenamento descentralizado
- **Internet Identity**: Sistema de autenticação descentralizado do ICP
- **Backend Motoko**: Smart contracts escritos em Motoko
- **React + TypeScript**: Interface moderna e type-safe
- **IPFS**: Armazenamento de metadados dos pets
- **Multilíngue**: Suporte para português, inglês e espanhol

## �️ Tecnologias

### Backend
- **Motoko**: Linguagem de programação para ICP
- **Candid**: Interface definition language para ICP
- **Internet Identity**: Sistema de autenticação descentralizado

### Frontend
- **React 19**: Framework para interface do usuário
- **TypeScript**: Linguagem tipada
- **Vite**: Build tool rápido
- **Tailwind CSS**: Framework CSS utilitário
- **i18next**: Internacionalização
- **@dfinity/agent**: Cliente JavaScript para ICP

## � Pré-requisitos

- Node.js 18+
- DFX (DFINITY SDK) 0.15.0+
- Git

### Instalação do DFX

```bash
# No Windows (usando WSL) ou macOS/Linux
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/BlockChainTechBrazil/PetID-ICP.git
cd PetID-ICP
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie a rede local do ICP:
```bash
dfx start --background
```

5. Deploy dos canisters:
```bash
dfx deploy
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```


## 🩺 Medical & Vaccine Records (Planned/Experimental)

The smart contract will support:

- **Vaccine Records**: Each pet will have an array of vaccine records (name, date, details)
- **Medical Records**: Each pet will have an array of medical records (description, date, veterinarian)

These will be managed by new functions in the same PetID contract, so all pet data remains unified and easy to query.

**Example Solidity additions:**

```solidity
struct VaccineRecord {
    string name;
    uint256 date;
    string details;
}

struct MedicalRecord {
    string description;
    uint256 date;
    string veterinarian;
}

mapping(uint256 => VaccineRecord[]) public petVaccines;
mapping(uint256 => MedicalRecord[]) public petMedicalRecords;

function addVaccine(uint256 petId, string memory name, uint256 date, string memory details) public onlyPetOwner(petId) {
    petVaccines[petId].push(VaccineRecord(name, date, details));
}

function addMedicalRecord(uint256 petId, string memory description, uint256 date, string memory veterinarian) public onlyPetOwner(petId) {
    petMedicalRecords[petId].push(MedicalRecord(description, date, veterinarian));
}
```

> **Note:** All new features will be added to the main contract for simplicity and unified access. If the project grows, modularization can be considered.

---

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

For questions or support, please reach out to the development team.

---

*Building a better future for pets through blockchain technology* 🐾
