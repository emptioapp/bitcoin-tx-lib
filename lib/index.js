"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/bech32/dist/index.js
var require_dist = __commonJS({
  "node_modules/bech32/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.bech32m = exports2.bech32 = void 0;
    var ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    var ALPHABET_MAP = {};
    for (let z = 0; z < ALPHABET.length; z++) {
      const x = ALPHABET.charAt(z);
      ALPHABET_MAP[x] = z;
    }
    function polymodStep(pre) {
      const b = pre >> 25;
      return (pre & 33554431) << 5 ^ -(b >> 0 & 1) & 996825010 ^ -(b >> 1 & 1) & 642813549 ^ -(b >> 2 & 1) & 513874426 ^ -(b >> 3 & 1) & 1027748829 ^ -(b >> 4 & 1) & 705979059;
    }
    function prefixChk(prefix) {
      let chk = 1;
      for (let i = 0; i < prefix.length; ++i) {
        const c = prefix.charCodeAt(i);
        if (c < 33 || c > 126)
          return "Invalid prefix (" + prefix + ")";
        chk = polymodStep(chk) ^ c >> 5;
      }
      chk = polymodStep(chk);
      for (let i = 0; i < prefix.length; ++i) {
        const v = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ v & 31;
      }
      return chk;
    }
    function convert(data, inBits, outBits, pad) {
      let value = 0;
      let bits = 0;
      const maxV = (1 << outBits) - 1;
      const result = [];
      for (let i = 0; i < data.length; ++i) {
        value = value << inBits | data[i];
        bits += inBits;
        while (bits >= outBits) {
          bits -= outBits;
          result.push(value >> bits & maxV);
        }
      }
      if (pad) {
        if (bits > 0) {
          result.push(value << outBits - bits & maxV);
        }
      } else {
        if (bits >= inBits)
          return "Excess padding";
        if (value << outBits - bits & maxV)
          return "Non-zero padding";
      }
      return result;
    }
    function toWords(bytes) {
      return convert(bytes, 8, 5, true);
    }
    function fromWordsUnsafe(words) {
      const res = convert(words, 5, 8, false);
      if (Array.isArray(res))
        return res;
    }
    function fromWords(words) {
      const res = convert(words, 5, 8, false);
      if (Array.isArray(res))
        return res;
      throw new Error(res);
    }
    function getLibraryFromEncoding(encoding) {
      let ENCODING_CONST;
      if (encoding === "bech32") {
        ENCODING_CONST = 1;
      } else {
        ENCODING_CONST = 734539939;
      }
      function encode(prefix, words, LIMIT) {
        LIMIT = LIMIT || 90;
        if (prefix.length + 7 + words.length > LIMIT)
          throw new TypeError("Exceeds length limit");
        prefix = prefix.toLowerCase();
        let chk = prefixChk(prefix);
        if (typeof chk === "string")
          throw new Error(chk);
        let result = prefix + "1";
        for (let i = 0; i < words.length; ++i) {
          const x = words[i];
          if (x >> 5 !== 0)
            throw new Error("Non 5-bit word");
          chk = polymodStep(chk) ^ x;
          result += ALPHABET.charAt(x);
        }
        for (let i = 0; i < 6; ++i) {
          chk = polymodStep(chk);
        }
        chk ^= ENCODING_CONST;
        for (let i = 0; i < 6; ++i) {
          const v = chk >> (5 - i) * 5 & 31;
          result += ALPHABET.charAt(v);
        }
        return result;
      }
      function __decode(str, LIMIT) {
        LIMIT = LIMIT || 90;
        if (str.length < 8)
          return str + " too short";
        if (str.length > LIMIT)
          return "Exceeds length limit";
        const lowered = str.toLowerCase();
        const uppered = str.toUpperCase();
        if (str !== lowered && str !== uppered)
          return "Mixed-case string " + str;
        str = lowered;
        const split2 = str.lastIndexOf("1");
        if (split2 === -1)
          return "No separator character for " + str;
        if (split2 === 0)
          return "Missing prefix for " + str;
        const prefix = str.slice(0, split2);
        const wordChars = str.slice(split2 + 1);
        if (wordChars.length < 6)
          return "Data too short";
        let chk = prefixChk(prefix);
        if (typeof chk === "string")
          return chk;
        const words = [];
        for (let i = 0; i < wordChars.length; ++i) {
          const c = wordChars.charAt(i);
          const v = ALPHABET_MAP[c];
          if (v === void 0)
            return "Unknown character " + c;
          chk = polymodStep(chk) ^ v;
          if (i + 6 >= wordChars.length)
            continue;
          words.push(v);
        }
        if (chk !== ENCODING_CONST)
          return "Invalid checksum for " + str;
        return { prefix, words };
      }
      function decodeUnsafe(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === "object")
          return res;
      }
      function decode(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === "object")
          return res;
        throw new Error(res);
      }
      return {
        decodeUnsafe,
        decode,
        encode,
        toWords,
        fromWordsUnsafe,
        fromWords
      };
    }
    exports2.bech32 = getLibraryFromEncoding("bech32");
    exports2.bech32m = getLibraryFromEncoding("bech32m");
  }
});

// index.ts
var index_exports = {};
__export(index_exports, {
  Address: () => Address,
  ECPairKey: () => ECPairKey,
  HDKManager: () => HDKManager,
  HDTransaction: () => HDTransaction,
  HDWallet: () => HDWallet,
  MnemonicUtils: () => MnemonicUtils,
  Transaction: () => Transaction,
  bytesToHex: () => bytesToHex2,
  checksum: () => checksum,
  getBytesCount: () => getBytesCount,
  hash160ToScript: () => hash160ToScript,
  hash256: () => hash256,
  hexToBytes: () => hexToBytes2,
  isEqual: () => isEqual,
  mergeUint8Arrays: () => mergeUint8Arrays,
  numberToHex: () => numberToHex,
  numberToHexLE: () => numberToHexLE,
  numberToVarint: () => numberToVarint,
  ripemd160: () => ripemd1602,
  sha256: () => sha2562
});
module.exports = __toCommonJS(index_exports);

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

