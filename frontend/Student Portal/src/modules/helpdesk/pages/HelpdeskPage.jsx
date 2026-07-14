import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../../core/services/api';

// Simple markdown renderer: bold, newlines, bullet points
const renderMarkdown = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part);
        return <span key={i}>{rendered}{i < lines.length - 1 && <br />}</span>;
    });
};

export const HelpdeskPage = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi there! I am your AI Helpdesk assistant. Ask me anything about your placement preparation, resume, or upcoming interviews.' }
    ]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userQuery = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
        setInput('');
        setIsTyping(true);

        const body = { message: userQuery };
        if (sessionId) body.session_id = sessionId;

        api.sendChatMessage(body)
            .then(res => {
                const { reply, session_id } = res.data;
                if (session_id) {
                    setSessionId(session_id);
                }
                setMessages(prev => [...prev, { role: 'bot', text: reply }]);
            })
            .catch(err => {
                console.error(err);
                setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting to the server. Please try again later." }]);
            })
            .finally(() => {
                setIsTyping(false);
            });
    };

    return (
        <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">AI Helpdesk</h1>
                <p className="text-gray-500">Your intelligent placement assistant</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                        <i className="fa-solid fa-robot"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 leading-tight">Placement Bot</h3>
                        <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 block"></span> Online
                        </span>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50/30 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                {msg.role === 'bot' ? renderMarkdown(msg.text) : msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-white border border-gray-200 text-gray-400 rounded-tl-none flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <div className="flex items-center gap-2 relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question here..." 
                            className="flex-1 pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm text-gray-800"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <i className="fa-solid fa-paper-plane text-xs"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
