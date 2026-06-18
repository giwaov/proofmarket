import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const zeroGMainnet = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: {
    name: "0G",
    symbol: "0G",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://evmrpc.0g.ai"]
    }
  },
  blockExplorers: {
    default: {
      name: "0G Chainscan",
      url: "https://chainscan.0g.ai"
    }
  }
});

const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
  "00000000000000000000000000000000";

export const walletConfig = getDefaultConfig({
  appName: "ProofMarket",
  appDescription: "Verifiable capability passports for autonomous AI agents.",
  appUrl: "https://proofmarket-alpha.vercel.app",
  projectId: walletConnectProjectId,
  chains: [zeroGMainnet],
  ssr: false
});
