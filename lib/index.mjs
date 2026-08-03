// src/constants/opcodes.ts
var OP_CODES = {
  OP_0: 0,
  OP_DUP: 118,
  OP_EQUAL: 135,
  OP_HASH160: 169,
  OP_EQUALVERIFY: 136,
  OP_CHECKSIG: 172,
  SIGHASH_ALL: 1,
  OP_PUSHBYTES_20: 20,
  OP_PUSHBYTES_32: 32
};

// src/utils/index.ts
import { ripemd160 as ripemd160Noble } from "@noble/hashes/legacy.js";
import { sha256 as sha256Noble } from "@noble/hashes/sha2.js";
function bytesToHex(bytes) {
  if (bytes.length <= 0)
    throw new Error("The byte array is empty!");
  let hexValue = "";
  bytes.forEach((byte) => {
    let hexNumber = byte.toString(16);
    if (hexNumber.length == 1)
      hexNumber = "0" + hexNumber;
    hexValue += hexNumber;
  });
  return hexValue;
}
function hexToBytes(hex, hexadecimal = true) {
  if (hex.length <= 0)
    throw new Error("hex value is empty");
  if (hexadecimal) {
    if (hex.length % 2 !== 0)
      throw new Error("Invalid hex value!");
    if (!/^[0-9a-fA-F]+$/.test(hex))
      throw new Error("Invalid hex value, contains non-hexadecimal characters");
  }
  let bytes = new Uint8Array(hexadecimal ? hex.length / 2 : hex.length);
  for (let i = 0; i < hex.length; i += hexadecimal ? 2 : 1) {
    if (hexadecimal)
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    else
      bytes[i] = hex.charCodeAt(i);
  }
  return bytes;
}
function sha256(message, hash2562 = false) {
  let hash = sha256Noble(message);
  if (hash2562)
    hash = sha256Noble(hash);
  return hash;
}
function hash256(message) {
  const hash = sha256Noble(sha256Noble(message));
  return hash;
}
function ripemd160(message, address = false) {
  let hash = address ? sha256(message) : message;
  hash = ripemd160Noble(hash);
  return hash;
}
function checksum(message, bytes = 4) {
  let hash = sha256Noble(message);
  hash = sha256Noble(hash).slice(0, bytes);
  return hash;
}
function numberToHex(number = 0, bits = 64) {
  let hexValue = number.toString(16);
  if (hexValue.length == 1)
    hexValue = "0" + hexValue;
  for (let i = hexValue.length; i < bits / 4; i++) {
    hexValue = "0" + hexValue;
  }
  return hexToBytes(hexValue);
}
function numberToHexLE(number = 0, bits = 64) {
  return numberToHex(number, bits).reverse();
}
function hash160ToScript(hash160) {
  let data = hash160;
  if (typeof hash160 !== "object")
    data = hexToBytes(hash160);
  let hash160Length = data.length;
  let hexScript = mergeUint8Arrays(
    new Uint8Array([
      OP_CODES.OP_DUP,
      OP_CODES.OP_HASH160,
      hash160Length
    ]),
    data,
    new Uint8Array([
      OP_CODES.OP_EQUALVERIFY,
      OP_CODES.OP_CHECKSIG
    ])
  );
  if (typeof hash160 == "string")
    return bytesToHex(hexScript);
  return hexScript;
}
function mergeUint8Arrays(...arrays) {
  let length = arrays.reduce((sum, e) => sum + e.length, 0);
  let mergeArray = new Uint8Array(length);
  arrays.forEach((array, index, arrays2) => {
    let offset = arrays2.slice(0, index).reduce((acc, e) => acc + e.length, 0);
    mergeArray.set(array, offset);
  });
  return mergeArray;
}
function isEqual(...arrays) {
  let result = true;
  arrays.forEach((arr, index, arrays2) => {
    if (index < arrays2.length - 1) {
      if (arr.toString() !== arrays2[arrays2.length - 1].toString())
        result = false;
    }
  });
  return result;
}
function numberToVarint(value) {
  let result;
  if (value < 253) {
    result = new Uint8Array([value]);
  } else if (value <= 65535) {
    var number = numberToHexLE(value, 16);
    result = mergeUint8Arrays(new Uint8Array([253]), number);
  } else if (value <= 4294967295) {
    let number2 = numberToHexLE(value, 32);
    result = mergeUint8Arrays(new Uint8Array([254]), number2);
  } else {
    let number2 = numberToHexLE(value, 64);
    result = mergeUint8Arrays(new Uint8Array([255]), number2);
  }
  return result;
}
function getBytesCount(hex) {
  if (hex.length % 2 != 0)
    throw new Error("invalid hexadecimal string value");
  return hex.length / 2;
}

// src/ecpairkey.ts
import { secp256k1 } from "@noble/curves/secp256k1.js";

// src/base/bech32.ts
var Bech32 = class {
  constructor(options = {}) {
    this.version = 0;
    this.network = "mainnet";
    this.encoding = "bech32";
    this.encodings = { BECH32: "bech32", BECH32M: "bech32m" };
    this.chars = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    this.generator = [996825010, 642813549, 513874426, 1027748829, 705979059];
    if (options?.network)
      this.network = options.network;
    if (options?.version) {
      this.version = options.version;
      this.encoding = options.version > 0 ? "bech32m" : "bech32";
    }
    this.publicKey = options.publicKey ?? "";
  }
  // convert a ripemd160 hexadecimal in a bech32 hexadecimal 32 bytes
  convert(ripemd1602) {
    let binary = "";
    let hexadecimal = typeof ripemd1602 == "string" ? hexToBytes(ripemd1602) : ripemd1602;
    hexadecimal.forEach((num) => {
      let bits = num.toString(2);
      while (bits.length < 8)
        bits = "0" + bits;
      binary += bits;
    });
    let int5Array = [this.version];
    for (let i = 0; i < binary.length; i += 5)
      int5Array.push(parseInt(binary.slice(i, i + 5), 2));
    return int5Array;
  }
  getAddress() {
    let sha2 = sha256(hexToBytes(this.publicKey));
    let ripemd = ripemd160(sha2);
    let hex = this.convert(ripemd);
    return this.encode(hex);
  }
  getEncodingConst(enc) {
    if (enc == this.encodings.BECH32) {
      return 1;
    } else if (enc == this.encodings.BECH32M) {
      return 734539939;
    }
    return 1;
  }
  polymod(values) {
    var chk = 1;
    for (var p = 0; p < values.length; ++p) {
      var top = chk >> 25;
      chk = (chk & 33554431) << 5 ^ values[p];
      for (var i = 0; i < 5; ++i) {
        if (top >> i & 1) {
          chk ^= this.generator[i];
        }
      }
    }
    return chk;
  }
  hrpExpand(hrp) {
    var p;
    var ret = [];
    for (p = 0; p < hrp.length; ++p) {
      ret.push(hrp.charCodeAt(p) >> 5);
    }
    ret.push(0);
    for (p = 0; p < hrp.length; ++p) {
      ret.push(hrp.charCodeAt(p) & 31);
    }
    return ret;
  }
  verifyChecksum(data) {
    let hrp = this.network === "mainnet" ? "bc" : "tb";
    return this.polymod(this.hrpExpand(hrp).concat(data)) === this.getEncodingConst(this.encoding);
  }
  createChecksum(data) {
    let hrp = this.network === "mainnet" ? "bc" : "tb";
    var values = this.hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
    var mod = this.polymod(values) ^ this.getEncodingConst(this.encoding);
    var ret = [];
    for (var p = 0; p < 6; ++p) {
      ret.push(mod >> 5 * (5 - p) & 31);
    }
    return ret;
  }
  encode(data) {
    let hrp = this.network === "mainnet" ? "bc" : "tb";
    let combined = data.concat(this.createChecksum(data));
    var ret = hrp + "1";
    for (let p = 0; p < combined.length; ++p) {
      ret += this.chars.charAt(combined[p]);
    }
    return ret;
  }
  decode(bechString) {
    var p;
    var has_lower = false;
    var has_upper = false;
    for (p = 0; p < bechString.length; ++p) {
      if (bechString.charCodeAt(p) < 33 || bechString.charCodeAt(p) > 126) {
        return null;
      }
      if (bechString.charCodeAt(p) >= 97 && bechString.charCodeAt(p) <= 122) {
        has_lower = true;
      }
      if (bechString.charCodeAt(p) >= 65 && bechString.charCodeAt(p) <= 90) {
        has_upper = true;
      }
    }
    if (has_lower && has_upper) {
      return null;
    }
    bechString = bechString.toLowerCase();
    var pos = bechString.lastIndexOf("1");
    if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
      return null;
    }
    var data = [];
    for (p = pos + 1; p < bechString.length; ++p) {
      var d = this.chars.indexOf(bechString.charAt(p));
      if (d === -1) {
        return null;
      }
      data.push(d);
    }
    if (!this.verifyChecksum(data)) {
      return null;
    }
    var program = data.slice(0, data.length - 6);
    var hash = new Uint8Array(program.length);
    program.forEach((num, index) => hash[index] = num);
    return hash;
  }
  getScriptPubkey(bech32Address) {
    let bytesint5 = this.decode(bech32Address);
    let int8string = "";
    bytesint5?.forEach((num, index) => {
      if (index > 0) {
        let binary = num.toString(2);
        while (binary.length < 5)
          binary = "0" + binary;
        int8string += binary;
      }
    });
    let int8array = new Uint8Array(int8string.length / 8);
    for (let i = 0; i < int8string.length; i += 8)
      int8array[i == 0 ? 0 : i / 8] = parseInt(int8string.slice(i, i + 8), 2);
    return bytesToHex(int8array);
  }
};

