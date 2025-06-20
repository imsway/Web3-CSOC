# Unlockable Frontend - Quick Reference

This README provides a brief overview of the key files in the `unlockable-frontend/src` folder for the Unlockable DApp project. It explains the purpose and usage of the main app component, Ethereum utility module, and local secret storage helper.

---

## 1. `App.tsx`

**Purpose:**
- The main React component and entry point for the Unlockable DApp frontend.
- Handles wallet connection, network checks, contract interaction, and user interface for listing and purchasing content.

**Key Features:**
- Connects to MetaMask and checks for the correct network (Sepolia).
- Fetches and displays all listed unlockable items from the smart contract.
- Allows users to list new content, purchase access, and view purchased secrets.
- Handles UI state, error messages, and user feedback.
- Integrates with `ethereum.ts` for blockchain logic and `secretsStore.ts` for local secret management.

---

## 2. `ethereum.ts`

**Purpose:**
- Utility module for all Ethereum and smart contract interactions in the frontend.

**Key Features:**
- Provides functions to:
  - Get the MetaMask provider and connect wallet.
  - Check and switch to the Sepolia network.
  - Instantiate the Unlockable contract with the correct ABI and address.
  - Retrieve the currently connected account.
- Centralizes all blockchain logic for easy maintenance and reuse.

---

## 3. `secretsStore.ts`

**Purpose:**
- Simple helper for storing and retrieving secret content (e.g., download links, codes) in the browser's localStorage.

**Key Features:**
- `storeSecretForItem(itemId, secret)`: Saves a secret for a purchased item locally.
- `getSecretForItem(itemId)`: Retrieves the secret for a purchased item.
- **Note:** This is for demo/assignment purposes only. In a real app, secrets should be managed securely on a backend after payment confirmation.

---

## How These Fit Together
- **App.tsx** is the main UI and logic hub for the DApp.
- **ethereum.ts** provides all blockchain/Ethereum utilities and contract access.
- **secretsStore.ts** manages local storage of purchased secrets for quick access in the UI.

For more details, see the main project [README](../README.md) or dive into each file for inline documentation and comments.
