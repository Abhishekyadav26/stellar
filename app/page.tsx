"use client";
import { useState, useRef } from "react";
import { motion } from "motion/react";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import BalanceDisplay from "@/components/balance";
import TransactionComponent from "@/components/transaction";
import TransactionHistory from "@/components/transaction-history";

export default function Home() {
  const [publicKey, setPublicKey] = useState<string>("");
  const [transactionKey, setTransactionKey] = useState(0);
  const balanceRef = useRef<{ refresh: () => void }>(null);
  const transactionHistoryRef = useRef<{ refresh: () => void }>(null);

  const handleTransactionSuccess = () => {
    setTransactionKey((prev) => prev + 1);
    // Trigger automatic refreshes
    setTimeout(() => {
      balanceRef.current?.refresh();
      transactionHistoryRef.current?.refresh();
    }, 1000); // Small delay to ensure transaction is processed
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="stellar-ui-theme">
      <div className="min-h-screen bg-background">
        <Navbar
          publicKey={publicKey}
          onConnect={setPublicKey}
          onDisconnect={() => setPublicKey("")}
        />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {publicKey ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <BalanceDisplay ref={balanceRef} publicKey={publicKey} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  id="transactions"
                >
                  <TransactionComponent
                    key={transactionKey}
                    publicKey={publicKey}
                    onTransactionSuccess={handleTransactionSuccess}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <TransactionHistory
                    ref={transactionHistoryRef}
                    publicKey={publicKey}
                  />
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="max-w-md space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">
                      Welcome to Stellar Demo
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      Connect your wallet to start sending XLM transactions on
                      the Stellar testnet
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mt-8">
                    <div className="p-6 border rounded-lg bg-card">
                      <h3 className="text-lg font-semibold mb-2">
                        🚀 Send XLM
                      </h3>
                      <p className="text-muted-foreground">
                        Send XLM transactions to any Stellar address with
                        real-time feedback
                      </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-card">
                      <h3 className="text-lg font-semibold mb-2">
                        📊 Track Balance
                      </h3>
                      <p className="text-muted-foreground">
                        Monitor your XLM balance with automatic updates
                      </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-card">
                      <h3 className="text-lg font-semibold mb-2">
                        📜 Transaction History
                      </h3>
                      <p className="text-muted-foreground">
                        View your complete transaction history with detailed
                        information
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
