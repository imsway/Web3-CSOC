<p align="center">
  <img src="https://placehold.co/600x120?text=Unlockable+DApp" alt="Unlockable DApp Banner"/>
</p>

<p align="center">
  <a href="https://sepolia.etherscan.io/address/YOUR_ADDRESS"><img src="https://img.shields.io/badge/Contract-Sepolia-blue?logo=ethereum" alt="Sepolia Contract"/></a>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License"/>
  <img src="https://img.shields.io/badge/Frontend-React-blue?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Smart_Contracts-Solidity-black?logo=solidity" alt="Solidity"/>
</p>

# Unlockable

> **Decentralized Pay-per-Access Content Gateway**

Unlockable is a decentralized application (DApp) that empowers digital creators to monetize their content with crypto. List your digital content for a price in ETH, let users purchase access, and enjoy transparent, automatic fee collection. Built for creators, by creators.

---

## 🚀 Features
- **List Content:** Creators can list digital content or links for a price in ETH.
- **Purchase Access:** Users buy access to content using ETH and MetaMask.
- **Automatic Fee Split:** The DApp owner receives a small percentage from each transaction.
- **Fully On-Chain:** All payments and access rights are managed by smart contracts.
- **Deployed on Sepolia:** Test and use with real ETH (on testnet).

---

## 🧐 Why Unlockable?
Monetizing digital content is hard. Unlockable makes it easy, transparent, and borderless:
- No middlemen or platform lock-in.
- Instant, global payments in crypto.
- Transparent fee structure for both creators and platform owners.

---

## 🛠️ Tech Stack
- **Smart Contracts:** Solidity, Hardhat
- **Frontend:** React, Vite, TypeScript
- **Blockchain Interaction:** Ethers.js, MetaMask
- **Network:** Sepolia Testnet

---

## 📦 Deployed Contract
- **Address:** `Your_Unlockable_Contract_Address_On_Sepolia`
- **Etherscan:** [View on Etherscan](https://sepolia.etherscan.io/address/YOUR_ADDRESS)

---

## 🖥️ Quick Demo


<p align="center">
  <img src="unlockable-dapp/unlockable-frontend/src/assets/Demo.png" alt="Unlockable Demo"/>
</p>

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v16+)
- npm
- MetaMask (browser extension)

### 1. Clone the Repository
```bash
git clone <this-repo-url>
cd unlockable-dapp
```

### 2. Smart Contract Setup (`unlockable-contract/`)
```bash
cd unlockable-contract
```
- Install dependencies:
  ```bash
  npm install
  ```
- Create a `.env` file (see example below):
  ```env
  SEPOLIA_RPC_URL=your_sepolia_rpc_url
  PRIVATE_KEY=your_private_key
  ETHERSCAN_API_KEY=your_etherscan_api_key
  ```
- Compile contracts:
  ```bash
  npx hardhat compile
  ```
- Run tests:
  ```bash
  npx hardhat test
  ```
- Deploy (optional):
  ```bash
  npx hardhat run scripts/deploy.ts --network sepolia
  ```
  > **Note:** If you deploy your own contract, update the contract address in the frontend as described below.

### 3. Frontend Setup (`unlockable-frontend/`)
```bash
cd ../unlockable-frontend
```
- Install dependencies:
  ```bash
  npm install
  ```
- **Update Contract Address:** Edit `src/ethereum.ts` and set `UNLOCKABLE_CONTRACT_ADDRESS` to your deployed address.
- Run the frontend:
  ```bash
  npm run dev
  ```
- Open [http://localhost:5173/](http://localhost:5173/) in your browser.
- Make sure MetaMask is connected to Sepolia.

---

## 👩‍💻 How to Use

1. **Connect MetaMask** (ensure you are on Sepolia testnet).
2. **List Content:**
   - Fill out the "List Your Unlockable Content" form.
   - Submit and confirm the transaction in MetaMask.
3. **Purchase Content:**
   - Browse available content.
   - Click "Purchase" and confirm in MetaMask.
4. **View Purchases:**
   - Access your unlocked content directly in the DApp.

---

## ❓ FAQ

**Q: What is the fee percentage?**  
A: The fee is set in the smart contract and can be viewed on-chain. (Check contract source for details.)

**Q: Can I use this on mainnet?**  
A: This version is for Sepolia testnet. For mainnet deployment, update the config and redeploy.

**Q: Is my content stored on-chain?**  
A: Only access rights and payment records are on-chain. Content itself is referenced by a link (e.g., IPFS, web URL).

**Q: How do I get Sepolia ETH?**  
A: Use a Sepolia faucet (search "Sepolia faucet" online) and send test ETH to your MetaMask wallet.

---

## 🤖 AI Assistance & Attribution

This project benefited from the use of AI tools to accelerate development, documentation, and/or code review. Please refer the points below about where and how AI was used (e.g., code generation, bug fixing, README writing, UI suggestions, etc.):

- README sections generated with AI assistance.
- Smart contract boilerplate generated using AI tools. 

---

## 📄 License
MIT 