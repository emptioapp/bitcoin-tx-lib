import { OP_CODES } from "../constants/opcodes"
import { ripemd160 as ripemd160Noble } from "@noble/hashes/legacy.js"
import { sha256 as sha256Noble } from "@noble/hashes/sha2.js"
import { Hex } from "../types"

export function bytesToHex(bytes: Uint8Array): string {

    if (bytes.length <= 0)
        throw new Error("The byte array is empty!")

    let hexValue: string = ""

    bytes.forEach(byte => {
        let hexNumber = byte.toString(16)
        if (hexNumber.length == 1)
            hexNumber = "0" + hexNumber

        hexValue += hexNumber
    })

    return hexValue
}

export function hexToBytes(hex: string, hexadecimal: boolean = true): Uint8Array {

    if(hex.length <= 0)
        throw new Error("hex value is empty")

    if (hexadecimal) {
        if (hex.length % 2 !== 0)
            throw new Error("Invalid hex value!")
        if (!/^[0-9a-fA-F]+$/.test(hex))
            throw new Error("Invalid hex value, contains non-hexadecimal characters")
    }

    let bytes = new Uint8Array(hexadecimal ? hex.length / 2 : hex.length)

    for (let i = 0; i < hex.length; i += hexadecimal ? 2 : 1)
    {
        if (hexadecimal)
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
        else
            bytes[i] = hex.charCodeAt(i)
    }

    return bytes;
}

export function sha256(message: Uint8Array, hash256: boolean = false): Uint8Array {

    let hash: Uint8Array = sha256Noble(message)

    // if is a hash256 return sha256(sha256(content)) (doc: https://en.bitcoin.it/wiki/BIP_0174)
    if (hash256)
        hash = sha256Noble(hash)

    return hash
}

export function hash256(message: Uint8Array) : Uint8Array {
    const hash = sha256Noble(sha256Noble(message))
    return hash
}

export function ripemd160(message: Uint8Array, address: boolean = false): Uint8Array {

    let hash = address ? sha256(message) : message

    hash = ripemd160Noble(hash)
    
    return hash
}

export function checksum(message: Uint8Array, bytes: number = 4): Uint8Array {
    
    // generate the hash256(sha256(content)) and return first 4 bytes (doc: https://en.bitcoin.it/wiki/BIP_0174)
    let hash = sha256Noble(message)

    hash = sha256Noble(hash).slice(0, bytes) 

    return hash
}

// export function reverseEndian(hex: Hex): Hex {

//     if(typeof(hex) == "object")
//         return hex.reverse()

//     let hexLE = ""
//         
//     for (let i = hex.length; i > 0; i -= 2) 
//         hexLE += hex[i - 2] + hex[i - 1]

//     return hexLE
// }

export function numberToHex(number: number = 0, bits: number = 64): Uint8Array {

    let hexValue = number.toString(16) // string hexadecimal

    if (hexValue.length == 1)
        hexValue = "0" + hexValue

    for (let i = hexValue.length; i < bits / 4; i++) {
        hexValue = "0" + hexValue
    }

    return hexToBytes(hexValue)
}

// Convert a integer number in Uint8Array(16) // 64 bits little-endian
export function numberToHexLE(number: number = 0, bits: number = 64): Uint8Array 
{
    return numberToHex(number, bits).reverse()
}

export function hash160ToScript(hash160: Hex): Hex {
    
    let data = hash160

    if(typeof(hash160) !== "object")
        data = hexToBytes(hash160)

    let hash160Length = data.length // 0x14 == 20 && 0x20 == 34

    // OP_DUP+OP_HASH160+PK_HASH_LENGTH+PUBKEY_HASH+OP_EQUALVERIFY+OP_CHECKSIG
    let hexScript = mergeUint8Arrays(new Uint8Array([
            OP_CODES.OP_DUP, 
            OP_CODES.OP_HASH160, 
            hash160Length
        ]),
        data as Uint8Array,
        new Uint8Array([
            OP_CODES.OP_EQUALVERIFY,
            OP_CODES.OP_CHECKSIG 
        ])
    )

    if(typeof(hash160) == "string")
        return bytesToHex(hexScript)

    return hexScript
}

export function mergeUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
    let length = arrays.reduce((sum, e) => sum + e.length, 0)
    let mergeArray = new Uint8Array(length)

    arrays.forEach((array, index, arrays) => {
        let offset = arrays.slice(0, index).reduce((acc, e) => acc + e.length, 0)
        mergeArray.set(array, offset)
    })

    return mergeArray
}

export function isEqual(...arrays: Uint8Array[]): boolean {
    let result: boolean = true

    arrays.forEach((arr, index, arrays) => {
        if(index < arrays.length - 1) {            
            if(arr.toString() !== arrays[arrays.length - 1].toString())
                result = false
        }
    })

    return result
}

export function numberToVarint(value: number): Uint8Array {

    let result: Uint8Array
    if (value < 0xfd) {
        result = new Uint8Array([value])
    } else if (value <= 0xffff) {
        var number = numberToHexLE(value, 16)
        result = mergeUint8Arrays(new Uint8Array([0xfd]), number)
    } else if (value <= 0xffffffff) {
        let number = numberToHexLE(value, 32) 
        result = mergeUint8Arrays(new Uint8Array([0xfe]), number)
    } else { 
        let number = numberToHexLE(value, 64) as Uint8Array
        result = mergeUint8Arrays(new Uint8Array([0xff]), number)
    }
    
    return result
}

export function getBytesCount(hex: string) : number 
{
    if(hex.length % 2 != 0)
        throw new Error("invalid hexadecimal string value")
    return hex.length / 2;
}
