from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric import utils as asn1_utils
from cryptography.exceptions import InvalidSignature

def _int_to_bytes(n: int, length: int) -> bytes:
    return n.to_bytes(length, byteorder='big')

def verify_signature(pubkey_bytes: bytes, sig_tuple: tuple, tx_hash_bytes: bytes) -> bool:
    if not isinstance(pubkey_bytes, bytes):
        raise TypeError("pubkey_bytes must be bytes.")
    if len(pubkey_bytes) not in [33, 65]:
        raise ValueError(f"Invalid public key length {len(pubkey_bytes)}. Must be 33 or 65 bytes.")
    if pubkey_bytes[0] not in [0x02, 0x03, 0x04]:
        raise ValueError(f"Invalid public key prefix {pubkey_bytes[0]}. Must be 0x02, 0x03, or 0x04.")

    if not (isinstance(sig_tuple, tuple) and len(sig_tuple) == 2 and
            isinstance(sig_tuple[0], int) and isinstance(sig_tuple[1], int)):
        raise TypeError("sig_tuple must be a tuple (r_int, s_int).")
    if not isinstance(tx_hash_bytes, bytes) or len(tx_hash_bytes) != 32:
        raise ValueError("tx_hash_bytes must be 32 bytes.")

    r_int, s_int = sig_tuple
    
    if r_int <= 0 or r_int >= ec.SECP256K1.order:
        print("Error: r value out of range")
        return False
    if s_int <= 0 or s_int >= ec.SECP256K1.order:
        print("Error: s value out of range")
        return False
    
    if s_int > ec.SECP256K1.order // 2:
        print("Error: s value too high (malleability)")
        return False

    signature_der = asn1_utils.encode_dss_signature(
        _int_to_bytes(r_int, 32),
        _int_to_bytes(s_int, 32)
    )

    try:
        public_key = ec.EllipticCurvePublicKey.from_encoded_point(
            ec.SECP256K1(),
            pubkey_bytes
        )
        
        public_key.verify(
            signature_der,
            tx_hash_bytes,
            ec.ECDSA(hashes.SHA256())
        )
        return True
        
    except ValueError as e:
        print(f"Error loading public key: {e}")
        return False
    except InvalidSignature:
        print("Invalid signature")
        return False
    except Exception as e:
        print(f"An unexpected error occurred during verification: {e}")
        return False




