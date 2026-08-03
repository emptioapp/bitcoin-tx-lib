import { ECPairKey } from "../ecpairkey"
import { InputTransaction, OutputTransaction, TXOptions } from "../types"
import { bytesToHex } from "../utils"
import { addressToScriptPubKey } from "../utils/txutils"
import { BuildFormat, SigParams, TransactionBuilder } from "./txbuilder"

/**
 * Abstract base class for simple transactions with a single signing key.
 */
export abstract class BaseTransaction extends TransactionBuilder
{
    /** Transaction version (default is 2) */
    public version: number = 2 

    /** Transaction locktime (default is 0) */
    public locktime: number = 0

    /** List of inputs included in the transaction */
    public inputs: InputTransaction[] = []

    /** List of outputs included in the transaction */
    public outputs: OutputTransaction[] = []

    /** Internal cache for precomputed data (e.g. transaction size, hashes) */
    protected cachedata: Map<string, Uint8Array>

    /** Defines which output pays the fee; can be an address or "everyone" */
    protected whoPayTheFee?: string

    /** Fee rate in satoshis per virtual byte */
    protected fee?: number
    
    /** Key pair used for signing the transaction. */
    protected pairKey: ECPairKey

    /**
     * Constructs a new transaction instance with optional options.
     * @param pairKey The key pair to use for signing inputs.
     * @param options Optional transaction parameters (version, locktime, fee, etc.).
     */
    constructor(pairKey: ECPairKey, options?: TXOptions)
    {
        super()
        this.pairKey = pairKey
        this.version = options?.version ?? 2
        this.locktime = options?.locktime ?? 0
        this.whoPayTheFee = options?.whoPayTheFee
        this.fee = options?.fee
        if(this.fee !== undefined)
            this.validateFeeRate(this.fee)
        this.cachedata = new Map()
    }

    /**
     * Adds a transaction input to the list.
     * Validates for duplicate txid and required fields.
     * @param input The transaction input to add.
     */
    public addInput(input: InputTransaction) 
    { 
        this.validateInput(input, this.inputs)

        if(!input.scriptPubKey)
            input.scriptPubKey = bytesToHex(addressToScriptPubKey(this.pairKey.getAddress()))

        // 0xfffffffd Replace By Fee (RBF) enabled BIP 125
        if(!input.sequence) input.sequence = "fffffffd"

        this.inputs.push(input)
        this.cachedata.clear()
        this.onTransactionMutated()
    }

    /**
     * Adds a transaction output to the list.
     * Validates for duplicate address and required fields.
     * @param output The transaction output to add.
     */
    public addOutput(output: OutputTransaction)
    {
        this.validateOutput(output, this.outputs, this.pairKey.network)

        this.outputs.push(output)
        this.cachedata.clear()
        this.onTransactionMutated()
    }

    /**
     * Indicates if the transaction contains any SegWit input.
     * @returns True if any input is SegWit.
     */
    public override isSegwit(): boolean
    {
        return super.isSegwit(this.inputs)
    }

    /**
     * Builds and signs the transaction.
     * @param format Output format, either "raw" or "txid".
     * @returns Raw transaction bytes.
     */
    protected build(format: BuildFormat = "raw"): Uint8Array 
    {
        return super.buildAndSign(this.buildSigParams(), format)
    }

    /**
     * Builds the witness field for a given input.
     * Only applicable to SegWit inputs.
     * @param input The input for which to build witness data.
     * @returns Byte array representing witness structure.
     */
    protected buildWitness(input: InputTransaction) 
    {
        return super.generateWitness(input, this.buildSigParams())
    }

    /**
     * Builds the legacy `scriptSig` for a given input.
     * Only applicable to non-SegWit inputs.
     * @param input The input for which to build the scriptSig.
     * @returns Byte array representing the scriptSig.
     */
    protected buildScriptSig(input: InputTransaction) 
    {
        return super.generateScriptSig(input, this.buildSigParams())
    }  

    /**
     * Clears all inputs, outputs, and cache data.
     */
    public clear() 
    {
        this.inputs = []
        this.outputs = []
        this.cachedata.clear()
    }

    /**
     * Generates the signing parameters object used throughout transaction signing.
     * @returns A complete SigParams object.
     */
    private buildSigParams() : SigParams {
        return {
            version: this.version,
            locktime: this.locktime,
            inputs: this.inputs,
            outputs: this.outputs,
            pairkey: this.pairKey
        }
    }
}


