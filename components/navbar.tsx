"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Wallet, Menu, X, TrendingUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { stellar } from "@/lib/stellar-helper";

interface NavbarProps {
  publicKey: string;
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function Navbar({
  publicKey,
  onConnect,
  onDisconnect,
}: NavbarProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const key = await stellar.connectWallet();
      setIsConnected(true);
      onConnect(key);
    } catch (error: unknown) {
      console.error("Connection error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect wallet";
      alert(`Failed to connect wallet:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    stellar.disconnect();
    setIsConnected(false);
    onDisconnect();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Stellar Demo</span>
          </motion.div>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          {!isConnected ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                <span>{loading ? "Connecting..." : "Connect Wallet"}</span>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono">
                  {formatAddress(publicKey)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="hidden sm:flex"
              >
                Disconnect
              </Button>
            </motion.div>
          )}

          {/* Mobile Menu Button */}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur"
        >
          <div className="container px-4 py-4 space-y-4">
            <a
              href="#transactions"
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <History className="h-4 w-4" />
              <span>Transactions</span>
            </a>
            {isConnected && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-mono">
                    {formatAddress(publicKey)}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
