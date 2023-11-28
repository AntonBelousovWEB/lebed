import forge from 'node-forge';

export const encryptData = (receivedPublicKeyPem, data, setData, setId = null) => {
    try {
      if (!data) {
        console.error('Data is null or undefined');
        return;
      }
      setId && setId((prev) => prev + 1);
      const publicKey = forge.pki.publicKeyFromPem(receivedPublicKeyPem);
      const encryptedData = publicKey.encrypt(data, 'RSA-OAEP');
      setData(forge.util.encode64(encryptedData));
    } catch (error) {
      console.error('Encryption error: ', error.message);
      throw error;
    }
};