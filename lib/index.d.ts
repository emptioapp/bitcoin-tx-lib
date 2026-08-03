import { HDKey } from '@scure/bip32';

type Hex = Uint8Array | string;
type BNetwork = "testnet" | "mainnet";
type BechEncoding = "bech32" | "bech32m";
type TypeAddress = "p2pkh" | "p2wpkh";
interface Bech32Options {
    network?: BNetwork;
    version?: number;
    publicKey?: string;
}
interface ECOptions {
    network?: BNetwork;
    privateKey?: Uint8Array;
    type?: TypeAddress;
}
interface InputTransaction {
    txid: string;
    vout: number;
    scriptPubKey?: string;
    sequence?: string;
    value: number;
}
interface OutputTransaction {
    address: string;
    amount: number;
}
interface TXOptions {
    version?: number;
    locktime?: number;
    whoPayTheFee?: string;
    fee?: number;
}

declare class ECPairKey {
    readonly network: BNetwork;
    readonly type: TypeAddress;
    readonly privateKey: Uint8Array;
    static wifPrefixes: {
        mainnet: number;
        testnet: number;
    };
    constructor(options?: ECOptions);
    /**
    * Returns the compressed public key derived from the private key.
    */
    getPublicKey(): Uint8Array;
    getPrivateKey(): Uint8Array;
    /**
    * Signs a message hash and returns the DER-encoded signature.
    * @param message Hash of the message to sign.
    */
    signDER(message: Uint8Array): Uint8Array;
    /**
    * Verifies a DER-encoded signature against a message hash.
    * @param message Message hash that was signed.
    * @param signature Signature in DER format.
    */
    verifySignature(message: Uint8Array, signature: Uint8Array): boolean;
    /**
    * Returns the WIF (Wallet Import Format) of the private key.
    * The 0x01 suffix indicates the key produces a compressed public key,
    * which is required for compatibility with standard Bitcoin wallets.
    */
    getWif(): string;
    /**
   * Returns the address associated with the compressed public key.
   * @param type Type of address to generate (p2pkh, p2wpkh, etc).
   */
    getAddress(type?: TypeAddress): string;
    /**
    * Creates a key pair from a WIF string.
    * @param wif Wallet Import Format string.
    * @param options Optional network override.
    */
    static fromWif(wif: string): ECPairKey;
    /**
    * Creates a key pair from a raw private key.
    */
    static fromHex(privateKey: string, network?: BNetwork): ECPairKey;
    /**
    * Verifies if a WIF string (decoded) has valid prefix and checksum.
    * @param bytes WIF decoded into bytes.
    */
    static verifyWif(decoded: Uint8Array): boolean;
    getPrivateKeyHex(): string;
    getPublicKeyHex(): string;
}

type BuildFormat = "raw" | "txid";
interface SigParams {
    inputs: InputTransaction[];
    outputs: OutputTransaction[];
    pairkey: ECPairKey;
    locktime: number;
    version: number;
}
/**
 * Base class for building and signing Bitcoin transactions (both Legacy and SegWit).
 */