// node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function anumber(n, title = "") {
  if (typeof n !== "number") {
    const prefix = title && `"${title}" `;
    throw new TypeError(`${prefix}expected number, got ${typeof n}`);
  }
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new RangeError(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes(value, length, title = "") {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    const message = prefix + "expected Uint8Array" + ofLen + ", got " + got;
    if (!bytes)
      throw new TypeError(message);
    throw new RangeError(message);
  }
  return value;
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new TypeError("Hash must wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
  if (h.outputLen < 1)
    throw new Error('"outputLen" must be >= 1');
  if (h.blockLen < 1)
    throw new Error('"blockLen" must be >= 1');
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "digestInto() output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new RangeError('"digestInto() output" expected to be of length >=' + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function rotl(word, shift) {
  return word << shift | word >>> 32 - shift >>> 0;
}
var hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  if (hasHexBuiltin) {
    try {
      return Uint8Array.fromHex(hex);
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new RangeError(error.message);
      throw error;
    }
  }
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new RangeError("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function createHasher(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  anumber(bytesLength, "bytesLength");
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  if (bytesLength > 65536)
    throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var oidNist = (suffix) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class {
  constructor(blockLen, outputLen, padOffset, isLE) {
    __publicField(this, "blockLen");
    __publicField(this, "outputLen");
    __publicField(this, "canXOF", false);
    __publicField(this, "padOffset");
    __publicField(this, "isLE");
    // For partial updates less than block size
    __publicField(this, "buffer");
    __publicField(this, "view");
    __publicField(this, "finished", false);
    __publicField(this, "length", 0);
    __publicField(this, "pos", 0);
    __publicField(this, "destroyed", false);
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA512_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);

// node_modules/@noble/hashes/legacy.js
var Rho160 = /* @__PURE__ */ Uint8Array.from([
  7,
  4,
  13,
  1,
  10,
  6,
  15,
  3,
  12,
  0,
  9,
  5,
  2,
  14,
  11,
  8
]);
var Id160 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
var Pi160 = /* @__PURE__ */ (() => Id160.map((i) => (9 * i + 5) % 16))();
var idxLR = /* @__PURE__ */ (() => {
  const L = [Id160];
  const R = [Pi160];
  const res = [L, R];
  for (let i = 0; i < 4; i++)
    for (let j of res)
      j.push(j[i].map((k) => Rho160[k]));
  return res;
})();
var idxL = /* @__PURE__ */ (() => idxLR[0])();
var idxR = /* @__PURE__ */ (() => idxLR[1])();
var shifts160 = /* @__PURE__ */ [
  [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
  [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
  [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
  [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
  [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
].map((i) => Uint8Array.from(i));
var shiftsL160 = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts160[i][j]));
var shiftsR160 = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts160[i][j]));
var Kl160 = /* @__PURE__ */ Uint32Array.from([
  0,
  1518500249,
  1859775393,
  2400959708,
  2840853838
]);
var Kr160 = /* @__PURE__ */ Uint32Array.from([
  1352829926,
  1548603684,
  1836072691,
  2053994217,
  0
]);
function ripemd_f(group, x, y, z) {
  if (group === 0)
    return x ^ y ^ z;
  if (group === 1)
    return x & y | ~x & z;
  if (group === 2)
    return (x | ~y) ^ z;
  if (group === 3)
    return x & z | y & ~z;
  return x ^ (y | ~z);
}
var BUF_160 = /* @__PURE__ */ new Uint32Array(16);
var _RIPEMD160 = class extends HashMD {
  constructor() {
    super(64, 20, 8, true);
    __publicField(this, "h0", 1732584193 | 0);
    __publicField(this, "h1", 4023233417 | 0);
    __publicField(this, "h2", 2562383102 | 0);
    __publicField(this, "h3", 271733878 | 0);
    __publicField(this, "h4", 3285377520 | 0);
  }
  get() {
    const { h0, h1, h2, h3, h4 } = this;
    return [h0, h1, h2, h3, h4];
  }
  set(h0, h1, h2, h3, h4) {
    this.h0 = h0 | 0;
    this.h1 = h1 | 0;
    this.h2 = h2 | 0;
    this.h3 = h3 | 0;
    this.h4 = h4 | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      BUF_160[i] = view.getUint32(offset, true);
    let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
    for (let group = 0; group < 5; group++) {
      const rGroup = 4 - group;
      const hbl = Kl160[group], hbr = Kr160[group];
      const rl = idxL[group], rr = idxR[group];
      const sl = shiftsL160[group], sr = shiftsR160[group];
      for (let i = 0; i < 16; i++) {
        const tl = rotl(al + ripemd_f(group, bl, cl, dl) + BUF_160[rl[i]] + hbl, sl[i]) + el | 0;
        al = el, el = dl, dl = rotl(cl, 10) | 0, cl = bl, bl = tl;
      }
      for (let i = 0; i < 16; i++) {
        const tr = rotl(ar + ripemd_f(rGroup, br, cr, dr) + BUF_160[rr[i]] + hbr, sr[i]) + er | 0;
        ar = er, er = dr, dr = rotl(cr, 10) | 0, cr = br, br = tr;
      }
    }
    this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
  }
  roundClean() {
    clean(BUF_160);
  }
  destroy() {
    this.destroyed = true;
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0);
  }
};
var ripemd160 = /* @__PURE__ */ createHasher(() => new _RIPEMD160());

// node_modules/@noble/hashes/_u64.js
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var shrSH = (h, _l, s) => h >>> s;
var shrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

// node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B = class extends HashMD {
  constructor(outputLen) {
    super(64, outputLen, 8, false);
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.destroyed = true;
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var _SHA256 = class extends SHA2_32B {
  constructor() {
    super(32);
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    __publicField(this, "A", SHA256_IV[0] | 0);
    __publicField(this, "B", SHA256_IV[1] | 0);
    __publicField(this, "C", SHA256_IV[2] | 0);
    __publicField(this, "D", SHA256_IV[3] | 0);
    __publicField(this, "E", SHA256_IV[4] | 0);
    __publicField(this, "F", SHA256_IV[5] | 0);
    __publicField(this, "G", SHA256_IV[6] | 0);
    __publicField(this, "H", SHA256_IV[7] | 0);
  }
};
var K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
var SHA2_64B = class extends HashMD {
  constructor(outputLen) {
    super(128, outputLen, 16, false);
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H[i] = view.getUint32(offset);
      SHA512_W_L[i] = view.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H[i - 15] | 0;
      const W15l = SHA512_W_L[i - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i - 2] | 0;
      const W2l = SHA512_W_L[i - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
      SHA512_W_H[i] = SUMh | 0;
      SHA512_W_L[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    this.destroyed = true;
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
var _SHA512 = class extends SHA2_64B {
  constructor() {
    super(64);
    __publicField(this, "Ah", SHA512_IV[0] | 0);
    __publicField(this, "Al", SHA512_IV[1] | 0);
    __publicField(this, "Bh", SHA512_IV[2] | 0);
    __publicField(this, "Bl", SHA512_IV[3] | 0);
    __publicField(this, "Ch", SHA512_IV[4] | 0);
    __publicField(this, "Cl", SHA512_IV[5] | 0);
    __publicField(this, "Dh", SHA512_IV[6] | 0);
    __publicField(this, "Dl", SHA512_IV[7] | 0);
    __publicField(this, "Eh", SHA512_IV[8] | 0);
    __publicField(this, "El", SHA512_IV[9] | 0);
    __publicField(this, "Fh", SHA512_IV[10] | 0);
    __publicField(this, "Fl", SHA512_IV[11] | 0);
    __publicField(this, "Gh", SHA512_IV[12] | 0);
    __publicField(this, "Gl", SHA512_IV[13] | 0);
    __publicField(this, "Hh", SHA512_IV[14] | 0);
    __publicField(this, "Hl", SHA512_IV[15] | 0);
  }
};
var sha256 = /* @__PURE__ */ createHasher(
  () => new _SHA256(),
  /* @__PURE__ */ oidNist(1)
);
var sha512 = /* @__PURE__ */ createHasher(
  () => new _SHA512(),
  /* @__PURE__ */ oidNist(3)
);

// src/utils/index.ts
function bytesToHex2(bytes) {
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
function hexToBytes2(hex, hexadecimal = true) {
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
function sha2562(message, hash2562 = false) {
  let hash = sha256(message);
  if (hash2562)
    hash = sha256(hash);
  return hash;
}
function hash256(message) {
  const hash = sha256(sha256(message));
  return hash;
}
function ripemd1602(message, address = false) {
  let hash = address ? sha2562(message) : message;
  hash = ripemd160(hash);
  return hash;
}
function checksum(message, bytes = 4) {
  let hash = sha256(message);
  hash = sha256(hash).slice(0, bytes);
  return hash;
}
function numberToHex(number = 0, bits = 64) {
  let hexValue = number.toString(16);
  if (hexValue.length == 1)
    hexValue = "0" + hexValue;
  for (let i = hexValue.length; i < bits / 4; i++) {
    hexValue = "0" + hexValue;
  }
  return hexToBytes2(hexValue);
}
function numberToHexLE(number = 0, bits = 64) {
  return numberToHex(number, bits).reverse();
}
function hash160ToScript(hash1602) {
  let data = hash1602;
  if (typeof hash1602 !== "object")
    data = hexToBytes2(hash1602);
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
  if (typeof hash1602 == "string")
    return bytesToHex2(hexScript);
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

// node_modules/@noble/curves/utils.js
var abytes2 = (value, length, title) => abytes(value, length, title);
var anumber2 = anumber;
var bytesToHex3 = bytesToHex;
var concatBytes2 = (...arrays) => concatBytes(...arrays);
var hexToBytes3 = (hex) => hexToBytes(hex);
var isBytes2 = isBytes;
var randomBytes2 = (bytesLength) => randomBytes(bytesLength);
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
function abool(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}" `;
    throw new TypeError(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new RangeError("positive bigint expected, got " + n);
  } else
    anumber2(n);
  return n;
}
function asafenumber(value, title = "") {
  if (typeof value !== "number") {
    const prefix = title && `"${title}" `;
    throw new TypeError(prefix + "expected number, got type=" + typeof value);
  }
  if (!Number.isSafeInteger(value)) {
    const prefix = title && `"${title}" `;
    throw new RangeError(prefix + "expected safe integer, got " + value);
  }
}
function numberToHexUnpadded(num) {
  const hex = abignumber(num).toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes(abytes(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber(len);
  if (len === 0)
    throw new RangeError("zero length");
  n = abignumber(n);
  const hex = n.toString(16);
  if (hex.length > len * 2)
    throw new RangeError("number too large");
  return hexToBytes(hex.padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes(bytes) {
  return Uint8Array.from(abytes2(bytes));
}
var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new RangeError("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  if (n < _0n)
    throw new Error("expected non-negative bigint, got " + n);
  let len;
  for (len = 0; n > _0n; n >>= _1n, len += 1)
    ;
  return len;
}
var bitMask = (n) => (_1n << BigInt(n)) - _1n;
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  anumber(hashLen, "hashLen");
  anumber(qByteLen, "qByteLen");
  if (typeof hmacFn !== "function")
    throw new TypeError("hmacFn must be a function");
  const u8n = (len) => new Uint8Array(len);
  const NULL = Uint8Array.of();
  const byte0 = Uint8Array.of(0);
  const byte1 = Uint8Array.of(1);
  const _maxDrbgIters = 1e3;
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...msgs) => hmacFn(k, concatBytes2(v, ...msgs));
  const reseed = (seed = NULL) => {
    k = h(byte0, seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(byte1, seed);
    v = h();
  };
  const gen = () => {
    if (i++ >= _maxDrbgIters)
      throw new Error("drbg: tried max amount of iterations");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes2(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while ((res = pred(gen())) === void 0)
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object, fields = {}, optFields = {}) {
  if (Object.prototype.toString.call(object) !== "[object Object]")
    throw new TypeError("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    if (!isOpt && expectedType !== "function" && !Object.hasOwn(object, fieldName))
      throw new TypeError(`param "${fieldName}" is invalid: expected own property`);
    const val = object[fieldName];
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new TypeError(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}

// node_modules/@noble/curves/abstract/modular.js
var _0n2 = /* @__PURE__ */ BigInt(0);
var _1n2 = /* @__PURE__ */ BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _3n = /* @__PURE__ */ BigInt(3);
var _4n = /* @__PURE__ */ BigInt(4);
var _5n = /* @__PURE__ */ BigInt(5);
var _7n = /* @__PURE__ */ BigInt(7);
var _8n = /* @__PURE__ */ BigInt(8);
var _9n = /* @__PURE__ */ BigInt(9);
var _16n = /* @__PURE__ */ BigInt(16);
function mod(a, b) {
  if (b <= _0n2)
    throw new Error("mod: expected positive modulus, got " + b);
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow2(x, power, modulo) {
  if (power < _0n2)
    throw new Error("pow2: expected non-negative exponent, got " + power);
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n2)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b - a * q;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function assertIsSquare(Fp, root, n) {
  const F = Fp;
  if (!F.eql(F.sqr(root), n))
    throw new Error("Cannot find square root");
}
function sqrt3mod4(Fp, n) {
  const F = Fp;
  const p1div4 = (F.ORDER + _1n2) / _4n;
  const root = F.pow(n, p1div4);
  assertIsSquare(F, root, n);
  return root;
}
function sqrt5mod8(Fp, n) {
  const F = Fp;
  const p5div8 = (F.ORDER - _5n) / _8n;
  const n2 = F.mul(n, _2n);
  const v = F.pow(n2, p5div8);
  const nv = F.mul(n, v);
  const i = F.mul(F.mul(nv, _2n), v);
  const root = F.mul(nv, F.sub(i, F.ONE));
  assertIsSquare(F, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return ((Fp, n) => {
    const F = Fp;
    let tv1 = F.pow(n, c4);
    let tv2 = F.mul(tv1, c1);
    const tv3 = F.mul(tv1, c2);
    const tv4 = F.mul(tv1, c3);
    const e1 = F.eql(F.sqr(tv2), n);
    const e2 = F.eql(F.sqr(tv3), n);
    tv1 = F.cmov(tv1, tv2, e1);
    tv2 = F.cmov(tv4, tv3, e2);
    const e3 = F.eql(F.sqr(tv2), n);
    const root = F.cmov(tv1, tv2, e3);
    assertIsSquare(F, root, n);
    return root;
  });
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp, n) {
    const F = Fp;
    if (F.is0(n))
      return n;
    if (FpLegendre(F, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = F.mul(F.ONE, cc);
    let t = F.pow(n, Q);
    let R = F.pow(n, Q1div2);
    while (!F.eql(t, F.ONE)) {
      if (F.is0(t))
        return F.ZERO;
      let i = 1;
      let t_tmp = F.sqr(t);
      while (!F.eql(t_tmp, F.ONE)) {
        i++;
        t_tmp = F.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M - i - 1);
      const b = F.pow(c, exponent);
      M = i;
      c = F.sqr(b);
      t = F.mul(t, c);
      R = F.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
var FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  validateObject(field, opts);
  asafenumber(field.BYTES, "BYTES");
  asafenumber(field.BITS, "BITS");
  if (field.BYTES < 1 || field.BITS < 1)
    throw new Error("invalid field: expected BYTES/BITS > 0");
  if (field.ORDER <= _1n2)
    throw new Error("invalid field: expected ORDER > 1, got " + field.ORDER);
  return field;
}
function FpPow(Fp, num, power) {
  const F = Fp;
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return F.ONE;
  if (power === _1n2)
    return num;
  let p = F.ONE;
  let d = num;
  while (power > _0n2) {
    if (power & _1n2)
      p = F.mul(p, d);
    d = F.sqr(d);
    power >>= _1n2;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const F = Fp;
  const inverted = new Array(nums.length).fill(passZero ? F.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = acc;
    return F.mul(acc, num);
  }, F.ONE);
  const invertedAcc = F.inv(multipliedAcc);
  nums.reduceRight((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = F.mul(acc, inverted[i]);
    return F.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const F = Fp;
  const p1mod2 = (F.ORDER - _1n2) / _2n;
  const powered = F.pow(n, p1mod2);
  const yes = F.eql(powered, F.ONE);
  const zero = F.eql(powered, F.ZERO);
  const no = F.eql(powered, F.neg(F.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber2(nBitLength);
  if (n <= _0n2)
    throw new Error("invalid n length: expected positive n, got " + n);
  if (nBitLength !== void 0 && nBitLength < 1)
    throw new Error("invalid n length: expected positive bit length, got " + nBitLength);
  const bits = bitLen(n);
  if (nBitLength !== void 0 && nBitLength < bits)
    throw new Error(`invalid n length: expected bit length (${bits}) >= n.length (${nBitLength})`);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : bits;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
var FIELD_SQRT = /* @__PURE__ */ new WeakMap();
var _Field = class {
  constructor(ORDER, opts = {}) {
    __publicField(this, "ORDER");
    __publicField(this, "BITS");
    __publicField(this, "BYTES");
    __publicField(this, "isLE");
    __publicField(this, "ZERO", _0n2);
    __publicField(this, "ONE", _1n2);
    __publicField(this, "_lengths");
    __publicField(this, "_mod");
    if (ORDER <= _1n2)
      throw new Error("invalid field: expected ORDER > 1, got " + ORDER);
    let _nbitLength = void 0;
    this.isLE = false;
    if (opts != null && typeof opts === "object") {
      if (typeof opts.BITS === "number")
        _nbitLength = opts.BITS;
      if (typeof opts.sqrt === "function")
        Object.defineProperty(this, "sqrt", { value: opts.sqrt, enumerable: true });
      if (typeof opts.isLE === "boolean")
        this.isLE = opts.isLE;
      if (opts.allowedLengths)
        this._lengths = Object.freeze(opts.allowedLengths.slice());
      if (typeof opts.modFromBytes === "boolean")
        this._mod = opts.modFromBytes;
    }
    const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
    if (nByteLength > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = ORDER;
    this.BITS = nBitLength;
    this.BYTES = nByteLength;
    Object.freeze(this);
  }
  create(num) {
    return mod(num, this.ORDER);
  }
  isValid(num) {
    if (typeof num !== "bigint")
      throw new TypeError("invalid field element: expected bigint, got " + typeof num);
    return _0n2 <= num && num < this.ORDER;
  }
  is0(num) {
    return num === _0n2;
  }
  // is valid and invertible
  isValidNot0(num) {
    return !this.is0(num) && this.isValid(num);
  }
  isOdd(num) {
    return (num & _1n2) === _1n2;
  }
  neg(num) {
    return mod(-num, this.ORDER);
  }
  eql(lhs, rhs) {
    return lhs === rhs;
  }
  sqr(num) {
    return mod(num * num, this.ORDER);
  }
  add(lhs, rhs) {
    return mod(lhs + rhs, this.ORDER);
  }
  sub(lhs, rhs) {
    return mod(lhs - rhs, this.ORDER);
  }
  mul(lhs, rhs) {
    return mod(lhs * rhs, this.ORDER);
  }
  pow(num, power) {
    return FpPow(this, num, power);
  }
  div(lhs, rhs) {
    return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(num) {
    return num * num;
  }
  addN(lhs, rhs) {
    return lhs + rhs;
  }
  subN(lhs, rhs) {
    return lhs - rhs;
  }
  mulN(lhs, rhs) {
    return lhs * rhs;
  }
  inv(num) {
    return invert(num, this.ORDER);
  }
  sqrt(num) {
    let sqrt = FIELD_SQRT.get(this);
    if (!sqrt)
      FIELD_SQRT.set(this, sqrt = FpSqrt(this.ORDER));
    return sqrt(this, num);
  }
  toBytes(num) {
    return this.isLE ? numberToBytesLE(num, this.BYTES) : numberToBytesBE(num, this.BYTES);
  }
  fromBytes(bytes, skipValidation = false) {
    abytes2(bytes);
    const { _lengths: allowedLengths, BYTES, isLE, ORDER, _mod: modFromBytes } = this;
    if (allowedLengths) {
      if (bytes.length < 1 || !allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
        throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
      }
      const padded = new Uint8Array(BYTES);
      padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
      bytes = padded;
    }
    if (bytes.length !== BYTES)
      throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
    let scalar = isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    if (modFromBytes)
      scalar = mod(scalar, ORDER);
    if (!skipValidation) {
      if (!this.isValid(scalar))
        throw new Error("invalid field element: outside of range 0..ORDER");
    }
    return scalar;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(lst) {
    return FpInvertBatch(this, lst);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(a, b, condition) {
    abool(condition, "condition");
    return condition ? b : a;
  }
};
Object.freeze(_Field.prototype);
function Field(ORDER, opts = {}) {
  return new _Field(ORDER, opts);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  if (fieldOrder <= _1n2)
    throw new Error("field order must be greater than 1");
  const bitLength = bitLen(fieldOrder - _1n2);
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE = false) {
  abytes2(key);
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = Math.max(getMinHashLength(fieldOrder), 16);
  if (len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num = isLE ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num, fieldOrder - _1n2) + _1n2;
  return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}

// node_modules/@noble/curves/abstract/curve.js
var _0n3 = /* @__PURE__ */ BigInt(0);
var _1n3 = /* @__PURE__ */ BigInt(1);
function negateCt(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ(c, points) {
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n3;
  }
  const offsetStart = window * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
var pointPrecomputes = /* @__PURE__ */ new WeakMap();
var pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
  if (n !== _0n3)
    throw new Error("invalid wNAF");
}
var wNAF = class {
  // Parametrized with a given Point class (not individual point)
  constructor(Point2, bits) {
    __publicField(this, "BASE");
    __publicField(this, "ZERO");
    __publicField(this, "Fn");
    __publicField(this, "bits");
    this.BASE = Point2.BASE;
    this.ZERO = Point2.ZERO;
    this.Fn = Point2.Fn;
    this.bits = bits;
  }
  // non-const time multiplication ladder
  _unsafeLadder(elm, n, p = this.ZERO) {
    let d = elm;
    while (n > _0n3) {
      if (n & _1n3)
        p = p.add(d);
      d = d.double();
      n >>= _1n3;
    }
    return p;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point - Point instance
   * @param W - window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(point, W) {
    const { windows, windowSize } = calcWOpts(W, this.bits);
    const points = [];
    let p = point;
    let base = p;
    for (let window = 0; window < windows; window++) {
      base = p;
      points.push(base);
      for (let i = 1; i < windowSize; i++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(W, precomputes, n) {
    if (!this.Fn.isValid(n))
      throw new Error("invalid scalar");
    let p = this.ZERO;
    let f = this.BASE;
    const wo = calcWOpts(W, this.bits);
    for (let window = 0; window < wo.windows; window++) {
      const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
      n = nextN;
      if (isZero) {
        f = f.add(negateCt(isNegF, precomputes[offsetF]));
      } else {
        p = p.add(negateCt(isNeg, precomputes[offset]));
      }
    }
    assert0(n);
    return { p, f };
  }
  /**
   * Implements unsafe EC multiplication using precomputed tables
   * and w-ary non-adjacent form.
   * @param acc - accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
    const wo = calcWOpts(W, this.bits);
    for (let window = 0; window < wo.windows; window++) {
      if (n === _0n3)
        break;
      const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
      n = nextN;
      if (isZero) {
        continue;
      } else {
        const item = precomputes[offset];
        acc = acc.add(isNeg ? item.negate() : item);
      }
    }
    assert0(n);
    return acc;
  }
  getPrecomputes(W, point, transform) {
    let comp = pointPrecomputes.get(point);
    if (!comp) {
      comp = this.precomputeWindow(point, W);
      if (W !== 1) {
        if (typeof transform === "function")
          comp = transform(comp);
        pointPrecomputes.set(point, comp);
      }
    }
    return comp;
  }
  cached(point, scalar, transform) {
    const W = getW(point);
    return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
  }
  unsafe(point, scalar, transform, prev) {
    const W = getW(point);
    if (W === 1)
      return this._unsafeLadder(point, scalar, prev);
    return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(P, W) {
    validateW(W, this.bits);
    pointWindowSizes.set(P, W);
    pointPrecomputes.delete(P);
  }
  hasCache(elm) {
    return getW(elm) !== 1;
  }
};
function mulEndoUnsafe(Point2, point, k1, k2) {
  let acc = point;
  let p1 = Point2.ZERO;
  let p2 = Point2.ZERO;
  while (k1 > _0n3 || k2 > _0n3) {
    if (k1 & _1n3)
      p1 = p1.add(acc);
    if (k2 & _1n3)
      p2 = p2.add(acc);
    acc = acc.double();
    k1 >>= _1n3;
    k2 >>= _1n3;
  }
  return { p1, p2 };
}
function createField(order, field, isLE) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn2 = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn: Fn2 };
}
function createKeygen(randomSecretKey, getPublicKey) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  };
}

// node_modules/@noble/hashes/hmac.js
var _HMAC = class {
  constructor(hash, key) {
    __publicField(this, "oHash");
    __publicField(this, "iHash");
    __publicField(this, "blockLen");
    __publicField(this, "outputLen");
    __publicField(this, "canXOF", false);
    __publicField(this, "finished", false);
    __publicField(this, "destroyed", false);
    ahash(hash);
    abytes(key, void 0, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    clean(pad);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const buf = out.subarray(0, this.outputLen);
    this.iHash.digestInto(buf);
    this.oHash.update(buf);
    this.oHash.digestInto(buf);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to || (to = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac = /* @__PURE__ */ (() => {
  const hmac_ = ((hash, key, message) => new _HMAC(hash, key).update(message).digest());
  hmac_.create = (hash, key) => new _HMAC(hash, key);
  return hmac_;
})();

// node_modules/@noble/curves/abstract/weierstrass.js
var divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n2) / den;
function _splitEndoScalar(k, basis, n) {
  aInRange("scalar", k, _0n4, n);
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest(b2 * k, n);
  const c2 = divNearest(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n4;
  const k2neg = k2 < _0n4;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
  if (k1 < _0n4 || k1 >= MAX_NUM || k2 < _0n4 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed for k");
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat(format) {
  if (!["compact", "recovered", "der"].includes(format))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format;
}
function validateSigOpts(opts, def) {
  validateObject(opts);
  const optsn = {};
  for (let optName of Object.keys(def)) {
    optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
  }
  abool(optsn.lowS, "lowS");
  abool(optsn.prehash, "prehash");
  if (optsn.format !== void 0)
    validateSigFormat(optsn.format);
  return optsn;
}
var DERErr = class extends Error {
  constructor(m = "") {
    super(m);
  }
};
var DER = {
  // asn.1 DER encoding utils
  Err: DERErr,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (tag, data) => {
      const { Err: E } = DER;
      asafenumber(tag, "tag");
      if (tag < 0 || tag > 255)
        throw new E("tlv.encode: wrong tag");
      if (typeof data !== "string")
        throw new TypeError('"data" expected string, got type=' + typeof data);
      if (data.length & 1)
        throw new E("tlv.encode: unpadded data");
      const dataLen = data.length / 2;
      const len = numberToHexUnpadded(dataLen);
      if (len.length / 2 & 128)
        throw new E("tlv.encode: long form length too big");
      const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
      const t = numberToHexUnpadded(tag);
      return t + lenLen + len + data;
    },
    // v - value, l - left bytes (unparsed)
    decode(tag, data) {
      const { Err: E } = DER;
      data = abytes2(data, void 0, "DER data");
      let pos = 0;
      if (tag < 0 || tag > 255)
        throw new E("tlv.encode: wrong tag");
      if (data.length < 2 || data[pos++] !== tag)
        throw new E("tlv.decode: wrong tlv");
      const first = data[pos++];
      const isLong = !!(first & 128);
      let length = 0;
      if (!isLong)
        length = first;
      else {
        const lenLen = first & 127;
        if (!lenLen)
          throw new E("tlv.decode(long): indefinite length not supported");
        if (lenLen > 4)
          throw new E("tlv.decode(long): byte length is too big");
        const lengthBytes = data.subarray(pos, pos + lenLen);
        if (lengthBytes.length !== lenLen)
          throw new E("tlv.decode: length bytes not complete");
        if (lengthBytes[0] === 0)
          throw new E("tlv.decode(long): zero leftmost byte");
        for (const b of lengthBytes)
          length = length << 8 | b;
        pos += lenLen;
        if (length < 128)
          throw new E("tlv.decode(long): not minimal encoding");
      }
      const v = data.subarray(pos, pos + length);
      if (v.length !== length)
        throw new E("tlv.decode: wrong value length");
      return { v, l: data.subarray(pos + length) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(num) {
      const { Err: E } = DER;
      abignumber(num);
      if (num < _0n4)
        throw new E("integer: negative integers are not allowed");
      let hex = numberToHexUnpadded(num);
      if (Number.parseInt(hex[0], 16) & 8)
        hex = "00" + hex;
      if (hex.length & 1)
        throw new E("unexpected DER parsing assertion: unpadded hex");
      return hex;
    },
    decode(data) {
      const { Err: E } = DER;
      if (data.length < 1)
        throw new E("invalid signature integer: empty");
      if (data[0] & 128)
        throw new E("invalid signature integer: negative");
      if (data.length > 1 && data[0] === 0 && !(data[1] & 128))
        throw new E("invalid signature integer: unnecessary leading zero");
      return bytesToNumberBE(data);
    }
  },
  toSig(bytes) {
    const { Err: E, _int: int, _tlv: tlv } = DER;
    const data = abytes2(bytes, void 0, "signature");
    const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
    if (seqLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
    const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
    if (sLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    return { r: int.decode(rBytes), s: int.decode(sBytes) };
  },
  hexFromSig(sig) {
    const { _tlv: tlv, _int: int } = DER;
    const rs = tlv.encode(2, int.encode(sig.r));
    const ss = tlv.encode(2, int.encode(sig.s));
    const seq = rs + ss;
    return tlv.encode(48, seq);
  }
};
Object.freeze(DER._tlv);
Object.freeze(DER._int);
Object.freeze(DER);
var _0n4 = /* @__PURE__ */ BigInt(0);
var _1n4 = /* @__PURE__ */ BigInt(1);
var _2n2 = /* @__PURE__ */ BigInt(2);
var _3n2 = /* @__PURE__ */ BigInt(3);
var _4n2 = /* @__PURE__ */ BigInt(4);
function weierstrass(params, extraOpts = {}) {
  const validated = createCurveFields("weierstrass", params, extraOpts);
  const Fp = validated.Fp;
  const Fn2 = validated.Fn;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object"
  });
  const { endo, allowInfinityPoint } = extraOpts;
  if (endo) {
    if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const lengths = getWLengths(Fp, Fn2);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes(_c, point, isCompressed) {
    if (allowInfinityPoint && point.is0())
      return Uint8Array.of(0);
    const { x, y } = point.toAffine();
    const bx = Fp.toBytes(x);
    abool(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes2(pprefix(hasEvenY), bx);
    } else {
      return concatBytes2(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    abytes2(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (allowInfinityPoint && length === 1 && head === 0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (length === comp && (head === 2 || head === 3)) {
      const x = Fp.fromBytes(tail);
      if (!Fp.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const evenY = Fp.isOdd(y);
      const evenH = (head & 1) === 1;
      if (evenH !== evenY)
        y = Fp.neg(y);
      return { x, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes === void 0 ? pointToBytes : extraOpts.toBytes;
  const decodePoint = extraOpts.fromBytes === void 0 ? pointFromBytes : extraOpts.fromBytes;
  function weierstrassEquation(x) {
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point2))
      throw new Error("Weierstrass Point expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k, endo.basises, Fn2.ORDER);
  }
  function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
    k2p = new Point2(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
    k1p = negateCt(k1neg, k1p);
    k2p = negateCt(k2neg, k2p);
    return k1p.add(k2p);
  }
  const _Point = class _Point {
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      __publicField(this, "X");
      __publicField(this, "Y");
      __publicField(this, "Z");
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof _Point)
        throw new Error("projective point not allowed");
      if (Fp.is0(x) && Fp.is0(y))
        return _Point.ZERO;
      return new _Point(x, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = _Point.fromAffine(decodePoint(abytes2(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex) {
      return _Point.fromBytes(hexToBytes3(hex));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy - true will defer table computation until the first multiplication
     * @returns
     */
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_3n2);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      const p = this;
      if (p.is0()) {
        if (extraOpts.allowInfinityPoint && Fp.is0(p.X) && Fp.eql(p.Y, Fp.ONE) && Fp.is0(p.Z))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not field elements");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new _Point(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new _Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new _Point(X3, Y3, Z3);
    }
    subtract(other) {
      aprjpoint(other);
      return this.add(other.negate());
    }
    is0() {
      return this.equals(_Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar - by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2 } = extraOpts;
      if (!Fn2.isValidNot0(scalar))
        throw new RangeError("invalid scalar: out of range");
      let point, fake;
      const mul = (n) => wnaf.cached(this, n, (p) => normalizeZ(_Point, p));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul(k1);
        const { p: k2p, f: k2f } = mul(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p, f } = mul(scalar);
        point = p;
        fake = f;
      }
      return normalizeZ(_Point, [point, fake])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(scalar) {
      const { endo: endo2 } = extraOpts;
      const p = this;
      const sc = scalar;
      if (!Fn2.isValid(sc))
        throw new RangeError("invalid scalar: out of range");
      if (sc === _0n4 || p.is0())
        return _Point.ZERO;
      if (sc === _1n4)
        return p;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2 } = mulEndoUnsafe(_Point, p, k1, k2);
        return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p, sc);
      }
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * (X, Y, Z) ∋ (x=X/Z, y=Y/Z).
     * @param invertedZ - Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      const p = this;
      let iz = invertedZ;
      const { X, Y, Z } = p;
      if (Fp.eql(Z, Fp.ONE))
        return { x: X, y: Y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(Z);
      const x = Fp.mul(X, iz);
      const y = Fp.mul(Y, iz);
      const zz = Fp.mul(Z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree } = extraOpts;
      if (cofactor === _1n4)
        return true;
      if (isTorsionFree)
        return isTorsionFree(_Point, this);
      return wnaf.unsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      const { clearCofactor } = extraOpts;
      if (cofactor === _1n4)
        return this;
      if (clearCofactor)
        return clearCofactor(_Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      if (cofactor === _1n4)
        return this.is0();
      return this.clearCofactor().is0();
    }
    toBytes(isCompressed = true) {
      abool(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(_Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex3(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  };
  // base / generator point
  __publicField(_Point, "BASE", new _Point(CURVE.Gx, CURVE.Gy, Fp.ONE));
  // zero / infinity / identity point
  __publicField(_Point, "ZERO", new _Point(Fp.ZERO, Fp.ONE, Fp.ZERO));
  // 0, 1, 0
  // math field
  __publicField(_Point, "Fp", Fp);
  // scalar field
  __publicField(_Point, "Fn", Fn2);
  let Point2 = _Point;
  const bits = Fn2.BITS;
  const wnaf = new wNAF(Point2, extraOpts.endo ? Math.ceil(bits / 2) : bits);
  if (bits >= 8)
    Point2.BASE.precompute(8);
  Object.freeze(Point2.prototype);
  Object.freeze(Point2);
  return Point2;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function getWLengths(Fp, Fn2) {
  return {
    secretKey: Fn2.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    // Raw compact `(r || s)` signature width; DER and recovered signatures use
    // different lengths outside this helper.
    signature: 2 * Fn2.BYTES
  };
}
function ecdh(Point2, ecdhOpts = {}) {
  const { Fn: Fn2 } = Point2;
  const randomBytes_ = ecdhOpts.randomBytes === void 0 ? randomBytes2 : ecdhOpts.randomBytes;
  const lengths = Object.assign(getWLengths(Point2.Fp, Fn2), {
    seed: Math.max(getMinHashLength(Fn2.ORDER), 16)
  });
  function isValidSecretKey(secretKey) {
    try {
      const num = Fn2.fromBytes(secretKey);
      return Fn2.isValidNot0(num);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !!Point2.fromBytes(publicKey);
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed) {
    seed = seed === void 0 ? randomBytes_(lengths.seed) : seed;
    return mapHashToField(abytes2(seed, lengths.seed, "seed"), Fn2.ORDER);
  }
  function getPublicKey(secretKey, isCompressed = true) {
    return Point2.BASE.multiply(Fn2.fromBytes(secretKey)).toBytes(isCompressed);
  }
  function isProbPub(item) {
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    const allowedLengths = Fn2._lengths;
    if (!isBytes2(item))
      return void 0;
    const l = abytes2(item, void 0, "key").length;
    const isPub = l === publicKey || l === publicKeyUncompressed;
    const isSec = l === secretKey || !!allowedLengths?.includes(l);
    if (isPub && isSec)
      return void 0;
    return isPub;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = Fn2.fromBytes(secretKeyA);
    const b = Point2.fromBytes(publicKeyB);
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey
  };
  const keygen = createKeygen(randomSecretKey, getPublicKey);
  Object.freeze(utils);
  Object.freeze(lengths);
  return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point: Point2, utils, lengths });
}
function ecdsa(Point2, hash, ecdsaOpts = {}) {
  const hash_ = hash;
  ahash(hash_);
  validateObject(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  ecdsaOpts = Object.assign({}, ecdsaOpts);
  const randomBytes3 = ecdsaOpts.randomBytes === void 0 ? randomBytes2 : ecdsaOpts.randomBytes;
  const hmac2 = ecdsaOpts.hmac === void 0 ? (key, msg) => hmac(hash_, key, msg) : ecdsaOpts.hmac;
  const { Fp, Fn: Fn2 } = Point2;
  const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn2;
  const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point2, ecdsaOpts);
  const defaultSigOpts = {
    prehash: true,
    lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : true,
    format: "compact",
    extraEntropy: false
  };
  const hasLargeRecoveryLifts = CURVE_ORDER * _2n2 + _1n4 < Fp.ORDER;
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n4;
    return number > HALF;
  }
  function validateRS(title, num) {
    if (!Fn2.isValidNot0(num))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num;
  }
  function assertRecoverableCurve() {
    if (hasLargeRecoveryLifts)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function validateSigLength(bytes, format) {
    validateSigFormat(format);
    const size = lengths.signature;
    const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
    return abytes2(bytes, sizer);
  }
  class Signature {
    constructor(r, s, recovery) {
      __publicField(this, "r");
      __publicField(this, "s");
      __publicField(this, "recovery");
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null) {
        assertRecoverableCurve();
        if (![0, 1, 2, 3].includes(recovery))
          throw new Error("invalid recovery id");
        this.recovery = recovery;
      }
      Object.freeze(this);
    }
    static fromBytes(bytes, format = defaultSigOpts.format) {
      validateSigLength(bytes, format);
      let recid;
      if (format === "der") {
        const { r: r2, s: s2 } = DER.toSig(abytes2(bytes));
        return new Signature(r2, s2);
      }
      if (format === "recovered") {
        recid = bytes[0];
        format = "compact";
        bytes = bytes.subarray(1);
      }
      const L = lengths.signature / 2;
      const r = bytes.subarray(0, L);
      const s = bytes.subarray(L, L * 2);
      return new Signature(Fn2.fromBytes(r), Fn2.fromBytes(s), recid);
    }
    static fromHex(hex, format) {
      return this.fromBytes(hexToBytes3(hex), format);
    }
    assertRecovery() {
      const { recovery } = this;
      if (recovery == null)
        throw new Error("invalid recovery id: must be present");
      return recovery;
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    // Unlike the top-level helper below, this method expects a digest that has
    // already been hashed to the curve's message representative.
    recoverPublicKey(messageHash) {
      const { r, s } = this;
      const recovery = this.assertRecovery();
      const radj = recovery === 2 || recovery === 3 ? r + CURVE_ORDER : r;
      if (!Fp.isValid(radj))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const x = Fp.toBytes(radj);
      const R = Point2.fromBytes(concatBytes2(pprefix((recovery & 1) === 0), x));
      const ir = Fn2.inv(radj);
      const h = bits2int_modN(abytes2(messageHash, void 0, "msgHash"));
      const u1 = Fn2.create(-h * ir);
      const u2 = Fn2.create(s * ir);
      const Q = Point2.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
      if (Q.is0())
        throw new Error("invalid recovery: point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format = defaultSigOpts.format) {
      validateSigFormat(format);
      if (format === "der")
        return hexToBytes3(DER.hexFromSig(this));
      const { r, s } = this;
      const rb = Fn2.toBytes(r);
      const sb = Fn2.toBytes(s);
      if (format === "recovered") {
        assertRecoverableCurve();
        return concatBytes2(Uint8Array.of(this.assertRecovery()), rb, sb);
      }
      return concatBytes2(rb, sb);
    }
    toHex(format) {
      return bytesToHex3(this.toBytes(format));
    }
  }
  Object.freeze(Signature.prototype);
  Object.freeze(Signature);
  const bits2int = ecdsaOpts.bits2int === void 0 ? function bits2int_def(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - fnBits;
    return delta > 0 ? num >> BigInt(delta) : num;
  } : ecdsaOpts.bits2int;
  const bits2int_modN = ecdsaOpts.bits2int_modN === void 0 ? function bits2int_modN_def(bytes) {
    return Fn2.create(bits2int(bytes));
  } : ecdsaOpts.bits2int_modN;
  const ORDER_MASK = bitMask(fnBits);
  function int2octets(num) {
    aInRange("num < 2^" + fnBits, num, _0n4, ORDER_MASK);
    return Fn2.toBytes(num);
  }
  function validateMsgAndHash(message, prehash) {
    abytes2(message, void 0, "message");
    return prehash ? abytes2(hash_(message), void 0, "prehashed message") : message;
  }
  function prepSig(message, secretKey, opts) {
    const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d = Fn2.fromBytes(secretKey);
    if (!Fn2.isValidNot0(d))
      throw new Error("invalid private key");
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes3(lengths.secretKey) : extraEntropy;
      seedArgs.push(abytes2(e, void 0, "extraEntropy"));
    }
    const seed = concatBytes2(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn2.isValidNot0(k))
        return;
      const ik = Fn2.inv(k);
      const q = Point2.BASE.multiply(k).toAffine();
      const r = Fn2.create(q.x);
      if (r === _0n4)
        return;
      const s = Fn2.create(ik * Fn2.create(m + r * d));
      if (s === _0n4)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n4);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn2.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, hasLargeRecoveryLifts ? void 0 : recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts = {}) {
    const { seed, k2sig } = prepSig(message, secretKey, opts);
    const drbg = createHmacDrbg(hash_.outputLen, Fn2.BYTES, hmac2);
    const sig = drbg(seed, k2sig);
    return sig.toBytes(opts.format);
  }
  function verify(signature, message, publicKey, opts = {}) {
    const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
    publicKey = abytes2(publicKey, void 0, "publicKey");
    message = validateMsgAndHash(message, prehash);
    if (!isBytes2(signature)) {
      const end = signature instanceof Signature ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + end);
    }
    validateSigLength(signature, format);
    try {
      const sig = Signature.fromBytes(signature, format);
      const P = Point2.fromBytes(publicKey);
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is = Fn2.inv(s);
      const u1 = Fn2.create(h * is);
      const u2 = Fn2.create(r * is);
      const R = Point2.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
      if (R.is0())
        return false;
      const v = Fn2.create(R.x);
      return v === r;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature, message, opts = {}) {
    const { prehash } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey,
    getSharedSecret,
    utils,
    lengths,
    Point: Point2,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash: hash_
  });
}

// node_modules/@noble/curves/secp256k1.js
var secp256k1_CURVE = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};
var secp256k1_ENDO = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
};
var _2n3 = /* @__PURE__ */ BigInt(2);
function sqrtMod(y) {
  const P = secp256k1_CURVE.p;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n3, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n3, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var Fpk1 = Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
var Pointk1 = /* @__PURE__ */ weierstrass(secp256k1_CURVE, {
  Fp: Fpk1,
  endo: secp256k1_ENDO
});
var secp256k1 = /* @__PURE__ */ ecdsa(Pointk1, sha256);

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
  convert(ripemd1603) {
    let binary = "";
    let hexadecimal = typeof ripemd1603 == "string" ? hexToBytes2(ripemd1603) : ripemd1603;
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
    let sha2 = sha2562(hexToBytes2(this.publicKey));
    let ripemd = ripemd1602(sha2);
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
    var mod2 = this.polymod(values) ^ this.getEncodingConst(this.encoding);
    var ret = [];
    for (var p = 0; p < 6; ++p) {
      ret.push(mod2 >> 5 * (5 - p) & 31);
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
    return bytesToHex2(int8array);
  }
};

// node_modules/@scure/base/index.js
function isBytes3(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function isArrayOf(isString, arr) {
  if (!Array.isArray(arr))
    return false;
  if (arr.length === 0)
    return true;
  if (isString) {
    return arr.every((item) => typeof item === "string");
  } else {
    return arr.every((item) => Number.isSafeInteger(item));
  }
}
function afn(input) {
  if (typeof input !== "function")
    throw new TypeError("function expected");
  return true;
}
function astr(label, input) {
  if (typeof input !== "string")
    throw new TypeError(`${label}: string expected`);
  return true;
}
function anumber3(n) {
  if (typeof n !== "number")
    throw new TypeError(`number expected, got ${typeof n}`);
  if (!Number.isSafeInteger(n))
    throw new RangeError(`invalid integer: ${n}`);
}
function aArr(input) {
  if (!Array.isArray(input))
    throw new TypeError("array expected");
}
function astrArr(label, input) {
  if (!isArrayOf(true, input))
    throw new TypeError(`${label}: array of strings expected`);
}
function anumArr(label, input) {
  if (!isArrayOf(false, input))
    throw new TypeError(`${label}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function chain(...args) {
  const id = (a) => a;
  const wrap = (a, b) => (c) => a(b(c));
  const encode = args.map((x) => x.encode).reduceRight(wrap, id);
  const decode = args.map((x) => x.decode).reduce(wrap, id);
  return { encode, decode };
}
// @__NO_SIDE_EFFECTS__
function alphabet(letters) {
  const lettersA = typeof letters === "string" ? letters.split("") : letters;
  const len = lettersA.length;
  astrArr("alphabet", lettersA);
  const indexes = new Map(lettersA.map((l, i) => [l, i]));
  return {
    encode: (digits) => {
      aArr(digits);
      return digits.map((i) => {
        if (!Number.isSafeInteger(i) || i < 0 || i >= len)
          throw new Error(`alphabet.encode: digit index outside alphabet "${i}". Allowed: ${letters}`);
        return lettersA[i];
      });
    },
    decode: (input) => {
      aArr(input);
      return input.map((letter) => {
        astr("alphabet.decode", letter);
        const i = indexes.get(letter);
        if (i === void 0)
          throw new Error(`Unknown letter: "${letter}". Allowed: ${letters}`);
        return i;
      });
    }
  };
}
// @__NO_SIDE_EFFECTS__
function join(separator = "") {
  astr("join", separator);
  return {
    encode: (from) => {
      astrArr("join.decode", from);
      return from.join(separator);
    },
    decode: (to) => {
      astr("join.decode", to);
      return to.split(separator);
    }
  };
}
function convertRadix(data, from, to) {
  if (from < 2)
    throw new RangeError(`convertRadix: invalid from=${from}, base cannot be less than 2`);
  if (to < 2)
    throw new RangeError(`convertRadix: invalid to=${to}, base cannot be less than 2`);
  aArr(data);
  if (!data.length)
    return [];
  let pos = 0;
  const res = [];
  const digits = Array.from(data, (d) => {
    anumber3(d);
    if (d < 0 || d >= from)
      throw new Error(`invalid integer: ${d}`);
    return d;
  });
  const dlen = digits.length;
  while (true) {
    let carry = 0;
    let done = true;
    for (let i = pos; i < dlen; i++) {
      const digit = digits[i];
      const fromCarry = from * carry;
      const digitBase = fromCarry + digit;
      if (!Number.isSafeInteger(digitBase) || fromCarry / from !== carry || digitBase - digit !== fromCarry) {
        throw new Error("convertRadix: carry overflow");
      }
      const div = digitBase / to;
      carry = digitBase % to;
      const rounded = Math.floor(div);
      digits[i] = rounded;
      if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase)
        throw new Error("convertRadix: carry overflow");
      if (!done)
        continue;
      else if (!rounded)
        pos = i;
      else
        done = false;
    }
    res.push(carry);
    if (done)
      break;
  }
  for (let i = 0; i < data.length - 1 && data[i] === 0; i++)
    res.push(0);
  return res.reverse();
}
// @__NO_SIDE_EFFECTS__
function radix(num) {
  anumber3(num);
  const _256 = 2 ** 8;
  return {
    encode: (bytes) => {
      if (!isBytes3(bytes))
        throw new TypeError("radix.encode input should be Uint8Array");
      return convertRadix(Array.from(bytes), _256, num);
    },
    decode: (digits) => {
      anumArr("radix.decode", digits);
      return Uint8Array.from(convertRadix(digits, num, _256));
    }
  };
}
function checksum2(len, fn) {
  anumber3(len);
  if (len <= 0)
    throw new RangeError(`checksum length must be positive: ${len}`);
  afn(fn);
  const _fn = fn;
  return {
    encode(data) {
      if (!isBytes3(data))
        throw new TypeError("checksum.encode: input should be Uint8Array");
      const sum = _fn(data).slice(0, len);
      const res = new Uint8Array(data.length + len);
      res.set(data);
      res.set(sum, data.length);
      return res;
    },
    decode(data) {
      if (!isBytes3(data))
        throw new TypeError("checksum.decode: input should be Uint8Array");
      const payload = data.slice(0, -len);
      const oldChecksum = data.slice(-len);
      const newChecksum = _fn(payload).slice(0, len);
      for (let i = 0; i < len; i++)
        if (newChecksum[i] !== oldChecksum[i])
          throw new Error("Invalid checksum");
      return payload;
    }
  };
}
var genBase58 = /* @__NO_SIDE_EFFECTS__ */ (abc) => /* @__PURE__ */ chain(/* @__PURE__ */ radix(58), /* @__PURE__ */ alphabet(abc), /* @__PURE__ */ join(""));
var base58 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"));
var createBase58check = (sha2563) => {
  afn(sha2563);
  const _sha256 = sha2563;
  return /* @__PURE__ */ chain(checksum2(4, (data) => _sha256(_sha256(data))), base58);
};

// src/utils/txutils.ts
var import_bech32 = __toESM(require_dist());
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
    const data = import_bech32.bech32.decode(address);
    if (network) {
      const expectedHrp = network === "mainnet" ? "bc" : "tb";
      if (data.prefix !== expectedHrp)
        throw new Error(`Address network mismatch, expected a ${network} address`);
    }
    const [version, ...programWords] = data.words;
    if (version !== 0)
      throw new Error("Unsupported witness version, only version 0 (P2WPKH/P2WSH) is supported");
    const hash = new Uint8Array(import_bech32.bech32.fromWords(programWords));
    if (hash.length !== 20 && hash.length !== 32)
      throw new Error("Invalid witness program length, expected 20 (P2WPKH) or 32 (P2WSH) bytes");
    const prefixScript = new Uint8Array([OP_CODES.OP_0, hash.length]);
    return mergeUint8Arrays(prefixScript, hash);
  }
  throw new Error("not supported format address or type of transaction");
}
function scriptPubkeyToScriptCode(script) {
  const scriptPubkey = hexToBytes2(script);
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
      builder.append(ripemd1602(hexToBytes2(pubkey), true));
      let checkHash = checksum(builder.raw());
      builder.append(checkHash);
      return base58.encode(builder.raw());
    }
  }
  static fromHash({ ripemd160: ripemd1603, type = "p2wpkh", network = "mainnet" }) {
    if (getBytesCount(ripemd1603) != 20)
      throw new Error("Invalid hash ripemd160");
    if (type === "p2wpkh") {
      let bech322 = new Bech32({ network });
      let complete = bech322.convert(ripemd1603);
      return bech322.encode(complete);
    } else {
      let builder = new ByteBuffer(numberToHex(this.addressPrefix[network], 8));
      builder.append(hexToBytes2(ripemd1603));
      let checkHash = checksum(builder.raw());
      builder.append(checkHash);
      return base58.encode(builder.raw());
    }
  }
  static getScriptPubkey(address) {
    return bytesToHex2(addressToScriptPubKey(address));
  }
  static getRipemd160(address) {
    let script = addressToScriptPubKey(address);
    if (script[1] == 20 || script[1] == 32)
      return bytesToHex2(script.slice(2));
    if (script[0] == 118)
      return bytesToHex2(script.slice(3, -2));
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
    return base58.encode(privateWif);
  }
  /**
  * Returns the address associated with the compressed public key.
  * @param type Type of address to generate (p2pkh, p2wpkh, etc).
  */
  getAddress(type = this.type) {
    let pubkey = bytesToHex2(this.getPublicKey());
    return Address.fromPubkey({ pubkey, type, network: this.network });
  }
  /**
  * Creates a key pair from a WIF string.
  * @param wif Wallet Import Format string.
  * @param options Optional network override.
  */
  static fromWif(wif) {
    const decoded = base58.decode(wif);
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
    return new _ECPairKey({ privateKey: hexToBytes2(privateKey), network });
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
    return bytesToHex2(this.privateKey);
  }
  getPublicKeyHex() {
    return bytesToHex2(this.getPublicKey());
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
    const bytes = hexToBytes2(input.scriptPubKey);
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
      hexTransaction.append(hexToBytes2(input.txid).reverse());
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
      hexTransaction.append(hexToBytes2(input.sequence ?? "fffffffd").reverse());
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
      hexTransaction.append(hexToBytes2(txin.txid).reverse());
      hexTransaction.append(numberToHexLE(txin.vout, 32));
      if (txin.txid === input.txid && txin.vout === input.vout) {
        let script = hexToBytes2(txin.scriptPubKey);
        hexTransaction.append(numberToVarint(script.length));
        hexTransaction.append(script);
      } else
        hexTransaction.append(new Uint8Array([0]));
      hexTransaction.append(hexToBytes2(txin.sequence ?? "fffffffd").reverse());
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
      let build = new ByteBuffer(hexToBytes2(input2.txid).reverse());
      build.append(numberToHexLE(input2.vout, 32));
      return build.raw();
    });
    let hashPrevouts = hash256(ByteBuffer.merge(prevouts));
    hexTransaction.append(hashPrevouts);
    let sequence = inputs.map((input2) => hexToBytes2(input2.sequence ?? "fffffffd").reverse());
    let hashSequence = hash256(ByteBuffer.merge(sequence));
    hexTransaction.append(hashSequence);
    hexTransaction.append(hexToBytes2(input.txid).reverse());
    hexTransaction.append(numberToHexLE(input.vout, 32));
    let scriptCode = scriptPubkeyToScriptCode(input.scriptPubKey);
    hexTransaction.append(scriptCode);
    hexTransaction.append(numberToHexLE(input.value, 64));
    hexTransaction.append(hexToBytes2(input.sequence ?? "fffffffd").reverse());
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
    const bytes = hexToBytes2(scriptPubKey);
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
      input.scriptPubKey = bytesToHex2(addressToScriptPubKey(this.pairKey.getAddress()));
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
    return bytesToHex2(txid);
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
    return bytesToHex2(this.cachedata.get("txraw"));
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

// node_modules/@scure/bip32/index.js
var Point = /* @__PURE__ */ (() => secp256k1.Point)();
var Fn = /* @__PURE__ */ (() => Point.Fn)();
var base58check = /* @__PURE__ */ createBase58check(sha256);
var MASTER_SECRET = /* @__PURE__ */ (() => {
  return Uint8Array.from("Bitcoin seed".split(""), (char) => char.charCodeAt(0));
})();
var BITCOIN_VERSIONS = { private: 76066276, public: 76067358 };
var HARDENED_OFFSET = 2147483648;
var hash160 = (data) => ripemd160(sha256(data));
var fromU32 = (data) => createView(data).getUint32(0, false);
var toU32 = (n) => {
  if (typeof n !== "number")
    throw new TypeError("invalid number, should be from 0 to 2**32-1, got " + n);
  if (!Number.isSafeInteger(n) || n < 0 || n > 2 ** 32 - 1)
    throw new RangeError("invalid number, should be from 0 to 2**32-1, got " + n);
  const buf = new Uint8Array(4);
  createView(buf).setUint32(0, n, false);
  return buf;
};
var HDKey = class _HDKey {
  constructor(opt) {
    __publicField(this, "versions");
    __publicField(this, "depth", 0);
    __publicField(this, "index", 0);
    __publicField(this, "chainCode", null);
    __publicField(this, "parentFingerprint", 0);
    __publicField(this, "_privateKey");
    __publicField(this, "_publicKey");
    __publicField(this, "pubHash");
    if (!opt || typeof opt !== "object") {
      throw new Error("HDKey.constructor must not be called directly");
    }
    this.versions = opt.versions || BITCOIN_VERSIONS;
    this.depth = opt.depth || 0;
    this.chainCode = opt.chainCode ? Uint8Array.from(opt.chainCode) : null;
    this.index = opt.index || 0;
    this.parentFingerprint = opt.parentFingerprint || 0;
    if (!this.depth) {
      if (this.parentFingerprint || this.index) {
        throw new Error("HDKey: zero depth with non-zero index/parent fingerprint");
      }
    }
    if (this.depth > 255) {
      throw new Error("HDKey: depth exceeds the serializable value 255");
    }
    if (opt.publicKey && opt.privateKey) {
      throw new Error("HDKey: publicKey and privateKey at same time.");
    }
    if (opt.privateKey) {
      if (!secp256k1.utils.isValidSecretKey(opt.privateKey))
        throw new Error("Invalid private key");
      this._privateKey = Uint8Array.from(opt.privateKey);
      this._publicKey = secp256k1.getPublicKey(this._privateKey, true);
    } else if (opt.publicKey) {
      this._publicKey = Point.fromBytes(opt.publicKey).toBytes(true);
    } else {
      throw new Error("HDKey: no public or private key provided");
    }
    this.pubHash = hash160(this._publicKey);
  }
  get fingerprint() {
    if (!this.pubHash) {
      throw new Error("No publicKey set!");
    }
    return fromU32(this.pubHash);
  }
  get identifier() {
    return this.pubHash;
  }
  get pubKeyHash() {
    return this.pubHash;
  }
  // Returns the live private key buffer for this instance.
  // Copy it first if you need an immutable snapshot.
  get privateKey() {
    return this._privateKey || null;
  }
  get publicKey() {
    return this._publicKey || null;
  }
  get privateExtendedKey() {
    const priv = this._privateKey;
    if (!priv) {
      throw new Error("No private key");
    }
    return base58check.encode(this.serialize(this.versions.private, concatBytes(Uint8Array.of(0), priv)));
  }
  get publicExtendedKey() {
    if (!this._publicKey) {
      throw new Error("No public key");
    }
    return base58check.encode(this.serialize(this.versions.public, this._publicKey));
  }
  static fromMasterSeed(seed, versions = BITCOIN_VERSIONS) {
    abytes(seed);
    if (8 * seed.length < 128 || 8 * seed.length > 512) {
      throw new RangeError("HDKey: seed length must be between 128 and 512 bits; 256 bits is advised, got " + seed.length);
    }
    const I = hmac(sha512, MASTER_SECRET, seed);
    const privateKey = I.slice(0, 32);
    const chainCode = I.slice(32);
    return new _HDKey({ versions, chainCode, privateKey });
  }
  static fromExtendedKey(base58key, versions = BITCOIN_VERSIONS) {
    const keyBuffer = base58check.decode(base58key);
    const keyView = createView(keyBuffer);
    const version = keyView.getUint32(0, false);
    const opt = {
      versions,
      depth: keyBuffer[4],
      parentFingerprint: keyView.getUint32(5, false),
      index: keyView.getUint32(9, false),
      chainCode: keyBuffer.slice(13, 45)
    };
    const key = keyBuffer.slice(45);
    const isPriv = key[0] === 0;
    if (version !== versions[isPriv ? "private" : "public"]) {
      throw new Error("Version mismatch");
    }
    if (isPriv) {
      return new _HDKey({ ...opt, privateKey: key.slice(1) });
    } else {
      return new _HDKey({ ...opt, publicKey: key });
    }
  }
  static fromJSON(json) {
    return _HDKey.fromExtendedKey(json.xpriv);
  }
  derive(path) {
    if (!/^[mM]'?/.test(path)) {
      throw new Error('Path must start with "m" or "M"');
    }
    if (/^[mM]'?$/.test(path)) {
      return this;
    }
    const parts = path.replace(/^[mM]'?\//, "").split("/");
    let child = this;
    for (const c of parts) {
      const m = /^(\d+)('?)$/.exec(c);
      const m1 = m && m[1];
      if (!m || m.length !== 3 || typeof m1 !== "string")
        throw new Error("invalid child index: " + c);
      let idx = +m1;
      if (!Number.isSafeInteger(idx) || idx >= HARDENED_OFFSET) {
        throw new Error("Invalid index");
      }
      if (m[2] === "'") {
        idx += HARDENED_OFFSET;
      }
      child = child.deriveChild(idx);
    }
    return child;
  }
  /**
   * @param _I - Test-only override for the 64-byte HMAC-SHA512 output; normal callers must omit it.
   */
  deriveChild(index, _I) {
    if (!this._publicKey || !this.chainCode) {
      throw new Error("No publicKey or chainCode set");
    }
    let data = toU32(index);
    if (index >= HARDENED_OFFSET) {
      const priv = this._privateKey;
      if (!priv) {
        throw new Error("Could not derive hardened child key");
      }
      data = concatBytes(Uint8Array.of(0), priv, data);
    } else {
      data = concatBytes(this._publicKey, data);
    }
    const out = _I || hmac(sha512, this.chainCode, data);
    abytes(out, 64);
    const childTweak = out.slice(0, 32);
    const chainCode = out.slice(32);
    const opt = {
      versions: this.versions,
      chainCode,
      depth: this.depth + 1,
      parentFingerprint: this.fingerprint,
      index
    };
    if (opt.depth > 255) {
      throw new Error("HDKey: depth exceeds the serializable value 255");
    }
    try {
      const ctweak = Fn.fromBytes(childTweak);
      if (this._privateKey) {
        const added = Fn.create(Fn.fromBytes(this._privateKey) + ctweak);
        if (!Fn.isValidNot0(added)) {
          throw new Error("The tweak was out of range or the resulted private key is invalid");
        }
        opt.privateKey = Fn.toBytes(added);
      } else {
        const point = Point.fromBytes(this._publicKey);
        const added = ctweak === 0n ? point : point.add(Point.BASE.multiply(ctweak));
        if (added.equals(Point.ZERO)) {
          throw new Error("The tweak was equal to negative P, which made the result key invalid");
        }
        opt.publicKey = added.toBytes(true);
      }
      return new _HDKey(opt);
    } catch (err) {
      return this.deriveChild(index + 1);
    }
  }
  sign(hash) {
    if (!this._privateKey) {
      throw new Error("No privateKey set!");
    }
    abytes(hash, 32);
    return secp256k1.sign(hash, this._privateKey, { prehash: false });
  }
  verify(hash, signature) {
    abytes(hash, 32);
    abytes(signature, 64);
    if (!this._publicKey) {
      throw new Error("No publicKey set!");
    }
    return secp256k1.verify(signature, hash, this._publicKey, { prehash: false });
  }
  wipePrivateData() {
    if (this._privateKey) {
      this._privateKey.fill(0);
      this._privateKey = void 0;
    }
    return this;
  }
  toJSON() {
    return {
      xpriv: this.privateExtendedKey,
      xpub: this.publicExtendedKey
    };
  }
  serialize(version, key) {
    if (!this.chainCode) {
      throw new Error("No chainCode set");
    }
    abytes(key, 33);
    return concatBytes(toU32(version), new Uint8Array([this.depth]), toU32(this.parentFingerprint), toU32(this.index), this.chainCode, key);
  }
};

// src/hdkmanager/index.ts
var import_bip39 = require("@scure/bip39");
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
    const masterSeed = (0, import_bip39.mnemonicToSeedSync)(mnemonic, passphrase);
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
    const privateKey = bytesToHex2(this.derivatePrivateKey(index, pathOptions));
    const type = this.purpose === 84 ? "p2wpkh" : "p2pkh";
    return new ECPairKey({ privateKey: hexToBytes2(privateKey), network: options?.network ?? this.network, type });
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
      input.scriptPubKey = bytesToHex2(addressToScriptPubKey(pairkey.getAddress()));
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
      hexTransaction.append(hexToBytes2(input.txid).reverse());
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
      hexTransaction.append(hexToBytes2(input.sequence ?? "fffffffd").reverse());
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
    return bytesToHex2(txid);
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
    return bytesToHex2(this.cachedata.get("txraw"));
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
var import_bip392 = require("@scure/bip39");
var import_english = require("@scure/bip39/wordlists/english");
var MnemonicUtils = class {
  /**
   * Generates a new BIP-39 mnemonic phrase.
   * 
   * @param {number} [strength=128] - Entropy strength in bits. Common values: 128 (12 words), 256 (24 words).
   * @returns {string} A mnemonic phrase.
   * @throws {Error} If the provided strength is invalid or unsupported.
   */
  static generateMnemonic(strength = 128) {
    const mnemonic = (0, import_bip392.generateMnemonic)(import_english.wordlist, strength);
    return mnemonic;
  }
  /**
   * Retrieves the full BIP-39 wordlist or filters it by a search term.
   * 
   * @param {string} [searchTerm] - Optional term to filter words. Case-insensitive and trimmed.
   * @returns {string[]} A list of matching words, or the entire list if no search term is given.
   */
  static getWords(searchTerm) {
    if (!searchTerm) return import_english.wordlist;
    return import_english.wordlist.filter((w) => {
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
    return (0, import_bip392.validateMnemonic)(mnemonic, import_english.wordlist);
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
    return (0, import_bip392.mnemonicToEntropy)(mnemonic, import_english.wordlist);
  }
  /**
  * Converts entropy (hex string) to a BIP-39 mnemonic phrase.
  *
  * @param {Uint8Array} entropy - The entropy to convert.
  * @returns {string} The resulting mnemonic phrase.
  */
  static entropyToMnemonic(entropy) {
    this.validateEntropy(entropy);
    return (0, import_bip392.entropyToMnemonic)(entropy, import_english.wordlist);
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
    return (0, import_bip392.mnemonicToSeedSync)(mnemonic, passphrase);
  }
  /**
  * Returns a random word from the BIP-39 wordlist.
  * Uses a cryptographically secure random source (not `Math.random()`).
  *
  * @returns {string} A randomly selected word.
  */
  static getRandomWord() {
    const index = new DataView(randomBytes(4).buffer).getUint32(0) % import_english.wordlist.length;
    return import_english.wordlist[index];
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
        pubkey: bytesToHex2(pubkey),
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
        pubkey: bytesToHex2(pubkey),
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
    const pairkey = ECPairKey.fromHex(bytesToHex2(this.getMasterPrivateKey()), this.network);
    return pairkey.getWif();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
/*! Bundled license information:

@noble/curves/utils.js:
@noble/curves/abstract/modular.js:
@noble/curves/abstract/curve.js:
@noble/curves/abstract/weierstrass.js:
@noble/curves/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/base/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/bip32/index.js:
  (*! scure-bip32 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)
*/
