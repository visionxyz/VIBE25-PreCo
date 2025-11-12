"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Send, Loader2, FileText, Home, Plus, MessageSquare,
  Trash2, CheckCircle, Eye, Send as SendIcon
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface Proposal {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  committed: boolean;
  sessionId: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

// Demo conversation about AI Financial Report Generator
// Client asks questions, AI proposes solutions
const DEMO_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Hi, I run a financial advisory firm. We spend too much time manually creating investment reports for our clients. I heard AI can help with this?",
    timestamp: new Date(Date.now() - 2000000),
  },
  {
    id: "2",
    role: "assistant",
    content: "Absolutely! AI can dramatically speed up report generation while improving quality and consistency. I'd love to help you design a solution.\n\nLet me understand your needs better:\n\n1. **Who are your clients?** (Individual investors, institutions, both?)\n2. **What types of investments do you cover?** (Stocks, bonds, crypto, real estate?)\n3. **How many reports do you create per month?**\n4. **What does a typical report include?** (Analysis, recommendations, charts?)\n5. **Any specific pain points** in your current process?",
    timestamp: new Date(Date.now() - 1950000),
  },
  {
    id: "3",
    role: "user",
    content: "We serve about 30 institutional clients - mostly hedge funds and asset managers. We cover stocks, forex, and cryptocurrencies. Right now we produce 50-100 reports per day, and each report takes 2-3 hours to write. The reports need market analysis, risk assessment, and specific buy/sell recommendations.",
    timestamp: new Date(Date.now() - 1900000),
  },
  {
    id: "4",
    role: "assistant",
    content: "That's 100-300 hours daily on report writing! AI can reduce this to minutes per report.\n\nGreat news - our company has existing AI infrastructure for financial analysis that we can leverage:\n- Real-time market data processing systems\n- AI models for financial forecasting\n- Natural language generation technology\n- Risk assessment frameworks\n\n**Here's what we can build:**\n\nAn automated system that:\n1. Pulls real-time data from stock/forex/crypto markets\n2. Uses AI to analyze trends and patterns\n3. Generates comprehensive reports in your style\n4. Includes charts, risk scores, and recommendations\n5. Can be customized per client\n\n**Key questions:**\n- What's your budget for this project?\n- When do you need it operational?\n- Do you have an existing tech team, or need us to handle everything?",
    timestamp: new Date(Date.now() - 1850000),
  },
  {
    id: "5",
    role: "user",
    content: "We have a small IT team - maybe 8 people, but they mostly handle our current systems. For budget, we could allocate around $150,000 for development. Ideally, we'd want something working in 3-4 months. Is that realistic?",
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: "6",
    role: "assistant",
    content: "Yes, that's absolutely realistic! With $150K and 4 months, we can deliver a solid MVP.\n\n## Proposed Solution\n\n**What You'll Get:**\n\n**1. Automated Report Generator**\n- Input: Select client + date range\n- Output: Professional report in 2-3 minutes\n- Formats: PDF, Excel, Web dashboard\n\n**2. AI Analysis Engine**\n- Analyzes 1000s of data points automatically\n- Identifies trends, risks, opportunities\n- Generates natural language insights\n- Uses our proven financial AI models\n\n**3. Customization**\n- Brand with your logo/colors\n- Templates per client type\n- Adjustable risk tolerance levels\n\n**4. Admin Dashboard**\n- Generate reports on demand\n- Review before sending\n- Track delivery & opens\n- Usage analytics\n\n## Timeline (4 Months)\n\n**Month 1:** Connect to data sources, build core engine\n**Month 2:** AI integration, report templates\n**Month 3:** Dashboard, customization features\n**Month 4:** Testing, training your team, launch\n\n## Investment Breakdown\n\n**Development:** $135,000\n- Software development: $100K\n- AI setup & training: $20K\n- Design & UX: $10K\n- Testing & deployment: $5K\n\n**Monthly Operating Costs:** ~$10,000\n- Cloud hosting: $4K\n- AI processing (for 100 reports/day): $3K\n- Data feeds: $2K\n- Maintenance: $1K\n\n**ROI:** At 150 hours saved daily, you'll break even in months!\n\nWould you like me to add any specific features?",
    timestamp: new Date(Date.now() - 1750000),
  },
  {
    id: "7",
    role: "user",
    content: "This sounds perfect! One thing - sometimes markets crash or spike suddenly. Can the system alert us immediately when something big happens?",
    timestamp: new Date(Date.now() - 1700000),
  },
  {
    id: "8",
    role: "assistant",
    content: "Excellent thinking! Real-time alerts are critical for financial services.\n\n## Adding Real-Time Alert System\n\n**What It Does:**\n\n**1. Smart Monitoring**\n- Watches all your tracked assets 24/7\n- Detects unusual price movements (>5% swings)\n- Identifies volume spikes\n- Monitors breaking financial news\n- Tracks regulatory announcements\n\n**2. Instant Notifications**\n- Email alerts\n- SMS text messages  \n- Push notifications to mobile app\n- Integration with Slack/Teams if you use them\n\n**3. Customizable Rules**\n- Set different thresholds per asset\n- Create watchlists for VIP clients\n- Choose notification channels\n- Quiet hours settings\n\n**Example Alert:**\n*\"⚠️ ALERT: Tesla (TSLA) dropped 7.2% in last hour. Volume 3x normal. Breaking news: CEO resignation rumors.\"*\n\n**Additional Cost:**\n- Development: +$15,000 (total: $150K)\n- Monthly: +$2,000 for real-time data streaming\n\n**Final Numbers:**\n- **Total Development: $150,000** ✓ (exactly your budget!)\n- **Monthly Operating: ~$12,000**\n\nThis gives you a complete solution: automated reports + real-time monitoring.",
    timestamp: new Date(Date.now() - 1650000),
  },
  {
    id: "9",
    role: "user",
    content: "Great! But I'm concerned about data security. Our clients are very sensitive about their investment data. How do you handle that?",
    timestamp: new Date(Date.now() - 1600000),
  },
  {
    id: "10",
    role: "assistant",
    content: "Security is our top priority, especially for financial data. Here's how we protect your information:\n\n## Security Measures\n\n**1. Data Encryption**\n- All data encrypted in transit (TLS 1.3)\n- All data encrypted at rest (AES-256)\n- End-to-end encryption for sensitive fields\n\n**2. Access Control**\n- Role-based permissions system\n- Multi-factor authentication (MFA)\n- IP whitelisting for your team\n- Audit logs for all data access\n\n**3. Compliance**\n- SOC 2 Type II certified infrastructure\n- GDPR compliant\n- Regular security audits\n- Penetration testing quarterly\n\n**4. Data Isolation**\n- Your data completely isolated from other clients\n- No cross-client data sharing\n- Option for dedicated database instance\n\n**5. Privacy**\n- AI models don't store your actual data\n- We can sign BAA/NDA agreements\n- Option for on-premise deployment (additional cost)\n\nWe also offer a **private cloud option** if you need even higher security - adds ~$20K to development and $5K/month to ops.",
    timestamp: new Date(Date.now() - 1550000),
  },
  {
    id: "11",
    role: "user",
    content: "That's reassuring. Another question - our analysts have their own writing styles and insights. Will the AI reports sound generic, or can they match our brand voice?",
    timestamp: new Date(Date.now() - 1500000),
  },
  {
    id: "12",
    role: "assistant",
    content: "Excellent question! Brand consistency is crucial for maintaining client trust.\n\n## Customization & Voice Matching\n\n**1. Training on Your Style**\n- We'll analyze 20-30 of your existing reports\n- AI learns your tone, terminology, and structure\n- Maintains your firm's unique voice\n- Can create different styles for different client types\n\n**2. Analyst Input**\n- Analysts can add custom insights before finalizing\n- \"Expert notes\" section for human judgment calls\n- Review & edit before sending\n- AI learns from your edits over time\n\n**3. Template Flexibility**\n- Multiple report templates (conservative, aggressive, balanced)\n- Custom sections per client preference\n- Your branding, logos, color schemes\n- Disclaimers and legal language\n\n**4. Quality Control**\n- Every report can be reviewed before delivery\n- Flag certain types for mandatory human review\n- A/B testing to optimize client engagement\n- Feedback loop improves quality continuously\n\n**Process:**\n1. AI generates draft report (90% complete)\n2. Analyst reviews, adds insights (5-10 min)\n3. Final approval & send\n\nYou get speed + automation while keeping your expertise and brand.",
    timestamp: new Date(Date.now() - 1450000),
  },
  {
    id: "13",
    role: "user",
    content: "I like that! What if some of our clients want different report formats or additional analysis? Can we customize per client?",
    timestamp: new Date(Date.now() - 1400000),
  },
  {
    id: "14",
    role: "assistant",
    content: "Absolutely! Client-specific customization is built into the system.\n\n## Per-Client Customization\n\n**1. Report Configurations**\n- Save different templates per client\n- Custom sections (e.g., \"ESG Analysis\" for some clients)\n- Different length/depth levels\n- Include/exclude specific asset classes\n\n**2. Data Preferences**\n- Some clients want more technical indicators\n- Others prefer fundamental analysis\n- Custom risk scoring models\n- Specific benchmarks to compare against\n\n**3. Delivery Options**\n- PDF via email (most common)\n- Excel with raw data\n- API integration to their systems\n- White-labeled client portal\n- Scheduled delivery times\n\n**4. Visual Customization**\n- Chart styles and colors\n- Logo placement\n- Custom branding per client\n- Include client-specific disclaimers\n\n**5. Language & Terminology**\n- Use client's preferred terms\n- Different industries use different jargon\n- Multi-language support (English, Chinese, etc.)\n\n**Easy Management:**\nYou'll have a simple interface to configure all these settings per client. Once set up, it runs automatically!",
    timestamp: new Date(Date.now() - 1350000),
  },
  {
    id: "15",
    role: "user",
    content: "This is getting better and better. One last concern - what happens if something goes wrong? Like, what if the AI makes a wrong recommendation or the system goes down?",
    timestamp: new Date(Date.now() - 1300000),
  },
  {
    id: "16",
    role: "assistant",
    content: "Great question - reliability and accuracy are critical in finance. Here's our approach:\n\n## Risk Mitigation & Support\n\n**1. Quality Assurance**\n- Multi-layer validation checks before output\n- Cross-reference multiple data sources\n- Anomaly detection flags unusual recommendations\n- Historical accuracy tracking and scoring\n- Confidence levels shown for each recommendation\n\n**2. Human Oversight**\n- Recommended: Human review for high-stakes decisions\n- Auto-flag reports that need extra review\n- Clear \"AI-generated\" disclosures\n- Final approval always with your team\n\n**3. System Reliability**\n- 99.9% uptime SLA\n- Redundant systems (no single point of failure)\n- Automatic failover if primary system issues\n- Real-time monitoring & alerts\n- Backup data sources if primary feed fails\n\n**4. Error Handling**\n- If insufficient data: Report marked \"incomplete\" instead of guessing\n- If conflicting signals: Presents both scenarios\n- If system uncertainty is high: Flags for human review\n\n**5. Support & Maintenance**\n- 24/7 technical support\n- Dedicated account manager\n- Monthly system health reports\n- Quarterly AI model updates\n- On-call engineer for critical issues\n\n**6. Legal Protection**\n- Clear documentation: AI is a tool, not a replacement for human judgment\n- You control final approval\n- Audit trail of all AI decisions\n- Professional liability insurance on our end\n\n**Incident Response:**\nIf issues occur: We have a 15-minute response time and full incident post-mortems with corrective actions.\n\nThe system makes your team faster and more consistent - but you remain in control.",
    timestamp: new Date(Date.now() - 1250000),
  },
  {
    id: "17",
    role: "user",
    content: "Perfect. I'm convinced this could really transform our operations. How do we get started, and what's the onboarding process like?",
    timestamp: new Date(Date.now() - 1200000),
  },
  {
    id: "18",
    role: "assistant",
    content: "Fantastic! I'm excited to help you transform your operations. Here's the implementation roadmap:\n\n## Getting Started Process\n\n**Phase 1: Discovery & Planning (Week 1-2)**\n- Kickoff meeting with your team\n- Deep-dive into your current workflow\n- Collect sample reports for AI training\n- Map out data sources\n- Finalize requirements & customizations\n\n**Phase 2: Foundation (Month 1)**\n- Set up secure infrastructure\n- Connect to market data feeds\n- Build core database & API\n- Begin AI model training on your reports\n- Weekly progress updates\n\n**Phase 3: AI Development (Month 2)**\n- Train AI on your writing style\n- Develop report generation engine\n- Build custom templates\n- Implement alert system\n- First prototype demo to your team\n\n**Phase 4: Platform Build (Month 3)**\n- Build admin dashboard\n- Develop client portal (if needed)\n- Integrate customization features\n- Set up user roles & permissions\n- Beta testing with 2-3 clients\n\n**Phase 5: Launch Preparation (Month 4)**\n- Full system testing\n- Security audit\n- Train your team (2-day workshop)\n- Create documentation\n- Pilot launch with select clients\n- Fine-tune based on feedback\n\n**Phase 6: Go Live**\n- Gradual rollout to all clients\n- Monitor performance closely\n- Daily check-ins first week\n- Optimize based on real usage\n- Full handoff & support begins\n\n## What We Need From You\n\n1. **Access**: API keys for your data sources\n2. **Examples**: 20-30 sample reports\n3. **Point Person**: 1-2 people from your team for coordination\n4. **Testing**: 1-2 analysts for beta testing\n5. **Time**: ~5 hours/week from your team during development\n\n## What You'll Receive\n\n- Fully functional system\n- Admin training (2 days)\n- Complete documentation\n- 30 days of intensive post-launch support\n- Ongoing monthly support & updates\n\nReady to move forward? I can prepare a detailed proposal with everything we've discussed!",
    timestamp: new Date(Date.now() - 1150000),
  },
];

