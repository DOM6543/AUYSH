import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles, Stethoscope, Mic, CornerDownLeft } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function AIAssistantDrawer() {
  const { isAiChatOpen, setIsAiChatOpen, chatMessages, sendAiChatMessage } = usePatient();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "Summarize cardiac risk factors",
    "Recommend AYUSH Dosha protocol",
    "Check Amlodipine interactions",
    "Generate differential diagnosis"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiChatOpen]);

  if (!isAiChatOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendAiChatMessage(inputText);
    setInputText("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-[#032e25] text-white flex items-center justify-between border-b border-[#084236]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                MediKiosk Clinical Copilot
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-emerald-300/80">
                Patient Context: Arun Kumar (MK-0001)
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAiChatOpen(false)}
            className="p-1 rounded-lg text-emerald-200/80 hover:text-white hover:bg-emerald-900/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-1.5 overflow-x-auto custom-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendAiChatMessage(prompt)}
              className="text-[11px] font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 rounded-full px-2.5 py-1 whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {chatMessages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isAi
                      ? "bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-xs"
                      : "bg-[#0b5344] text-white shadow-xs rounded-tr-xs"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isAi ? "text-slate-400" : "text-emerald-200"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about vitals, ECG rationale, drugs..."
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
          />
          <button
            type="button"
            onClick={() => {
              setInputText("Check Ayurvedic Hridya formulations for hypertension");
            }}
            className="p-2 text-slate-400 hover:text-emerald-700 transition cursor-pointer"
            title="Voice input simulation"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-[#0b5344] hover:bg-[#084236] disabled:opacity-40 text-white rounded-lg transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
