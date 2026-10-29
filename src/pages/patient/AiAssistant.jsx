import { useState } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { useSelector } from "react-redux";

const AiAssistant = () => {
  // Get logged-in patient from Redux
  const user = useSelector((state) => state.auth.user);

  const patientName = user?.fullName || "Patient";

  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "ai",
      text: `Hello ${patientName}! I'm your MedCare AI Health Assistant. Ask me anything about your symptoms, lab reports, medications, or recommended lifestyle choices.`,
      timestamp: "10:00 AM",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Quick prompts
  const samplePrompts = [
    "What are normal blood pressure ranges for adults?",
    "Explain symptoms of orthopedic joint inflammation",
    "Side effects of taking Amoxicillin with food",
    "How to prepare for a routine blood lab test?",
  ];

  // Send message
  const handleSend = (textToSend = "") => {
    const text = textToSend || input;

    if (!text.trim()) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);

    if (!textToSend) {
      setInput("");
    }

    setIsTyping(true);

    // Temporary fake AI response
    setTimeout(() => {
      let reply =
        "I analyzed your query in context with MedCare clinical guidelines. Please consult a qualified doctor for diagnosis and treatment.";

      const lower = text.toLowerCase();

      if (
        lower.includes("bp") ||
        lower.includes("blood pressure")
      ) {
        reply =
          "Normal adult blood pressure is generally below 120/80 mmHg. Blood pressure can vary depending on age, activity, stress, and other factors.";
      } else if (
        lower.includes("joint") ||
        lower.includes("inflammation")
      ) {
        reply =
          "Joint inflammation can cause swelling, tenderness, warmth, and stiffness. Rest, gentle movement, and appropriate medical evaluation may help depending on the cause.";
      } else if (
        lower.includes("amoxicillin") ||
        lower.includes("food")
      ) {
        reply =
          "Amoxicillin can generally be taken with or without food. Taking it with food may help reduce stomach discomfort for some people. Follow the instructions provided with your prescription.";
      } else if (
        lower.includes("blood") ||
        lower.includes("lab") ||
        lower.includes("test")
      ) {
        reply =
          "Some blood tests require fasting while others do not. Follow the preparation instructions provided by your doctor or laboratory.";
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 700);
  };

  // Reset chat
  const handleNewSession = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "ai",
        text: `Chat reset. How can I assist your health today, ${patientName}?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setInput("");
    setIsTyping(false);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Health Assistant
            </h1>

            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
              AI
            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            Instant medical guidance based on your patient care history
          </p>
        </div>

        {/* New Session */}
        <button
          onClick={handleNewSession}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />

          <span>New Session</span>
        </button>

      </div>

      {/* Chat Box */}
      <div className="flex h-[580px] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/40 p-6">

          {messages.map((message) => {

            const isUser = message.sender === "user";

            return (
              <div
                key={message.id}
                className={`flex max-w-[80%] gap-3 ${
                  isUser
                    ? "ml-auto flex-row-reverse"
                    : ""
                }`}
              >

                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm ${
                    isUser
                      ? "bg-purple-600"
                      : "bg-gradient-to-br from-blue-600 to-cyan-500"
                  }`}
                >
                  {isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message */}
                <div>

                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed shadow-sm sm:text-sm ${
                      isUser
                        ? "rounded-tr-none bg-blue-600 text-white"
                        : "rounded-tl-none border border-slate-100 bg-white text-slate-800"
                    }`}
                  >
                    {message.text}
                  </div>

                  <span className="mt-1 block px-1 text-[10px] text-slate-400">
                    {message.timestamp}
                  </span>

                </div>

              </div>
            );
          })}

          {/* Typing */}
          {isTyping && (
            <div className="flex items-center gap-2 py-2 text-xs text-slate-400">

              <Bot className="h-4 w-4 animate-bounce text-blue-600" />

              <span>
                MedCare AI is thinking...
              </span>

            </div>
          )}

        </div>

        {/* Quick Prompts */}
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap border-t border-slate-100 bg-white p-3">

          {samplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSend(prompt)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              <Sparkles className="h-3 w-3 text-blue-500" />

              <span>{prompt}</span>

              <ChevronRight className="h-3 w-3" />
            </button>
          ))}

        </div>

        {/* Medical Notice */}
        <div className="flex items-center gap-2 border-t border-blue-100/60 bg-blue-50/80 px-4 py-2 text-[11px] text-blue-800">

          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-blue-600" />

          <span>
            AI answers are for informational purposes and do not
            substitute direct professional medical advice.
          </span>

        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-4">

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            placeholder="Ask anything about your health, medications, or lab results..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800 outline-none focus:border-blue-500 sm:text-sm"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="shrink-0 rounded-full bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>

        </div>

      </div>
    </div>
  );
};

export default AiAssistant;