declare abstract class TransactionBuilder {
    protected static readonly MAX_MONEY: number;
    /**
     * Determines if any input is a SegWit (P2WPKH or P2WSH) input.
     * @param inputs List of transaction inputs.
     * @returns True if at least one input is SegWit.
     */
    isSegwit(inputs: InputTransaction[]): boolean;
    /**
     * Checks if a specific input is a SegWit input (P2WPKH or P2WSH).
     * @param input The input to check.
     * @returns True if input is SegWit.
     */
    isSegwitInput(input: InputTransaction): boolean;
    /**
     * Builds and signs the entire transaction.
     * @param params Signing parameters including inputs, outputs, key, version and locktime.
     * @param format Whether to generate a "raw" or "txid" version.
     * @returns Raw transaction bytes.
     */
    protected buildAndSign(params: SigParams, format?: BuildFormat): Uint8Array;
    /**
     * Generates the `scriptSig` for a legacy (non-SegWit) P2PKH input.
     * @param input The input to sign.
     * @param params All transaction signing context.
     * @returns The generated `scriptSig` as a byte array.
     */
    protected generateScriptSig(input: InputTransaction, { inputs, outputs, pairkey, locktime, version }: SigParams): Uint8Array;
    /**
     * Generates the witness data for a SegWit input (P2WPKH).
     * @param input The input to sign.
     * @param params All transaction signing context.
     * @returns The witness field as a byte array.
     */
    protected generateWitness(input: InputTransaction, { inputs, outputs, pairkey, locktime, version }: SigParams): Uint8Array;
    /**
     * Serializes transaction outputs into their raw binary format.
     * @param outputs List of transaction outputs.
     * @returns Byte array of all outputs serialized.
     */
    protected outputsRaw(outputs: OutputTransaction[]): Uint8Array;
    /**
     * Validates a transaction input.
     * Throws if txid is invalid, scriptPubKey is missing, or the txid is duplicated.
     * @param input The input to validate.
     * @param inputs The current list of inputs.
     */
    protected validateInput(input: InputTransaction, inputs: InputTransaction[]): void;
    /**
     * Validates a transaction output.
     * Throws if amount is non-positive, address is invalid, or address is duplicated.
     * @param output The output to validate.
     * @param outputs The current list of outputs.
     */
    protected validateOutput(output: OutputTransaction, outputs: OutputTransaction[], network?: BNetwork): void;
    protected validateTransaction(inputs: InputTransaction[], outputs: OutputTransaction[]): void;
    protected sumInputs(inputs: InputTransaction[]): number;
    protected sumOutputs(outputs: OutputTransaction[]): number;
    protected validateOutputsValue(outputs: OutputTransaction[]): void;
    protected validateFeeRate(feeRate: number): void;
    protected onTransactionMutated(): void;
    private isHex;
    private isUnsupportedWitnessScript;
}

/**
 * Abstract base class for simple transactions with a single signing key.
 */
declare abstract class BaseTransaction extends TransactionBuilder {
    /** Transaction version (default is 2) */
    version: number;
    /** Transaction locktime (default is 0) */
    locktime: number;
    /** List of inputs included in the transaction */
    inputs: InputTransaction[];
    /** List of outputs included in the transaction */
    outputs: OutputTransaction[];
    /** Internal cache for precomputed data (e.g. transaction size, hashes) */
    protected cachedata: Map<string, Uint8Array>;
    /** Defines which output pays the fee; can be an address or "everyone" */
    protected whoPayTheFee?: string;
    /** Fee rate in satoshis per virtual byte */
    protected fee?: number;
    /** Key pair used for signing the transaction. */
    protected pairKey: ECPairKey;
    /**
     * Constructs a new transaction instance with optional options.
     * @param pairKey The key pair to use for signing inputs.
     * @param options Optional transaction parameters (version, locktime, fee, etc.).
     */
    constructor(pairKey: ECPairKey, options?: TXOptions);
    /**
     * Adds a transaction input to the list.
     * Validates for duplicate txid and required fields.
     * @param input The transaction input to add.
     */
    addInput(input: InputTransaction): void;
    /**
     * Adds a transaction output to the list.
     * Validates for duplicate address and required fields.
     * @param output The transaction output to add.
     */
    addOutput(output: OutputTransaction): void;
    /**
     * Indicates if the transaction contains any SegWit input.
     * @returns True if any input is SegWit.
     */
    isSegwit(): boolean;
    /**
     * Builds and signs the transaction.
     * @param format Output format, either "raw" or "txid".
     * @returns Raw transaction bytes.
     */
    protected build(format?: BuildFormat): Uint8Array;
    /**
     * Builds the witness field for a given input.
     * Only applicable to SegWit inputs.
     * @param input The input for which to build witness data.
     * @returns Byte array representing witness structure.
     */
    protected buildWitness(input: InputTransaction): Uint8Array;
    /**
     * Builds the legacy `scriptSig` for a given input.
     * Only applicable to non-SegWit inputs.
     * @param input The input for which to build the scriptSig.
     * @returns Byte array representing the scriptSig.
     */
    protected buildScriptSig(input: InputTransaction): Uint8Array;
    /**
     * Clears all inputs, outputs, and cache data.
     */
    clear(): void;
    /**
     * Generates the signing parameters object used throughout transaction signing.
     * @returns A complete SigParams object.
     */
    private buildSigParams;
}

