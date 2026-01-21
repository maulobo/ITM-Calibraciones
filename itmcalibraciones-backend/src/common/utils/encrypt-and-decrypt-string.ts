import * as CryptoJS from 'crypto-js';

export const encryptString = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

export const decryptString = (hash: string, password: string): string => {
  return CryptoJS.AES.decrypt(hash, password).toString(CryptoJS.enc.Utf8);
};
