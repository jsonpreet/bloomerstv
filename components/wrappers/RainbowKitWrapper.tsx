'use client'
import React from 'react'

import '@rainbow-me/rainbowkit/styles.css'
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig
} from '@rainbow-me/rainbowkit'
import { polygon, polygonMumbai } from 'wagmi/chains'
// import { alchemyProvider } from 'wagmi/providers/alchemy'
import { APP_NAME, isMainnet } from '@/utils/config'
import { WagmiProvider, http } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import {
  LensConfig,
  LensProvider,
  development,
  production
} from '@lens-protocol/react-web'
import { bindings } from '@lens-protocol/wagmi'

const defaultChains = isMainnet ? [polygon] : [polygonMumbai]
const defaultTransports = {
  [polygon.id]: http(),
  [polygonMumbai.id]: http()
}

const config = getDefaultConfig({
  appName: APP_NAME,
  projectId: String(process.env.NEXT_PUBLIC_RAINBOW_KIT_PROJECT_ID),
  // @ts-ignore
  chains: defaultChains,
  transports: defaultTransports
})

const lensConfig: LensConfig = {
  environment: isMainnet ? production : development,
  bindings: bindings(config)
}

const queryClient = new QueryClient()

const RainbowKitWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <LensProvider config={lensConfig}>{children}</LensProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default RainbowKitWrapper