declare class Transaction extends BaseTransaction {
    private feeResolved;
    /**
     * Creates a new Transaction instance.
     * @param pairkey The key pair used to sign the transaction inputs.
     * @param options Optional transaction parameters (version, locktime, fee, etc.).
     */
    constructor(pairkey: ECPairKey, options?: TXOptions);
    /**
     * Signs the transaction.
     * Caches the raw transaction data and the version used for txid calculation.
     */
    sign(): void;
    /**
     * Returns the transaction ID (txid) as a hex string.
     * The txid is the double SHA-256 hash of the stripped raw transaction (no witness data), reversed in byte order.
     *
     * @throws Error if the transaction is not signed.
     * @returns The txid as a hex string.
     */
    getTxid(): string;
    /**
     * Calculates the total weight of the transaction according to BIP 141.
     * Weight = (non-witness bytes * 4) + witness bytes + marker/flag bytes.
     * Uses cached serialization to avoid re-signing on each call.
     *
     * @throws Error if the transaction is not signed.
     * @returns The transaction weight.
     */
    weight(): number;
    /**
     * Calculates the virtual size (vBytes) of the transaction.
     * Defined as weight divided by 4.
     *
     * @throws Error if the transaction is not signed.
     * @returns The transaction virtual size in bytes.
     */
    vBytes(): number;
    /**
     * Deducts the transaction fee from the output(s) according to the fee-paying strategy.
     * If only one output exists, deduct the entire fee from it.
     * If `whoPayTheFee` is "everyone", split the fee evenly among all outputs.
     * If `whoPayTheFee` is an address, deduct the fee from the output matching that address.
     * Idempotent: calling more than once has no additional effect.
     *
     * @throws Error if the transaction is not signed.
     */
    resolveFee(): void;
    /**
     * Calculates the actual fee in satoshis from input total minus output total.
     *
     * @returns The transaction fee in satoshis.
     */
    getFeeSats(): number;
    estimateFeeSats(): number;
    /**
     * Returns the raw transaction as a hex string.
     *
     * @throws Error if the transaction is not signed.
     * @returns The raw transaction hex string.
     */
    getRawHex(): string;
    /**
     * Returns the raw transaction bytes as a Uint8Array.
     *
     * @throws Error if the transaction is not signed.
     * @returns The raw transaction bytes.
     */
    getRawBytes(): Uint8Array;
    /**
     * Clears all inputs, outputs, cache data and resets the fee state.
     */
    clear(): void;
    protected onTransactionMutated(): void;
    private deductFeeFromOutput;
    private deductFeeFromEveryone;
    private markFeeResolved;
    private findFeePayerIndex;
}

interface HDKParams {
    purpose?: 44 | 84;
    coinType?: number;
    account?: number;
    change?: number;
    rootKey: HDKey;
    network?: BNetwork;
}
interface PathOptions {
    account?: number;
    change?: number;
}
/**
 * Manages BIP44/84 HD key derivation from a master seed, mnemonic, or extended key.
 * Supports mainnet (xprv/xpub, zprv/zpub) and testnet (tprv/tpub, vprv/vpub) key formats.
 */
