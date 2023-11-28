const crypto = require('crypto');

const privateKey = require('fs').readFileSync('./keys/private_key.pem', 'utf8');
let reqId = 0;

const rsaPrivateKey = {
  key: privateKey,
  passphrase: process.env.SECRET_PHRASE
};

const decryptData = (encryptedData1, encryptedData2) => {
    const decryptedData1 = crypto.privateDecrypt(
      rsaPrivateKey,
      Buffer.from(encryptedData1, 'base64'),
    ).toString('utf8');
  
    const decryptedData2 = crypto.privateDecrypt(
      rsaPrivateKey,
      Buffer.from(encryptedData2, 'base64'),
    ).toString('utf8');
  
    return {
      decryptedData1,
      decryptedData2,
      id: reqId++
    };
};  

module.exports = { decryptData };