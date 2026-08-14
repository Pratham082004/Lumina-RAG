import React, { useState, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

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

  const fetchStockData = async () => {
    if (data || loading) return;
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(`http://localhost:8000/stocks/${ticker}`);
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
    }, 300); // 300ms delay before showing tooltip to avoid flashing
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  const isPositive = data ? data.currentPrice >= data.previousClose : true;
  const color = isPositive ? '#00C49F' : '#FF8042'; // Green or Red
  const changePercent = data 
    ? (((data.currentPrice - data.previousClose) / data.previousClose) * 100).toFixed(2)
    : '0.00';

  return (
    <span 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.15)', // Light blue background
          color: '#60A5FA', // Blue text
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          transition: 'all 0.2s',
          fontSize: '0.9em'
        }}
      >
        ${ticker}
      </span>

      {isHovered && (
        <div 
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            backgroundColor: '#1F2937', // Dark gray
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '12px',
            width: '200px',
            zIndex: 1000,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: 'white' }}>${ticker}</span>
            {loading ? (
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Loading...</span>
            ) : error ? (
              <span style={{ fontSize: '12px', color: '#EF4444' }}>Error</span>
            ) : data ? (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', color: 'white' }}>${data.currentPrice.toFixed(2)}</div>
                <div style={{ fontSize: '12px', color: color }}>
                  {isPositive ? '+' : ''}{changePercent}%
                </div>
              </div>
            ) : null}
          </div>
          
          {data && !loading && !error && (
            <div style={{ width: '100%', height: '60px', marginTop: '4px' }}>
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

          {/* Tooltip Arrow */}
          <div 
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '12px',
              height: '12px',
              backgroundColor: '#1F2937',
              borderBottom: '1px solid #374151',
              borderRight: '1px solid #374151',
            }}
          />
        </div>
      )}
    </span>
  );
};

export default StockTickerPill;
