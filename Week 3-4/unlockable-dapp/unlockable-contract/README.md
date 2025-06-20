# Unlockable Smart Contract - Quick Reference

This README provides a brief overview of the key files in the `unlockable-contract` folder for the Unlockable DApp project. It explains the purpose and usage of the main smart contract, deployment script, and test suite.

---

## 1. `contracts/Unlockable.sol`

**Purpose:**
- The core smart contract for the Unlockable DApp.
- Allows publishers to list digital content for sale, and users to purchase access using ETH.
- Handles payments, access rights, and platform fee distribution.

**Key Features:**
- **List Content:** Creators can list items with a title, description, and price.
- **Purchase Access:** Users can buy access to listed items by sending ETH.
- **Fee Split:** Automatically splits payment between the publisher and the platform owner (fee recipient).
- **Access Control:** Tracks which users have purchased which items.
- **Admin Controls:** Owner can update the platform fee percentage and transfer ownership.
- **Events:** Emits events for item listing, purchase, and fee updates for easy tracking.

---

## 2. `scripts/deploy.ts`

**Purpose:**
- Script to deploy the `Unlockable` smart contract to a blockchain network (e.g., Sepolia testnet).

**How it Works:**
- Sets the initial platform fee percentage (default: 5%) and fee recipient (deployer address).
- Deploys the contract and prints the deployed address, fee settings, and owner info to the console.

**Usage:**
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```
- Update the contract address in your frontend after deployment.

---

## 3. `test/Unlockable.ts`

**Purpose:**
- Automated test suite for the `Unlockable` smart contract using Hardhat, Chai, and Ethers.js.

**What It Tests:**
- Listing items as a publisher.
- Purchasing items and correct ETH/fund distribution (including platform fee).
- Access control: ensuring only buyers can access purchased content.
- Admin functions: updating platform fee, restricting admin actions to owner.
- Edge cases: incorrect payments, double purchases, and access checks.
- Event emission for all major actions.

**How to Run Tests:**
```bash
npx hardhat test
```

---

## How These Fit Together
- **Unlockable.sol** defines the business logic and rules for the DApp.
- **deploy.ts** puts the contract on the blockchain so it can be used by the frontend and users.
- **Unlockable.ts (test)** ensures the contract works as intended and is safe to use.

For more details, see the main project [README](../README.md) or dive into each file for inline documentation and comments.
