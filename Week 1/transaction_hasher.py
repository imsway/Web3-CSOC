import hashlib 


def double_sha(data: bytes)-> bytes:
    return hashlib.sha256(hashlib.sha256(data).digest()).digest();

def create_tx_hash(tx_data:bytes) -> str:
    if not isinstance(tx_data,bytes):
        raise TypeError("tx_data must be in bytes.")
    if len(tx_data)==0:
        raise ValueError("Empty tx_data cannot be computed.")
    
    tx_hash_bytes= double_sha(tx_data)
    txid_hex= tx_hash_bytes[::-1].hex()

    return txid_hex


hex_data = "d1a8f3b7c4e2095d"
bytes_data = bytes.fromhex(hex_data)
txid = create_tx_hash(bytes_data)
print("TXID:", txid)