declare class HDKManager {
    /** BIP44/84 purpose field (default: 84) */
    purpose: 44 | 84;
    /** BIP44 coin type (default: 0 for Bitcoin) */
    coinType: number;
    /** BIP44 account number (default: 0) */
    account: number;
    /** BIP44 change value: 0 for external, 1 for internal (default: 0) */
    change: number;
    /** Network this manager is associated with */
    readonly network: BNetwork;
    /** Root HD key derived from the master seed */
    private readonly _rootKey;
    private static readonly versions;
    constructor(params: HDKParams);
    /**
     * Instantiates HDKManager from a raw master seed.
     */
    static fromMasterSeed(masterSeed: Uint8Array, options?: HDKParams): HDKManager;
    /**
     * Instantiates HDKManager from a BIP39 mnemonic phrase.
     */
    static fromMnemonic(mnemonic: string, passphrase?: string, options?: HDKParams): HDKManager;
    /**
     * Creates an instance from an extended private key.
     * Accepts xprv (BIP44 mainnet), tprv (BIP44 testnet), zprv (BIP84 mainnet), vprv (BIP84 testnet).
     * Purpose and network are inferred from the key prefix; pathParams may override them.
     */
    static fromXPriv(xpriv: string, pathParams?: Omit<HDKParams, 'rootKey'>): HDKManager;
    /**
     * Creates an instance from an extended public key (watch-only).
     * Accepts xpub (BIP44 mainnet), tpub (BIP44 testnet), zpub (BIP84 mainnet), vpub (BIP84 testnet).
     * Purpose and network are inferred from the key prefix; pathParams may override them.
     */
    static fromXPub(xpub: string, pathParams?: Omit<HDKParams, 'rootKey'>): HDKManager;
    /**
     * Derives a private key from the BIP44/84 path at the given index.
     */
    derivatePrivateKey(index: number, pathOptions?: PathOptions): Uint8Array;
    /**
     * Derives a public key from the BIP44/84 path at the given index.
     */
    derivatePublicKey(index: number, pathOptions?: PathOptions): Uint8Array;
    /**
     * Derives multiple private keys for indexes 0 to quantity - 1.
     */
    deriveMultiplePrivateKeys(quantity: number, pathOptions?: PathOptions): Uint8Array[];
    /**
     * Derives multiple public keys for indexes 0 to quantity - 1.
     */
    deriveMultiplePublicKeys(quantity: number, pathOptions?: PathOptions): Uint8Array[];
    /**
     * Derives an ECPairKey from a private key at a specific index.
     */
    derivatePairKey(index: number, options?: {
        network?: BNetwork;
    }, pathOptions?: PathOptions): ECPairKey;
    /**
     * Derives multiple ECPairKeys for indexes 0 to quantity - 1.
     */
    derivateMultiplePairKeys(quantity: number, options?: {
        network?: BNetwork;
    }, pathOptions?: PathOptions): ECPairKey[];
    /**
     * Returns the full BIP44/84 derivation path for a given index.
     */
    getDerivationPath(index: number, pathOptions?: PathOptions): string;
    /**
     * Checks if the current root key has a private key.
     */
    hasPrivateKey(): boolean;
    getMasterPrivateKey(): Uint8Array;
    getMasterPublicKey(): Uint8Array;
    /**
     * Returns the extended private key serialized with the correct version bytes.
     * Mainnet BIP44 → xprv, Testnet BIP44 → tprv, Mainnet BIP84 → zprv, Testnet BIP84 → vprv.
     */
    getXPriv(): string;
    /**
     * Returns the root extended public key. For sharing with watch-only wallets, use
     * getAccountXPub() instead — this returns the master root key, not the account-level key.
     * Mainnet BIP44 → xpub, Testnet BIP44 → tpub, Mainnet BIP84 → zpub, Testnet BIP84 → vpub.
     */
    getXPub(): string;
    /**
     * Returns the BIP44/84 account-level extended public key for sharing with watch-only wallets.
     * Derives to m/purpose'/coinType'/account' and returns that subtree's public key.
     * This is what Electrum, Sparrow, hardware wallets, and other wallets export as zpub/xpub.
     * Throws if called on a watch-only instance (hardened derivation requires the private key).
     */
    getAccountXPub(account?: number): string;
    /**
     * Resolves the correct HD key version bytes for the given purpose and network.
     */
    private static resolveVersions;
    /**
     * Detects purpose, network, and version bytes from an extended key prefix.
     * Supports: xprv/xpub (BIP44 mainnet), tprv/tpub (BIP44 testnet),
     *           zprv/zpub (BIP84 mainnet), vprv/vpub (BIP84 testnet).
     */
    private static detectExtendedKeyInfo;
}

/**
 * Abstract base class for building HD (Hierarchical Deterministic) Bitcoin transactions,
 * supporting per-input signing using separate key pairs.
 */
