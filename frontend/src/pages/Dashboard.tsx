import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Plus, MessageSquare, Search, BarChart2, FileText, Send, User, Pin, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ChartRenderer = ({ data }: { data: any }) => {
  if (!data || !data.type) return null;

  const renderChart = () => {
    switch (data.type) {
      case 'bar':
        return (
          <BarChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={data.xKey || data.nameKey || 'name'} stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white' }} />
            <Legend />
            <Bar dataKey={data.yKey || data.dataKey || 'value'} fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
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
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white' }} />
            <Legend />
          </PieChart>
        );
      case 'line':
        return (
          <LineChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={data.xKey || data.nameKey || 'name'} stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white' }} />
            <Legend />
            <Line type="monotone" dataKey={data.yKey || data.dataKey || 'value'} stroke="var(--accent-purple)" strokeWidth={2} />
          </LineChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div style={{ margin: '2rem 0', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      {data.title && <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>{data.title}</h3>}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.name || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch all sessions on mount
  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
  }, [user?.id]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/auth/history/${user.id}`);
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setActiveSessionId(sessionId);
      const res = await axios.get(`http://localhost:4000/api/auth/history/session/${sessionId}`);
      if (res.data.success) {
        setMessages(res.data.data.messages);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, presetQuestion?: string) => {
    if (e) e.preventDefault();
    
    const questionToAsk = presetQuestion || input;
    if (!questionToAsk.trim()) return;

    // Optimistic UI update
    const newMessages = [...messages, { role: 'user' as const, content: questionToAsk }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      let currentSessionId = activeSessionId;

      // 1. Create a new session if one doesn't exist
      if (!currentSessionId) {
        const title = questionToAsk.substring(0, 30) + (questionToAsk.length > 30 ? '...' : '');
        const resSession = await axios.post(`http://localhost:4000/api/auth/history/${user.id}`, { title });
        currentSessionId = resSession.data.data.id;
        setActiveSessionId(currentSessionId);
        
        // Optimistically update sessions list
        setSessions([{ id: currentSessionId!, title, updatedAt: new Date().toISOString() }, ...sessions]);
      }

      // 2. Save User Message to DB
      await axios.post(`http://localhost:4000/api/auth/history/session/${currentSessionId}/message`, {
        role: 'user',
        content: questionToAsk
      });

      // 3. Get Answer from FastAPI backend
      let assistantResponse = '';
      let sources: any[] = [];
      
      // Initialize empty assistant message for streaming
      setMessages(prev => [...prev, { role: 'assistant', content: '', sources: [] }]);

      try {
        const response = await fetch('http://localhost:8000/chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: questionToAsk,
            limit: 3,
            session_id: currentSessionId
          })
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
              buffer = lines.pop() || ''; // Keep the incomplete line in the buffer
              
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

      // 4. Save Assistant Message to DB
      await axios.post(`http://localhost:4000/api/auth/history/session/${currentSessionId}/message`, {
        role: 'assistant',
        content: assistantResponse,
        sources
      });

      // Refresh sessions to get latest updatedAt order
      fetchSessions();

    } catch (error) {
      console.error("Chat flow error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = async (file: File) => {
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const title = `Analysis: ${file.name}`;
      const resSession = await axios.post(`http://localhost:4000/api/auth/history/${user.id}`, { title });
      currentSessionId = resSession.data.data.id;
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
      setMessages(prev => [...prev, { role: 'assistant', content: `Successfully uploaded and processed ${file.name}. You can now ask questions about it.` }]);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Failed to upload ${file.name}.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          width: '260px', 
          backgroundColor: isDragging ? 'rgba(255,255,255,0.05)' : 'var(--bg-secondary)', 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: isDragging ? '2px dashed var(--accent-blue)' : '1px solid var(--border-color)',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        {isDragging && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10, color: 'var(--text-primary)', backdropFilter: 'blur(4px)' }}>
            <FileText size={48} style={{ marginBottom: '1rem', color: 'var(--accent-blue)' }} />
            <p style={{ fontWeight: 500 }}>Drop file to upload</p>
          </div>
        )}
        <div style={{ padding: '1.5rem 1rem' }}>
          <button 
            onClick={startNewChat}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', fontFamily: 'Lora, serif' }}>Lumina Finance</span>
            </span>
            <Plus size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
              Recent Chats
            </h3>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
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
                    gap: '0.75rem', 
                    padding: '0.5rem', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    color: activeSessionId === chat.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: activeSessionId === chat.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'background-color 0.2s ease, color 0.2s ease'
                  }}
                  onMouseOver={(e) => { if(activeSessionId !== chat.id) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                  onMouseOut={(e) => { if(activeSessionId !== chat.id) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                >
                  <MessageSquare size={14} />
                  <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Profile Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
               onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.875rem', flexShrink: 0 }}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={userName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  userInitials
                )}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.jobTitle || 'Pro Plan'}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
        
        {messages.length === 0 ? (
          /* Empty State */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '2.5rem', fontWeight: 500, fontFamily: 'Lora, serif', marginBottom: '3rem', color: 'var(--text-primary)' }}
            >
              Ready when you are.
            </motion.h1>

            <div style={{ width: '100%', maxWidth: '768px' }}>
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  style={{
                    width: '100%',
                    padding: '1.25rem 3.5rem 1.25rem 1.5rem',
                    borderRadius: '24px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    resize: 'none',
                    minHeight: '60px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    outline: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
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
                    borderRadius: '50%',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                    background: input.trim() && !isLoading ? 'white' : '#444',
                    color: input.trim() && !isLoading ? 'black' : '#888',
                    border: 'none',
                    borderRadius: '50%',
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

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleSubmit(undefined, "Analyze the latest earnings report for Apple (AAPL)")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)' }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                  <BarChart2 size={16} />
                  <span>Analyze Stock</span>
                </button>
                <button onClick={() => handleSubmit(undefined, "Extract key risk factors from Tesla's recent 10-K")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)' }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                  <FileText size={16} />
                  <span>Extract 10-K</span>
                </button>
                <button onClick={() => handleSubmit(undefined, "What are the current macroeconomic trends affecting tech?")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)' }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                  <Search size={16} />
                  <span>Search Market</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Chat History View */
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
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
                      gap: '1.5rem',
                      marginBottom: '2rem',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        <span style={{ fontWeight: 'bold', fontSize: '12px' }}>AI</span>
                      </div>
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3F3F46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        <User size={20} />
                      </div>
                    )}
                    
                    <div style={{ 
                      maxWidth: '85%', 
                      background: msg.role === 'user' ? 'var(--bg-secondary)' : 'transparent',
                      border: msg.role === 'user' ? '1px solid var(--border-color)' : 'none',
                      padding: msg.role === 'user' ? '1rem 1.5rem' : '0.5rem 0',
                      borderRadius: msg.role === 'user' ? '24px' : '0',
                      color: 'var(--text-primary)',
                      lineHeight: '1.6',
                      overflowX: 'auto'
                    }}>
                      <div className="markdown-content">
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
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.875rem', borderLeft: '3px solid var(--accent-blue)' }}>
                          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-secondary)' }}>Sources:</p>
                          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                            {msg.sources.map((src, i) => (
                              <li key={i}>{src.title || src.metadata?.source || 'Document Extract'}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                      <span style={{ fontWeight: 'bold', fontSize: '12px' }}>AI</span>
                    </div>
                    <div style={{ padding: '0.5rem 0', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out' }}></span>
                        <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out 0.2s' }}></span>
                        <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out 0.4s' }}></span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>
            </div>

            {/* Bottom Input Area */}
            <div style={{ padding: '1rem 2rem 2rem', background: 'linear-gradient(to top, var(--bg-primary) 80%, transparent)' }}>
              <div style={{ maxWidth: '768px', margin: '0 auto', position: 'relative' }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  style={{
                    width: '100%',
                    padding: '1rem 3.5rem 1rem 1.5rem',
                    borderRadius: '24px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    resize: 'none',
                    minHeight: '52px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    outline: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  rows={1}
                />
                <button 
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isLoading}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: input.trim() && !isLoading ? 'white' : '#444',
                    color: input.trim() && !isLoading ? 'black' : '#888',
                    border: 'none',
                    borderRadius: '50%',
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
              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Lumina Finance can make mistakes. Verify important financial information.
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
