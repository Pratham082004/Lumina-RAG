import React, { useState, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface StockData {
  ticker: string;
  currentPrice: number;
  previousClose: number;
  chart: { date: number; price: number }[];
}

interface StockTickerPillProps {
  ticker: string;
}

const StockTickerPill: React.FC<StockTickerPillProps> = ({ ticker }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanTicker = ticker.replace(/^\$/, '').trim().toUpperCase();

  const fetchStockData = async () => {
    if (data || loading || !cleanTicker) return;
    setLoading(true);
    setError(false);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      const response = await axios.get(`${baseUrl}/stocks/${encodeURIComponent(cleanTicker)}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch stock data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      fetchStockData();
    }, 200); // reduced delay for snappier feel
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  const isPositive = data ? data.currentPrice >= data.previousClose : true;
  const color = isPositive ? 'var(--accent-sage)' : 'var(--accent-rust)';
  const changePercent = data 
    ? (((data.currentPrice - data.previousClose) / data.previousClose) * 100).toFixed(2)
    : '0.00';

  return (
    <span 
      className="relative inline-block cursor-pointer font-sans"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="bg-[rgba(128,128,128,0.1)] text-text-primary px-2 py-0.5 rounded-md font-semibold border border-border-color transition-colors hover:bg-[rgba(128,128,128,0.15)] hover:border-border-hover text-[0.85em]">
        ${cleanTicker}
      </span>

      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 z-50 editorial-card p-4 pointer-events-none"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-text-primary text-sm">${cleanTicker}</span>
              {loading ? (
                <span className="text-xs text-text-secondary animate-pulse">Loading...</span>
              ) : error ? (
                <span className="text-xs text-error">Data unavailable</span>
              ) : data ? (
                <div className="text-right">
                  <div className="font-bold text-text-primary text-sm">${data.currentPrice.toFixed(2)}</div>
                  <div className="text-[11px] font-medium" style={{ color }}>
                    {isPositive ? '+' : ''}{changePercent}%
                  </div>
                </div>
              ) : null}
            </div>
            
            {data && !loading && !error && (
              <div className="w-full h-[50px] mt-2 opacity-90">
                <ResponsiveContainer>
                  <LineChart data={data.chart}>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={color} 
                      strokeWidth={2} 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export default StockTickerPill;
