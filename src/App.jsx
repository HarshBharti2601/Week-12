import React,{ useMemo, useState } from "react";
import { ConnectionProvider,WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets"
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui'
import {clusterApiUrl} from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { TokenLaunchpad } from "./Components/Create-Token";

import { MintToken } from './Components/Mint-Token';
import { CreateCpPool } from './Components/CreateCpPool';

function App() {

  const [token,setToken] = useState(null);
  const [mintDone,setMintDone] = useState(false);

  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(()=>clusterApiUrl(network),[network]);
  //memoizes only when the variable network changes

  return (
    <ConnectionProvider endpoint = {"https://solana-mainnet.g.alchemy.com/v2/yBzlkWFR7LyZlmSKMjCBgTJEYK9LIktp"}>
      <WalletProvider wallets ={[]} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton/>
            <WalletDisconnectButton/>
            <TokenLaunchpad onTokenCreate={(tokenMint)=>{
              setToken(tokenMint);
            }}/>
            {token && token.toBase58()}
            {token && <MintToken onDone={()=>setMintDone(true)} mintAddress={token}/>}
            {mintDone && <CreateCpPool token={token}/>}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
      
    
  )
}

export default App
