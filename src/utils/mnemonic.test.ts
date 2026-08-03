// MnemonicUtils.test.ts
import { MnemonicUtils } from './mnemonic';
import { wordlist } from '@scure/bip39/wordlists/english';

describe('MnemonicUtils', () => {
    describe('generateMnemonic', () => {
        test('should generate a 12-word mnemonic by default (128 bits)', () => {
            const mnemonic = MnemonicUtils.generateMnemonic();
            const words = mnemonic.split(' ');
            expect(words.length).toBe(12);
            words.forEach(word => {
                expect(wordlist).toContain(word);
            });
        });

        test('should generate a 24-word mnemonic when strength is 256 bits', () => {
            const mnemonic = MnemonicUtils.generateMnemonic(256);
            const words = mnemonic.split(' ');
            expect(words.length).toBe(24);
            words.forEach(word => {
                expect(wordlist).toContain(word);
            });
        });

        test('should throw an error for invalid strength value (e.g., 123)', () => {
            expect(() => MnemonicUtils.generateMnemonic(123 as any)).toThrow();
        });
    });

    describe('getWords', () => {
        test('should return the full wordlist if no search term is provided', () => {
            const result = MnemonicUtils.getWords();
            expect(result).toEqual(wordlist);
            expect(result.length).toBe(2048);
        });

        test('should return words that include the provided search term', () => {
            const result = MnemonicUtils.getWords('ab');
            expect(result.length).toBeGreaterThan(0);
            expect(result.every(word => word.includes('ab'))).toBe(true);
        });

        test('should trim and lowercase the search term before filtering', () => {
            const result1 = MnemonicUtils.getWords(' aB  ');
            const result2 = MnemonicUtils.getWords('AB');
            expect(result1).toEqual(result2);
        });

        test('should return an empty array if no matches are found', () => {
            const result = MnemonicUtils.getWords('nonexistentword');
            expect(result).toEqual([]);
        });
    });

    describe('validateMnemonic', () => {
        test('should return true for valid mnemonic', () => {
            const mnemonic = MnemonicUtils.generateMnemonic();
            expect(MnemonicUtils.validateMnemonic(mnemonic)).toBe(true);
        });

        test('should return false for invalid mnemonic', () => {
            const mnemonic = 'foo bar baz';
            expect(MnemonicUtils.validateMnemonic(mnemonic)).toBe(false);
        });
    });

    describe('mnemonicToEntropy', () => {
        test('should convert mnemonic to entropy', () => {
            const mnemonic = MnemonicUtils.generateMnemonic();
            const entropy = MnemonicUtils.mnemonicToEntropy(mnemonic);
            expect(entropy.length).toBe(16);
        });

        test('should throw for invalid mnemonic', () => {
            expect(() => MnemonicUtils.mnemonicToEntropy('invalid mnemonic')).toThrow('Invalid mnemonic.');
        });
    });

    describe('entropyToMnemonic', () => {
        test('should convert valid entropy to mnemonic', () => {
            const entropy = new Uint8Array([123,87,45,200,14,99,2,240,176,33,78,91,143,19,201,64]);
            const mnemonic = MnemonicUtils.entropyToMnemonic(entropy);
            expect(MnemonicUtils.validateMnemonic(mnemonic)).toBe(true);
        });

        test('should throw for invalid entropy hex', () => {
            expect(() => MnemonicUtils.entropyToMnemonic(new Uint8Array([1,2,3])))
                .toThrow("Invalid size entropy");
            expect(() => MnemonicUtils.entropyToMnemonic(new Uint8Array([23,45,34,213,45,57,3])))
                .toThrow("Invalid size entropy");

            const lowEntropy = new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
            expect(() => MnemonicUtils.entropyToMnemonic(lowEntropy))
                .toThrow("Low entropy, unsafe entropy level");

        });
    });

    describe('mnemonicToSeed', () => {
        test('should convert mnemonic to seed', () => {
            const mnemonic = MnemonicUtils.generateMnemonic();
            const seed = MnemonicUtils.mnemonicToSeed(mnemonic);
            expect(seed instanceof Uint8Array).toBe(true);
        });

        test('should throw if mnemonic is invalid', () => {
            expect(() => MnemonicUtils.mnemonicToSeed('invalid mnemonic'))
                .toThrow('Invalid mnemonic');
        });

        test('should throw if passphrase is not a string', () => {
            const mnemonic = MnemonicUtils.generateMnemonic();
            expect(() => MnemonicUtils.mnemonicToSeed(mnemonic, 123 as any))
                .toThrow('Passphrase must be a string');
        });
    });

    describe('getRandomWord', () => {
        test('should return a word from the wordlist', () => {
            const word = MnemonicUtils.getRandomWord();
            expect(wordlist).toContain(word);
        });

        test('should not use Math.random (must use a cryptographically secure source)', () => {
            const spy = jest.spyOn(Math, 'random');
            MnemonicUtils.getRandomWord();
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });

        test('should produce varied words across multiple calls', () => {
            const words = new Set(Array.from({ length: 25 }, () => MnemonicUtils.getRandomWord()));
            expect(words.size).toBeGreaterThan(1);
        });
    });
});
