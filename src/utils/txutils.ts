import { bech32 } from "bech32"
import { bytesToHex, checksum, hexToBytes, mergeUint8Arrays, ripemd160 } from "."
import { base58 } from "@scure/base"
import { OP_CODES } from "../constants/opcodes"
import { BNetwork } from "../types"

export function addressToScriptPubKey(address: string, network?: BNetwork): Uint8Array {
    if(["1", "m", "n"].includes(address[0])) {
        // P2PKH Legacy
        const decoded = base58.decode(address)
        if(decoded.length !== 25)
            throw new Error("Invalid base58 address length")

        const payload = decoded.slice(0, -4)
        const providedChecksum = decoded.slice(-4)
        const validChecksum = checksum(payload)
        if(!providedChecksum.every((byte, index) => byte === validChecksum[index]))
            throw new Error("Invalid base58 address checksum")

        if(network) {
            const expectedPrefix = network === "mainnet" ? 0x00 : 0x6f
            if(decoded[0] !== expectedPrefix)
                throw new Error(`Address network mismatch, expected a ${network} address`)
        }

        const hash = decoded.slice(1, -4) // remove the prefix and checksum
        const prefixScript = new Uint8Array([OP_CODES.OP_DUP, OP_CODES.OP_HASH160, hash.length])
        const sufixScript = new Uint8Array([OP_CODES.OP_EQUALVERIFY, OP_CODES.OP_CHECKSIG])
        return mergeUint8Arrays(prefixScript, hash, sufixScript)
    // wallet not support this type of transaction
    // } else if (["2", "3"].includes(address[0])) {
    //     // P2SH Legacy
    //     const decoded = hexToBytes(Base58.decode(address))
    //     const hash = decoded.slice(1, -4) // remove the prefix and checksum
    //     const prefixScript = new Uint8Array([OP_CODES.OP_HASH160, hash.length])
    //     const sufixScript = new Uint8Array([OP_CODES.OP_EQUAL])
    //     return mergeUint8Arrays(prefixScript, hash, sufixScript)
    // }
    } else if (["tb1", "bc1"].includes(address.substring(0,3))) {
        // SegWit (P2WPKH, P2WSH) — only witness version 0 is supported by this library
        const data = bech32.decode(address)

        if(network) {
            const expectedHrp = network === "mainnet" ? "bc" : "tb"
            if(data.prefix !== expectedHrp)
                throw new Error(`Address network mismatch, expected a ${network} address`)
        }

        const [version, ...programWords] = data.words
        if(version !== 0)
            throw new Error("Unsupported witness version, only version 0 (P2WPKH/P2WSH) is supported")

        const hash = new Uint8Array(bech32.fromWords(programWords))
        // BIP141: a v0 witness program that isn't 20 or 32 bytes is provably unspendable
        if(hash.length !== 0x14 && hash.length !== 0x20)
            throw new Error("Invalid witness program length, expected 20 (P2WPKH) or 32 (P2WSH) bytes")

        const prefixScript = new Uint8Array([OP_CODES.OP_0, hash.length])
        return mergeUint8Arrays(prefixScript, hash)
    }
    throw new Error("not supported format address or type of transaction")
}

export function pubkeyToScriptCode(pubkey: string) {
    const hash = ripemd160(hexToBytes(pubkey), true) as Uint8Array
    
    const prefixScript = new Uint8Array([OP_CODES.OP_DUP, OP_CODES.OP_HASH160, hash.length])
    const sufixScript = new Uint8Array([OP_CODES.OP_EQUALVERIFY, OP_CODES.OP_CHECKSIG])

    const script = mergeUint8Arrays(prefixScript, hash, sufixScript)
    const scriptLength = new Uint8Array([script.length])

    return bytesToHex(mergeUint8Arrays(scriptLength, script))
}

export function scriptPubkeyToScriptCode(script: string) : Uint8Array {
    const scriptPubkey = hexToBytes(script)

    if(scriptPubkey[0] == 0x00 && scriptPubkey[1] == 0x14) {
        const hash = scriptPubkey.slice(2)
        const prefixScript = new Uint8Array([OP_CODES.OP_DUP, OP_CODES.OP_HASH160, hash.length])
        const sufixScript = new Uint8Array([OP_CODES.OP_EQUALVERIFY, OP_CODES.OP_CHECKSIG])
        const scriptCode = mergeUint8Arrays(prefixScript, hash, sufixScript)
        return new Uint8Array([scriptCode.length, ...scriptCode])
    }
    if(scriptPubkey[0] == 0x00 && scriptPubkey[1] == 0x20) {
        // P2WSH: OP_0 <32-byte-hash>
        return new Uint8Array([scriptPubkey.length, ...scriptPubkey])
    }
        
    throw new Error("scriptPubkey no segwit, expected P2WPKH")
}


