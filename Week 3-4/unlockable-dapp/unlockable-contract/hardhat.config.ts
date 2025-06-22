import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"; // Import dotenv to load .env variables

      
// Retrieve environment variables or use defaults
   const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org"; // Fallback public RPC
   const PRIVATE_KEY = process.env.PRIVATE_KEY || "your_dummy_private_key"; // Fallback, should be set in .env
   const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

   const config: HardhatUserConfig = {
     solidity: "0.8.20", // Or your contract's Solidity version e.g. "0.8.9"
     networks: {
       hardhat: { // Configuration for the local Hardhat Network
         chainId: 31337,
       },
       localhost: { // For connecting to a manually started `npx hardhat node`
         url: "http://127.0.0.1:8545/",
         chainId: 31337, // Default Hardhat network chainId
       },
       sepolia: {
         url: SEPOLIA_RPC_URL,
         accounts: [`0x${PRIVATE_KEY}`], 
         chainId: 11155111, 
       },
     },
     etherscan: {
       
       apiKey: ETHERSCAN_API_KEY,
     },
   };

   export default config;

   
  