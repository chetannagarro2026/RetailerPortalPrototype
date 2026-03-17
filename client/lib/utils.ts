import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Number Format Configuration ──────────────────────────────────────
// Get format from environment variable: VITE_NUMBER_FORMAT ('international' or 'indian')
// Default: 'international'
const NUMBER_FORMAT = (import.meta.env.VITE_NUMBER_FORMAT || 'international') as 'international' | 'indian';

// ── Helper Functions ─────────────────────────────────────────────────

function getBaseNumericWords() {
  return {
    ones: ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"],
    teens: ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"],
    tens: ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"],
  };
}

function convertChunk(n: number, words: ReturnType<typeof getBaseNumericWords>): string {
  const { ones, teens, tens } = words;
  if (n === 0) return "";
  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    const tensPart = tens[Math.floor(n / 10)];
    const onesPart = ones[n % 10];
    return onesPart ? `${tensPart}-${onesPart}` : tensPart;
  }
  
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const hundredsPart = `${ones[hundreds]} Hundred`;
  const remainderPart = remainder ? ` ${convertChunk(remainder, words)}` : "";
  return hundredsPart + remainderPart;
}

// ── Internal Functions ───────────────────────────────────────────────

/**
 * Convert a number to words in international format (Thousand, Million, Billion, Trillion)
 */
function _numberToWordsInternational(num: number): string {
  if (num === 0) return "Zero";
  
  const words = getBaseNumericWords();
  const thousands = ["", "Thousand", "Million", "Billion", "Trillion"];

  // Handle negative numbers
  if (num < 0) {
    return "Minus " + _numberToWordsInternational(Math.abs(num));
  }

  // Handle decimals
  if (num % 1 !== 0) {
    const [intPart, decPart] = num.toString().split(".");
    const intWords = _numberToWordsInternational(parseInt(intPart));
    const decWords = decPart.split("").map(d => words.ones[parseInt(d)]).join(" ");
    return `${intWords} Point ${decWords}`;
  }

  let word = "";
  let chunkIndex = 0;
  let tempNum = Math.floor(num);

  while (tempNum > 0) {
    const chunk = tempNum % 1000;
    if (chunk !== 0) {
      const chunkWords = convertChunk(chunk, words);
      const scale = thousands[chunkIndex] ? ` ${thousands[chunkIndex]}` : "";
      word = chunkWords + scale + (word ? " " + word : "");
    }
    tempNum = Math.floor(tempNum / 1000);
    chunkIndex++;
  }

  return word.trim();
}

/**
 * Convert a number to words in Indian format (Crore, Lakh, Thousand)
 */
function _numberToWordsIndian(num: number): string {
  if (num === 0) return "Zero";
  
  const words = getBaseNumericWords();

  // Handle negative numbers
  if (num < 0) {
    return "Minus " + _numberToWordsIndian(Math.abs(num));
  }

  // Handle decimals
  if (num % 1 !== 0) {
    const [intPart, decPart] = num.toString().split(".");
    const intWords = _numberToWordsIndian(parseInt(intPart));
    const decWords = decPart.split("").map(d => words.ones[parseInt(d)]).join(" ");
    return `${intWords} Point ${decWords}`;
  }

  let word = "";
  let tempNum = Math.floor(num);

  // Arabs (Billion) - 1,000,000,000+
  const arabs = Math.floor(tempNum / 1000000000);
  if (arabs > 0) {
    word += convertChunk(arabs, words) + " Arab";
    tempNum = tempNum % 1000000000;
  }

  // Crores - 10,000,000+
  const crores = Math.floor(tempNum / 10000000);
  if (crores > 0) {
    if (word) word += " ";
    word += convertChunk(crores, words) + " Crore";
    tempNum = tempNum % 10000000;
  }

  // Lakhs - 100,000+
  const lakhs = Math.floor(tempNum / 100000);
  if (lakhs > 0) {
    if (word) word += " ";
    word += convertChunk(lakhs, words) + " Lakh";
    tempNum = tempNum % 100000;
  }

  // Thousands - 1,000+
  const thousands = Math.floor(tempNum / 1000);
  if (thousands > 0) {
    if (word) word += " ";
    word += convertChunk(thousands, words) + " Thousand";
    tempNum = tempNum % 1000;
  }

  // Remaining (hundreds, tens, ones)
  if (tempNum > 0) {
    if (word) word += " ";
    word += convertChunk(tempNum, words);
  }

  return word.trim();
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Convert a number to words (format determined by VITE_NUMBER_FORMAT env variable)
 * @param num - The number to convert (supports integers and decimals)
 * @returns The number in words using the configured format
 * 
 * Format options (set via VITE_NUMBER_FORMAT):
 * - "international": Thousand, Million, Billion (default)
 * - "indian": Crore, Lakh, Thousand
 */
export function numberToWords(num: number): string {
  return NUMBER_FORMAT === 'indian' 
    ? _numberToWordsIndian(num) 
    : _numberToWordsInternational(num);
}

/**
 * Convert currency amount to words (format determined by VITE_NUMBER_FORMAT env variable)
 * @param amount - The currency amount
 * @param currency - Currency type (default: "Dollar" for international, "Rupee" for indian)
 * @returns The amount in words using the configured format
 */
export function amountToWords(amount: number, currency?: string): string {
  if (NUMBER_FORMAT === 'indian') {
    return amountToWordsIndian(amount, currency);
  } else {
    return amountToWordsInternational(amount, currency);
  }
}

/**
 * Convert currency amount to words in international format (Dollars and Cents)
 * @param amount - The currency amount
 * @param currency - Currency type (default: "Dollar")
 * @returns The amount in words in international format
 */
export function amountToWordsInternational(amount: number, currency: string = "Dollar"): string {
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);
  
  const dollarWord = dollars === 1 ? currency : `${currency}s`;
  const centsWord = cents === 1 ? "Cent" : "Cents";
  
  let result = _numberToWordsInternational(dollars) + " " + dollarWord;
  
  if (cents > 0) {
    result += " and " + _numberToWordsInternational(cents) + " " + centsWord;
  }
  
  return result;
}

/**
 * Convert currency amount to words in Indian format (Rupees and Paise)
 * @param amount - The currency amount
 * @param currency - Currency type (default: "Rupee")
 * @returns The amount in words in Indian format
 */
export function amountToWordsIndian(amount: number, currency: string = "Rupee"): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  const rupeeWord = rupees === 1 ? currency : `${currency}s`;
  const paiseWord = paise === 1 ? "Paisa" : "Paise";
  
  let result = _numberToWordsIndian(rupees) + " " + rupeeWord;
  
  if (paise > 0) {
    result += " and " + _numberToWordsIndian(paise) + " " + paiseWord;
  }
  
  return result;
}
