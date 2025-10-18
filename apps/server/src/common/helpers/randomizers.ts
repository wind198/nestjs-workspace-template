const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';
const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const getRandomChar = (str: string) =>
  str[Math.floor(Math.random() * str.length)];

export const generateRandomAlphanumeric = (length: number): string => {
  const chars = lowercase + numbers;
  let output = '';
  for (let i = 0; i < length; i++) {
    output += getRandomChar(chars);
  }
  // if output not contain any number, add a number
  if (!output.match(/\d+/)) {
    output += getRandomChar(numbers);
  }
  // if output not contain any uppercase, add a uppercase
  if (!output.match(/[A-Z]/)) {
    output += getRandomChar(uppercase);
  }
  return output;
};

export const generateRandomPassword = (length: number): string => {
  const chars = lowercase + uppercase + numbers + symbols;
  let output = '';
  for (let i = 0; i < length; i++) {
    output += getRandomChar(chars);
  }
  // if output not contain any number, add a number
  if (!output.match(/\d+/)) {
    output += getRandomChar(numbers);
  }
  // if output not contain any uppercase, add a uppercase
  if (!output.match(/[A-Z]/)) {
    output += getRandomChar(uppercase);
  }
  // if output not contain any symbol, add a symbol
  if (!output.match(/[!@#$%^&*()_+-=[]{}|;:,.<>?]/)) {
    output += getRandomChar(symbols);
  }
  // if output not contain any lowercase, add a lowercase
  if (!output.match(/[a-z]/)) {
    output += getRandomChar(lowercase);
  }
  return output;
};
