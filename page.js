"use client";
import { useState, useEffect } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("en"); // Default language is English
  const API_KEY = "AIzaSyB5aCLVpcPd1RzTxuwe3A9s0GgLDIY9xos";
  const MODEL_NAME = "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(API_KEY);

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  useEffect(() => {
    const initChat = async () => {
      try {
        console.log("Initializing chat...");

        if (!genAI) {
          throw new Error("GoogleGenerativeAI instance is not created");
        }

        console.log("Fetching generative model...");
        const model = await genAI.getGenerativeModel({ model: MODEL_NAME });

        console.log("Starting chat...");
        const newChat = await model.startChat({
          generationConfig,
          safetySettings,
          history: messages.map((msg) => ({
            text: msg.text,
            role: msg.role,
          })),
        });

        console.log("Chat initialized successfully");
        setChat(newChat);
      } catch (err) {
        console.error("Error during chat initialization:", err);
        setError("");
      }
    };

    initChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: "user",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");

      if (chat) {
        const translatedInput = await translateText(userInput, language, "en"); // Translate input to English

        const result = await chat.sendMessage(translatedInput);
        const translatedResponse = await translateText(result.response.text(), "en", language); // Translate response to the selected language

        const botMessage = {
          text: translatedResponse,
          role: "bot",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      setError("Failed to send a message, please try again later");
    }
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const translateText = async (text, targetLanguage, sourceLanguage = "en") => {
    // This is a placeholder function. Replace it with actual translation API call.
    // You need to implement translation logic using an API like Google Translate.
    return text; // Just returning text as is for now
  };

  const getThemeColors = () => {
    switch (theme) {
      case "light":
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800",
          inputBg: "bg-white",
          inputText: "text-gray-800",
        };
      case "dark":
        return {
          primary: "bg-gray-900",
          secondary: "bg-gray-800",
          accent: "bg-yellow-500",
          text: "text-gray-600",
          inputBg: "bg-gray-700",
          inputText: "text-gray-200",
        };
      default:
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800",
          inputBg: "bg-white",
          inputText: "text-gray-800",
        };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const { primary, secondary, accent, text, inputBg, inputText } = getThemeColors();

  return (
    <div
  className={`flex flex-col h-screen p-4 ${primary}`}
  style={{
    backgroundImage: "url('images/Image.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>

      <div className="flex justify-between items-center mb-4">
        <h1 className={`text-4xl font-bold ${text}`}>Personal AI Assistant</h1>
        <div className="flex space-x-2 items-center">
          <label htmlFor="theme" className={`text-sm ${text}`}>
            Theme:
          </label>
          <select
            id="theme"
            value={theme}
            onChange={handleThemeChange}
            className={`p-1 rounded-md border ${text}`}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <label htmlFor="language" className={`text-sm ${text}`}>
            Language:
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className={`p-1 rounded-md border ${text}`}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto ${secondary} rounded-md p-4 bg-opacity-70 bg-white`}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 p-4 rounded-lg ${
              msg.role === "user"
                ? `bg-blue-100 text-blue-900 text-right`
                : `bg-gray-200 text-gray-900 text-left`
            }`}
            style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
          >
            {msg.role === "bot" ? (
              <ReactMarkdown className={`text-base ${text}`}>
                {DOMPurify.sanitize(msg.text)}
              </ReactMarkdown>
            ) : (
              <p className={`text-base ${text}`}>{msg.text}</p>
            )}
            <p className={`text-xs mt-2 ${text}`}>
              {msg.role === "bot" ? "AI Assistant" : "You"} - {msg.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <div className="flex items-center mt-4">
        <input
          type="text"
          placeholder="Enter your prompt"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className={`flex-1 p-2 rounded-l-md border-t border-b border-l focus:outline-none focus:border-${accent} ${inputText} ${inputBg}`}
        />
        <button
          onClick={handleSendMessage}
          className={`p-2 ${accent} text-white rounded-r-md hover:bg-opacity-80 focus:outline-none`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
