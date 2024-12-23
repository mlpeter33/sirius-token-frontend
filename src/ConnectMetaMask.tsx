import React from 'react'
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
import CATTokenABI from './CATTokenABI';

declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider
    }
}

interface FormData {
    sendAdress: string,
    sendAmount: number;
}

export default function ConnectMetaMask() {

    const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({});
    const [adress, setAdress] = React.useState<string | null>(null);
    const [signer, setSigner] = React.useState<ethers.JsonRpcSigner | null>(null);
    const [provider, setProvider] = React.useState<ethers.BrowserProvider | null>(null);

    const [formData, setFormData] = React.useState<FormData>({
        sendAdress: "",
        sendAmount: 0
    });

    React.useEffect(() => {
        if (provider) {
            (async () => {
                try {
                    const _signer = await provider.getSigner();
                    setSigner(_signer)
                    const _adress = await _signer.getAddress();
                    setAdress(_adress)
                }
                catch (e) {
                    console.log("ERROR ", e)
                }
            })()
        }
    }, [provider])

    const handleConnect = async () => {
        console.log("Attempting to connect")
        console.log(window.ethereum)
        if (window.ethereum) {
            try {
                // SET provider
                const _provider = new ethers.BrowserProvider(window.ethereum)
                setProvider(_provider)
            } catch (e) {
                console.log("handleConnect ERROR ", e)
            }
        }
    }


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("setting form data", e.target.name, e.target.value)
        const { name, value } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    }

    // Validate inputs
    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        if (!formData.sendAdress) newErrors.sendAdress = "sendAdress is required";
        if (!formData.sendAmount) newErrors.sendAmount = "sendAmount is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const attemptSendTokens = async () => {
        if (provider) {
            try {
                // SET provider
                const contractAdress = "0xBB84E54C4e37bC06958947CEF3fbc8A587A38bb0"
                const contract = new ethers.Contract(contractAdress, CATTokenABI, signer);
                await contract.transfer(formData.sendAdress, formData.sendAmount)
            } catch (e) {
                console.log("handleSendTokens ERROR ", e)
            }
        }
    }

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validate()) {
            attemptSendTokens()
            // Handle successful submission
            setFormData({
                sendAdress: "",
                sendAmount: 0
            }); // Reset form
            setErrors({}); // Clear errors
        }
    }

    const isMetamaskInstalled = window.ethereum !== undefined
    if (!isMetamaskInstalled) {
        return <div>
            <h2>Metamask no esta instalado</h2>
        </div>
    }

    if (!adress) {
        return <div>
            <button className='btn' onClick={handleConnect}>Conectar con MetaMask <img width={30} src={"metamask.svg"} alt="Metamask Logo" /></button>
        </div>
    }

    if (provider && signer) {
        // Connect to contract
        const contractAdress = "0xBB84E54C4e37bC06958947CEF3fbc8A587A38bb0"
        const contract = new ethers.Contract(contractAdress, CATTokenABI, provider);
        // (async () => {
        //     console.log(await contract.getAddress())
        //     console.log(await contract.name())
        //     console.log("Total supply: ", await contract.totalSupply())
        //     const selfBalance = await contract.balanceOf(adress)
        //     console.log(ethers.formatUnits(selfBalance, 18))
        //     const ownerBalance = await contract.balanceOf("0x691C67E1b7276FF7c835D260db48ee3D1FB943B4")
        //     console.log(ethers.formatUnits(ownerBalance, 18))
        //     // const sendOK = await contract.transfer("0x691C67E1b7276FF7c835D260db48ee3D1FB943B4", 100)
        // })()
    }

    return (
        <div>
            <p>
                Adress: {adress}
            </p>
            <form className='sendForm' onSubmit={handleFormSubmit}>
                <label>Direccion para enviar</label>
                <input type="text" name={"sendAdress"} onChange={handleFormChange} placeholder="Adress"></input>
                <label>Cantidad a enviar</label>
                <input type="text" name={"sendAmount"} onChange={handleFormChange} placeholder="Amount"></input>
                <button className='btn' type="submit" >Mandar tokens </button>
            </form>
        </div>
    )
}
