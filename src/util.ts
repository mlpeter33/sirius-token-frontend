import { ethers } from "ethers";

export const signMessage = async ({ message, address, signature }: { message: Uint8Array | string, address: string, signature: ethers.SignatureLike }) => {
    try {
        const signerAddr = await ethers.verifyMessage(message, signature);
        if (signerAddr !== address) {
            return false;
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export const verifyMessage = async ({ message, signer }: { message: Uint8Array | string, signer: ethers.JsonRpcSigner }) => {
    try {
        const signature = await signer.signMessage(message);
        return signature;
    } catch (err) {
        console.log(err);
        return false;
    }
}