import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, MessageSquare, Search, BarChart2, FileText, Send, User, Paperclip, Download, Edit, PanelLeftClose, PanelLeftOpen, MoreHorizontal, Trash2, ChevronDown, TrendingUp, Globe, Sparkles, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import StockTickerPill from '../components/StockTickerPill';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];

const ChartRenderer = ({ data }: { data: any }) => {
  if (!data || !data.type) return null;

  const renderChart = () => {
    switch (data.type) {
      case 'bar':
        return (
          <BarChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey={data.xKey || data.nameKey || 'name'} stroke="var(--text-secondary)" fontSize={12} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white', borderRadius: '12px' }} />
            <Legend />
            <Bar dataKey={data.yKey || data.dataKey || 'value'} fill="var(--accent-blue)" radius={[6, 6, 0, 0]} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data.data}
              dataKey={data.yKey || data.dataKey || 'value'}
              nameKey={data.xKey || data.nameKey || 'name'}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white', borderRadius: '12px' }} />
            <Legend />
          </PieChart>
        );
      case 'line':
        return (
          <LineChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey={data.xKey || data.nameKey || 'name'} stroke="var(--text-secondary)" fontSize={12} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white', borderRadius: '12px' }} />
            <Legend />
            <Line type="monotone" dataKey={data.yKey || data.dataKey || 'value'} stroke="var(--accent-purple)" strokeWidth={2} dot={{ fill: 'var(--accent-purple)', r: 3 }} />
          </LineChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div style={{ margin: '1.5rem 0', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
      {data.title && <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>{data.title}</h3>}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const suggestionCards = [
  { icon: <BarChart2 size={18} />, title: 'Analyze Stock', desc: 'Analyze the latest earnings report for Apple (AAPL)', color: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.08)' },
  { icon: <FileText size={18} />, title: 'Extract 10-K', desc: "Extract key risk factors from Tesla's recent 10-K", color: 'var(--accent-purple)', bg: 'rgba(139, 92, 246, 0.08)' },
  { icon: <TrendingUp size={18} />, title: 'Revenue Trends', desc: "Compare Microsoft and Google's revenue growth 2022-2024", color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.08)' },
  { icon: <Globe size={18} />, title: 'Market Analysis', desc: 'What are the current macroeconomic trends affecting tech?', color: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.08)' },
  { icon: <Briefcase size={18} />, title: 'Competitor Intel', desc: "Compare AMD and Intel's R&D spending and strategic focus", color: 'var(--accent-pink)', bg: 'rgba(236, 72, 153, 0.08)' },
  { icon: <Search size={18} />, title: 'Deep Dive', desc: "What are Amazon's key business segments and revenue split?", color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.08)' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.name || 'User';
  const firstName = userName.split(' ')[0];
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonTickers, setComparisonTickers] = useState('');
  const [showPinned, setShowPinned] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        startNewChat();
      }
    };
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
  }, [user?.id]);

  const fetchSessions = async () => {
    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      const res = await axios.get(`${authUrl}/history/${user.id}`);
      if (res.status === 200 || Array.isArray(res.data)) {
        setSessions(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setActiveSessionId(sessionId);
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      const res = await axios.get(`${authUrl}/history/session/${sessionId}`);
      if (res.status === 200 || Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        startNewChat();
      }
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      await axios.delete(`${authUrl}/history/session/${sessionId}`);
    } catch (error) {
      console.error('Failed to delete session:', error);
      fetchSessions();
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, presetQuestion?: string) => {
    if (e) e.preventDefault();
    
    const questionToAsk = presetQuestion || input;
    if (!questionToAsk.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: questionToAsk }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    try {
      let currentSessionId = activeSessionId;

      if (!currentSessionId) {
        const title = questionToAsk.substring(0, 30) + (questionToAsk.length > 30 ? '...' : '');
        const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
        const resSession = await axios.post(`${authUrl}/history/${user.id}`, { title });
        currentSessionId = resSession.data.id;
        setActiveSessionId(currentSessionId);
        setSessions([{ id: currentSessionId!, title, updatedAt: new Date().toISOString() }, ...sessions]);
      }

      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      await axios.post(`${authUrl}/history/session/${currentSessionId}/message`, {
        role: 'user',
        content: questionToAsk
      });

      let assistantResponse = '';
      let sources: any[] = [];
      
      setMessages(prev => [...prev, { role: 'assistant', content: '', sources: [] }]);

      try {
        const payload: any = {
          question: questionToAsk,
          limit: 3,
          session_id: currentSessionId
        };
        
        if (isComparisonMode && comparisonTickers.trim()) {
          payload.is_comparison = true;
          payload.tickers = comparisonTickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
        }

        const response = await fetch('http://localhost:8000/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.type === 'metadata') {
                      sources = data.sources || [];
                      setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], sources };
                        return newMsgs;
                      });
                    } else if (data.type === 'chunk') {
                      assistantResponse += data.content;
                      setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: assistantResponse };
                        return newMsgs;
                      });
                    }
                  } catch (e) {
                    console.error("Error parsing stream chunk", e, line);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("FastAPI error:", err);
        assistantResponse = assistantResponse || "I'm sorry, I encountered an error connecting to the RAG backend.";
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: assistantResponse };
          return newMsgs;
        });
      }

      setIsStreaming(false);

      await axios.post(`${authUrl}/history/session/${currentSessionId}/message`, {
        role: 'assistant',
        content: assistantResponse,
        sources
      });

      fetchSessions();

    } catch (error) {
      console.error("Chat flow error:", error);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = async (file: File) => {
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const title = `Analysis: ${file.name}`;
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      const resSession = await axios.post(`${authUrl}/history/${user.id}`, { title });
      currentSessionId = resSession.data.id;
      setActiveSessionId(currentSessionId);
      setSessions([{ id: currentSessionId!, title, updatedAt: new Date().toISOString() }, ...sessions]);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', currentSessionId!);

    try {
      setIsLoading(true);
      await axios.post('http://localhost:8000/ingest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages(prev => [...prev, { role: 'assistant', content: `✅ Successfully uploaded and processed **${file.name}**. You can now ask questions about it.` }]);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Failed to upload ${file.name}.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const exportToPDF = async (messageIndex: number) => {
    const element = document.getElementById(`message-${messageIndex}`);
    if (!element) return;
    const originalBackground = element.style.background;
    element.style.background = 'var(--bg-secondary)';
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#18181b', useCORS: true });
      element.style.background = originalBackground;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Lumina-Response-${messageIndex + 1}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      element.style.background = originalBackground;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <motion.div 
        animate={{ width: sidebarOpen ? 260 : 60 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'var(--sidebar-bg)', 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: '1px solid var(--border-color)',
          transition: 'background-color 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {isDragging && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10, color: 'white', backdropFilter: 'blur(4px)' }}>
            <FileText size={48} style={{ marginBottom: '1rem', color: 'var(--accent-blue)' }} />
            <p style={{ fontWeight: 500 }}>Drop file to upload</p>
          </div>
        )}
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', padding: sidebarOpen ? '1rem' : '1rem 0.5rem' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0 }}>L</div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Lumina</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.375rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: sidebarOpen ? '0 0.75rem' : '0 0.5rem', marginBottom: '1rem' }}>
          <button 
            onClick={startNewChat}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: sidebarOpen ? 'space-between' : 'center',
              padding: sidebarOpen ? '0.5rem 0.75rem' : '0.5rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              gap: '0.5rem',
            }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            title="New chat (Ctrl+Shift+N)"
          >
            {sidebarOpen && <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>New chat</span>}
            <Edit size={16} />
          </button>
        </div>

        {/* Sessions list - only show when sidebar is open */}
        {sidebarOpen && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Pinned Section */}
            {showPinned && (
            <div>
              <h3 style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', paddingLeft: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Pinned
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <MessageSquare size={14} style={{ flexShrink: 0, color: 'var(--text-secondary)' }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Lumina Finance Defaults</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === 'pinned' ? null : 'pinned'); }} 
                    style={{ cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', borderRadius: '4px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <MoreHorizontal size={14} />
                  </div>
                  <AnimatePresence>
                  {openDropdownId === 'pinned' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '4px', zIndex: 100, minWidth: '120px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                    >
                      <div onClick={(e) => { e.stopPropagation(); setShowPinned(false); setOpenDropdownId(null); }} style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-primary)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Unpin</div>
                      <div onClick={(e) => { e.stopPropagation(); setShowPinned(false); setOpenDropdownId(null); }} style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '6px', color: 'var(--error)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Delete</div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            )}

            {/* Recents Section */}
            <div>
              <h3 style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', paddingLeft: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Recents
              </h3>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
              >
                {sessions.length === 0 && (
                  <p style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No conversations yet</p>
                )}
                {sessions.map(chat => (
                  <motion.div 
                    key={chat.id} 
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    onClick={() => loadSession(chat.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      color: 'var(--text-primary)',
                      backgroundColor: activeSessionId === chat.id ? 'var(--sidebar-active)' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseOver={(e) => { if(activeSessionId !== chat.id) { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'; } }}
                    onMouseOut={(e) => { if(activeSessionId !== chat.id) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <MessageSquare size={14} style={{ flexShrink: 0, color: 'var(--text-secondary)' }} />
                      <span style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title}</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div 
                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === chat.id ? null : chat.id); }} 
                        style={{ cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', borderRadius: '4px' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <MoreHorizontal size={14} />
                      </div>
                      <AnimatePresence>
                      {openDropdownId === chat.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '4px', zIndex: 100, minWidth: '120px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                        >
                          <div onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-primary)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Pin</div>
                          <div onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-primary)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Rename</div>
                          <div onClick={(e) => { e.stopPropagation(); deleteSession(chat.id); setOpenDropdownId(null); }} style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '6px', color: 'var(--error)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Delete</div>
                        </motion.div>
                      )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {/* Profile Footer */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
               onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
               onClick={() => navigate('/settings')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.75rem', flexShrink: 0 }}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={userName} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                ) : (
                  userInitials
                )}
              </div>
              {sidebarOpen && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.jobTitle || 'Pro Plan'}</div>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex' }} title="Logout"
                onMouseOver={e => e.currentTarget.style.color = 'var(--error)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
        
        {messages.length === 0 ? (
          /* Empty State */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginBottom: '2.5rem' }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', marginBottom: '1.5rem' }}>
                <Sparkles size={28} color="white" />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {getGreeting()}, {firstName}.
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>How can I help you analyze today?</p>
            </motion.div>

            <div style={{ width: '100%', maxWidth: '768px' }}>
              {/* Compare Mode toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <button onClick={() => setIsComparisonMode(false)} style={{ padding: '0.375rem 0.875rem', background: !isComparisonMode ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', color: !isComparisonMode ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, transition: 'all 0.2s' }}>
                    Single
                  </button>
                  <button onClick={() => setIsComparisonMode(true)} style={{ padding: '0.375rem 0.875rem', background: isComparisonMode ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', color: isComparisonMode ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, transition: 'all 0.2s' }}>
                    Compare
                  </button>
                </div>
                {isComparisonMode && (
                  <motion.input 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    type="text" 
                    placeholder="Tickers (e.g., AAPL, MSFT)" 
                    value={comparisonTickers} 
                    onChange={(e) => setComparisonTickers(e.target.value)}
                    className="input-field"
                    style={{ padding: '0.375rem 0.75rem', borderRadius: '10px', fontSize: '0.8125rem', maxWidth: '220px' }}
                  />
                )}
              </div>

              {/* Main Input */}
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about SEC filings..."
                  style={{
                    width: '100%',
                    padding: '1.25rem 3.5rem 1.25rem 1.5rem',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    resize: 'none',
                    minHeight: '60px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(59, 130, 246, 0.08)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.15)'; }}
                  rows={1}
                />
                <label style={{
                    position: 'absolute',
                    right: '56px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <Paperclip size={18} />
                    <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept=".pdf,.txt" />
                  </label>
                <button 
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isLoading}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: input.trim() && !isLoading ? 'white' : 'rgba(255,255,255,0.1)',
                    color: input.trim() && !isLoading ? 'black' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '10px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Suggestion Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {suggestionCards.map((card, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSubmit(undefined, card.desc)}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '0.5rem',
                      padding: '1rem',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ color: card.color }}>{card.icon}</div>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{card.title}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{card.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat History View */
          <>
            <div ref={chatContainerRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ 
                      display: 'flex', 
                      gap: '1rem',
                      marginBottom: '1.5rem',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '10px',
                      background: msg.role === 'assistant' ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', flexShrink: 0,
                      border: msg.role === 'user' ? '1px solid var(--border-color)' : 'none',
                    }}>
                      {msg.role === 'assistant' ? (
                        <Sparkles size={16} />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    
                    <div 
                      id={`message-${idx}`}
                      style={{ 
                        maxWidth: '80%', 
                        background: msg.role === 'user' ? 'var(--bg-secondary)' : 'transparent',
                        border: msg.role === 'user' ? '1px solid var(--border-color)' : 'none',
                        padding: msg.role === 'user' ? '0.875rem 1.25rem' : '0.25rem 0',
                        borderRadius: msg.role === 'user' ? '18px' : '0',
                        color: 'var(--text-primary)',
                        lineHeight: '1.6',
                        overflowX: 'auto',
                        position: 'relative'
                      }}
                    >
                      <div className={`markdown-content${isStreaming && idx === messages.length - 1 && msg.role === 'assistant' ? ' streaming-cursor' : ''}`}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({node, inline, className, children, ...props}: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              if (!inline && match && match[1] === 'chart') {
                                try {
                                  const chartData = JSON.parse(String(children).replace(/\n$/, ''));
                                  return <ChartRenderer data={chartData} />;
                                } catch (e) {
                                  return <div style={{ color: 'var(--error)' }}>Failed to parse chart data.</div>;
                                }
                              }
                              return <code className={className} {...props}>{children}</code>;
                            },
                            a({node, href, children, ...props}: any) {
                              if (href && href.startsWith('ticker:')) {
                                const ticker = href.split(':')[1];
                                return <StockTickerPill ticker={ticker} />;
                              }
                              return <a href={href} {...props}>{children}</a>;
                            }
                          }}
                        >
                          {msg.content.replace(/\$([A-Z]{1,5})\b/g, '[$1](ticker:$1)')}
                        </ReactMarkdown>
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', fontSize: '0.8125rem', borderLeft: '3px solid var(--accent-blue)' }}>
                          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sources</p>
                          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
                            {msg.sources.map((src, i) => (
                              <li key={i} style={{ marginBottom: '0.25rem' }}>{src.title || src.metadata?.source || 'Document Extract'}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {msg.role === 'assistant' && !isLoading && msg.content && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button
                            onClick={() => exportToPDF(idx)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.625rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.75rem' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <Download size={13} />
                            <span>Export PDF</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && !isStreaming && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                      <Sparkles size={16} />
                    </div>
                    <div style={{ padding: '0.5rem 0', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', background: 'var(--accent-blue)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out' }}></span>
                        <span style={{ width: '6px', height: '6px', background: 'var(--accent-blue)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out 0.2s' }}></span>
                        <span style={{ width: '6px', height: '6px', background: 'var(--accent-blue)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out 0.4s' }}></span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>
            </div>

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={scrollToBottom}
                  className="scroll-to-bottom"
                >
                  <ChevronDown size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Bottom Input Area */}
            <div style={{ padding: '1rem 2rem 1.5rem', background: 'linear-gradient(to top, var(--bg-primary) 80%, transparent)' }}>
              <div style={{ maxWidth: '768px', margin: '0 auto', position: 'relative' }}>
                {isComparisonMode && (
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>Compare:</span>
                    <input 
                      type="text" 
                      placeholder="AAPL, MSFT, GOOG" 
                      value={comparisonTickers} 
                      onChange={(e) => setComparisonTickers(e.target.value)}
                      className="input-field"
                      style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8125rem', flex: 1, maxWidth: '250px' }}
                    />
                  </div>
                )}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  style={{
                    width: '100%',
                    padding: '0.875rem 3.5rem 0.875rem 1.25rem',
                    borderRadius: '18px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    fontFamily: 'Inter, sans-serif',
                    resize: 'none',
                    minHeight: '48px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    outline: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(59, 130, 246, 0.08)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'; }}
                  rows={1}
                />
                <button 
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isLoading}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    bottom: '10px',
                    background: input.trim() && !isLoading ? 'white' : 'rgba(255,255,255,0.1)',
                    color: input.trim() && !isLoading ? 'black' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '10px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                Lumina Finance can make mistakes. Verify important financial information.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
