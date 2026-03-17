import React, { useEffect, useState } from 'react';
import ForexListWidget from '../components/trading/ForexListWidget';
import { Chart } from '../components/trading/Chart';
import { OrderPanel } from '../components/trading/OrderPanel';
import { TradeList } from '../components/trading/TradeList';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
export function TradePage() {
  const { assets } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(
    'Connecting to trading server...'
  );
  // Mobile Tab State
  const [mobileTab, setMobileTab] = useState<'order' | 'market' | 'trades'>(
    'order'
  );
  useEffect(() => {
    const statusMessages = [
    'Connecting to trading server...',
    'Authenticating session...',
    'Loading market data...',
    'Initializing chart engine...',
    'Syncing open positions...',
    'Ready'];

    let progressInterval: NodeJS.Timeout;
    let textInterval: NodeJS.Timeout;
    progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const increment = Math.max(1, Math.floor(Math.random() * 10));
        return Math.min(100, prev + increment);
      });
    }, 200);
    let msgIndex = 0;
    textInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % statusMessages.length;
      if (msgIndex < statusMessages.length) {
        setLoadingText(statusMessages[msgIndex]);
      }
    }, 600);
    const completeTimer = setTimeout(() => {
      setIsLoading(false);
      clearInterval(progressInterval);
      clearInterval(textInterval);
    }, 3000);
    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      clearTimeout(completeTimer);
    };
  }, []);
  return (
    <div className="h-screen w-full bg-white dark:bg-[#0d1117] overflow-hidden flex flex-col relative">
      <AnimatePresence>
        {isLoading &&
        <motion.div
          initial={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.5
          }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white">

            <div className="w-full max-w-md px-6 text-center">
              <motion.h1
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">

                ExplicitMarket <span className="text-[#2962ff]">Terminal</span>
              </motion.h1>

              <div className="w-full h-1 bg-gray-300 dark:bg-[#21262d] overflow-hidden mb-4">
                <motion.div
                className="h-full bg-[#2962ff]"
                initial={{
                  width: '0%'
                }}
                animate={{
                  width: `${loadingProgress}%`
                }}
                transition={{
                  ease: 'linear'
                }} />

              </div>

              <div className="flex justify-between items-center text-xs font-mono text-gray-600 dark:text-[#8b949e]">
                <motion.span
                key={loadingText}
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: 1
                }}
                className="truncate">

                  {loadingText}
                </motion.span>
                <span>{loadingProgress}%</span>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Mobile Symbol Selector */}
      <div className="md:hidden h-14 bg-gray-100 dark:bg-[#161b22] border-b border-gray-300 dark:border-[#21262d] flex items-center overflow-x-auto no-scrollbar px-2 space-x-2 flex-shrink-0">
        {assets.map((asset) =>
        <button
          key={asset.symbol}
          onClick={() => setSelectedSymbol(asset.symbol)}
          className={cn(
            'px-3 py-2 rounded text-xs font-bold whitespace-nowrap transition-colors min-h-[44px] flex items-center',
            selectedSymbol === asset.symbol ?
            'bg-[#2962ff] text-white' :
            'bg-white dark:bg-[#0d1117] text-gray-600 dark:text-[#8b949e] border border-gray-300 dark:border-[#21262d]'
          )}>

            {asset.symbol}
          </button>
        )}
      </div>

      {/* Main Layout - MT4 Style Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Market Overview (Desktop Only) */}
        <div className="hidden md:block w-[300px] flex-shrink-0 border-r border-gray-300 dark:border-[#21262d] overflow-y-auto p-4 bg-white dark:bg-[#0d1117]">
          <ForexListWidget />
        </div>

        {/* Center: Chart (Always visible, but flexible height on mobile) */}
        <div className="flex-shrink-0 h-48 md:h-auto md:flex-1 min-w-0 border-b md:border-b-0 border-gray-300 dark:border-[#21262d]">
          <Chart symbol={selectedSymbol} />
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex bg-gray-100 dark:bg-[#161b22] border-b border-gray-300 dark:border-[#21262d] flex-shrink-0">
          {['order', 'market', 'trades'].map((tab) =>
          <button
            key={tab}
            onClick={() => setMobileTab(tab as any)}
            className={cn(
              'flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors min-h-[44px] flex items-center justify-center',
              mobileTab === tab ?
              'border-[#2962ff] text-white dark:bg-[#1c2128] bg-[#e0f2ff]' :
              'border-transparent text-gray-600 dark:text-[#8b949e]'
            )}>

              {tab}
            </button>
          )}
        </div>

        {/* Mobile Content Area (Switches based on tab) */}
        <div className="md:hidden flex-1 overflow-hidden flexible">
          <div
            className={cn(
              'h-full overflow-y-auto',
              mobileTab === 'order' ? 'block' : 'hidden'
            )}>

            <OrderPanel symbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
          </div>
          <div
            className={cn(
              'h-full overflow-y-auto',
              mobileTab === 'market' ? 'block' : 'hidden'
            )}>

            <div className="p-4">
              <ForexListWidget />
            </div>

          </div>
          <div
            className={cn(
              'h-full overflow-y-auto',
              mobileTab === 'trades' ? 'block' : 'hidden'
            )}>

            <TradeList />
          </div>
        </div>

        {/* Right: Order Panel (Desktop Only) */}
        <div className="hidden md:block w-[320px] flex-shrink-0 border-l border-gray-300 dark:border-[#21262d]">
          <OrderPanel symbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
        </div>
      </div>

      {/* Bottom: Trade List (Desktop Only) */}
      <div className="hidden md:block h-[250px] flex-shrink-0 border-t border-gray-300 dark:border-[#21262d]">
        <TradeList />
      </div>
    </div>);

}