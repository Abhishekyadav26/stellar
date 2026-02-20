"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion } from "motion/react";
import { History, ExternalLink, Copy, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { stellar } from "@/lib/stellar-helper";

interface TransactionHistoryProps {
  publicKey: string;
  onRefresh?: () => void;
}

interface TransactionHistoryRef {
  refresh: () => void;
}

interface Transaction {
  id: string;
  type: string;
  amount?: string;
  asset?: string;
  from?: string;
  to?: string;
  createdAt: string;
  hash: string;
}

const TransactionHistory = forwardRef<
  TransactionHistoryRef,
  TransactionHistoryProps
>(({ publicKey, onRefresh }, ref) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const txHistory = await stellar.getRecentTransactions(publicKey, 10);
      setTransactions(txHistory);
      onRefresh?.();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load transactions";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, onRefresh]);

  useImperativeHandle(ref, () => ({
    refresh: loadTransactions,
  }));

  useEffect(() => {
    if (publicKey) {
      loadTransactions();
    }
  }, [publicKey, loadTransactions]);

  const handleCopyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(""), 2000);
  };

  const getExplorerLink = (hash: string) => {
    return stellar.getExplorerLink(hash, "tx");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount?: string) => {
    if (!amount) return "0";
    const num = parseFloat(amount);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });
  };

  const isSentTransaction = (tx: Transaction) => {
    return tx.from === publicKey;
  };

  if (!publicKey) {
    return null;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={loadTransactions}
            disabled={loading}
            className="h-8 w-8"
            title="Refresh transactions"
          >
            <motion.div
              animate={loading ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </motion.div>
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-6 w-6 border-2 border-primary border-r-transparent rounded-full"
              />
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm mt-1">
                Your transaction history will appear here
              </p>
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isSentTransaction(tx) ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                      <span className="font-medium text-foreground text-sm">
                        {isSentTransaction(tx) ? "Sent" : "Received"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {tx.asset || "XLM"}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(tx.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-foreground">
                      {isSentTransaction(tx) ? "-" : "+"}
                      {formatAmount(tx.amount)} {tx.asset || "XLM"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-xs font-mono truncate flex-1 mr-2">
                      {isSentTransaction(tx)
                        ? `To: ${stellar.formatAddress(tx.to || "")}`
                        : `From: ${stellar.formatAddress(tx.from || "")}`}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyHash(tx.hash)}
                        className="h-8 w-8"
                        title={
                          copied === tx.hash
                            ? "Copied!"
                            : "Copy transaction hash"
                        }
                      >
                        {copied === tx.hash ? (
                          <Copy className="h-4 w-4 text-green-600" />
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
                          href={getExplorerLink(tx.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-muted-foreground text-xs font-mono break-all">
                      Hash: {tx.hash}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

TransactionHistory.displayName = "TransactionHistory";

export default TransactionHistory;