// src/utils/address.ts
import { base58 as base582 } from "@scure/base";

// src/utils/txutils.ts
import { bech32 } from "bech32";
import { base58 } from "@scure/base";
function addressToScriptPubKey(address, network) {
  if (["1", "m", "n"].includes(address[0])) {
    const decoded = base58.decode(address);
    if (decoded.length !== 25)
      throw new Error("Invalid base58 address length");
    const payload = decoded.slice(0, -4);
    const providedChecksum = decoded.slice(-4);
    const validChecksum = checksum(payload);
    if (!providedChecksum.every((byte, index) => byte === validChecksum[index]))
      throw new Error("Invalid base58 address checksum");
    if (network) {
      const expectedPrefix = network === "mainnet" ? 0 : 111;
      if (decoded[0] !== expectedPrefix)
        throw new Error(`Address network mismatch, expected a ${network} address`);
    }
    const hash = decoded.slice(1, -4);
    const prefixScript = new Uint8Array([OP_CODES.OP_DUP, OP_CODES.OP_HASH160, hash.length]);
    const sufixScript = new Uint8Array([OP_CODES.OP_EQUALVERIFY, OP_CODES.OP_CHECKSIG]);
    return mergeUint8Arrays(prefixScript, hash, sufixScript);
  } else if (["tb1", "bc1"].includes(address.substring(0, 3))) {
    const data = bech32.decode(address);
    if (network) {
      const expectedHrp = network === "mainnet" ? "bc" : "tb";
      if (data.prefix !== expectedHrp)
        throw new Error(`Address network mismatch, expected a ${network} address`);
    }
    const [version, ...programWords] = data.words;
    if (version !== 0)
      throw new Error("Unsupported witness version, only version 0 (P2WPKH/P2WSH) is supported");
    const hash = new Uint8Array(bech32.fromWords(programWords));
    if (hash.length !== 20 && hash.length !== 32)
      throw new Error("Invalid witness program length, expected 20 (P2WPKH) or 32 (P2WSH) bytes");
    const prefixScript = new Uint8Array([OP_CODES.OP_0, hash.length]);
    return mergeUint8Arrays(prefixScript, hash);
  }
  throw new Error("not supported format address or type of transaction");
}
function scriptPubkeyToScriptCode(script) {
  const scriptPubkey = hexToBytes(script);
  if (scriptPubkey[0] == 0 && scriptPubkey[1] == 20) {
    const hash = scriptPubkey.slice(2);
    const prefixScript = new Uint8Array([OP_CODES.OP_DUP, OP_CODES.OP_HASH160, hash.length]);
    const sufixScript = new Uint8Array([OP_CODES.OP_EQUALVERIFY, OP_CODES.OP_CHECKSIG]);
    const scriptCode = mergeUint8Arrays(prefixScript, hash, sufixScript);
    return new Uint8Array([scriptCode.length, ...scriptCode]);
  }
  if (scriptPubkey[0] == 0 && scriptPubkey[1] == 32) {
    return new Uint8Array([scriptPubkey.length, ...scriptPubkey]);
  }
  throw new Error("scriptPubkey no segwit, expected P2WPKH");
}

