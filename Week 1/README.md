# Bitcoin Transaction Signature System

## Evaluation Criteria

### Hashing
- Correct double-SHA256 implementation matching TXID specs
  - Implements double SHA-256 hashing as per Bitcoin specification
  - Handles 32-byte hash outputs
  - Proper error handling for invalid inputs
- Proper byte ordering for Bitcoin data structures
  - Implements little-endian byte ordering for TXIDs
  - Handles byte-level operations correctly
  - Converts between hex and byte formats

### Signature
- Valid (r,s) component generation
  - Implements ECDSA signature generation using secp256k1
  - Calculates r and s components directly
  - Handles transaction malleability protection
  - Validates signature components
- Nonce reuse protection mechanism
  - Implements RFC 6979 for deterministic k-value generation
  - Ensures unique k-value for each signature
  - Prevents signature reuse vulnerabilities

### Verification
- Strict encoding rule enforcement
  - Validates public key formats (compressed/uncompressed)
  - Enforces proper signature component ranges
  - Checks for high s-values
  - Implements proper ASN.1 DER encoding
- Public key recovery logic
  - Validates recovered public keys
  - Handles both compressed and uncompressed formats
  - Implements proper error handling

### Documentation
- Clear explanation of implementation
  - Transaction hasher: Double SHA-256 implementation with proper byte ordering
  - Signature simulator: ECDSA with RFC 6979 for nonce protection
  - Signature verifier: Strict validation with public key recovery
  - Comprehensive error handling throughout

## Dependencies
- cryptography
- hashlib
- hmac

## Installation
```bash
pip install cryptography
```

## Usage
1. Create transaction hash
2. Sign transaction
3. Verify signature