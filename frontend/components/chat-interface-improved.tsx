"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Loader2, FileText, Home, Plus, MessageSquare, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

export function ChatInterfaceImproved() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Conversation",
      lastMessage: "",
      timestamp: new Date(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const selectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId("");
      setMessages([]);
    }
  };

  const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    const title = firstMessage.length > 50
      ? firstMessage.substring(0, 50) + "..."
      : firstMessage;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, title, lastMessage: firstMessage, timestamp: new Date() }
          : s
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let sessionId = currentSessionId;

    // Create new session if none exists
    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: input.length > 50 ? input.substring(0, 50) + "..." : input,
        lastMessage: input,
        timestamp: new Date(),
        messages: [],
      };
      sessionId = newSession.id;
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(sessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Update session title from first message
    if (messages.length === 0) {
      updateSessionTitle(sessionId, input);
    }

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        sources: data.sources,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Update session messages
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: updatedMessages, lastMessage: data.response.substring(0, 100) }
            : s
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, an error occurred. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (messages.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();

      const blob = new Blob([data.proposal], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-proposal-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating proposal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Chat History */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start mb-2">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Button onClick={createNewSession} className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground p-4">
                No conversations yet
              </div>
            ) : (
              sessions.map((session) => (
                <Card
                  key={session.id}
                  className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                    currentSessionId === session.id ? "bg-accent" : ""
                  }`}
                  onClick={() => selectSession(session.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-3 w-3 flex-shrink-0" />
                        <p className="text-sm font-medium truncate">
                          {session.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.lastMessage || "New conversation"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => deleteSession(session.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-center bg-background">
          <div>
            <h1 className="text-2xl font-bold">AI Presales Copilot</h1>
            <p className="text-sm text-muted-foreground">
              Describe your project vision and get AI-powered recommendations
            </p>
          </div>
          <Button
            onClick={handleGenerateProposal}
            disabled={messages.length === 0 || isLoading}
            variant="outline"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Proposal
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center max-w-md">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">
                      Welcome to AI Presales Copilot
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      Start a conversation to transform your ideas into actionable project proposals
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}

                <Card
                  className={`max-w-[85%] p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">
                        📚 References:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-3">
                    {message.timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>

                {message.role === "user" && (
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarFallback className="bg-secondary">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
                </Avatar>
                <Card className="p-4 bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area - Fixed at bottom, more prominent */}
        <div className="border-t p-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Describe your project needs... (e.g., I want to build an AI-powered educational platform)"
                disabled={isLoading}
                className="flex-1 text-base py-6"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="lg"
                className="px-8"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