// src/utils/buffer.ts
var ByteBuffer = class {
  /**
   * Creates a new ByteBuffer instance, optionally with initial bytes.
   * @param bytes Optional initial Uint8Array to add.
   */
  constructor(bytes) {
    this.chunks = bytes ? [bytes] : [];
    this.length = bytes?.length ?? 0;
  }
  /**
   * Appends a new Uint8Array to the internal buffer.
   * @param bytes The Uint8Array to append.
   */
  append(bytes) {
    if (!bytes.length) return;
    this.length += bytes.length;
    this.chunks.push(bytes);
  }
  /**
   * Prepends a new Uint8Array to the beginning of the buffer.
   * @param bytes The Uint8Array to prepend.
   */
  prepend(bytes) {
    if (!bytes.length) return;
    this.length += bytes.length;
    this.chunks.unshift(bytes);
  }
  /**
   * Returns the final concatenated Uint8Array containing all appended data.
   * @returns The full buffer as a Uint8Array.
   */
  raw() {
    const bytes = new Uint8Array(this.length);
    let offset = 0;
    for (const chunk of this.chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
  }
  /**
   * Merges an array of Uint8Array chunks into a single Uint8Array.
   * @param arrays The array of Uint8Array chunks to merge.
   * @returns A new Uint8Array containing all concatenated bytes.
   */
  static merge(arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }
  clear() {
    this.length = 0;
    this.chunks = [];
  }
};

// src/utils/address.ts
var Address = class {
  static fromPubkey({ pubkey, type = "p2wpkh", network = "mainnet" }) {
    if (getBytesCount(pubkey) != 33)
      throw new Error("invalid pubkey, expected a compressed format 33 bytes");
    if (type === "p2wpkh") {
      let bech322 = new Bech32({ publicKey: pubkey, network });
      return bech322.getAddress();
    } else {
      let builder = new ByteBuffer(numberToHex(this.addressPrefix[network], 8));
      builder.append(ripemd160(hexToBytes(pubkey), true));
      let checkHash = checksum(builder.raw());
      builder.append(checkHash);
      return base582.encode(builder.raw());
    }
  }
  static fromHash({ ripemd160: ripemd1602, type = "p2wpkh", network = "mainnet" }) {
    if (getBytesCount(ripemd1602) != 20)
      throw new Error("Invalid hash ripemd160");
    if (type === "p2wpkh") {
      let bech322 = new Bech32({ network });
      let complete = bech322.convert(ripemd1602);
      return bech322.encode(complete);
    } else {
      let builder = new ByteBuffer(numberToHex(this.addressPrefix[network], 8));
      builder.append(hexToBytes(ripemd1602));
      let checkHash = checksum(builder.raw());
      builder.append(checkHash);
      return base582.encode(builder.raw());
    }
  }
  static getScriptPubkey(address) {
    return bytesToHex(addressToScriptPubKey(address));
  }
  static getRipemd160(address) {
    let script = addressToScriptPubKey(address);
    if (script[1] == 20 || script[1] == 32)
      return bytesToHex(script.slice(2));
    if (script[0] == 118)
      return bytesToHex(script.slice(3, -2));
    throw new Error("address not supported");
  }
  static isValid(address, network) {
    try {
      addressToScriptPubKey(address, network);
      return true;
    } catch {
      return false;
    }
  }
};
Address.addressPrefix = { "mainnet": 0, "testnet": 111 };

// src/ecpairkey.ts
import { base58 as base583 } from "@scure/base";
var _ECPairKey = class _ECPairKey {
  constructor(options) {
    this.network = options?.network ?? "mainnet";
    this.type = options?.type ?? "p2wpkh";
    this.privateKey = options?.privateKey ?? secp256k1.utils.randomSecretKey();
  }
  /**
  * Returns the compressed public key derived from the private key.
  */
  getPublicKey() {
    return secp256k1.getPublicKey(this.privateKey, true);
  }
  getPrivateKey() {
    return this.privateKey;
  }
  /**
  * Signs a message hash and returns the DER-encoded signature.
  * @param message Hash of the message to sign.
  */
  signDER(message) {
    return secp256k1.sign(message, this.privateKey, {
      lowS: true,
      format: "der",
      prehash: false
    });
  }
  /**
  * Verifies a DER-encoded signature against a message hash.
  * @param message Message hash that was signed.
  * @param signature Signature in DER format.
  */
  verifySignature(message, signature) {
    return secp256k1.verify(signature, message, this.getPublicKey(), { format: "der", prehash: false });
  }
  /**
  * Returns the WIF (Wallet Import Format) of the private key.
  * The 0x01 suffix indicates the key produces a compressed public key,
  * which is required for compatibility with standard Bitcoin wallets.
  */
  getWif() {
    const prefix = _ECPairKey.wifPrefixes[this.network];
    const payload = new Uint8Array([prefix, ...this.privateKey, 1]);
    const check = checksum(payload);
    const privateWif = new Uint8Array([...payload, ...check]);
    return base583.encode(privateWif);
  }
  /**
  * Returns the address associated with the compressed public key.
  * @param type Type of address to generate (p2pkh, p2wpkh, etc).
  */
  getAddress(type = this.type) {
    let pubkey = bytesToHex(this.getPublicKey());
    return Address.fromPubkey({ pubkey, type, network: this.network });
  }
  /**
  * Creates a key pair from a WIF string.
  * @param wif Wallet Import Format string.
  * @param options Optional network override.
  */
  static fromWif(wif) {
    const decoded = base583.decode(wif);
    if (!this.verifyWif(decoded))
      throw new Error("Wif type is invalid or not supported, only private key wif are suported");
    const keyBytes = decoded.slice(1, 33);
    const network = decoded[0] === this.wifPrefixes.mainnet ? "mainnet" : "testnet";
    return new _ECPairKey({ privateKey: keyBytes, network });
  }
  /**
  * Creates a key pair from a raw private key.
  */
  static fromHex(privateKey, network = "mainnet") {
    return new _ECPairKey({ privateKey: hexToBytes(privateKey), network });
  }
  /**
  * Verifies if a WIF string (decoded) has valid prefix and checksum.
  * @param bytes WIF decoded into bytes.
  */
  static verifyWif(decoded) {
    const prefix = decoded[0];
    const isValidPrefix = Object.values(this.wifPrefixes).includes(prefix);
    if (!isValidPrefix) return false;
    const payload = decoded.slice(0, -4);
    const providedChecksum = decoded.slice(-4);
    const validChecksum = checksum(payload);
    return providedChecksum.every((b, i) => b === validChecksum[i]);
  }
  getPrivateKeyHex() {
    return bytesToHex(this.privateKey);
  }
  getPublicKeyHex() {
    return bytesToHex(this.getPublicKey());
  }
};
// the byte 0x80 is prefix for mainnet and 0xef is prefix for testnet
_ECPairKey.wifPrefixes = { mainnet: 128, testnet: 239 };
var ECPairKey = _ECPairKey;

// src/base/txbuilder.ts
var _TransactionBuilder = class _TransactionBuilder {
  /**
   * Determines if any input is a SegWit (P2WPKH or P2WSH) input.
   * @param inputs List of transaction inputs.
   * @returns True if at least one input is SegWit.
   */
  isSegwit(inputs) {
    return inputs.some(this.isSegwitInput);
  }
  /**
   * Checks if a specific input is a SegWit input (P2WPKH or P2WSH).
   * @param input The input to check.
   * @returns True if input is SegWit.
   */
  isSegwitInput(input) {
    const bytes = hexToBytes(input.scriptPubKey);
    return bytes.length === 22 && bytes[0] == 0 && bytes[1] == 20;
  }
  /**
   * Builds and signs the entire transaction.
   * @param params Signing parameters including inputs, outputs, key, version and locktime.
   * @param format Whether to generate a "raw" or "txid" version.
   * @returns Raw transaction bytes.
   */
  buildAndSign(params, format = "raw") {
    this.validateTransaction(params.inputs, params.outputs);
    let witnessData = new ByteBuffer();
    let hexTransaction = new ByteBuffer(numberToHexLE(params.version, 32));
    if (this.isSegwit(params.inputs) && format != "txid")
      hexTransaction.append(new Uint8Array([0, 1]));
    hexTransaction.append(numberToVarint(params.inputs.length));
    params.inputs.forEach((input) => {
      hexTransaction.append(hexToBytes(input.txid).reverse());
      hexTransaction.append(numberToHexLE(input.vout, 32));
      if (this.isSegwitInput(input)) {
        witnessData.append(this.generateWitness(input, params));
        hexTransaction.append(new Uint8Array([0]));
      } else {
        witnessData.append(new Uint8Array([0]));
        let scriptSig = this.generateScriptSig(input, params);
        hexTransaction.append(numberToVarint(scriptSig.length));
        hexTransaction.append(scriptSig);
      }
      hexTransaction.append(hexToBytes(input.sequence ?? "fffffffd").reverse());
    });
    hexTransaction.append(numberToVarint(params.outputs.length));
    hexTransaction.append(this.outputsRaw(params.outputs));
    if (this.isSegwit(params.inputs) && format != "txid") hexTransaction.append(witnessData.raw());
    hexTransaction.append(numberToHexLE(params.locktime, 32));
    return hexTransaction.raw();
  }
  /**
   * Generates the `scriptSig` for a legacy (non-SegWit) P2PKH input.
   * @param input The input to sign.
   * @param params All transaction signing context.
   * @returns The generated `scriptSig` as a byte array.
   */
  generateScriptSig(input, {
    inputs,
    outputs,
    pairkey,
    locktime,
    version
  }) {
    let hexTransaction = new ByteBuffer(numberToHexLE(version, 32));
    hexTransaction.append(numberToVarint(inputs.length));
    inputs.forEach((txin) => {
      hexTransaction.append(hexToBytes(txin.txid).reverse());
      hexTransaction.append(numberToHexLE(txin.vout, 32));
      if (txin.txid === input.txid && txin.vout === input.vout) {
        let script = hexToBytes(txin.scriptPubKey);
        hexTransaction.append(numberToVarint(script.length));
        hexTransaction.append(script);
      } else
        hexTransaction.append(new Uint8Array([0]));
      hexTransaction.append(hexToBytes(txin.sequence ?? "fffffffd").reverse());
    });
    hexTransaction.append(numberToVarint(outputs.length));
    hexTransaction.append(this.outputsRaw(outputs));
    hexTransaction.append(numberToHexLE(locktime, 32));
    hexTransaction.append(numberToHexLE(OP_CODES.SIGHASH_ALL, 32));
    let sigHash = hash256(hexTransaction.raw());
    let scriptSig = new ByteBuffer(pairkey.signDER(sigHash));
    scriptSig.append(numberToHexLE(OP_CODES.SIGHASH_ALL, 8));
    scriptSig.prepend(numberToHex(scriptSig.length, 8));
    let publicKey = pairkey.getPublicKey();
    scriptSig.append(numberToHex(publicKey.length, 8));
    scriptSig.append(publicKey);
    return scriptSig.raw();
  }
  /**
   * Generates the witness data for a SegWit input (P2WPKH).
   * @param input The input to sign.
   * @param params All transaction signing context.
   * @returns The witness field as a byte array.
   */
  generateWitness(input, {
    inputs,
    outputs,
    pairkey,
    locktime,
    version
  }) {
    let hexTransaction = new ByteBuffer(numberToHexLE(version, 32));
    let prevouts = inputs.map((input2) => {
      let build = new ByteBuffer(hexToBytes(input2.txid).reverse());
      build.append(numberToHexLE(input2.vout, 32));
      return build.raw();
    });
    let hashPrevouts = hash256(ByteBuffer.merge(prevouts));
    hexTransaction.append(hashPrevouts);
    let sequence = inputs.map((input2) => hexToBytes(input2.sequence ?? "fffffffd").reverse());
    let hashSequence = hash256(ByteBuffer.merge(sequence));
    hexTransaction.append(hashSequence);
    hexTransaction.append(hexToBytes(input.txid).reverse());
    hexTransaction.append(numberToHexLE(input.vout, 32));
    let scriptCode = scriptPubkeyToScriptCode(input.scriptPubKey);
    hexTransaction.append(scriptCode);
    hexTransaction.append(numberToHexLE(input.value, 64));
    hexTransaction.append(hexToBytes(input.sequence ?? "fffffffd").reverse());
    let hashOutputs = hash256(this.outputsRaw(outputs));
    hexTransaction.append(hashOutputs);
    hexTransaction.append(numberToHexLE(locktime, 32));
    hexTransaction.append(numberToHexLE(OP_CODES.SIGHASH_ALL, 32));
    let sigHash = hash256(hexTransaction.raw());
    let scriptSig = new ByteBuffer(pairkey.signDER(sigHash));
    scriptSig.append(numberToHex(OP_CODES.SIGHASH_ALL, 8));
    scriptSig.prepend(numberToVarint(scriptSig.length));
    let publicKey = pairkey.getPublicKey();
    scriptSig.append(numberToVarint(publicKey.length));
    scriptSig.append(publicKey);
    scriptSig.prepend(numberToHex(2, 8));
    return scriptSig.raw();
  }
  /**
   * Serializes transaction outputs into their raw binary format.
   * @param outputs List of transaction outputs.
   * @returns Byte array of all outputs serialized.
   */
  outputsRaw(outputs) {
    this.validateOutputsValue(outputs);
    const rows = outputs.map((output) => {
      let txoutput = new ByteBuffer(numberToHexLE(output.amount, 64));
      let scriptPubKey = addressToScriptPubKey(output.address);
      txoutput.append(numberToVarint(scriptPubKey.length));
      txoutput.append(scriptPubKey);
      return txoutput.raw();
    }).flat();
    return ByteBuffer.merge(rows);
  }
  /**
   * Validates a transaction input.
   * Throws if txid is invalid, scriptPubKey is missing, or the txid is duplicated.
   * @param input The input to validate.
   * @param inputs The current list of inputs.
   */
  validateInput(input, inputs) {
    if (!this.isHex(input.txid))
      throw new Error("txid is in invalid format, expected a hexadecimal string");
    if (input.txid.length % 2 != 0)
      throw new Error("txid is in invalid format, expected a hexadecimal string");
    else if (getBytesCount(input.txid) != 32)
      throw new Error("Expected a valid txid with 32 bytes");
    else if (input.scriptPubKey && !this.isHex(input.scriptPubKey))
      throw new Error("scriptPubKey is in invalid format, expected a hexadecimal string");
    else if (input.scriptPubKey && input.scriptPubKey.length % 2 != 0)
      throw new Error("scriptPubKey is in invalid format, expected a hexadecimal string");
    else if (input.scriptPubKey && this.isUnsupportedWitnessScript(input.scriptPubKey))
      throw new Error("P2WSH inputs are not supported");
    else if (!Number.isSafeInteger(input.vout) || input.vout < 0)
      throw new Error("Expected a valid vout");
    else if (!Number.isSafeInteger(input.value) || input.value <= 0 || input.value > _TransactionBuilder.MAX_MONEY)
      throw new Error("Expected a valid input value");
    else if (input.sequence && (!this.isHex(input.sequence) || getBytesCount(input.sequence) !== 4))
      throw new Error("Expected a valid sequence with 4 bytes");
    if (inputs.some((i) => i.txid === input.txid && i.vout === input.vout))
      throw new Error("An input with this utxo (txid:vout) has already been added");
  }
  /**
   * Validates a transaction output.
   * Throws if amount is non-positive, address is invalid, or address is duplicated.
   * @param output The output to validate.
   * @param outputs The current list of outputs.
   */
  validateOutput(output, outputs, network) {
    if (!Number.isSafeInteger(output.amount) || output.amount <= 0 || output.amount > _TransactionBuilder.MAX_MONEY)
      throw new Error("Expected a valid amount");
    if (!Address.isValid(output.address, network))
      throw new Error("Expected a valid address to output");
    if (outputs.some((o) => o.address == output.address))
      throw new Error("An output with this address has already been added");
  }
  validateTransaction(inputs, outputs) {
    if (inputs.length === 0)
      throw new Error("Transaction must have at least one input");
    if (outputs.length === 0)
      throw new Error("Transaction must have at least one output");
    inputs.forEach((input, index) => this.validateInput(input, inputs.slice(0, index)));
    this.validateOutputsValue(outputs);
    const inputTotal = this.sumInputs(inputs);
    const outputTotal = this.sumOutputs(outputs);
    if (outputTotal > inputTotal)
      throw new Error("Transaction outputs exceed inputs");
  }
  sumInputs(inputs) {
    return inputs.reduce((sum, input) => sum + input.value, 0);
  }
  sumOutputs(outputs) {
    return outputs.reduce((sum, output) => sum + output.amount, 0);
  }
  validateOutputsValue(outputs) {
    outputs.forEach((output) => {
      if (!Number.isSafeInteger(output.amount) || output.amount <= 0 || output.amount > _TransactionBuilder.MAX_MONEY)
        throw new Error("Expected a valid amount");
    });
    const outputTotal = this.sumOutputs(outputs);
    if (!Number.isSafeInteger(outputTotal) || outputTotal > _TransactionBuilder.MAX_MONEY)
      throw new Error("Expected a valid total output amount");
  }
  validateFeeRate(feeRate) {
    if (!Number.isFinite(feeRate) || feeRate <= 0)
      throw new Error("Expected a valid fee rate");
  }
  onTransactionMutated() {
  }
  isHex(value) {
    return /^[0-9a-fA-F]+$/.test(value);
  }
  isUnsupportedWitnessScript(scriptPubKey) {
    const bytes = hexToBytes(scriptPubKey);
    return bytes.length === 34 && bytes[0] === 0 && bytes[1] === 32;
  }
};
_TransactionBuilder.MAX_MONEY = 21e6 * 1e8;
var TransactionBuilder = _TransactionBuilder;

// src/base/txbase.ts
var BaseTransaction = class extends TransactionBuilder {
  /**
   * Constructs a new transaction instance with optional options.
   * @param pairKey The key pair to use for signing inputs.
   * @param options Optional transaction parameters (version, locktime, fee, etc.).
   */
  constructor(pairKey, options) {
    super();
    /** Transaction version (default is 2) */
    this.version = 2;
    /** Transaction locktime (default is 0) */
    this.locktime = 0;
    /** List of inputs included in the transaction */
    this.inputs = [];
    /** List of outputs included in the transaction */
    this.outputs = [];
    this.pairKey = pairKey;
    this.version = options?.version ?? 2;
    this.locktime = options?.locktime ?? 0;
    this.whoPayTheFee = options?.whoPayTheFee;
    this.fee = options?.fee;
    if (this.fee !== void 0)
      this.validateFeeRate(this.fee);
    this.cachedata = /* @__PURE__ */ new Map();
  }
  /**
   * Adds a transaction input to the list.
   * Validates for duplicate txid and required fields.
   * @param input The transaction input to add.
   */
  addInput(input) {
    this.validateInput(input, this.inputs);
    if (!input.scriptPubKey)
      input.scriptPubKey = bytesToHex(addressToScriptPubKey(this.pairKey.getAddress()));
    if (!input.sequence) input.sequence = "fffffffd";
    this.inputs.push(input);
    this.cachedata.clear();
    this.onTransactionMutated();
  }
  /**
   * Adds a transaction output to the list.
   * Validates for duplicate address and required fields.
   * @param output The transaction output to add.
   */
  addOutput(output) {
    this.validateOutput(output, this.outputs, this.pairKey.network);
    this.outputs.push(output);
    this.cachedata.clear();
    this.onTransactionMutated();
  }
  /**
   * Indicates if the transaction contains any SegWit input.
   * @returns True if any input is SegWit.
   */
  isSegwit() {
    return super.isSegwit(this.inputs);
  }
  /**
   * Builds and signs the transaction.
   * @param format Output format, either "raw" or "txid".
   * @returns Raw transaction bytes.
   */
  build(format = "raw") {
    return super.buildAndSign(this.buildSigParams(), format);
  }
  /**
   * Builds the witness field for a given input.
   * Only applicable to SegWit inputs.
   * @param input The input for which to build witness data.
   * @returns Byte array representing witness structure.
   */
  buildWitness(input) {
    return super.generateWitness(input, this.buildSigParams());
  }
  /**
   * Builds the legacy `scriptSig` for a given input.
   * Only applicable to non-SegWit inputs.
   * @param input The input for which to build the scriptSig.
   * @returns Byte array representing the scriptSig.
   */
  buildScriptSig(input) {
    return super.generateScriptSig(input, this.buildSigParams());
  }
  /**
   * Clears all inputs, outputs, and cache data.
   */
  clear() {
    this.inputs = [];
    this.outputs = [];
    this.cachedata.clear();
  }
  /**
   * Generates the signing parameters object used throughout transaction signing.
   * @returns A complete SigParams object.
   */
  buildSigParams() {
    return {
      version: this.version,
      locktime: this.locktime,
      inputs: this.inputs,
      outputs: this.outputs,
      pairkey: this.pairKey
    };
  }
};

// src/transaction.ts
var Transaction = class extends BaseTransaction {
  /**
   * Creates a new Transaction instance.
   * @param pairkey The key pair used to sign the transaction inputs.
   * @param options Optional transaction parameters (version, locktime, fee, etc.).
   */
  constructor(pairkey, options) {
    super(pairkey, options);
    this.feeResolved = false;
  }
  /**
   * Signs the transaction.
   * Caches the raw transaction data and the version used for txid calculation.
   */
  sign() {
    this.cachedata.set("txraw", this.build());
    this.cachedata.set("txidraw", this.build("txid"));
  }
  /**
   * Returns the transaction ID (txid) as a hex string.
   * The txid is the double SHA-256 hash of the stripped raw transaction (no witness data), reversed in byte order.
   * 
   * @throws Error if the transaction is not signed.
   * @returns The txid as a hex string.
   */
  getTxid() {
    if (!this.cachedata.get("txidraw")) this.sign();
    let hexTransaction = this.cachedata.get("txidraw");
    if (!hexTransaction)
      throw new Error("Transaction not signed, please sign the transaction");
    let txid = hash256(hexTransaction).reverse();
    return bytesToHex(txid);
  }
  /**
   * Calculates the total weight of the transaction according to BIP 141.
   * Weight = (non-witness bytes * 4) + witness bytes + marker/flag bytes.
   * Uses cached serialization to avoid re-signing on each call.
   *
   * @throws Error if the transaction is not signed.
   * @returns The transaction weight.
   */
  weight() {
    if (!this.cachedata.get("txraw")) this.sign();
    const txraw = this.cachedata.get("txraw");
    const txidraw = this.cachedata.get("txidraw");
    if (!this.isSegwit()) return txraw.length * 4;
    const witnessMK = 2;
    const witnessSize = txraw.length - txidraw.length - witnessMK;
    return txidraw.length * 4 + witnessSize + witnessMK;
  }
  /**
   * Calculates the virtual size (vBytes) of the transaction.
   * Defined as weight divided by 4.
   * 
   * @throws Error if the transaction is not signed.
   * @returns The transaction virtual size in bytes.
   */
  vBytes() {
    return Math.ceil(this.weight() / 4);
  }
  /**
   * Deducts the transaction fee from the output(s) according to the fee-paying strategy.
   * If only one output exists, deduct the entire fee from it.
   * If `whoPayTheFee` is "everyone", split the fee evenly among all outputs.
   * If `whoPayTheFee` is an address, deduct the fee from the output matching that address.
   * Idempotent: calling more than once has no additional effect.
   *
   * @throws Error if the transaction is not signed.
   */
  resolveFee() {
    if (this.feeResolved) return;
    const previousAmounts = this.outputs.map((output) => output.amount);
    try {
      if (!this.cachedata.get("txraw")) this.sign();
      const feeSats = this.estimateFeeSats();
      if (this.outputs.length == 1) {
        this.deductFeeFromOutput(0, feeSats);
        this.markFeeResolved();
        return;
      }
      if (this.whoPayTheFee === "everyone") {
        this.deductFeeFromEveryone(feeSats);
        this.markFeeResolved();
        return;
      }
      for (let i = 0; i < this.outputs.length; i++) {
        if (this.outputs[i].address === this.whoPayTheFee) {
          this.deductFeeFromOutput(i, feeSats);
          this.markFeeResolved();
          return;
        }
      }
      throw new Error("Fee payer output not found");
    } catch (error) {
      this.outputs.forEach((output, index) => output.amount = previousAmounts[index]);
      this.feeResolved = false;
      this.cachedata.clear();
      throw error;
    }
  }
  /**
   * Calculates the actual fee in satoshis from input total minus output total.
   * 
   * @returns The transaction fee in satoshis.
   */
  getFeeSats() {
    return this.sumInputs(this.inputs) - this.sumOutputs(this.outputs);
  }
  estimateFeeSats() {
    return Math.ceil(this.vBytes() * (this.fee ?? 1));
  }
  /**
   * Returns the raw transaction as a hex string.
   * 
   * @throws Error if the transaction is not signed.
   * @returns The raw transaction hex string.
   */
  getRawHex() {
    if (!this.cachedata.get("txraw")) this.sign();
    return bytesToHex(this.cachedata.get("txraw"));
  }
  /**
   * Returns the raw transaction bytes as a Uint8Array.
   *
   * @throws Error if the transaction is not signed.
   * @returns The raw transaction bytes.
   */
  getRawBytes() {
    if (!this.cachedata.get("txraw")) this.sign();
    return this.cachedata.get("txraw");
  }
  /**
   * Clears all inputs, outputs, cache data and resets the fee state.
   */
  clear() {
    super.clear();
    this.feeResolved = false;
  }
  onTransactionMutated() {
    this.feeResolved = false;
  }
  deductFeeFromOutput(index, feeSats) {
    const previousAmount = this.outputs[index].amount;
    this.outputs[index].amount -= feeSats;
    try {
      this.validateTransaction(this.inputs, this.outputs);
    } catch (error) {
      this.outputs[index].amount = previousAmount;
      throw error;
    }
  }
  deductFeeFromEveryone(feeSats) {
    const previousAmounts = this.outputs.map((output) => output.amount);
    const baseShare = Math.floor(feeSats / this.outputs.length);
    let remainder = feeSats % this.outputs.length;
    this.outputs.forEach((output) => {
      output.amount -= baseShare;
      if (remainder > 0) {
        output.amount -= 1;
        remainder--;
      }
    });
    try {
      this.validateTransaction(this.inputs, this.outputs);
    } catch (error) {
      this.outputs.forEach((output, index) => output.amount = previousAmounts[index]);
      throw error;
    }
  }
  markFeeResolved() {
    this.feeResolved = true;
    this.cachedata.clear();
    this.sign();
    const targetFee = this.estimateFeeSats();
    const actualFee = this.getFeeSats();
    if (actualFee < targetFee) {
      this.deductFeeFromOutput(this.outputs.length === 1 || this.whoPayTheFee !== "everyone" ? this.findFeePayerIndex() : 0, targetFee - actualFee);
      this.cachedata.clear();
      this.sign();
    }
  }
  findFeePayerIndex() {
    if (this.outputs.length === 1) return 0;
    const index = this.outputs.findIndex((output) => output.address === this.whoPayTheFee);
    if (index < 0)
      throw new Error("Fee payer output not found");
    return index;
  }
};

// src/hdkmanager/index.ts
import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
var _HDKManager = class _HDKManager {
  constructor(params) {
    this._rootKey = params.rootKey;
    this.purpose = params.purpose ?? 84;
    this.coinType = params.coinType ?? 0;
    this.account = params.account ?? 0;
    this.change = params.change ?? 0;
    this.network = params.network ?? "mainnet";
  }
  /**
   * Instantiates HDKManager from a raw master seed.
   */
  static fromMasterSeed(masterSeed, options) {
    const versions = this.resolveVersions(options?.purpose, options?.network);
    const rootKey = HDKey.fromMasterSeed(masterSeed, versions);
    return new _HDKManager({ ...options, rootKey });
  }
  /**
   * Instantiates HDKManager from a BIP39 mnemonic phrase.
   */
  static fromMnemonic(mnemonic, passphrase, options) {
    const masterSeed = mnemonicToSeedSync(mnemonic, passphrase);
    const versions = this.resolveVersions(options?.purpose, options?.network);
    const rootKey = HDKey.fromMasterSeed(masterSeed, versions);
    return new _HDKManager({ ...options, rootKey });
  }
  /**
   * Creates an instance from an extended private key.
   * Accepts xprv (BIP44 mainnet), tprv (BIP44 testnet), zprv (BIP84 mainnet), vprv (BIP84 testnet).
   * Purpose and network are inferred from the key prefix; pathParams may override them.
   */
  static fromXPriv(xpriv, pathParams = {}) {
    const info = this.detectExtendedKeyInfo(xpriv);
    const rootKey = HDKey.fromExtendedKey(xpriv, info.versions);
    if (!rootKey.privateKey)
      throw new Error("Provided xpriv is invalid or missing private key");
    return new _HDKManager({ purpose: info.purpose, network: info.network, ...pathParams, rootKey });
  }
  /**
   * Creates an instance from an extended public key (watch-only).
   * Accepts xpub (BIP44 mainnet), tpub (BIP44 testnet), zpub (BIP84 mainnet), vpub (BIP84 testnet).
   * Purpose and network are inferred from the key prefix; pathParams may override them.
   */
  static fromXPub(xpub, pathParams = {}) {
    const info = this.detectExtendedKeyInfo(xpub);
    const rootKey = HDKey.fromExtendedKey(xpub, info.versions);
    if (rootKey.privateKey)
      throw new Error("xpub should not contain a private key");
    return new _HDKManager({ purpose: info.purpose, network: info.network, ...pathParams, rootKey });
  }
  /**
   * Derives a private key from the BIP44/84 path at the given index.
   */
  derivatePrivateKey(index, pathOptions) {
    if (!this.hasPrivateKey())
      throw new Error("Missing private key");
    if (index < 0 || index > 2147483647)
      throw new Error("Invalid derivation index");
    const path = this.getDerivationPath(index, pathOptions);
    const child = this._rootKey.derive(path);
    if (!child.privateKey)
      throw new Error(`Missing private key at path ${path}`);
    return child.privateKey;
  }
  /**
   * Derives a public key from the BIP44/84 path at the given index.
   */
  derivatePublicKey(index, pathOptions) {
    if (index < 0 || index > 2147483647)
      throw new Error("Invalid derivation index");
    const path = this.getDerivationPath(index, pathOptions);
    const child = this._rootKey.derive(path);
    if (!child.publicKey)
      throw new Error(`Missing public key at path ${path}`);
    return child.publicKey;
  }
  /**
   * Derives multiple private keys for indexes 0 to quantity - 1.
   */
  deriveMultiplePrivateKeys(quantity, pathOptions) {
    if (!this.hasPrivateKey())
      throw new Error("Missing private key");
    const result = [];
    for (let i = 0; i < quantity; i++) {
      if (i < 0 || i > 2147483647)
        throw new Error("Invalid derivation index");
      result.push(this.derivatePrivateKey(i, pathOptions));
    }
    return result;
  }
  /**
   * Derives multiple public keys for indexes 0 to quantity - 1.
   */
  deriveMultiplePublicKeys(quantity, pathOptions) {
    const result = [];
    for (let i = 0; i < quantity; i++) {
      if (i < 0 || i > 2147483647)
        throw new Error("Invalid derivation index");
      result.push(this.derivatePublicKey(i, pathOptions));
    }
    return result;
  }
  /**
   * Derives an ECPairKey from a private key at a specific index.
   */
  derivatePairKey(index, options, pathOptions) {
    if (!this.hasPrivateKey())
      throw new Error("Missing private key");
    if (index < 0 || index > 2147483647)
      throw new Error("Invalid derivation index");
    const privateKey = bytesToHex(this.derivatePrivateKey(index, pathOptions));
    const type = this.purpose === 84 ? "p2wpkh" : "p2pkh";
    return new ECPairKey({ privateKey: hexToBytes(privateKey), network: options?.network ?? this.network, type });
  }
  /**
   * Derives multiple ECPairKeys for indexes 0 to quantity - 1.
   */
  derivateMultiplePairKeys(quantity, options, pathOptions) {
    if (!this.hasPrivateKey())
      throw new Error("Missing private key");
    const result = [];
    for (let i = 0; i < quantity; i++) {
      if (i < 0 || i > 2147483647)
        throw new Error("Invalid derivation index");
      result.push(this.derivatePairKey(i, { network: options?.network ?? this.network }, pathOptions));
    }
    return result;
  }
  /**
   * Returns the full BIP44/84 derivation path for a given index.
   */
  getDerivationPath(index, pathOptions) {
    if (index < 0 || index > 2147483647)
      throw new Error("Invalid derivation index");
    if (!this.hasPrivateKey())
      return `m/${pathOptions?.change ?? this.change}/${index}`;
    return `m/${this.purpose}'/${this.coinType}'/${pathOptions?.account ?? this.account}'/${pathOptions?.change ?? this.change}/${index}`;
  }
  /**
   * Checks if the current root key has a private key.
   */
  hasPrivateKey() {
    return !!this._rootKey.privateKey;
  }
  getMasterPrivateKey() {
    if (!this._rootKey.privateKey)
      throw new Error("Missing private key");
    return this._rootKey.privateKey;
  }
  getMasterPublicKey() {
    if (!this._rootKey.publicKey)
      throw new Error("Missing public key");
    return this._rootKey.publicKey;
  }
  /**
   * Returns the extended private key serialized with the correct version bytes.
   * Mainnet BIP44 → xprv, Testnet BIP44 → tprv, Mainnet BIP84 → zprv, Testnet BIP84 → vprv.
   */
  getXPriv() {
    if (!this.hasPrivateKey())
      throw new Error("Missing private key");
    return this._rootKey.privateExtendedKey;
  }
  /**
   * Returns the root extended public key. For sharing with watch-only wallets, use
   * getAccountXPub() instead — this returns the master root key, not the account-level key.
   * Mainnet BIP44 → xpub, Testnet BIP44 → tpub, Mainnet BIP84 → zpub, Testnet BIP84 → vpub.
   */
  getXPub() {
    return this._rootKey.publicExtendedKey;
  }
  /**
   * Returns the BIP44/84 account-level extended public key for sharing with watch-only wallets.
   * Derives to m/purpose'/coinType'/account' and returns that subtree's public key.
   * This is what Electrum, Sparrow, hardware wallets, and other wallets export as zpub/xpub.
   * Throws if called on a watch-only instance (hardened derivation requires the private key).
   */
  getAccountXPub(account) {
    if (!this.hasPrivateKey())
      throw new Error("Cannot derive account-level xpub from a watch-only key \u2014 hardened derivation requires the private key");
    const acct = account ?? this.account;
    const path = `m/${this.purpose}'/${this.coinType}'/${acct}'`;
    const accountKey = this._rootKey.derive(path);
    if (!accountKey.publicKey)
      throw new Error(`Failed to derive account key at path ${path}`);
    return accountKey.publicExtendedKey;
  }
  /**
   * Resolves the correct HD key version bytes for the given purpose and network.
   */
  static resolveVersions(purpose, network) {
    const isTestnet = network === "testnet";
    if (purpose === 44) {
      return isTestnet ? this.versions.bip44Testnet : this.versions.bip44Mainnet;
    }
    return isTestnet ? this.versions.bip84Testnet : this.versions.bip84Mainnet;
  }
  /**
   * Detects purpose, network, and version bytes from an extended key prefix.
   * Supports: xprv/xpub (BIP44 mainnet), tprv/tpub (BIP44 testnet),
   *           zprv/zpub (BIP84 mainnet), vprv/vpub (BIP84 testnet).
   */
  static detectExtendedKeyInfo(key) {
    const prefix = key.slice(0, 4);
    switch (prefix) {
      case "xprv":
      case "xpub":
        return { versions: this.versions.bip44Mainnet, purpose: 44, network: "mainnet" };
      case "tprv":
      case "tpub":
        return { versions: this.versions.bip44Testnet, purpose: 44, network: "testnet" };
      case "zprv":
      case "zpub":
        return { versions: this.versions.bip84Mainnet, purpose: 84, network: "mainnet" };
      case "vprv":
      case "vpub":
        return { versions: this.versions.bip84Testnet, purpose: 84, network: "testnet" };
      default:
        throw new Error(`Unrecognized extended key prefix: "${prefix}". Supported: xprv/xpub, tprv/tpub, zprv/zpub, vprv/vpub`);
    }
  }
};
_HDKManager.versions = {
  bip44Mainnet: { private: 76066276, public: 76067358 },
  bip44Testnet: { private: 70615956, public: 70617039 },
  bip84Mainnet: { private: 78791436, public: 78792518 },
  bip84Testnet: { private: 73341116, public: 73342198 }
};
var HDKManager = _HDKManager;

// src/base/hdtxbase.ts
var HDTransactionBase = class extends TransactionBuilder {
  /**
   * Constructs an HDTransactionBase instance with optional transaction settings.
   * @param options Optional transaction configuration: version, locktime, fee, who pays the fee.
   */
  constructor(options) {
    super();
    /** Transaction version (default is 2) */
    this.version = 2;
    /** Transaction locktime (default is 0) */
    this.locktime = 0;
    /** List of inputs included in the transaction */
    this.inputs = [];
    /** List of outputs included in the transaction */
    this.outputs = [];
    this.signingKeys = /* @__PURE__ */ new Map();
    this.version = options?.version ?? 2;
    this.locktime = options?.locktime ?? 0;
    this.whoPayTheFee = options?.whoPayTheFee;
    this.fee = options?.fee;
    if (this.fee !== void 0)
      this.validateFeeRate(this.fee);
    this.cachedata = /* @__PURE__ */ new Map();
  }
  /**
   * Adds a transaction input and associates a signing key to it.
   * @param input The transaction input to be added.
   * @param pairkey The key pair used to sign this specific input.
   * @throws If the input is invalid or already exists.
   */
  addInput(input, pairkey) {
    this.validateInput(input, this.inputs);
    if (!input.scriptPubKey)
      input.scriptPubKey = bytesToHex(addressToScriptPubKey(pairkey.getAddress()));
    if (!input.sequence) input.sequence = "fffffffd";
    this.signingKeys.set(this.getkey(input), pairkey);
    this.inputs.push(input);
    this.cachedata.clear();
    this.onTransactionMutated();
  }
  /**
   * Adds an output to the transaction.
   * @param output The output (address and amount) to be added.
   * @throws If the output is invalid or duplicated.
   */
  addOutput(output) {
    this.validateOutput(output, this.outputs);
    this.outputs.push(output);
    this.cachedata.clear();
    this.onTransactionMutated();
  }
  /**
   * Checks if the transaction contains at least one SegWit input.
   * @returns True if any input is SegWit, false otherwise.
   */
  isSegwit() {
    return super.isSegwit(this.inputs);
  }
  /**
   * Builds the raw transaction (optionally for txid calculation).
   * Handles both SegWit and legacy inputs.
   * @param format Output format, either "raw" (default) or "txid".
   * @returns Serialized transaction as Uint8Array.
   * @throws If any input lacks its associated signing key.
   */
  build(format = "raw") {
    this.validateSigning();
    let witnessData = new ByteBuffer();
    let hexTransaction = new ByteBuffer(numberToHexLE(this.version, 32));
    if (this.isSegwit() && format != "txid")
      hexTransaction.append(new Uint8Array([0, 1]));
    hexTransaction.append(numberToVarint(this.inputs.length));
    this.inputs.forEach((input) => {
      hexTransaction.append(hexToBytes(input.txid).reverse());
      hexTransaction.append(numberToHexLE(input.vout, 32));
      if (this.isSegwitInput(input)) {
        witnessData.append(this.buildWitness(input));
        hexTransaction.append(new Uint8Array([0]));
      } else {
        let scriptSig = this.buildScriptSig(input);
        hexTransaction.append(numberToVarint(scriptSig.length));
        hexTransaction.append(scriptSig);
        witnessData.append(new Uint8Array([0]));
      }
      hexTransaction.append(hexToBytes(input.sequence ?? "fffffffd").reverse());
    });
    hexTransaction.append(numberToVarint(this.outputs.length));
    hexTransaction.append(this.outputsRaw(this.outputs));
    if (this.isSegwit() && format != "txid") hexTransaction.append(witnessData.raw());
    hexTransaction.append(numberToHexLE(this.locktime, 32));
    return hexTransaction.raw();
  }
  /**
   * Generates the witness data for a SegWit input.
   * @param input The input to generate witness for.
   * @returns Serialized witness field.
   * @throws If the input has no associated signing key.
   */
  buildWitness(input) {
    const pairkey = this.signingKeys.get(this.getkey(input));
    if (!pairkey)
      throw new Error("Transaction not signed, please sign the transaction");
    return super.generateWitness(input, {
      version: this.version,
      locktime: this.locktime,
      inputs: this.inputs,
      outputs: this.outputs,
      pairkey
    });
  }
  /**
   * Generates the legacy scriptSig for a non-SegWit input.
   * @param input The input to generate the scriptSig for.
   * @returns Serialized scriptSig.
   * @throws If the input has no associated signing key.
   */
  buildScriptSig(input) {
    const pairkey = this.signingKeys.get(this.getkey(input));
    if (!pairkey)
      throw new Error("Transaction not signed, please sign the transaction");
    return super.generateScriptSig(input, {
      version: this.version,
      locktime: this.locktime,
      inputs: this.inputs,
      outputs: this.outputs,
      pairkey
    });
  }
  /**
   * Clears all inputs, outputs, cached data, and signing keys.
   */
  clear() {
    this.inputs = [];
    this.outputs = [];
    this.signingKeys.clear();
    this.cachedata.clear();
  }
  /**
   * Generates a unique key for the signingKeys map based on txid and vout.
   * @param input The input to derive the key from.
   * @returns A string in the format "txid:vout".
   */
  getkey(input) {
    return `${input.txid}:${input.vout}`;
  }
  /**
   * Validates that all inputs have an associated signing key.
   * @throws If any input is missing its corresponding key.
   */
  validateSigning() {
    for (const input of this.inputs) {
      if (!this.signingKeys.has(this.getkey(input)))
        throw new Error(`Missing signing key for input ${JSON.stringify(input)}`);
    }
  }
};

// src/hdtransaction.ts
var HDTransaction = class extends HDTransactionBase {
  /**
   * Constructs a new HDTransaction.
   * @param options Optional transaction parameters (version, locktime, fee, etc.).
   */
  constructor(options) {
    super(options);
    this.feeResolved = false;
  }
  /**
   * Returns the transaction ID (txid) as a hex string.
   * It is the double SHA-256 hash of the raw transaction (excluding witness data),
   * reversed in byte order.
   * 
   * @throws Error if the transaction is not signed.
   * @returns The txid in hex string format.
   */
  getTxid() {
    if (!this.cachedata.get("txidraw")) this.sign();
    let hexTransaction = this.cachedata.get("txidraw");
    if (!hexTransaction)
      throw new Error("Transaction not signed, please sign the transactio");
    let txid = hash256(hexTransaction).reverse();
    return bytesToHex(txid);
  }
  /**
   * Signs the transaction and stores both the full raw transaction and
   * the stripped version used to calculate the txid.
   */
  sign() {
    this.cachedata.set("txraw", this.build());
    this.cachedata.set("txidraw", this.build("txid"));
  }
  /**
   * Determines if the transaction contains any SegWit inputs.
   * @returns True if the transaction has at least one SegWit input.
   */
  isSegwit() {
    return super.isSegwit();
  }
  /**
   * Calculates the total weight of the transaction as defined in BIP 141.
   * Weight = (non-witness bytes * 4) + witness bytes + marker/flag bytes.
   * Uses cached serialization to avoid re-signing on each call.
   *
   * @throws Error if the transaction is not signed.
   * @returns The transaction weight.
   */
  weight() {
    if (!this.cachedata.get("txraw")) this.sign();
    const txraw = this.cachedata.get("txraw");
    const txidraw = this.cachedata.get("txidraw");
    if (!this.isSegwit()) return txraw.length * 4;
    const witnessMK = 2;
    const witnessSize = txraw.length - txidraw.length - witnessMK;
    return txidraw.length * 4 + witnessSize + witnessMK;
  }
  /**
   * Calculates the virtual size (vBytes) of the transaction, defined as weight / 4.
   * 
   * @throws Error if the transaction is not signed.
   * @returns The virtual size of the transaction in vBytes.
   */
  vBytes() {
    return Math.ceil(this.weight() / 4);
  }
  /**
   * Resolves and deducts the transaction fee from the specified output(s).
   *
   * Fee deduction strategy:
   * - If one output: subtracts total fee from that output.
   * - If `whoPayTheFee` is "everyone": splits the fee among all outputs equally.
   * - If `whoPayTheFee` is an address: subtracts full fee from that address.
   * Idempotent: calling more than once has no additional effect.
   *
   * @throws Error if the transaction is not signed.
   */
  resolveFee() {
    if (this.feeResolved) return;
    const previousAmounts = this.outputs.map((output) => output.amount);
    try {
      if (!this.cachedata.get("txraw")) this.sign();
      const feeSats = this.estimateFeeSats();
      if (this.outputs.length == 1) {
        this.deductFeeFromOutput(0, feeSats);
        this.markFeeResolved();
        return;
      }
      if (this.whoPayTheFee === "everyone") {
        this.deductFeeFromEveryone(feeSats);
        this.markFeeResolved();
        return;
      }
      for (let i = 0; i < this.outputs.length; i++) {
        if (this.outputs[i].address === this.whoPayTheFee) {
          this.deductFeeFromOutput(i, feeSats);
          this.markFeeResolved();
          return;
        }
      }
      throw new Error("Fee payer output not found");
    } catch (error) {
      this.outputs.forEach((output, index) => output.amount = previousAmounts[index]);
      this.feeResolved = false;
      this.cachedata.clear();
      throw error;
    }
  }
  /**
   * Calculates the actual fee in satoshis from input total minus output total.
   * 
   * @returns Total transaction fee in satoshis.
   */
  getFeeSats() {
    return this.sumInputs(this.inputs) - this.sumOutputs(this.outputs);
  }
  estimateFeeSats() {
    return Math.ceil(this.vBytes() * (this.fee ?? 1));
  }
  /**
   * Returns the raw transaction as a hex-encoded string.
   * 
   * @throws Error if the transaction is not signed.
   * @returns Raw transaction in hex format.
   */
  getRawHex() {
    if (!this.cachedata.get("txraw")) this.sign();
    return bytesToHex(this.cachedata.get("txraw"));
  }
  /**
   * Returns the raw transaction as a Uint8Array.
   *
   * @throws Error if the transaction is not signed.
   * @returns Raw transaction as bytes.
   */
  getRawBytes() {
    if (!this.cachedata.get("txraw")) this.sign();
    return this.cachedata.get("txraw");
  }
  /**
   * Clears all inputs, outputs, signing keys, cache data and resets the fee state.
   */
  clear() {
    super.clear();
    this.feeResolved = false;
  }
  onTransactionMutated() {
    this.feeResolved = false;
  }
  deductFeeFromOutput(index, feeSats) {
    const previousAmount = this.outputs[index].amount;
    this.outputs[index].amount -= feeSats;
    try {
      this.validateTransaction(this.inputs, this.outputs);
    } catch (error) {
      this.outputs[index].amount = previousAmount;
      throw error;
    }
  }
  deductFeeFromEveryone(feeSats) {
    const previousAmounts = this.outputs.map((output) => output.amount);
    const baseShare = Math.floor(feeSats / this.outputs.length);
    let remainder = feeSats % this.outputs.length;
    this.outputs.forEach((output) => {
      output.amount -= baseShare;
      if (remainder > 0) {
        output.amount -= 1;
        remainder--;
      }
    });
    try {
      this.validateTransaction(this.inputs, this.outputs);
    } catch (error) {
      this.outputs.forEach((output, index) => output.amount = previousAmounts[index]);
      throw error;
    }
  }
  markFeeResolved() {
    this.feeResolved = true;
    this.cachedata.clear();
    this.sign();
    const targetFee = this.estimateFeeSats();
    const actualFee = this.getFeeSats();
    if (actualFee < targetFee) {
      this.deductFeeFromOutput(this.outputs.length === 1 || this.whoPayTheFee !== "everyone" ? this.findFeePayerIndex() : 0, targetFee - actualFee);
      this.cachedata.clear();
      this.sign();
    }
  }
  findFeePayerIndex() {
    if (this.outputs.length === 1) return 0;
    const index = this.outputs.findIndex((output) => output.address === this.whoPayTheFee);
    if (index < 0)
      throw new Error("Fee payer output not found");
    return index;
  }
};

// src/utils/mnemonic.ts
import {
  generateMnemonic,
  mnemonicToEntropy,
  entropyToMnemonic,
  mnemonicToSeedSync as mnemonicToSeedSync2,
  validateMnemonic
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { randomBytes } from "@noble/hashes/utils.js";
var MnemonicUtils = class {
  /**
   * Generates a new BIP-39 mnemonic phrase.
   * 
   * @param {number} [strength=128] - Entropy strength in bits. Common values: 128 (12 words), 256 (24 words).
   * @returns {string} A mnemonic phrase.
   * @throws {Error} If the provided strength is invalid or unsupported.
   */
  static generateMnemonic(strength = 128) {
    const mnemonic = generateMnemonic(wordlist, strength);
    return mnemonic;
  }
  /**
   * Retrieves the full BIP-39 wordlist or filters it by a search term.
   * 
   * @param {string} [searchTerm] - Optional term to filter words. Case-insensitive and trimmed.
   * @returns {string[]} A list of matching words, or the entire list if no search term is given.
   */
  static getWords(searchTerm) {
    if (!searchTerm) return wordlist;
    return wordlist.filter((w) => {
      return w.includes(searchTerm.trim().toLowerCase());
    });
  }
  /**
  * Validates if the given mnemonic is valid according to BIP-39 rules.
  *
  * @param {string} mnemonic - The mnemonic phrase to validate.
  * @returns {boolean} True if valid, false otherwise.
  */
  static validateMnemonic(mnemonic) {
    return validateMnemonic(mnemonic, wordlist);
  }
  /**
  * Converts a mnemonic phrase to its entropy (hex string).
  *
  * @param {string} mnemonic - The mnemonic to convert.
  * @returns {Uint8Array} The Uint8Array entropy.
  * @throws {Error} If the mnemonic is invalid.
  */
  static mnemonicToEntropy(mnemonic) {
    if (!this.validateMnemonic(mnemonic))
      throw new Error("Invalid mnemonic.");
    return mnemonicToEntropy(mnemonic, wordlist);
  }
  /**
  * Converts entropy (hex string) to a BIP-39 mnemonic phrase.
  *
  * @param {Uint8Array} entropy - The entropy to convert.
  * @returns {string} The resulting mnemonic phrase.
  */
  static entropyToMnemonic(entropy) {
    this.validateEntropy(entropy);
    return entropyToMnemonic(entropy, wordlist);
  }
  /**
  * Converts a mnemonic phrase into a BIP-39 seed.
  *
  * @param {string} mnemonic - The mnemonic phrase.
  * @param {string} [passphrase] - Optional passphrase.
  * @returns {Uint8Array} The resulting seed as a byte array.
  */
  static mnemonicToSeed(mnemonic, passphrase = "") {
    if (typeof passphrase !== "string")
      throw new Error("Passphrase must be a string");
    if (!this.validateMnemonic(mnemonic))
      throw new Error("Invalid mnemonic");
    return mnemonicToSeedSync2(mnemonic, passphrase);
  }
  /**
  * Returns a random word from the BIP-39 wordlist.
  * Uses a cryptographically secure random source (not `Math.random()`).
  *
  * @returns {string} A randomly selected word.
  */
  static getRandomWord() {
    const index = new DataView(randomBytes(4).buffer).getUint32(0) % wordlist.length;
    return wordlist[index];
  }
  static validateEntropy(entropy) {
    const validLengths = [16, 20, 24, 28, 32];
    if (!validLengths.includes(entropy.length))
      throw new Error("Invalid size entropy");
    if (this.isHighlyRepetitive(entropy))
      throw new Error("Low entropy, unsafe entropy level");
  }
  static isHighlyRepetitive(entropy) {
    const counts = /* @__PURE__ */ new Map();
    for (const byte of entropy) {
      counts.set(byte, (counts.get(byte) || 0) + 1);
    }
    return [...counts.values()].some((count) => count / entropy.length >= 0.9);
  }
  static isEntropyStrong(entropy, minEntropyBits = 7.5) {
    const perByteEntropy = this.calculateShannonEntropy(entropy) / entropy.length;
    return perByteEntropy >= minEntropyBits;
  }
  static calculateShannonEntropy(data) {
    const len = data.length;
    const freq = {};
    for (const byte of data) {
      freq[byte] = (freq[byte] || 0) + 1;
    }
    let entropy = 0;
    for (const byte in freq) {
      const p = freq[byte] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy * 8;
  }
};

// src/hdwallet.ts
var HDWallet = class _HDWallet {
  constructor(hdkManager, options) {
    this._hdkManager = hdkManager;
    this.isWatchOnly = !hdkManager.hasPrivateKey();
    this.network = options?.network ?? hdkManager.network;
  }
  /**
   * Creates a new HDWallet with a randomly generated mnemonic.
   * @param password Optional password for the mnemonic.
   * @param options Network options.
   * @returns Object containing the mnemonic and wallet instance.
   */
  static create(passphrase, options) {
    const mnemonic = MnemonicUtils.generateMnemonic(128);
    const hdkeyManager = HDKManager.fromMnemonic(mnemonic, passphrase, {
      purpose: options?.purpose ?? 84,
      network: options?.network
    });
    const wallet = new _HDWallet(hdkeyManager, options);
    return { mnemonic, wallet };
  }
  /**
   * Imports a wallet from mnemonic, xpriv, or xpub.
   * @param input String representing the mnemonic, xpriv, or xpub.
   * @param password Optional password if input is a mnemonic.
   * @param options Network options.
   * @returns Object containing the HDWallet and optionally the mnemonic.
   */
  static import(input, password, options) {
    const trimmed = input.trim();
    if (trimmed.split(/\s+/).length > 1) {
      if (!MnemonicUtils.validateMnemonic(trimmed))
        throw new Error("Invalid seed phrase (mnemonic)");
      const hdkParams = {
        purpose: options?.purpose,
        network: options?.network
      };
      const wallet = new _HDWallet(HDKManager.fromMnemonic(trimmed, password, hdkParams), options);
      return { mnemonic: trimmed, wallet };
    }
    if (/^(xprv|tprv|zprv|vprv)[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
      const wallet = new _HDWallet(HDKManager.fromXPriv(trimmed), options);
      return { wallet };
    }
    if (/^(xpub|tpub|zpub|vpub)[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
      const wallet = new _HDWallet(HDKManager.fromXPub(trimmed), options);
      return { wallet };
    }
    throw new Error("Unsupported or invalid HD wallet data format, expected mnemonic, xpriv or xpub.");
  }
  /**
   * Derives multiple key pairs from the wallet.
   * @param quantity Number of keys to derive.
   * @param pathOptions Optional derivation path configuration.
   * @returns Array of ECPairKey.
   */
  listPairKeys(quantity, pathOptions) {
    if (this.isWatchOnly)
      throw new Error("The wallet only has the public key, it is read-only");
    return this._hdkManager.derivateMultiplePairKeys(quantity, {
      network: this.network
    }, pathOptions);
  }
  /**
   * Returns a list of addresses from the wallet.
   * @param quantity Number of addresses to return.
   * @param options Address type options (p2wpkh, p2pkh, etc).
   * @param pathOptions Optional derivation path configuration.
   */
  listAddresses(quantity, pathOptions) {
    const getTypeAddreee = () => {
      return this._hdkManager.purpose == 84 ? "p2wpkh" : "p2pkh";
    };
    if (this.isWatchOnly) {
      return this._hdkManager.deriveMultiplePublicKeys(quantity, pathOptions).map((pubkey) => Address.fromPubkey({
        pubkey: bytesToHex(pubkey),
        type: getTypeAddreee(),
        network: this.network
      }));
    }
    return this._hdkManager.derivateMultiplePairKeys(quantity, {
      network: this.network
    }, pathOptions).map((pair) => pair.getAddress(getTypeAddreee()));
  }
  /**
   * Returns a list of external (receiving) addresses as per BIP44.
   * @param quantity Number of addresses to return.
   * @param type Address type options (p2wpkh, p2pkh, etc).
   * @param account Account index (default is 0).
   */
  listReceiveAddresses(quantity, account = 0) {
    return this.listAddresses(quantity, { account, change: 0 });
  }
  /**
   * Returns a list of internal (change) addresses as per BIP44.
   * @param quantity Number of addresses to return.
   * @param type Address type options (p2wpkh, p2pkh, etc).
   * @param account Account index (default is 0).
   */
  listChangeAddresses(quantity, account = 0) {
    return this.listAddresses(quantity, { account, change: 1 });
  }
  /**
   * Derives a single address by index.
   */
  getAddress(index, pathOptions) {
    const getTypeAddress = () => {
      return this._hdkManager.purpose == 84 ? "p2wpkh" : "p2pkh";
    };
    if (this.isWatchOnly) {
      const pubkey = this._hdkManager.derivatePublicKey(index, pathOptions);
      return Address.fromPubkey({
        pubkey: bytesToHex(pubkey),
        type: getTypeAddress(),
        network: this.network
      });
    }
    return this.getPairKey(index, pathOptions).getAddress(getTypeAddress());
  }
  /** Returns the master private key in base58 (xprv). */
  getMasterPrivateKey() {
    if (this.isWatchOnly)
      throw new Error("The wallet only has the public key, it is read-only");
    return this._hdkManager.getMasterPrivateKey();
  }
  /** Returns the master public key in base58 (xpub). */
  getMasterPublicKey() {
    return this._hdkManager.getMasterPublicKey();
  }
  /** Derives the private key for a given index. */
  getPrivateKey(index, pathOptions) {
    if (this.isWatchOnly)
      throw new Error("The wallet only has the public key, it is read-only");
    return this._hdkManager.derivatePrivateKey(index, pathOptions);
  }
  /** Derives the public key for a given index. */
  getPublicKey(index, pathOptions) {
    return this._hdkManager.derivatePublicKey(index, pathOptions);
  }
  /** Derives a key pair (private + public) for a given index. */
  getPairKey(index, pathOptions) {
    if (this.isWatchOnly)
      throw new Error("The wallet only has the public key, it is read-only");
    return this._hdkManager.derivatePairKey(index, {
      network: this.network
    }, pathOptions);
  }
  /** Returns the extended private key (xprv). */
  getXPriv() {
    if (this.isWatchOnly)
      throw new Error("The wallet only has the public key, it is read-only");
    return this._hdkManager.getXPriv();
  }
  /** Returns the root extended public key. For watch-only sharing, use getAccountXPub() instead. */
  getXPub() {
    return this._hdkManager.getXPub();
  }
  /**
   * Returns the account-level extended public key (zpub/xpub/tpub/vpub) suitable for
   * import into watch-only wallets. This is the key at m/purpose'/coinType'/account'
   * and matches what Electrum, Sparrow, Ledger, and Trezor export.
   * Throws for watch-only wallets (hardened derivation requires the private key).
   */
  getAccountXPub(account) {
    if (this.isWatchOnly)
      throw new Error("The wallet only has the public key, it is read-only");
    return this._hdkManager.getAccountXPub(account);
  }
  getWif() {
    const pairkey = ECPairKey.fromHex(bytesToHex(this.getMasterPrivateKey()), this.network);
    return pairkey.getWif();
  }
};
export {
  Address,
  ECPairKey,
  HDKManager,
  HDTransaction,
  HDWallet,
  MnemonicUtils,
  Transaction,
  bytesToHex,
  checksum,
  getBytesCount,
  hash160ToScript,
  hash256,
  hexToBytes,
  isEqual,
  mergeUint8Arrays,
  numberToHex,
  numberToHexLE,
  numberToVarint,
  ripemd160,
  sha256
};
