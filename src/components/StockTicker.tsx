import { useEffect } from 'react';
import { useStockStore, STOCKS } from '../store/stockStore';
import { useTerminalStore } from '../store/terminalStore';

const STAKE = 500;

export default function StockTicker() {
  const prices = useStockStore(s => s.prices);
  const positions = useStockStore(s => s.positions);
  const tick = useStockStore(s => s.tick);
  const invest = useStockStore(s => s.invest);
  const settle = useStockStore(s => s.settle);

  useEffect(() => {
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [tick]);

  const addLog = useTerminalStore(s => s.addLog);

  return (
    <div className="bg-black/90 border border-yellow-500/30 rounded p-2 mb-2 w-full">
      <div className="text-[10px] text-yellow-400 font-bold mb-1">LIVE MARKET TICKER</div>
      <div className="flex flex-col gap-1 text-[9px] font-mono">
        {STOCKS.map(s => {
          const price = prices[s.id] ?? s.base;
          const pos = positions[s.id];
          return (
            <div key={s.id} className="flex items-center justify-between gap-1 text-white">
              <span>{s.name}: {price}eb{pos ? ` [${pos.type.toUpperCase()} ${pos.amount}@${pos.avgPrice}]` : ''}</span>
              <span className="flex gap-1">
                {!pos && (
                  <>
                    <button className="border border-green-500 text-green-400 px-1 hover:bg-green-500 hover:text-black" onClick={() => { if (invest(s.id, STAKE, 'long')) addLog(`> LONG ${s.name.toUpperCase()} ${STAKE}eb @ ${price}.`); }}>L500</button>
                    <button className="border border-red-500 text-red-400 px-1 hover:bg-red-500 hover:text-black" onClick={() => { if (invest(s.id, STAKE, 'short')) addLog(`> SHORT ${s.name.toUpperCase()} ${STAKE}eb @ ${price}.`); }}>S500</button>
                  </>
                )}
                {pos && (
                  <button className="border border-yellow-500 text-yellow-400 px-1 hover:bg-yellow-500 hover:text-black" onClick={() => { const p = settle(s.id); addLog(`> SETTLED ${s.name.toUpperCase()}: +${p} cr.`); }}>SETTLE</button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
