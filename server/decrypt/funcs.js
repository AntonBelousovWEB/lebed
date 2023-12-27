const crypto = require('crypto');

const privateKey = require('fs').readFileSync('./keys/private_key.pem', 'utf8');
let reqId = 0;

const rsaPrivateKey = {
  key: privateKey,
  passphrase: process.env.SECRET_PHRASE
};

const decryptData = (encryptedData) => {
    const decryptedData = crypto.privateDecrypt(
      rsaPrivateKey,
      Buffer.from(encryptedData, 'base64'),
    ).toString('utf8');
           
    return {
      decryptedData,
      id: reqId++
    };
};  

module.exports = { decryptData };