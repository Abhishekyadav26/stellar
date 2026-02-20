"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { stellar } from "@/lib/stellar-helper";

interface BalanceDisplayProps {
  publicKey: string;
  onRefresh?: () => void;
}

interface BalanceDisplayRef {
  refresh: () => void;
}

const BalanceDisplay = forwardRef<BalanceDisplayRef, BalanceDisplayProps>(
  ({ publicKey, onRefresh }, ref) => {
    const [xlm, setXlm] = useState("0");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadBalance = useCallback(async () => {
      try {
        setLoading(true);
        setError("");
        const balanceData = await stellar.getBalance(publicKey);
        setXlm(balanceData.xlm);
        onRefresh?.();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load balance";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }, [publicKey, onRefresh]);

    useImperativeHandle(ref, () => ({
      refresh: loadBalance,
    }));

    useEffect(() => {
      if (publicKey) {
        loadBalance();
      }
    }, [publicKey, loadBalance]);

    const formatBalance = (bal: string): string => {
      const num = parseFloat(bal);
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 7,
      });
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Balance</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={loadBalance}
              disabled={loading}
              className="h-8 w-8"
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

            <div className="flex items-baseline space-x-2">
              <motion.span
                key={xlm}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl font-bold"
              >
                {formatBalance(xlm)}
              </motion.span>
              <span className="text-xl text-muted-foreground">XLM</span>
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              Stellar Testnet
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  },
);

BalanceDisplay.displayName = "BalanceDisplay";

export default BalanceDisplay;
