// src/ethereum.ts
import { ethers, BrowserProvider } from 'ethers'; 
import type { Signer } from 'ethers';
import UnlockableABI from './abi/Unlockable.json';

export const UNLOCKABLE_CONTRACT_ADDRESS = "0x88CdD310b22611d91af1D70E87268e34fE4440b6";

const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'; // Chain ID for Sepolia in hexadecimal (11155111)
const SEPOLIA_CHAIN_ID_DEC = 11155111;

interface EthereumProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    send: (method: string, params?: unknown[]) => Promise<unknown>;
    on: (eventName: string, handler: (...args: unknown[]) => void) => void;
    removeListener: (eventName: string, handler: (...args: unknown[]) => void) => void;
    selectedAddress: string | null;
    isMetaMask?: boolean;
}

interface ExtendedWindow extends Window {
    ethereum?: EthereumProvider;
}

export const getEthereumProvider = (): BrowserProvider | null => {
    const extendedWindow = window as ExtendedWindow;
    if (extendedWindow.ethereum) {
        return new ethers.BrowserProvider(extendedWindow.ethereum);
    }
    console.error("MetaMask is not installed. Please install MetaMask to use this DApp.");
    return null;
};

export const connectWalletAndGetSigner = async (): Promise<Signer | null> => { 
    const provider = getEthereumProvider();
    if (!provider) return null;

    try {
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner(); 
        return signer;
    } catch (error) {
        console.error("Failed to connect wallet or get signer:", error);
        return null;
    }
};

export const checkAndSwitchNetwork = async (provider: BrowserProvider): Promise<boolean> => {
    try {
        const network = await provider.getNetwork();
        if (network.chainId !== BigInt(SEPOLIA_CHAIN_ID_DEC)) { 
            console.log(`Current network: ${network.name} (ID: ${network.chainId}). Required: Sepolia (ID: ${SEPOLIA_CHAIN_ID_DEC})`);
            try {
                await provider.send("wallet_switchEthereumChain", [{ chainId: SEPOLIA_CHAIN_ID_HEX }]);
                const newNetwork = await provider.getNetwork();
                return newNetwork.chainId === BigInt(SEPOLIA_CHAIN_ID_DEC);
            } catch (switchError: unknown) {
                if ((switchError as { code: number }).code === 4902) {
                    try {
                        await provider.send("wallet_addEthereumChain", [
                            {
                                chainId: SEPOLIA_CHAIN_ID_HEX,
                                chainName: "Sepolia Testnet",
                                rpcUrls: ["https://rpc.sepolia.org"],
                                nativeCurrency: { name: "SepoliaETH", symbol: "SEP", decimals: 18 },
                                blockExplorerUrls: ["https://sepolia.etherscan.io"],
                            },
                        ]);
                        const newNetwork = await provider.getNetwork();
                        return newNetwork.chainId === BigInt(SEPOLIA_CHAIN_ID_DEC);
                    } catch (addError) {
                        console.error("Failed to add Sepolia network:", addError);
                        return false;
                    }
                }
                console.error("Failed to switch network:", switchError);
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error("Could not get network info:", error);
        return false;
    }
};

export const getUnlockableContractInstance = (
    signerOrProvider: Signer | BrowserProvider 
): ethers.Contract => {
    return new ethers.Contract(UNLOCKABLE_CONTRACT_ADDRESS, UnlockableABI.abi, signerOrProvider);
};

export const getConnectedAccount = async (): Promise<string | null> => {
    const provider = getEthereumProvider();
    if (!provider) return null;

    try {
        const signer = await provider.getSigner(); 
        return await signer.getAddress();
    } catch {
        return null; 
    }
};