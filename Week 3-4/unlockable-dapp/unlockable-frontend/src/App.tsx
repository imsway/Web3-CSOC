import React, { useState, useEffect, useCallback } from 'react';
// Import specific functions and types from Ethers v6
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import type { Signer } from 'ethers';
import './App.css';

import {
    getEthereumProvider,
    connectWalletAndGetSigner,
    getUnlockableContractInstance,
    getConnectedAccount,
    checkAndSwitchNetwork,
} from './ethereum';

import { storeSecretForItem, getSecretForItem } from './secretsStore';


interface LockableItemFE {
    id: number; 
    publisher: string;
    title: string;
    description: string;
    price: bigint; 
    priceFormatted: string;
    userHasAccess: boolean;
    secretContent?: string | null;
    isCurrentUserPublisher: boolean;
}

interface MetaMaskEthereumProvider {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: Array<unknown> }) => Promise<unknown>;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    selectedAddress?: string | null;
}

interface ExtendedWindow extends Window {
    ethereum?: MetaMaskEthereumProvider;
}

// A type guard to check if an object has a specific property
function hasProperty<T extends object, K extends PropertyKey>(obj: T, key: K): obj is T & Record<K, unknown> {
    return key in obj;
}

// Interface for common error structures from Ethers/MetaMask

// Function to safely extract an error message string
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) { 
        if (hasProperty(error, 'reason') && typeof error.reason === 'string') {
            return error.reason;
        }
        if (hasProperty(error, 'data') && hasProperty(error.data as object, 'message') && typeof (error.data as { message: string }).message === 'string') {
            return (error.data as { message: string }).message;
        }
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (hasProperty(error as object, 'message') && typeof (error as { message: string }).message === 'string') {
        return (error as { message: string }).message;
    }
    return "An unknown error occurred. Check the console.";
}

