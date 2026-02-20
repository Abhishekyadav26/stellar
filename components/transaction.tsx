"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { stellar } from "@/lib/stellar-helper";
import { BiPaperPlane } from "react-icons/bi";

interface TransactionProps {
  publicKey: string;
  onTransactionSuccess?: () => void;
}

interface TransactionState {
  status: "idle" | "sending" | "success" | "error";
  hash?: string;
  message?: string;
  error?: string;
}

export default function TransactionComponent({
  publicKey,
  onTransactionSuccess,
}: TransactionProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [transactionState, setTransactionState] = useState<TransactionState>({
    status: "idle",
  });
  const [copied, setCopied] = useState(false);

  const validateAddress = (address: string): boolean => {
    return address.startsWith("G") && address.length >= 56;
  };

  const validateAmount = (amount: string): boolean => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 10000;
  };

  const handleSendTransaction = async () => {
    if (!validateAddress(recipientAddress)) {
      setTransactionState({
        status: "error",
        error: "Invalid recipient address. Please check the Stellar address.",
      });
      return;
    }

    if (!validateAmount(amount)) {
      setTransactionState({
        status: "error",
        error:
          "Invalid amount. Please enter a valid amount between 0.0000001 and 10000 XLM.",
      });
      return;
    }

    try {
      setTransactionState({ status: "sending" });

      const result = await stellar.sendPayment({
        from: publicKey,
        to: recipientAddress,
        amount: amount,
        memo: memo.trim() || undefined,
      });

      if (result.success) {
        setTransactionState({
          status: "success",
          hash: result.hash,
          message: "Transaction sent successfully!",
        });
        setRecipientAddress("");
        setAmount("");
        setMemo("");
        onTransactionSuccess?.();
      } else {
        setTransactionState({
          status: "error",
          error: "Transaction failed. Please try again.",
        });
      }
    } catch (error: unknown) {
      console.error("Transaction error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Transaction failed. Please check your balance and try again.";
      setTransactionState({
        status: "error",
        error: errorMessage,
      });
    }
  };

  const handleCopyHash = async () => {
    if (transactionState.hash) {
      await navigator.clipboard.writeText(transactionState.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExplorerLink = () => {
    return transactionState.hash
      ? stellar.getExplorerLink(transactionState.hash, "tx")
      : "";
  };

  const resetForm = () => {
    setTransactionState({ status: "idle" });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BiPaperPlane className="h-5 w-5 text-primary" />
            Send XLM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactionState.status === "idle" && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="G..."
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amount (XLM)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.0000001"
                    min="0.0000001"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Transaction memo..."
                    maxLength={28}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                  />
                </div>
              </div>

              <Button
                onClick={handleSendTransaction}
                disabled={!recipientAddress || !amount || !publicKey}
                className="w-full flex items-center gap-2"
              >
                <BiPaperPlane className="h-4 w-4" />
                Send XLM
              </Button>
            </>
          )}

          {transactionState.status === "sending" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 border-2 border-primary border-r-transparent rounded-full"
              />
              <p className="text-foreground">Sending transaction...</p>
              <p className="text-muted-foreground text-sm">
                Please confirm in your wallet
              </p>
            </div>
          )}

          {transactionState.status === "success" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Transaction Successful!</span>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  Transaction Hash
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-mono text-green-900 dark:text-green-100 break-all">
                    {transactionState.hash}
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyHash}
                      className="h-8 w-8"
                      title={copied ? "Copied!" : "Copy hash"}
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                      title="View on explorer"
                    >
                      <a
                        href={getExplorerLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-green-700 dark:text-green-300 text-sm">
                {transactionState.message}
              </div>

              <Button variant="outline" onClick={resetForm} className="w-full">
                Send Another Transaction
              </Button>
            </div>
          )}

          {transactionState.status === "error" && (
            <>
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Transaction Failed</span>
              </div>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-destructive text-sm">
                  {transactionState.error}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button onClick={handleSendTransaction} className="flex-1">
                  Retry
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
