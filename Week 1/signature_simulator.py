# remember to install crypto library 
# i.e. in terminal : pip install crypto


from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric import utils as asn1_utils
import os
import hmac
import hashlib

def int_to_bytes(n: int, length: int) -> bytes:
    return n.to_bytes(length, byteorder='big')

def bytes_to_int(b: bytes) -> int:
    return int.from_bytes(b, byteorder='big')

def deterministic_k(private_key: int, tx_hash: bytes) -> int:
    curve_order = ec.SECP256K1.order
    private_key_bytes = int_to_bytes(private_key, 32)
    
    h1 = hashlib.sha256(tx_hash).digest()
    V = b'\x01' * 32
    K = b'\x00' * 32
    
    K = hmac.new(K, V + b'\x00' + private_key_bytes + h1, hashlib.sha256).digest()
    V = hmac.new(K, V, hashlib.sha256).digest()
    K = hmac.new(K, V + b'\x01' + private_key_bytes + h1, hashlib.sha256).digest()
    V = hmac.new(K, V, hashlib.sha256).digest()
    
    k = 0
    while k == 0 or k >= curve_order:
        V = hmac.new(K, V, hashlib.sha256).digest()
        k = int.from_bytes(V, byteorder='big')
        K = hmac.new(K, V + b'\x00', hashlib.sha256).digest()
    
    return k

def sign_transaction(private_key_int: int, tx_hash_bytes: bytes) -> tuple:
    if not isinstance(private_key_int, int):
        raise TypeError("private_key_int must be an integer.")
    if not 0 < private_key_int < ec.SECP256K1.order:
        raise ValueError("private_key_int is outside the valid range for secp256k1.")
    if not isinstance(tx_hash_bytes, bytes) or len(tx_hash_bytes) != 32:
        raise ValueError("tx_hash_bytes must be 32 bytes.")

    private_key = ec.derive_private_key(private_key_int, ec.SECP256K1())
    k = deterministic_k(private_key_int, tx_hash_bytes)
    temp_private_key = ec.derive_private_key(k, ec.SECP256K1())
    public_key_point = temp_private_key.public_key().public_numbers()
    
    r = public_key_point.x % ec.SECP256K1.order
    s = (pow(k, -1, ec.SECP256K1.order) * 
         (int.from_bytes(tx_hash_bytes, byteorder='big') + r * private_key_int)) % ec.SECP256K1.order
    
    if s > ec.SECP256K1.order // 2:
        s = ec.SECP256K1.order - s
    
    print(f"Private Key (int): {private_key_int}")
    print(f"Signature (r, s): ({int_to_bytes(r, 32).hex()}, {int_to_bytes(s, 32).hex()})")
    return (r, s)







