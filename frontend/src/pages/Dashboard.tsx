import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, MessageSquare, Search, BarChart2, FileText, Send, User, Paperclip, Download, Edit, PanelLeftClose, PanelLeftOpen, MoreHorizontal, ChevronDown, TrendingUp, Globe, Sparkles, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import StockTickerPill from '../components/StockTickerPill';
import PageShell from '../components/PageShell';
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

const COLORS = ['#4B6E96', '#9E5540', '#5F7966', '#A67C46', '#2A4B75', '#8C3A25'];

const ChartRenderer = ({ data }: { data: any }) => {
  if (!data || !data.type) return null;

  const renderChart = () => {
    switch (data.type) {
      case 'bar':
        return (
          <BarChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" vertical={false} />
            <XAxis dataKey={data.xKey || data.nameKey || 'name'} stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }} itemStyle={{ color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', paddingTop: '10px' }} />
            <Bar dataKey={data.yKey || data.dataKey || 'value'} fill="var(--color-accent-blue)" radius={[4, 4, 0, 0]} />
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
              innerRadius={60}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              labelLine={false}
              stroke="var(--bg-secondary)"
              strokeWidth={2}
            >
              {data.data.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }} itemStyle={{ color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', paddingTop: '10px' }} />
          </PieChart>
        );
      case 'line':
        return (
          <LineChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" vertical={false} />
            <XAxis dataKey={data.xKey || data.nameKey || 'name'} stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }} itemStyle={{ color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', paddingTop: '10px' }} />
            <Line type="monotone" dataKey={data.yKey || data.dataKey || 'value'} stroke="var(--color-accent-rust)" strokeWidth={2} dot={{ fill: 'var(--color-accent-rust)', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        );
      default:
        return <div className="text-error font-sans text-sm p-4">Unsupported chart type</div>;
    }
  };

  return (
    <div className="editorial-card my-6 p-6">
      {data.title && <h3 className="mb-6 text-center font-serif text-lg font-medium tracking-tight text-text-primary">{data.title}</h3>}
      <div className="w-full h-[300px]">
        <ResponsiveContainer>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const suggestionCards = [
  { icon: <BarChart2 size={18} />, title: 'Analyze Stock', desc: 'Analyze the latest earnings report for Apple (AAPL)' },
  { icon: <FileText size={18} />, title: 'Extract 10-K', desc: "Extract key risk factors from Tesla's recent 10-K" },
  { icon: <TrendingUp size={18} />, title: 'Revenue Trends', desc: "Compare Microsoft and Google's revenue growth 2022-2024" },
  { icon: <Globe size={18} />, title: 'Market Analysis', desc: 'What are the current macroeconomic trends affecting tech?' },
  { icon: <Briefcase size={18} />, title: 'Competitor Intel', desc: "Compare AMD and Intel's R&D spending and strategic focus" },
  { icon: <Search size={18} />, title: 'Deep Dive', desc: "What are Amazon's key business segments and revenue split?" },
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

  // Auth Guard
  useEffect(() => {
    if (!userStr || !localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate, userStr]);

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
    <PageShell withNavbar={false} withFooter={false} withNavOffset={false} backdrop="subtle">
    <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* Sidebar */}
      <motion.div 
        animate={{ width: sidebarOpen ? 260 : 64 }}
        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col border-r border-border-color relative overflow-hidden shrink-0 transition-colors duration-200 ${isDragging ? 'bg-[rgba(75,110,150,0.05)]' : 'bg-sidebar-bg'}`}
      >
        {isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-white backdrop-blur-sm">
            <FileText size={48} className="mb-4 text-accent-blue" />
            <p className="font-medium font-sans">Drop file to upload</p>
          </div>
        )}
        
        {/* Top Header */}
        <div className={`flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center px-2'} py-4`}>
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center text-bg-primary font-bold font-serif text-lg shrink-0 shadow-sm">L</div>
              <span className="font-serif font-semibold text-lg text-text-primary tracking-tight whitespace-nowrap">Lumina</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text-secondary hover:text-text-primary hover:bg-border-color/50 p-1.5 rounded-lg transition-colors flex items-center justify-center"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        {/* New Chat Button */}
        <div className={`px-${sidebarOpen ? '3' : '2'} mb-4`}>
          <button 
            onClick={startNewChat}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-between px-3' : 'justify-center px-2'} py-2 bg-transparent border border-border-color rounded-xl text-text-primary cursor-pointer transition-all hover:bg-sidebar-hover hover:border-border-hover group`}
            title="New chat (Ctrl+Shift+N)"
          >
            {sidebarOpen && <span className="font-medium font-sans text-sm">New draft</span>}
            <Edit size={16} className="text-text-secondary group-hover:text-text-primary transition-colors" />
          </button>
        </div>

        {/* Sessions list - only show when sidebar is open */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-6">
            
            {/* Pinned Section */}
            {showPinned && (
            <div>
              <h3 className="text-[0.65rem] font-bold font-sans text-text-secondary mb-2 pl-3 uppercase tracking-widest">
                Pinned
              </h3>
              <div className="flex items-center justify-between px-3 py-2 text-text-primary text-sm cursor-pointer rounded-lg transition-colors hover:bg-sidebar-hover group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={14} className="shrink-0 text-text-secondary" />
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis font-sans">Lumina RAG Defaults</span>
                </div>
                <div className="relative">
                  <div 
                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === 'pinned' ? null : 'pinned'); }} 
                    className="cursor-pointer text-text-secondary p-1 flex rounded-md hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
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
                      className="absolute right-0 top-full mt-1 bg-bg-secondary border border-border-color rounded-lg p-1 z-[100] min-w-[120px] shadow-lg"
                    >
                      <div onClick={(e) => { e.stopPropagation(); setShowPinned(false); setOpenDropdownId(null); }} className="px-3 py-2 flex items-center gap-2 text-sm cursor-pointer rounded-md text-text-primary hover:bg-black/5 dark:hover:bg-white/5 font-sans">Unpin</div>
                      <div onClick={(e) => { e.stopPropagation(); setShowPinned(false); setOpenDropdownId(null); }} className="px-3 py-2 flex items-center gap-2 text-sm cursor-pointer rounded-md text-error hover:bg-error/10 font-sans">Delete</div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            )}

            {/* Recents Section */}
            <div>
              <h3 className="text-[0.65rem] font-bold font-sans text-text-secondary mb-2 pl-3 uppercase tracking-widest">
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
                  <p className="px-3 py-2 text-sm text-text-secondary italic font-serif">No conversations yet</p>
                )}
                {sessions.map(chat => (
                  <motion.div 
                    key={chat.id} 
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    onClick={() => loadSession(chat.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-text-primary transition-colors group ${activeSessionId === chat.id ? 'bg-sidebar-active font-medium' : 'hover:bg-sidebar-hover'}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare size={14} className="shrink-0 text-text-secondary" />
                      <span className="text-[13px] whitespace-nowrap overflow-hidden text-ellipsis font-sans">{chat.title}</span>
                    </div>
                    <div className="relative">
                      <div 
                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === chat.id ? null : chat.id); }} 
                        className={`cursor-pointer text-text-secondary p-1 flex rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-opacity ${activeSessionId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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
                          className="absolute right-0 top-full mt-1 bg-bg-secondary border border-border-color rounded-lg p-1 z-[100] min-w-[120px] shadow-lg"
                        >
                          <div onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} className="px-3 py-2 flex items-center gap-2 text-sm cursor-pointer rounded-md text-text-primary hover:bg-black/5 dark:hover:bg-white/5 font-sans">Pin</div>
                          <div onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} className="px-3 py-2 flex items-center gap-2 text-sm cursor-pointer rounded-md text-text-primary hover:bg-black/5 dark:hover:bg-white/5 font-sans">Rename</div>
                          <div onClick={(e) => { e.stopPropagation(); deleteSession(chat.id); setOpenDropdownId(null); }} className="px-3 py-2 flex items-center gap-2 text-sm cursor-pointer rounded-md text-error hover:bg-error/10 font-sans">Delete</div>
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
        <div className="p-3 border-t border-border-color">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} p-2 rounded-xl cursor-pointer transition-colors hover:bg-sidebar-hover group`}
               onClick={() => navigate('/settings')}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-border-color flex items-center justify-center text-text-primary font-medium font-sans text-xs shrink-0">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={userName} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <div className="text-[13px] font-medium text-text-primary whitespace-nowrap text-ellipsis overflow-hidden font-sans">{userName}</div>
                  <div className="text-[11px] text-text-secondary whitespace-nowrap text-ellipsis overflow-hidden font-sans">{user?.jobTitle || 'Pro Plan'}</div>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 rounded-md flex hover:text-error hover:bg-error/10 transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-bg-primary">
        
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl font-serif text-text-primary mb-3">
                {getGreeting()}, {firstName}.
              </h1>
              <p className="text-text-secondary font-sans text-lg">What financial insights are you looking for today?</p>
            </motion.div>

            <div className="w-full max-w-2xl">
              {/* Compare Mode toggle */}
              <div className="flex items-center gap-4 mb-6 justify-center">
                <div className="flex bg-[rgba(128,128,128,0.05)] rounded-lg p-1 border border-border-color">
                  <button onClick={() => setIsComparisonMode(false)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all font-sans ${!isComparisonMode ? 'bg-bg-secondary shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                    Single
                  </button>
                  <button onClick={() => setIsComparisonMode(true)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all font-sans ${isComparisonMode ? 'bg-bg-secondary shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                    Compare
                  </button>
                </div>
                {isComparisonMode && (
                  <motion.input 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    type="text" 
                    placeholder="Tickers (e.g. AAPL, MSFT)" 
                    value={comparisonTickers} 
                    onChange={(e) => setComparisonTickers(e.target.value)}
                    className="input-field max-w-[200px]"
                  />
                )}
              </div>

              {/* Main Input */}
              <div className="relative mb-8">
                <div className="editorial-card p-2 rounded-2xl relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about SEC filings..."
                    className="w-full bg-transparent text-text-primary font-sans text-base resize-none border-none outline-none py-3 pl-4 pr-24 min-h-[60px] max-h-[200px] overflow-y-auto placeholder:text-text-secondary/60"
                    rows={1}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <label className="text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl transition-colors">
                      <Paperclip size={18} />
                      <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt" />
                    </label>
                    <button 
                      onClick={() => handleSubmit()}
                      disabled={!input.trim() || isLoading}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${input.trim() && !isLoading ? 'bg-text-primary text-bg-primary shadow-sm hover:scale-105' : 'bg-black/5 dark:bg-white/5 text-text-secondary/50 cursor-not-allowed'}`}
                    >
                      <Send size={16} className={input.trim() && !isLoading ? 'ml-0.5' : ''} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestionCards.map((card, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                    onClick={() => handleSubmit(undefined, card.desc)}
                    className="editorial-card p-4 text-left group hover:scale-[1.02] active:scale-[0.98] border-border-color bg-transparent"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="text-text-primary">{card.icon}</div>
                      <span className="font-sans font-semibold text-sm text-text-primary">{card.title}</span>
                    </div>
                    <span className="font-serif text-[13px] text-text-secondary leading-snug line-clamp-2">{card.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat History View */
          <>
            <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col scroll-smooth">
              <div className="w-full max-w-3xl mx-auto pb-32">
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={`flex gap-4 mb-8 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-text-primary text-bg-primary' : 'bg-transparent border border-border-color text-text-secondary'}`}>
                        {msg.role === 'assistant' ? <Sparkles size={16} /> : <User size={16} />}
                      </div>
                      
                      <div 
                        id={`message-${idx}`}
                        className={`max-w-[85%] ${msg.role === 'user' ? 'bg-bg-secondary border border-border-color px-5 py-4 rounded-2xl rounded-tr-sm' : 'bg-transparent py-1'}`}
                      >
                        <div className={`markdown-content ${isStreaming && idx === messages.length - 1 && msg.role === 'assistant' ? 'streaming-cursor' : ''}`}>
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
                                    return <div className="text-error">Failed to parse chart data.</div>;
                                  }
                                }
                                return <code className={className} {...props}>{children}</code>;
                              },
                              a({node, href, children, ...props}: any) {
                                if (href && href.startsWith('ticker:')) {
                                  const ticker = href.split(':')[1];
                                  return <StockTickerPill ticker={ticker} />;
                                }
                                return <a href={href} className="text-accent-blue hover:underline underline-offset-2" {...props}>{children}</a>;
                              }
                            }}
                          >
                            {msg.content.replace(/\$([A-Z]{1,5})\b/g, '[$1](ticker:$1)')}
                          </ReactMarkdown>
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-6 p-4 bg-[rgba(128,128,128,0.04)] rounded-xl border border-border-color">
                            <p className="m-0 mb-3 font-sans font-semibold text-[11px] text-text-secondary uppercase tracking-widest">Sources & Citations</p>
                            <ul className="m-0 pl-5 text-text-secondary font-serif text-[13px] space-y-2">
                              {msg.sources.map((src, i) => (
                                <li key={i}>{src.title || src.metadata?.source || 'Document Extract'}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {msg.role === 'assistant' && !isLoading && msg.content && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => exportToPDF(idx)}
                              className="btn-ghost flex items-center gap-2 text-xs font-sans !py-1.5 px-3 border border-border-color hover:border-text-primary/30"
                            >
                              <Download size={14} />
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
                      className="flex gap-4 items-start"
                    >
                      <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center text-bg-primary shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <div className="py-2 text-text-secondary flex gap-2 items-center">
                        <div className="flex gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"></span>
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
                  initial={{ opacity: 0, y: 10, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 10, x: '-50%' }}
                  onClick={scrollToBottom}
                  className="absolute bottom-28 left-1/2 bg-bg-secondary border border-border-color text-text-secondary hover:text-text-primary rounded-full w-9 h-9 flex items-center justify-center shadow-lg transition-colors z-10"
                >
                  <ChevronDown size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Bottom Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 pb-6 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent pt-12">
              <div className="max-w-3xl mx-auto relative">
                {isComparisonMode && (
                  <div className="flex items-center mb-2 gap-2">
                    <span className="text-xs font-sans font-semibold text-accent-blue uppercase tracking-wider">Compare:</span>
                    <input 
                      type="text" 
                      placeholder="AAPL, MSFT" 
                      value={comparisonTickers} 
                      onChange={(e) => setComparisonTickers(e.target.value)}
                      className="bg-[rgba(128,128,128,0.1)] border border-border-color text-text-primary rounded-md px-3 py-1 text-xs font-sans outline-none focus:border-accent-blue max-w-[200px]"
                    />
                  </div>
                )}
                <div className="editorial-card p-2 rounded-2xl relative shadow-[0_8px_40px_rgba(0,0,0,0.12)] bg-bg-secondary">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a follow-up question..."
                    className="w-full bg-transparent text-text-primary font-sans text-base resize-none border-none outline-none py-3 pl-4 pr-16 min-h-[52px] max-h-[200px] overflow-y-auto placeholder:text-text-secondary/60"
                    rows={1}
                  />
                  <button 
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading}
                    className={`absolute right-3 bottom-3 w-8 h-8 flex items-center justify-center rounded-xl transition-all ${input.trim() && !isLoading ? 'bg-text-primary text-bg-primary shadow-sm hover:scale-105' : 'bg-black/5 dark:bg-white/5 text-text-secondary/50 cursor-not-allowed'}`}
                  >
                    <Send size={14} className={input.trim() && !isLoading ? 'ml-0.5' : ''} />
                  </button>
                </div>
                <div className="text-center mt-3 text-[11px] font-sans text-text-secondary/70">
                  Lumina can make mistakes. Verify important financial information.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </PageShell>
  );
};

export default Dashboard;
