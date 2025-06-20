// VERY BASIC AND INSECURE ---- only for the assignment in Week 3/4.
// In a real app, secrets would be fetched from a secure backend AFTER blockchain payment confirmation.(I will try to attempt this as my final project)

const SECRET_STORAGE_KEY_PREFIX = 'unlockableSecret_';

// Stores a secret for a given item ID in the browser's localStorage.
export const storeSecretForItem = (itemId: number, secret: string): void => {
    try {
        localStorage.setItem(`${SECRET_STORAGE_KEY_PREFIX}${itemId}`, secret);
    } catch (e) {
        console.error("Error saving secret to localStorage:", e);
        // Handle browsers that might block localStorage (e.g., private mode with strict settings)
    }
};

// Retrieves a secret for a given item ID from localStorage.
export const getSecretForItem = (itemId: number): string | null => {
    try {
        return localStorage.getItem(`${SECRET_STORAGE_KEY_PREFIX}${itemId}`);
    } catch (e) {
        console.error("Error reading secret from localStorage:", e);
        return null;
    }
};