import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import App from "./App";
import { walletConfig, zeroGMainnet } from "./wallet";
import "@rainbow-me/rainbowkit/styles.css";
import "./styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={walletConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={zeroGMainnet}
          modalSize="compact"
          theme={darkTheme({
            accentColor: "#d9ff43",
            accentColorForeground: "#10120d",
            borderRadius: "medium",
            overlayBlur: "small"
          })}
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
