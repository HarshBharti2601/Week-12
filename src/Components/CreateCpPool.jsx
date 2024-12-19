import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID,createInitializeMint2Instruction,getMinimumBalanceForRentExemptMint } from "@solana/spl-token";

const ALT_TOKEN = new PublicKey('Es9vMFrzghAn6SYbvYm7VtPEw5dRG1adRcpKZmRS6Mns');
const POOL_PROGRAM_ID = new PublicKey('5yCuZfxuQxhVSTnKMUug8n8TbxVX8MwU6QgmxXYjfvHs'); 


export function CreateCpPool({ token }) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);
  const [error, setError] = useState(null);

  const { connection } = useConnection();

  const createPool = async () => {
    if (!connected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);

      const tokenAccount = await Token.getAssociatedTokenAddress(
        TOKEN_PROGRAM_ID,
        token.publicKey,
        publicKey,
      );

      const altTokenAccount = await Token.getAssociatedTokenAddress(
        TOKEN_PROGRAM_ID,
        ALT_TOKEN,
        publicKey,
      );

      const tokenBalance = await connection.getTokenAccountBalance(tokenAccount);
      const altTokenBalance = await connection.getTokenAccountBalance(altTokenAccount);

      if (tokenBalance.value.amount <= 0 || altTokenBalance.value.amount <= 0) {
        alert("You need more tokens to create a pool.");
        return;
      }

      const approveTx = new Transaction();

      approveTx.add(
        Token.createApproveInstruction(
          TOKEN_PROGRAM_ID,
          tokenAccount,
          POOL_PROGRAM_ID,
          publicKey,
          [],
          tokenBalance.value.amount
        )
      );

      approveTx.add(
        Token.createApproveInstruction(
          TOKEN_PROGRAM_ID,
          altTokenAccount,
          POOL_PROGRAM_ID,
          publicKey,
          [],
          altTokenBalance.value.amount
        )
      );

      const approvalTransaction = await sendTransaction(approveTx, connection);
      await connection.confirmTransaction(approvalTransaction);

      const createPoolTx = new Transaction();

      createPoolTx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: POOL_PROGRAM_ID,
          lamports: 1000,
        })
      );

      const poolTransaction = await sendTransaction(createPoolTx, connection);
      await connection.confirmTransaction(poolTransaction);

      setTransactionHash(poolTransaction);
      alert('Pool created successfully!');
    } catch (err) {
      console.error('Error creating pool:', err);
      setError('An error occurred while creating the pool.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Create Constant Product Pool</h3>
      <button onClick={createPool} disabled={isLoading}>
        {isLoading ? 'Creating Pool...' : 'Create Pool'}
      </button>
      {transactionHash && (
        <div>
          <p>Transaction Hash: <a href={`https://solscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">{transactionHash}</a></p>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
