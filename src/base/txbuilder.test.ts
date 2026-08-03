import { ECPairKey } from "../ecpairkey"
import { InputTransaction, OutputTransaction } from "../types"
import { BuildFormat, SigParams, TransactionBuilder } from "./txbuilder"

class TestBuilder extends TransactionBuilder {
    public build(params: SigParams, format?: BuildFormat) { return this.buildAndSign(params, format) }
    public testScriptSig(input: InputTransaction, params: SigParams) { return this.generateScriptSig(input, params) }
    public testWitness(input: InputTransaction, params: SigParams) { return this.generateWitness(input, params) }
    public testValidateInput(input: InputTransaction, inputs: InputTransaction[]) { return this.validateInput(input, inputs) }
    public testValidateOutput(output: OutputTransaction, outputs: OutputTransaction[], network?: "mainnet" | "testnet") { return this.validateOutput(output, outputs, network) }
    public testOutputsRaw(outputs: OutputTransaction[]) { return this.outputsRaw(outputs) }
}

describe("TransactionBuilder", () => {
    const pairKey = new ECPairKey()

    const segwitInput: InputTransaction = {
        txid: "a".repeat(64),
        vout: 0,
        scriptPubKey: "0014" + "ab".repeat(20),
        value: 50000
    }

    const legacyInput: InputTransaction = {
        txid: "b".repeat(64),
        vout: 0,
        scriptPubKey: "76a914" + "ab".repeat(20) + "88ac",
        value: 50000
    }

    const baseOutput: OutputTransaction = {
        address: pairKey.getAddress(),
        amount: 49000
    }

    const segwitParams: SigParams = {
        inputs: [segwitInput],
        outputs: [baseOutput],
        pairkey: pairKey,
        locktime: 0,
        version: 2
    }

    let builder: TestBuilder

    beforeEach(() => {
        builder = new TestBuilder()
    })

    // ── SegWit detection ──────────────────────────────────────────────────────
    describe("isSegwit / isSegwitInput", () => {
        test("P2WPKH scriptPubKey (0x00 0x14) is SegWit", () => {
            expect(builder.isSegwit([segwitInput])).toBe(true)
        })

        test("P2PKH scriptPubKey (0x76 0xa9) is not SegWit", () => {
            expect(builder.isSegwit([legacyInput])).toBe(false)
        })

        test("mixed inputs: any SegWit input makes isSegwit true", () => {
            expect(builder.isSegwit([legacyInput, segwitInput])).toBe(true)
        })
    })

    // ── Transaction building ──────────────────────────────────────────────────
    describe("buildAndSign", () => {
        test("builds SegWit transaction as Uint8Array", () => {
            const raw = builder.build(segwitParams)
            expect(raw).toBeInstanceOf(Uint8Array)
            expect(raw.length).toBeGreaterThan(0)
        })

        test("SegWit raw tx includes witness marker bytes (0x00 0x01)", () => {
            const raw = builder.build(segwitParams)
            const hex = Buffer.from(raw).toString("hex")
            // After version (4 bytes = 8 hex chars) the marker+flag appear
            expect(hex).toContain("0001")
        })

        test("txid build (no witness) is shorter than raw for SegWit", () => {
            const raw = builder.build(segwitParams)
            const txid = builder.build(segwitParams, "txid")
            expect(txid.length).toBeLessThan(raw.length)
        })

        test("legacy transaction: txid format omits no witness data (lengths within 1 byte)", () => {
            const params: SigParams = { ...segwitParams, inputs: [legacyInput] }
            const raw = builder.build(params)
            const txid = builder.build(params, "txid")
            // For legacy inputs there is no witness data to strip, so raw and txid formats
            // are structurally identical. build() re-signs on every call, so non-deterministic
            // DER signature encoding (71 vs 72 bytes) may shift the length by ±1 byte.
            expect(Math.abs(raw.length - txid.length)).toBeLessThanOrEqual(1)
        })
    })

    // ── scriptSig generation ──────────────────────────────────────────────────
    describe("generateScriptSig", () => {
        test("produces non-empty Uint8Array for legacy input", () => {
            const params: SigParams = { ...segwitParams, inputs: [legacyInput] }
            const sig = builder.testScriptSig(legacyInput, params)
            expect(sig).toBeInstanceOf(Uint8Array)
            expect(sig.length).toBeGreaterThan(0)
        })

        test("multi-input: each input's scriptSig differs (signed with different preimage)", () => {
            const input0: InputTransaction = {
                txid: "d".repeat(64),
                vout: 0,
                scriptPubKey: "76a914" + "ab".repeat(20) + "88ac",
                value: 30000,
                sequence: "fffffffd"
            }
            const input1: InputTransaction = {
                txid: "e".repeat(64),
                vout: 0,
                scriptPubKey: "76a914" + "ab".repeat(20) + "88ac",
                value: 20000,
                sequence: "feffffff"
            }
            const params: SigParams = {
                inputs: [input0, input1],
                outputs: [baseOutput],
                pairkey: pairKey,
                locktime: 0,
                version: 2
            }
            const sig0 = builder.testScriptSig(input0, params)
            const sig1 = builder.testScriptSig(input1, params)
            expect(sig0).not.toEqual(sig1)
        })
    })

    // ── witness generation ────────────────────────────────────────────────────
    describe("generateWitness", () => {
        test("produces non-empty Uint8Array for SegWit input", () => {
            const witness = builder.testWitness(segwitInput, segwitParams)
            expect(witness).toBeInstanceOf(Uint8Array)
            expect(witness.length).toBeGreaterThan(0)
        })

        test("witness starts with 0x02 (2 items: signature + pubkey)", () => {
            const witness = builder.testWitness(segwitInput, segwitParams)
            expect(witness[0]).toBe(0x02)
        })
    })

    // ── validateInput ─────────────────────────────────────────────────────────
    describe("validateInput", () => {
        test("valid input does not throw", () => {
            expect(() => builder.testValidateInput(segwitInput, [])).not.toThrow()
        })

        test("odd-length txid throws (not valid hex)", () => {
            const bad = { ...segwitInput, txid: "a".repeat(63) }
            expect(() => builder.testValidateInput(bad, [])).toThrow()
        })

        test("non-hex txid throws", () => {
            const bad = { ...segwitInput, txid: "z".repeat(64) }
            expect(() => builder.testValidateInput(bad, [])).toThrow("txid is in invalid format")
        })

        test("txid with wrong byte count throws", () => {
            const bad = { ...segwitInput, txid: "abcd" }
            expect(() => builder.testValidateInput(bad, [])).toThrow("Expected a valid txid")
        })

        test("odd-length scriptPubKey throws", () => {
            const bad = { ...segwitInput, scriptPubKey: "001" }
            expect(() => builder.testValidateInput(bad, [])).toThrow("scriptPubKey is in invalid format")
        })

        test("non-hex scriptPubKey throws", () => {
            const bad = { ...segwitInput, scriptPubKey: "zz".repeat(22) }
            expect(() => builder.testValidateInput(bad, [])).toThrow("scriptPubKey is in invalid format")
        })

        test("P2WSH input throws because signing it is not implemented", () => {
            const bad = { ...segwitInput, scriptPubKey: "0020" + "ab".repeat(32) }
            expect(() => builder.testValidateInput(bad, [])).toThrow("P2WSH inputs are not supported")
        })

        test("invalid vout throws", () => {
            expect(() => builder.testValidateInput({ ...segwitInput, vout: -1 }, [])).toThrow("Expected a valid vout")
            expect(() => builder.testValidateInput({ ...segwitInput, vout: 1.5 }, [])).toThrow("Expected a valid vout")
        })

        test("invalid input value throws", () => {
            expect(() => builder.testValidateInput({ ...segwitInput, value: 0 }, [])).toThrow("Expected a valid input value")
            expect(() => builder.testValidateInput({ ...segwitInput, value: 1.5 }, [])).toThrow("Expected a valid input value")
        })

        test("invalid sequence throws", () => {
            expect(() => builder.testValidateInput({ ...segwitInput, sequence: "ffffff" }, [])).toThrow("Expected a valid sequence")
            expect(() => builder.testValidateInput({ ...segwitInput, sequence: "zzzzzzzz" }, [])).toThrow("Expected a valid sequence")
        })

        // ── duplicate detection — anti-regression for fix #6 ─────────────────
        test("same txid + same vout → rejected as duplicate", () => {
            expect(() => builder.testValidateInput(segwitInput, [segwitInput])).toThrow("already been added")
        })

        test("same txid + different vout → ALLOWED (valid multi-UTXO from same tx)", () => {
            const input1: InputTransaction = { ...segwitInput, vout: 1 }
            expect(() => builder.testValidateInput(input1, [segwitInput])).not.toThrow()
        })

        test("different txid + same vout → ALLOWED", () => {
            const input1: InputTransaction = { ...segwitInput, txid: "f".repeat(64) }
            expect(() => builder.testValidateInput(input1, [segwitInput])).not.toThrow()
        })

        test("three inputs: two from same txid (different vout) + one unrelated are all valid", () => {
            const base: InputTransaction = { txid: "cc".repeat(32), vout: 0, scriptPubKey: "0014" + "ab".repeat(20), value: 10000 }
            const vout1: InputTransaction = { ...base, vout: 1 }
            const other: InputTransaction = { ...base, txid: "dd".repeat(32) }
            expect(() => builder.testValidateInput(base, [])).not.toThrow()
            expect(() => builder.testValidateInput(vout1, [base])).not.toThrow()
            expect(() => builder.testValidateInput(other, [base, vout1])).not.toThrow()
        })
    })

    // ── validateOutput ────────────────────────────────────────────────────────
    describe("validateOutput", () => {
        test("valid output does not throw", () => {
            expect(() => builder.testValidateOutput(baseOutput, [])).not.toThrow()
        })

        test("amount = 0 throws", () => {
            expect(() => builder.testValidateOutput({ ...baseOutput, amount: 0 }, [])).toThrow("valid amount")
        })

        test("negative amount throws", () => {
            expect(() => builder.testValidateOutput({ ...baseOutput, amount: -1 }, [])).toThrow("valid amount")
        })

        test("fractional amount throws", () => {
            expect(() => builder.testValidateOutput({ ...baseOutput, amount: 1.5 }, [])).toThrow("valid amount")
        })

        test("amount above bitcoin max money throws", () => {
            expect(() => builder.testValidateOutput({ ...baseOutput, amount: 2_100_000_000_000_001 }, [])).toThrow("valid amount")
        })

        test("invalid address throws", () => {
            expect(() => builder.testValidateOutput({ ...baseOutput, address: "bad" }, [])).toThrow("valid address")
        })

        test("empty address throws", () => {
            expect(() => builder.testValidateOutput({ ...baseOutput, address: "" }, [])).toThrow()
        })

        test("duplicate address throws", () => {
            expect(() => builder.testValidateOutput(baseOutput, [baseOutput])).toThrow("already been added")
        })

        test("network param rejects an address from a different network", () => {
            const testnetAddress = new ECPairKey({ network: "testnet" }).getAddress()
            expect(() => builder.testValidateOutput({ address: testnetAddress, amount: 1000 }, [], "mainnet"))
                .toThrow("valid address")
        })

        test("network param accepts an address from the matching network", () => {
            const mainnetAddress = new ECPairKey({ network: "mainnet" }).getAddress()
            expect(() => builder.testValidateOutput({ address: mainnetAddress, amount: 1000 }, [], "mainnet"))
                .not.toThrow()
        })

        test("omitting network param skips the network cross-check", () => {
            const testnetAddress = new ECPairKey({ network: "testnet" }).getAddress()
            expect(() => builder.testValidateOutput({ address: testnetAddress, amount: 1000 }, []))
                .not.toThrow()
        })
    })

    // ── outputsRaw ────────────────────────────────────────────────────────────
    describe("outputsRaw", () => {
        test("serializes single output to Uint8Array", () => {
            const raw = builder.testOutputsRaw([baseOutput])
            expect(raw).toBeInstanceOf(Uint8Array)
            expect(raw.length).toBeGreaterThan(0)
        })

        test("two outputs produce more bytes than one", () => {
            const addr2 = new ECPairKey().getAddress()
            const out2: OutputTransaction = { address: addr2, amount: 1000 }
            const one = builder.testOutputsRaw([baseOutput])
            const two = builder.testOutputsRaw([baseOutput, out2])
            expect(two.length).toBeGreaterThan(one.length)
        })

        test("invalid mutated output amount throws during serialization", () => {
            expect(() => builder.testOutputsRaw([{ ...baseOutput, amount: -1 }])).toThrow("Expected a valid amount")
        })
    })
})