declare abstract class HDTransactionBase extends TransactionBuilder {
    /** Transaction version (default is 2) */
    version: number;
    /** Transaction locktime (default is 0) */
    locktime: number;
    /** List of inputs included in the transaction */
    inputs: InputTransaction[];
    /** List of outputs included in the transaction */
    outputs: OutputTransaction[];
    /** Mapping of input identifier (txid:vout) to its corresponding signing key */
    protected signingKeys: Map<string, ECPairKey>;
    /** Internal cache for precomputed data (e.g. transaction size, hashes) */
    protected cachedata: Map<string, Uint8Array>;
    /** Defines which output pays the fee; can be an address or "everyone" */
    protected whoPayTheFee?: string;
    /** Fee rate in satoshis per virtual byte */
    protected fee?: number;
    /**
     * Constructs an HDTransactionBase instance with optional transaction settings.
     * @param options Optional transaction configuration: version, locktime, fee, who pays the fee.
     */
    constructor(options?: TXOptions);
    /**
     * Adds a transaction input and associates a signing key to it.
     * @param input The transaction input to be added.
     * @param pairkey The key pair used to sign this specific input.
     * @throws If the input is invalid or already exists.
     */
    addInput(input: InputTransaction, pairkey: ECPairKey): void;
    /**
     * Adds an output to the transaction.
     * @param output The output (address and amount) to be added.
     * @throws If the output is invalid or duplicated.
     */
    addOutput(output: OutputTransaction): void;
    /**
     * Checks if the transaction contains at least one SegWit input.
     * @returns True if any input is SegWit, false otherwise.
     */
    isSegwit(): boolean;
    /**
     * Builds the raw transaction (optionally for txid calculation).
     * Handles both SegWit and legacy inputs.
     * @param format Output format, either "raw" (default) or "txid".
     * @returns Serialized transaction as Uint8Array.
     * @throws If any input lacks its associated signing key.
     */
    protected build(format?: BuildFormat): Uint8Array;
    /**
     * Generates the witness data for a SegWit input.
     * @param input The input to generate witness for.
     * @returns Serialized witness field.
     * @throws If the input has no associated signing key.
     */
    protected buildWitness(input: InputTransaction): Uint8Array;
    /**
     * Generates the legacy scriptSig for a non-SegWit input.
     * @param input The input to generate the scriptSig for.
     * @returns Serialized scriptSig.
     * @throws If the input has no associated signing key.
     */
    protected buildScriptSig(input: InputTransaction): Uint8Array;
    /**
     * Clears all inputs, outputs, cached data, and signing keys.
     */
    clear(): void;
    /**
     * Generates a unique key for the signingKeys map based on txid and vout.
     * @param input The input to derive the key from.
     * @returns A string in the format "txid:vout".
     */
    private getkey;
    /**
     * Validates that all inputs have an associated signing key.
     * @throws If any input is missing its corresponding key.
     */
    private validateSigning;
}

/**
 * HDTransaction represents a Bitcoin transaction using hierarchical deterministic keys.
 * Inherits from HDTransactionBase and provides high-level utilities such as fee calculation,
 * weight estimation, and raw hex retrieval.
 */
declare class HDTransaction extends HDTransactionBase {
    private feeResolved;
    /**
     * Constructs a new HDTransaction.
     * @param options Optional transaction parameters (version, locktime, fee, etc.).
     */
    constructor(options?: TXOptions);
    /**
     * Returns the transaction ID (txid) as a hex string.
     * It is the double SHA-256 hash of the raw transaction (excluding witness data),
     * reversed in byte order.
     *
     * @throws Error if the transaction is not signed.
     * @returns The txid in hex string format.
     */
    getTxid(): string;
    /**
     * Signs the transaction and stores both the full raw transaction and
     * the stripped version used to calculate the txid.
     */
    sign(): void;
    /**
     * Determines if the transaction contains any SegWit inputs.
     * @returns True if the transaction has at least one SegWit input.
     */
    isSegwit(): boolean;
    /**
     * Calculates the total weight of the transaction as defined in BIP 141.
     * Weight = (non-witness bytes * 4) + witness bytes + marker/flag bytes.
     * Uses cached serialization to avoid re-signing on each call.
     *
     * @throws Error if the transaction is not signed.
     * @returns The transaction weight.
     */
    weight(): number;
    /**
     * Calculates the virtual size (vBytes) of the transaction, defined as weight / 4.
     *
     * @throws Error if the transaction is not signed.
     * @returns The virtual size of the transaction in vBytes.
     */
    vBytes(): number;
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
    resolveFee(): void;
    /**
     * Calculates the actual fee in satoshis from input total minus output total.
     *
     * @returns Total transaction fee in satoshis.
     */
    getFeeSats(): number;
    estimateFeeSats(): number;
    /**
     * Returns the raw transaction as a hex-encoded string.
     *
     * @throws Error if the transaction is not signed.
     * @returns Raw transaction in hex format.
     */
    getRawHex(): string;
    /**
     * Returns the raw transaction as a Uint8Array.
     *
     * @throws Error if the transaction is not signed.
     * @returns Raw transaction as bytes.
     */
    getRawBytes(): Uint8Array;
    /**
     * Clears all inputs, outputs, signing keys, cache data and resets the fee state.
     */
    clear(): void;
    protected onTransactionMutated(): void;
    private deductFeeFromOutput;
    private deductFeeFromEveryone;
    private markFeeResolved;
    private findFeePayerIndex;
}