export function ChatInterfaceDemo() {
  // Default demo data
  const defaultSession = {
    id: "demo-1",
    title: "AI Financial Report Generator",
    lastMessage: "Ready to move forward? I can prepare a detailed proposal...",
    timestamp: new Date(),
    messages: DEMO_MESSAGES,
  };

  const [sessions, setSessions] = useState<ChatSession[]>([defaultSession]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("demo-1");
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from localStorage after hydration (client-side only)
  useEffect(() => {
    setIsHydrated(true);

    const savedSessions = localStorage.getItem('chat-sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const sessionsWithDates = parsed.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setSessions(sessionsWithDates);

        // If we have a current session, load its messages
        const currentSession = sessionsWithDates.find((s: ChatSession) => s.id === currentSessionId);
        if (currentSession) {
          setMessages(currentSession.messages);
        }
      } catch (e) {
        console.error("Error loading sessions from localStorage:", e);
      }
    }

    const savedProposals = localStorage.getItem('proposals');
    if (savedProposals) {
      try {
        const parsed = JSON.parse(savedProposals);
        const proposalsWithDates = parsed.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        }));
        setProposals(proposalsWithDates);
      } catch (e) {
        console.error("Error loading proposals from localStorage:", e);
      }
    }
  }, []);

  // Save to localStorage whenever sessions change (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('chat-sessions', JSON.stringify(sessions));
    }
  }, [sessions, isHydrated]);

  // Save to localStorage whenever proposals change (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('proposals', JSON.stringify(proposals));
    }
  }, [proposals, isHydrated]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (viewingProposal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingProposal]);

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
    setSelectedProposal(null);
  };

  const selectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      // Clear selected proposal if it doesn't belong to this session
      if (selectedProposal && selectedProposal.sessionId !== sessionId) {
        setSelectedProposal(null);
      }
    }
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId("");
      setMessages([]);
      setSelectedProposal(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let sessionId = currentSessionId;

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

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: updatedMessages, lastMessage: data.response.substring(0, 100) }
            : s
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (messages.length === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();

      const newProposal: Proposal = {
        id: Date.now().toString(),
        title: `Proposal - ${new Date().toLocaleDateString()}`,
        content: data.proposal,
        timestamp: new Date(),
        committed: false,
        sessionId: currentSessionId,
      };

      setProposals((prev) => [newProposal, ...prev]);
      setSelectedProposal(newProposal);
    } catch (error) {
      console.error("Error generating proposal:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCommitProposal = async (proposalId: string) => {
    // Send to engineer dashboard
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, committed: true } : p
      )
    );

    // TODO: Send to backend API to notify engineers
    alert("Proposal committed to Engineering Dashboard! Engineers will be notified.");
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
            {sessions.map((session) => (
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
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {session.lastMessage || "New conversation"}
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
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex justify-between items-center bg-background">
          <div>
            <h1 className="text-2xl font-bold">PreCo</h1>
            <p className="text-sm text-muted-foreground">
              Client Portal - Design your project with AI
            </p>
          </div>
          <Button
            onClick={handleGenerateProposal}
            disabled={messages.length === 0 || isGenerating}
            variant="default"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Proposal
              </>
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-6">
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
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3" suppressHydrationWarning>
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

        <div className="border-t p-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Continue the conversation..."
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

      {/* Right Sidebar - Proposals */}
      <div className="w-96 border-l flex flex-col bg-muted/20">
        <div className="p-4 border-b bg-background">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposals
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {proposals.filter(p => p.sessionId === currentSessionId).length} for this chat
          </p>
        </div>

        <ScrollArea className="flex-1">
          {!currentSessionId ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Select a chat to view proposals</p>
            </div>
          ) : proposals.filter(p => p.sessionId === currentSessionId).length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No proposals yet</p>
              <p className="text-xs mt-2">
                Generate proposals from your conversations
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {proposals.filter(p => p.sessionId === currentSessionId).map((proposal) => (
                <Card
                  key={proposal.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedProposal?.id === proposal.id
                      ? "ring-2 ring-primary"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{proposal.title}</h3>
                    {proposal.committed && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Committed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3" suppressHydrationWarning>
                    {proposal.timestamp.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingProposal(proposal);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    {!proposal.committed && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommitProposal(proposal.id);
                        }}
                      >
                        <SendIcon className="h-3 w-3 mr-1" />
                        Commit
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {selectedProposal && (
          <div className="border-t bg-background p-4 max-h-[40%]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Preview</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedProposal(null)}
              >
                Close
              </Button>
            </div>
            <ScrollArea className="h-64">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {selectedProposal.content.substring(0, 500) + "..."}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Full-Screen Proposal Modal */}
      {viewingProposal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-8"
          onClick={() => setViewingProposal(null)}
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold">{viewingProposal.title}</h2>
                <p className="text-sm text-muted-foreground mt-1" suppressHydrationWarning>
                  Generated on {viewingProposal.timestamp.toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingProposal(null)}
              >
                <span className="text-2xl">&times;</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {viewingProposal.content}
                </ReactMarkdown>
              </div>
            </div>
            <div className="border-t p-4 bg-muted/30 flex gap-3 justify-end flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setViewingProposal(null)}
              >
                Close
              </Button>
              {!viewingProposal.committed && (
                <Button
                  onClick={() => {
                    handleCommitProposal(viewingProposal.id);
                    setViewingProposal(null);
                  }}
                >
                  <SendIcon className="h-4 w-4 mr-2" />
                  Commit to Engineers
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
