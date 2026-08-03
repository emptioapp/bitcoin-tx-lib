import { BNetwork, TypeAddress } from "../types"
import { Bech32 } from "../base/bech32"
import { bytesToHex, checksum, getBytesCount, hexToBytes, numberToHex, ripemd160 } from "."
import { base58 } from "@scure/base"
import { addressToScriptPubKey } from "./txutils"
import { ByteBuffer } from "./buffer"

interface PubkeyProps {
    pubkey: string,
    type?: TypeAddress,
    network?: BNetwork
}

interface HashProps {
    ripemd160: string,
    type?: TypeAddress,
    network?: BNetwork
}

export class Address {

    private static addressPrefix = { "mainnet": 0x00, "testnet": 0x6f }
   
    public static fromPubkey({ pubkey, type="p2wpkh", network="mainnet" } : PubkeyProps) : string {
        
        if(getBytesCount(pubkey) != 33) 
            throw new Error("invalid pubkey, expected a compressed format 33 bytes")

        if (type === "p2wpkh") {
            let bech32 = new Bech32({ publicKey: pubkey, network })

            return bech32.getAddress()
        } else {
            // byte prefix 0x00 and 0x6f (doc: https://en.bitcoin.it/wiki/List_of_address_prefixes)
            let builder = new ByteBuffer(numberToHex(this.addressPrefix[network], 8))
            
            builder.append(ripemd160(hexToBytes(pubkey), true))
            
            let checkHash = checksum(builder.raw())

            builder.append(checkHash)

            return base58.encode(builder.raw())
        }
    }

    public static fromHash({ ripemd160, type="p2wpkh", network="mainnet" } : HashProps) : string {

        if(getBytesCount(ripemd160) != 0x14)
            throw new Error("Invalid hash ripemd160")

        if (type === "p2wpkh") {
            let bech32 = new Bech32({ network })

            let complete = bech32.convert(ripemd160)

            return bech32.encode(complete)
        } else {
            // byte prefix 0x00 and 0x6f (doc: https://en.bitcoin.it/wiki/List_of_address_prefixes)
            let builder = new ByteBuffer(numberToHex(this.addressPrefix[network], 8))

            builder.append(hexToBytes(ripemd160))
            // the last param to sha256 -> true -> sha256(sha256(script)).substring(0, 8) - is a checksum(first 4 bytes)
            let checkHash = checksum(builder.raw())

            builder.append(checkHash)

            return base58.encode(builder.raw())
        } 
    }

    static getScriptPubkey(address: string) : string {
        return bytesToHex(addressToScriptPubKey(address))
    }

    static getRipemd160(address: string): string {
        let script = addressToScriptPubKey(address)

        if(script[1] == 0x14 || script[1] == 0x20) 
            return bytesToHex(script.slice(2))
        if(script[0] == 0x76) 
            return bytesToHex(script.slice(3, -2))

        throw new Error("address not supported")
    } 

    static isValid(address: string, network?: BNetwork) : boolean {
        try {
            addressToScriptPubKey(address, network)
            return true
        } catch { return false }
    }
}