interface HDWalletOptions {
    network: BNetwork;
    purpose?: 44 | 84;
}
interface HDWalletData {
    mnemonic?: string;
    wallet: HDWallet;
}
/**
 * HDWallet encapsulates an HD key manager, providing key and address derivation
 * with support for watch-only mode and automatic format detection.
 */
declare class HDWallet {
    /** Network used for address formatting */
    readonly network: BNetwork;
    /** Whether the wallet is watch-only (xpub-based) */
    readonly isWatchOnly: boolean;
    private readonly _hdkManager;
    constructor(hdkManager: HDKManager, options?: HDWalletOptions);
    /**
     * Creates a new HDWallet with a randomly generated mnemonic.
     * @param password Optional password for the mnemonic.
     * @param options Network options.
     * @returns Object containing the mnemonic and wallet instance.
     */
    static create(passphrase?: string, options?: HDWalletOptions): HDWalletData;
    /**
     * Imports a wallet from mnemonic, xpriv, or xpub.
     * @param input String representing the mnemonic, xpriv, or xpub.
     * @param password Optional password if input is a mnemonic.
     * @param options Network options.
     * @returns Object containing the HDWallet and optionally the mnemonic.
     */
    static import(input: string, password?: string, options?: HDWalletOptions): HDWalletData;
    /**
     * Derives multiple key pairs from the wallet.
     * @param quantity Number of keys to derive.
     * @param pathOptions Optional derivation path configuration.
     * @returns Array of ECPairKey.
     */
    listPairKeys(quantity: number, pathOptions?: PathOptions): ECPairKey[];
    /**
     * Returns a list of addresses from the wallet.
     * @param quantity Number of addresses to return.
     * @param options Address type options (p2wpkh, p2pkh, etc).
     * @param pathOptions Optional derivation path configuration.
     */
    listAddresses(quantity: number, pathOptions?: PathOptions): string[];
    /**
     * Returns a list of external (receiving) addresses as per BIP44.
     * @param quantity Number of addresses to return.
     * @param type Address type options (p2wpkh, p2pkh, etc).
     * @param account Account index (default is 0).
     */
    listReceiveAddresses(quantity: number, account?: number): string[];
    /**
     * Returns a list of internal (change) addresses as per BIP44.
     * @param quantity Number of addresses to return.
     * @param type Address type options (p2wpkh, p2pkh, etc).
     * @param account Account index (default is 0).
     */
    listChangeAddresses(quantity: number, account?: number): string[];
    /**
     * Derives a single address by index.
     */
    getAddress(index: number, pathOptions?: PathOptions): string;
    /** Returns the master private key in base58 (xprv). */
    getMasterPrivateKey(): Uint8Array;
    /** Returns the master public key in base58 (xpub). */
    getMasterPublicKey(): Uint8Array;
    /** Derives the private key for a given index. */
    getPrivateKey(index: number, pathOptions?: PathOptions): Uint8Array;
    /** Derives the public key for a given index. */
    getPublicKey(index: number, pathOptions?: PathOptions): Uint8Array;
    /** Derives a key pair (private + public) for a given index. */
    getPairKey(index: number, pathOptions?: PathOptions): ECPairKey;
    /** Returns the extended private key (xprv). */
    getXPriv(): string;
    /** Returns the root extended public key. For watch-only sharing, use getAccountXPub() instead. */
    getXPub(): string;
    /**
     * Returns the account-level extended public key (zpub/xpub/tpub/vpub) suitable for
     * import into watch-only wallets. This is the key at m/purpose'/coinType'/account'
     * and matches what Electrum, Sparrow, Ledger, and Trezor export.
     * Throws for watch-only wallets (hardened derivation requires the private key).
     */
    getAccountXPub(account?: number): string;
    getWif(): string;
}

