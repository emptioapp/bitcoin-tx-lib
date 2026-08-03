import { generateMnemonic, mnemonicToEntropy, entropyToMnemonic, mnemonicToSeedSync,
    validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { randomBytes } from '@noble/hashes/utils.js';

/**
 * Utility class for BIP-39 mnemonic generation and wordlist management.
 */
export class MnemonicUtils 
{
    /**
     * Generates a new BIP-39 mnemonic phrase.
     * 
     * @param {number} [strength=128] - Entropy strength in bits. Common values: 128 (12 words), 256 (24 words).
     * @returns {string} A mnemonic phrase.
     * @throws {Error} If the provided strength is invalid or unsupported.
     */
    public static generateMnemonic(strength: 128|256 = 128): string 
    {
        const mnemonic = generateMnemonic(wordlist, strength)
        return mnemonic
    }

    /**
     * Retrieves the full BIP-39 wordlist or filters it by a search term.
     * 
     * @param {string} [searchTerm] - Optional term to filter words. Case-insensitive and trimmed.
     * @returns {string[]} A list of matching words, or the entire list if no search term is given.
     */
    public static getWords(searchTerm?: string): string[] 
    {        
        if(!searchTerm) return wordlist

        return wordlist.filter(w => {
            return w.includes(searchTerm.trim().toLowerCase())
        })
    }

    /**
    * Validates if the given mnemonic is valid according to BIP-39 rules.
    *
    * @param {string} mnemonic - The mnemonic phrase to validate.
    * @returns {boolean} True if valid, false otherwise.
    */
    public static validateMnemonic(mnemonic: string): boolean 
    {
        return validateMnemonic(mnemonic, wordlist);
    }

    /**
    * Converts a mnemonic phrase to its entropy (hex string).
    *
    * @param {string} mnemonic - The mnemonic to convert.
    * @returns {Uint8Array} The Uint8Array entropy.
    * @throws {Error} If the mnemonic is invalid.
    */
    public static mnemonicToEntropy(mnemonic: string): Uint8Array 
    {
        if (!this.validateMnemonic(mnemonic)) 
            throw new Error('Invalid mnemonic.')

        return mnemonicToEntropy(mnemonic, wordlist)
    }

    /**
    * Converts entropy (hex string) to a BIP-39 mnemonic phrase.
    *
    * @param {Uint8Array} entropy - The entropy to convert.
    * @returns {string} The resulting mnemonic phrase.
    */
    public static entropyToMnemonic(entropy: Uint8Array): string 
    {
        this.validateEntropy(entropy)

        return entropyToMnemonic(entropy, wordlist)
    }

    /**
    * Converts a mnemonic phrase into a BIP-39 seed.
    *
    * @param {string} mnemonic - The mnemonic phrase.
    * @param {string} [passphrase] - Optional passphrase.
    * @returns {Uint8Array} The resulting seed as a byte array.
    */
    public static mnemonicToSeed(mnemonic: string, passphrase: string = ''): Uint8Array 
    {
        if (typeof passphrase !== 'string') 
            throw new Error('Passphrase must be a string');

        if (!this.validateMnemonic(mnemonic)) 
            throw new Error('Invalid mnemonic')

        return mnemonicToSeedSync(mnemonic, passphrase)
    }

    /**
    * Returns a random word from the BIP-39 wordlist.
    * Uses a cryptographically secure random source (not `Math.random()`).
    *
    * @returns {string} A randomly selected word.
    */
    public static getRandomWord(): string
    {
        const index = new DataView(randomBytes(4).buffer).getUint32(0) % wordlist.length;
        return wordlist[index];
    }

    private static validateEntropy(entropy: Uint8Array)
    {
        const validLengths: number[] = [16, 20, 24, 28, 32]
        if(!validLengths.includes(entropy.length))           
            throw new Error("Invalid size entropy")
        if(this.isHighlyRepetitive(entropy))
            throw new Error("Low entropy, unsafe entropy level")
        // if(!this.isEntropyStrong(entropy))
        //     throw new Error("Low entropy, unsafe entropy level")
    }

    private static isHighlyRepetitive(entropy: Uint8Array): boolean 
    {
        const counts = new Map<number, number>();
        for (const byte of entropy) {
            counts.set(byte, (counts.get(byte) || 0) + 1);
        }

        // if 90% or more bytes are equals, is suspect
        return [...counts.values()].some(count => count / entropy.length >= 0.9);
    }

    private static isEntropyStrong(entropy: Uint8Array, minEntropyBits: number = 7.5): boolean 
    {
        const perByteEntropy = this.calculateShannonEntropy(entropy) / entropy.length;
        return perByteEntropy >= minEntropyBits; // típico: >= 7.5 de 8
    }

    private static calculateShannonEntropy(data: Uint8Array): number
    {
        const len = data.length;
        const freq: Record<number, number> = {};

        for (const byte of data) {
            freq[byte] = (freq[byte] || 0) + 1;
        }

        let entropy = 0;
        for (const byte in freq) {
            const p = freq[byte] / len;
            entropy -= p * Math.log2(p);
        }

        return entropy * 8; // bits de entropia por bloco total
    }
}