function App() {
    const [provider, setProvider] = useState<BrowserProvider | null>(null); 
    const [signer, setSigner] = useState<Signer | null>(null);             
    const [contract, setContract] = useState<Contract | null>(null);       
    const [readOnlyContract, setReadOnlyContract] = useState<Contract | null>(null);
    const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
    const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState<boolean>(false);

    const [items, setItems] = useState<LockableItemFE[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [appError, setAppError] = useState<string | null>(null);

    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('0.01');
    const [newItemSecret, setNewItemSecret] = useState('');

    // Add new state for button loading
    const [isConnecting, setIsConnecting] = useState(false);
    const [isListing, setIsListing] = useState(false);
    const [purchasingItemId, setPurchasingItemId] = useState<number | null>(null);

    useEffect(() => {
        const initProvider = getEthereumProvider();
        if (initProvider) {
            setProvider(initProvider);
            const roContract = getUnlockableContractInstance(initProvider);
            setReadOnlyContract(roContract);
        }
    }, []);

    useEffect(() => {
        if (!provider) return;

        const checkAccountAndNetwork = async () => {
            setIsLoading(true);
            try {
                const account = await getConnectedAccount(); 
                if (account) {
                    setConnectedAccount(account);
                    const currentSigner = await provider.getSigner(); 
                    setSigner(currentSigner);
                    setContract(getUnlockableContractInstance(currentSigner));
                }
                // Always check/switch network, even if no account is initially connected
                const correctNetwork = await checkAndSwitchNetwork(provider);
                setIsOnCorrectNetwork(correctNetwork);

            } catch (e: unknown) { // Catch as unknown
                console.warn("User might have cancelled connection or no accounts available.", getErrorMessage(e));
                if (provider) { // Ensure provider is still valid before trying to use it
                    const correctNetwork = await checkAndSwitchNetwork(provider);
                    setIsOnCorrectNetwork(correctNetwork);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAccountAndNetwork();

        const handleAccountsChanged = async (accounts: string[]) => {
            if (accounts.length === 0) {
                setConnectedAccount(null);
                setSigner(null);
                setContract(null);
                console.log("MetaMask disconnected.");
            } else {
                setConnectedAccount(accounts[0]);
                if (provider) { // Ensure provider is available
                    const currentSigner = await provider.getSigner(); 
                    setSigner(currentSigner);
                    setContract(getUnlockableContractInstance(currentSigner));
                    console.log("Account changed to:", accounts[0]);
                }
            }
        };

        const handleChainChanged = async (_chainId: string) => {
            console.log("Network changed to:", _chainId);
            if (provider) {
                const correctNetwork = await checkAndSwitchNetwork(provider);
                setIsOnCorrectNetwork(correctNetwork);
            }
        };

        const eth = (window as ExtendedWindow).ethereum; 

        if (eth) {
            eth.on('accountsChanged', handleAccountsChanged as (...args: unknown[]) => void); 
            eth.on('chainChanged', handleChainChanged as (...args: unknown[]) => void);     
        }

        return () => {
            if (eth) {
                eth.removeListener('accountsChanged', handleAccountsChanged as (...args: unknown[]) => void);
                eth.removeListener('chainChanged', handleChainChanged as (...args: unknown[]) => void);
            }
        };
    }, [provider]);

    const fetchAllItems = useCallback(async () => {
        const contractToUse = contract || readOnlyContract;
        if (!contractToUse) {
            setAppError("Contract not initialized. Cannot fetch items.");
            return;
        }
        if (!isOnCorrectNetwork) {
            if (provider) setAppError("Please switch to the Sepolia network in MetaMask to fetch items.");
            setItems([]); 
            return;
        }

        setIsLoading(true);
        setAppError(null);
        try {
            const itemIds = await contractToUse.getAllItemIds(); 
            const fetchedItems: LockableItemFE[] = [];

            for (const idBigInt of itemIds) {
                const id = Number(idBigInt); 
                const itemData = await contractToUse.items(id);

                if (!itemData.exists) continue;

                let userHasAccess = false;
                if (connectedAccount) {
                    userHasAccess = await contractToUse.hasAccess(connectedAccount, id);
                }

                const secret = userHasAccess ? getSecretForItem(id) : null;
                const isCurrentUserPublisher = itemData.publisher.toLowerCase() === connectedAccount?.toLowerCase();

                fetchedItems.push({
                    id: id,
                    publisher: itemData.publisher,
                    title: itemData.title,
                    description: itemData.description,
                    price: itemData.price, 
                    priceFormatted: formatEther(itemData.price), 
                    userHasAccess: userHasAccess,
                    secretContent: secret,
                    isCurrentUserPublisher: isCurrentUserPublisher,
                });
            }
            setItems(fetchedItems.reverse());
        } catch (err: unknown) { 
            console.error("Error fetching items:", err);
            setAppError(`Failed to fetch items: ${getErrorMessage(err)}`);
        } finally {
            setIsLoading(false);
        }
    }, [contract, readOnlyContract, connectedAccount, isOnCorrectNetwork, provider]);

    useEffect(() => {
        if ((contract || readOnlyContract) && isOnCorrectNetwork) {
            fetchAllItems();
        }
    }, [contract, readOnlyContract, isOnCorrectNetwork, fetchAllItems]);


    const handleConnectWallet = async () => {
        if (!provider) {
            setAppError("MetaMask provider not available.");
            return;
        }
        setAppError(null);
        setIsConnecting(true);
        try {
            const currentSigner = await connectWalletAndGetSigner();
            if (currentSigner) {
                setSigner(currentSigner);
                const userAddress = await currentSigner.getAddress();
                setConnectedAccount(userAddress);
                setContract(getUnlockableContractInstance(currentSigner));

                const correctNetwork = await checkAndSwitchNetwork(provider);
                setIsOnCorrectNetwork(correctNetwork);
            }
        } catch (err: unknown) {
            console.error("Connection error:", err);
            setAppError(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleListItem = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!contract || !signer) {
            setAppError("Please connect your wallet first.");
            return;
        }

        setIsListing(true);
        setAppError(null);

        try {
            const priceInWei = parseEther(newItemPrice);
            const tx = await contract.listItem(
                newItemTitle,
                newItemDescription,
                priceInWei
            );

            await tx.wait();
            storeSecretForItem(items.length, newItemSecret);
            await fetchAllItems();

            // Clear form
            setNewItemTitle('');
            setNewItemDescription('');
            setNewItemPrice('0.01');
            setNewItemSecret('');
        } catch (err: unknown) {
            console.error("Error listing item:", err);
            setAppError(`Failed to list item: ${getErrorMessage(err)}`);
        } finally {
            setIsListing(false);
        }
    };

    const handlePurchaseItem = async (itemId: number, price: bigint) => {
        if (!contract || !signer) {
            setAppError("Please connect your wallet first.");
            return;
        }

        setPurchasingItemId(itemId);
        setAppError(null);

        try {
            const tx = await contract.purchaseItem(itemId, { value: price });
            await tx.wait();
            await fetchAllItems();
        } catch (err: unknown) {
            console.error("Error purchasing item:", err);
            setAppError(`Failed to purchase item: ${getErrorMessage(err)}`);
        } finally {
            setPurchasingItemId(null);
        }
    };

    // Logout handler
    const handleLogout = () => {
        setConnectedAccount(null);
        setSigner(null);
        setContract(null);
    };

    return (
        <div className="App">
            <div className="main-centered-content">
                <header className="App-header">
                    <h1>Unlockable Content Marketplace</h1>
                    {!connectedAccount ? (
                        <button
                            onClick={handleConnectWallet}
                            disabled={isConnecting}
                            className={isConnecting ? 'loading' : ''}
                        >
                            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <p style={{ margin: 0 }}>
                                Connected: {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
                            </p>
                            <button onClick={handleLogout} style={{ padding: '0.5rem 1.2rem', fontSize: '1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.13)', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 600, cursor: 'pointer' }}>
                                Logout
                            </button>
                            {!isOnCorrectNetwork && (
                                <p className="error-message">Please switch to Sepolia network</p>
                            )}
                        </div>
                    )}
                </header>

                {appError && <div className="error-message">{appError}</div>}

                {connectedAccount && isOnCorrectNetwork && (
                    <section>
                        <h2>List New Item</h2>
                        <form onSubmit={handleListItem}>
                            <div>
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={newItemTitle}
                                    onChange={(e) => setNewItemTitle(e.target.value)}
                                    required
                                    placeholder="Enter item title"
                                />
                            </div>
                            <div>
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={newItemDescription}
                                    onChange={(e) => setNewItemDescription(e.target.value)}
                                    required
                                    placeholder="Enter item description"
                                />
                            </div>
                            <div>
                                <label htmlFor="price">Price (ETH)</label>
                                <input
                                    type="number"
                                    id="price"
                                    value={newItemPrice}
                                    onChange={(e) => setNewItemPrice(e.target.value)}
                                    required
                                    min="0.0001"
                                    step="0.0001"
                                />
                            </div>
                            <div>
                                <label htmlFor="secret">Secret Content</label>
                                <textarea
                                    id="secret"
                                    value={newItemSecret}
                                    onChange={(e) => setNewItemSecret(e.target.value)}
                                    required
                                    placeholder="Enter the secret content that will be unlocked after purchase"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isListing}
                                className={isListing ? 'loading' : ''}
                            >
                                {isListing ? 'Listing...' : 'List Item'}
                            </button>
                        </form>
                    </section>
                )}

                <section>
                    <h2>Available Items</h2>
                    {isLoading ? (
                        <div className="loading-spinner" />
                    ) : (
                        <div className="items-grid">
                            {items.map((item) => (
                                <div key={item.id} className="item-card">
                                    <h3>{item.title}</h3>
                                    <p className="item-description">{item.description}</p>
                                    <p>Price: {item.priceFormatted} ETH</p>
                                    <small>Publisher: {item.publisher.slice(0, 6)}...{item.publisher.slice(-4)}</small>

                                    {item.userHasAccess ? (
                                        <div className="access-granted">
                                            <p>Access Granted!</p>
                                            <div className="secret-content">
                                                {item.secretContent}
                                            </div>
                                        </div>
                                    ) : item.isCurrentUserPublisher ? (
                                        <p>You published this item</p>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchaseItem(item.id, item.price)}
                                            disabled={purchasingItemId === item.id}
                                            className={purchasingItemId === item.id ? 'loading' : ''}
                                        >
                                            {purchasingItemId === item.id ? 'Purchasing...' : 'Purchase'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default App;