interface PubkeyProps {
    pubkey: string;
    type?: TypeAddress;
    network?: BNetwork;
}
interface HashProps {
    ripemd160: string;
    type?: TypeAddress;
    network?: BNetwork;
}
declare class Address {
    private static addressPrefix;
    static fromPubkey({ pubkey, type, network }: PubkeyProps): string;
    static fromHash({ ripemd160, type, network }: HashProps): string;
    static getScriptPubkey(address: string): string;
    static getRipemd160(address: string): string;
    static isValid(address: string, network?: BNetwork): boolean;
}

/**
 * Utility class for BIP-39 mnemonic generation and wordlist management.
 */
declare class MnemonicUtils {
    /**
     * Generates a new BIP-39 mnemonic phrase.
     *
     * @param {number} [strength=128] - Entropy strength in bits. Common values: 128 (12 words), 256 (24 words).
     * @returns {string} A mnemonic phrase.
     * @throws {Error} If the provided strength is invalid or unsupported.
     */
    static generateMnemonic(strength?: 128 | 256): string;
    /**
     * Retrieves the full BIP-39 wordlist or filters it by a search term.
     *
     * @param {string} [searchTerm] - Optional term to filter words. Case-insensitive and trimmed.
     * @returns {string[]} A list of matching words, or the entire list if no search term is given.
     */
    static getWords(searchTerm?: string): string[];
    /**
    * Validates if the given mnemonic is valid according to BIP-39 rules.
    *
    * @param {string} mnemonic - The mnemonic phrase to validate.
    * @returns {boolean} True if valid, false otherwise.
    */
    static validateMnemonic(mnemonic: string): boolean;
    /**
    * Converts a mnemonic phrase to its entropy (hex string).
    *
    * @param {string} mnemonic - The mnemonic to convert.
    * @returns {Uint8Array} The Uint8Array entropy.
    * @throws {Error} If the mnemonic is invalid.
    */
    static mnemonicToEntropy(mnemonic: string): Uint8Array;
    /**
    * Converts entropy (hex string) to a BIP-39 mnemonic phrase.
    *
    * @param {Uint8Array} entropy - The entropy to convert.
    * @returns {string} The resulting mnemonic phrase.
    */
    static entropyToMnemonic(entropy: Uint8Array): string;
    /**
    * Converts a mnemonic phrase into a BIP-39 seed.
    *
    * @param {string} mnemonic - The mnemonic phrase.
    * @param {string} [passphrase] - Optional passphrase.
    * @returns {Uint8Array} The resulting seed as a byte array.
    */
    static mnemonicToSeed(mnemonic: string, passphrase?: string): Uint8Array;
    /**
    * Returns a random word from the BIP-39 wordlist.
    * Uses a cryptographically secure random source (not `Math.random()`).
    *
    * @returns {string} A randomly selected word.
    */
    static getRandomWord(): string;
    private static validateEntropy;
    private static isHighlyRepetitive;
    private static isEntropyStrong;
    private static calculateShannonEntropy;
}

declare function bytesToHex(bytes: Uint8Array): string;
declare function hexToBytes(hex: string, hexadecimal?: boolean): Uint8Array;
declare function sha256(message: Uint8Array, hash256?: boolean): Uint8Array;
declare function hash256(message: Uint8Array): Uint8Array;
declare function ripemd160(message: Uint8Array, address?: boolean): Uint8Array;
declare function checksum(message: Uint8Array, bytes?: number): Uint8Array;
declare function numberToHex(number?: number, bits?: number): Uint8Array;
declare function numberToHexLE(number?: number, bits?: number): Uint8Array;
declare function hash160ToScript(hash160: Hex): Hex;
declare function mergeUint8Arrays(...arrays: Uint8Array[]): Uint8Array;
declare function isEqual(...arrays: Uint8Array[]): boolean;
declare function numberToVarint(value: number): Uint8Array;
declare function getBytesCount(hex: string): number;

export { Address, type BNetwork, type Bech32Options, type BechEncoding, type ECOptions, ECPairKey, HDKManager, type HDKParams, HDTransaction, HDWallet, type HDWalletData, type Hex, type InputTransaction, MnemonicUtils, type OutputTransaction, type PathOptions, type TXOptions, Transaction, type TypeAddress, bytesToHex, checksum, getBytesCount, hash160ToScript, hash256, hexToBytes, isEqual, mergeUint8Arrays, numberToHex, numberToHexLE, numberToVarint, ripemd160, sha256 };
