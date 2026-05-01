import { useState, useEffect } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';

const STOCKS = [
  { id: 'arasaka', name: 'Arasaka', base: 150, volatility: 0.3 },
  { id: 'militech', name: 'Militech', base: 120, volatility: 0.35 },
  { id: 'petrochem', name: 'Petrochem', base: 90, volatility: 0.25 },
  { id: 'biotechnica', name: 'Biotechnica', base: 110, volatility: 0.28 },
  { id: 'eurospace', name: 'Eurospace', base: 100, volatility: 0.2 },
  { id: 'sovspace', name: 'SovSpace', base: 80, volatility: 0.4 }
];

export default function StockTicker() {
  const [prices, setPrices] = useState(() => 
    STOCKS.reduce((acc, s) => ({ ...acc, [s.id]: s.base }), {})
  );
  const factionReputation = useMeatspaceStore(s => s.factionReputation);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        STOCKS.forEach(s => {
          const rep = factionReputation[s.id] || 0;
          const repMod = rep > 0 ? -0.1 : rep < 0 ? 0.1 : 0;
          const change = (Math.random() - 0.5 + repMod) * s.volatility * s.base;
          next[s.id] = Math.max(10, Math.min(500, Math.round((prev[s.id] + change) * 100) / 100));
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [factionReputation]);

  return (
    <div className="bg-black/90 border border-yellow-500/30 rounded p-2 mb-2">
      <div className="text-[10px] text-yellow-400 font-bold mb-1">LIVE MARKET TICKER</div>
      <div className="flex gap-3 overflow-x-auto text-[9px] font-mono">
        {STOCKS.map(s => {
          const price = prices[s.id];
          const rep = factionReputation[s.id] || 0;
          return (
            <div key={s.id} className={rep < 0 ? 'text-red-400' : rep > 0 ? 'text-green-400' : 'text-white'}>
              {s.name}: {price}eb {rep < 0 ? '▼' : rep > 0 ? '▲' : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}
