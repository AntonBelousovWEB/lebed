import { useState } from 'react';
import forge from 'node-forge';

const useEncryption = (receivedPublicKeyPem) => {
  const [reqId, setReqId] = useState(0);

  const encryptData = (data) => {
    try {
      if (!data) {
        console.error('Data is null or undefined');
        return;
      }
      const publicKey = forge.pki.publicKeyFromPem(receivedPublicKeyPem);
      const encryptedId = publicKey.encrypt(JSON.stringify(reqId), 'RSA-OAEP');
      
      setReqId(prevId => prevId + 1);

      return {
        id: forge.util.encode64(encryptedId),
      };
    } catch (error) {
      console.error('Encryption error: ', error.message);
      throw error;
    }
  };

  return { encryptData };
};

export default useEncryption;