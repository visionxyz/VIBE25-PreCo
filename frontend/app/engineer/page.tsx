"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Home, RefreshCw, Eye, CheckCircle, Clock, Loader2, MessageSquare, History, Send, Languages } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Proposal {
  id: string;
  title: string;
  content: string;
  translatedContent?: string; // Japanese translation of content
  timestamp: Date;
  committed: boolean;
  sessionId: string;
}

interface InternalResource {
  id: string;
  name: string;
  type: "project" | "knowledge" | "component";
  description: string;
  techStack: string[];
  relevance: number; // 0-100
  estimatedReusability: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

interface SavedPlan {
  id: string;
  proposalId: string;
  proposalTitle: string;
  createdAt: Date;
  selectedResources: string[];
  engineerNotes: string; // Engineer's additional ideas and requirements
  result: PlanningResult;
  comments: Comment[];
}

interface PlanningResult {
  proposalId: string;
  techStack: string[];
  timeline: {
    phase: string;
    duration: string;
    tasks: string[];
  }[];
  teamRequirements: {
    role: string;
    count: number;
    duration: string;
  }[];
  estimatedCost: {
    development: number;
    monthly: number;
  };
  risks: string[];
  recommendations: string[];
}

// Mock internal resources database
const INTERNAL_RESOURCES: InternalResource[] = [
  {
    id: "res-1",
    name: "AI Financial Analysis Engine",
    type: "project",
    description: "Production-ready AI system for financial data analysis and prediction. Includes real-time market data integration, risk assessment models, and automated report generation.",
    techStack: ["Python", "PyTorch", "FastAPI", "Redis", "PostgreSQL"],
    relevance: 95,
    estimatedReusability: "70% of core features can be reused"
  },
  {
    id: "res-2",
    name: "Real-time Alert System",
    type: "component",
    description: "Multi-channel notification system supporting email, SMS, and push notifications with customizable rules and throttling.",
    techStack: ["Node.js", "Redis", "WebSocket", "Twilio", "SendGrid"],
    relevance: 88,
    estimatedReusability: "Can be directly integrated with minimal changes"
  },
  {
    id: "res-3",
    name: "Document Generation Framework",
    type: "component",
    description: "Template-based document generation supporting PDF, Excel, and HTML formats. Includes branding customization and batch processing.",
    techStack: ["Python", "ReportLab", "Jinja2", "Celery"],
    relevance: 92,
    estimatedReusability: "80% reusable for report generation needs"
  },
  {
    id: "res-4",
    name: "GPT-4 Integration Best Practices",
    type: "knowledge",
    description: "Comprehensive documentation on prompt engineering, cost optimization, error handling, and response validation for OpenAI GPT-4 API integration.",
    techStack: ["OpenAI API", "LangChain", "Python"],
    relevance: 90,
    estimatedReusability: "Essential reference for AI implementation"
  },
  {
    id: "res-5",
    name: "Multi-tenant SaaS Architecture",
    type: "project",
    description: "Enterprise SaaS platform with data isolation, role-based access control, and client-specific customization. Handles 100+ concurrent clients.",
    techStack: ["FastAPI", "PostgreSQL", "Redis", "Docker", "AWS"],
    relevance: 75,
    estimatedReusability: "Authentication and multi-tenancy patterns applicable"
  },
  {
    id: "res-6",
    name: "React Dashboard Component Library",
    type: "component",
    description: "Reusable dashboard components including charts, tables, filters, and analytics widgets. Fully responsive and accessible.",
    techStack: ["React", "TypeScript", "Recharts", "Tailwind CSS"],
    relevance: 70,
    estimatedReusability: "Can accelerate frontend development by 40%"
  }
];

export default function EngineerView() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);

  // Planning workflow states
  const [planningProposal, setPlanningProposal] = useState<Proposal | null>(null);
  const [planningStep, setPlanningStep] = useState<"resources" | "generating" | "result" | "history">("resources");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [engineerNotes, setEngineerNotes] = useState<string>(""); // Engineer's additional ideas
  const [planningResult, setPlanningResult] = useState<PlanningResult | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Saved plans and comments
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [newComment, setNewComment] = useState("");
  const [viewingHistoryProposal, setViewingHistoryProposal] = useState<Proposal | null>(null);

  // Translation states
  const [translatingProposalId, setTranslatingProposalId] = useState<string | null>(null);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());
  const [showTranslation, setShowTranslation] = useState(true); // Toggle between original and translated

  // Load committed proposals from localStorage
  const loadProposals = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('proposals');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const proposalsWithDates = parsed
            .filter((p: any) => p.committed) // Only show committed proposals
            .map((p: any) => ({
              ...p,
              timestamp: new Date(p.timestamp)
            }));
          setProposals(proposalsWithDates);
        } catch (e) {
          console.error("Error loading proposals:", e);
        }
      }
    }
  };

  useEffect(() => {
    loadProposals();
    loadSavedPlans();
  }, []);

  // Save proposals to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && proposals.length > 0) {
      // Get all proposals from localStorage (including non-committed ones from client)
      const allProposals = localStorage.getItem('proposals');
      if (allProposals) {
        try {
          const parsed = JSON.parse(allProposals);
          // Update the committed proposals with latest data (including translations)
          const updatedProposals = parsed.map((p: any) => {
            const updated = proposals.find((prop) => prop.id === p.id);
            return updated ? { ...p, translatedContent: updated.translatedContent } : p;
          });
          localStorage.setItem('proposals', JSON.stringify(updatedProposals));
        } catch (e) {
          console.error("Error saving proposals:", e);
        }
      }
    }
  }, [proposals]);

  // Load saved plans from localStorage
  const loadSavedPlans = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saved-plans');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const plansWithDates = parsed.map((p: any) => ({
            ...p,
            engineerNotes: p.engineerNotes || "", // Default to empty string for backward compatibility
            createdAt: new Date(p.createdAt),
            comments: p.comments.map((c: any) => ({
              ...c,
              timestamp: new Date(c.timestamp)
            }))
          }));
          setSavedPlans(plansWithDates);
        } catch (e) {
          console.error("Error loading saved plans:", e);
        }
      }
    }
  };

  // Save plans to localStorage
  const savePlansToStorage = (plans: SavedPlan[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('saved-plans', JSON.stringify(plans));
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (viewingProposal || planningProposal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingProposal, planningProposal]);

  // Auto-select highly relevant resources
  useEffect(() => {
    if (planningProposal && selectedResources.length === 0) {
      const autoSelected = INTERNAL_RESOURCES
        .filter(r => r.relevance >= 85)
        .map(r => r.id);
      setSelectedResources(autoSelected);
    }
  }, [planningProposal]);

  const toggleResource = (resourceId: string) => {
    setSelectedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const generatePlan = async () => {
    if (!planningProposal) return;

    setIsGeneratingPlan(true);
    setPlanningStep("generating");

    try {
      // TODO: Call backend API to generate plan
      // For now, simulate with setTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult: PlanningResult = {
        proposalId: planningProposal.id,
        techStack: [
          "Python 3.11 + FastAPI",
          "OpenAI GPT-4o",
          "PostgreSQL 15",
          "Redis 7",
          "React 18 + Next.js 15",
          "TypeScript",
          "Docker + AWS ECS"
        ],
        timeline: [
          {
            phase: "Phase 1: Foundation & Data Integration",
            duration: "4 weeks",
            tasks: [
              "Set up infrastructure (AWS, databases, CI/CD)",
              "Integrate market data feeds (stocks, forex, crypto)",
              "Build core AI analysis engine (reuse 70% from res-1)",
              "Implement data pipeline and caching"
            ]
          },
          {
            phase: "Phase 2: AI & Report Generation",
            duration: "5 weeks",
            tasks: [
              "Train/fine-tune GPT-4 models on sample reports",
              "Build report generation engine (reuse res-3)",
              "Implement customization & branding system",
              "Create template management system"
            ]
          },
          {
            phase: "Phase 3: Alert System & Dashboard",
            duration: "3 weeks",
            tasks: [
              "Integrate real-time alert system (reuse res-2)",
              "Build admin dashboard (reuse components from res-6)",
              "Implement user management & permissions",
              "Add analytics and monitoring"
            ]
          },
          {
            phase: "Phase 4: Testing & Deployment",
            duration: "2 weeks",
            tasks: [
              "End-to-end testing with sample data",
              "Security audit and penetration testing",
              "Performance optimization",
              "Client training and documentation"
            ]
          }
        ],
        teamRequirements: [
          { role: "Senior Backend Engineer", count: 2, duration: "4 months" },
          { role: "AI/ML Engineer", count: 1, duration: "3 months" },
          { role: "Frontend Engineer", count: 1, duration: "2.5 months" },
          { role: "DevOps Engineer", count: 1, duration: "1 month (part-time)" },
          { role: "QA Engineer", count: 1, duration: "1 month" }
        ],
        estimatedCost: {
          development: 145000,
          monthly: 12000
        },
        risks: [
          "GPT-4 API rate limits during high volume - Mitigation: Implement caching and request queuing",
          "Market data feed reliability - Mitigation: Use multiple data providers with fallback",
          "AI model accuracy for edge cases - Mitigation: Human review workflow for high-stakes recommendations",
          "Client data security concerns - Mitigation: SOC 2 compliance, encryption, regular audits"
        ],
        recommendations: [
          "✅ Leverage existing AI Financial Analysis Engine (res-1) to save 3-4 weeks of development",
          "✅ Reuse Alert System component (res-2) - proven and production-ready",
          "✅ Use Document Generation Framework (res-3) for 80% of report needs",
          "⚠️ Allocate extra time for GPT-4 fine-tuning on client's specific report style",
          "⚠️ Consider phased rollout: Start with 10 clients, then scale to all 30"
        ]
      };

      setPlanningResult(mockResult);

      // Save the plan
      const newPlan: SavedPlan = {
        id: Date.now().toString(),
        proposalId: planningProposal.id,
        proposalTitle: planningProposal.title,
        createdAt: new Date(),
        selectedResources: selectedResources,
        engineerNotes: engineerNotes, // Include engineer's notes
        result: mockResult,
        comments: []
      };

      const updatedPlans = [newPlan, ...savedPlans];
      setSavedPlans(updatedPlans);
      savePlansToStorage(updatedPlans);
      setCurrentPlanId(newPlan.id);

      setPlanningStep("result");
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const addComment = () => {
    if (!newComment.trim() || !currentPlanId) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: "Engineer", // TODO: Get from auth
      content: newComment,
      timestamp: new Date()
    };

    const updatedPlans = savedPlans.map(plan =>
      plan.id === currentPlanId
        ? { ...plan, comments: [...plan.comments, comment] }
        : plan
    );

    setSavedPlans(updatedPlans);
    savePlansToStorage(updatedPlans);
    setNewComment("");
  };

  const viewPlanHistory = (proposal: Proposal) => {
    setViewingHistoryProposal(proposal);
    setPlanningStep("history");
    setPlanningProposal(proposal);
  };

  const loadExistingPlan = (plan: SavedPlan) => {
    setPlanningResult(plan.result);
    setCurrentPlanId(plan.id);
    setSelectedResources(plan.selectedResources);
    setEngineerNotes(plan.engineerNotes || ""); // Load engineer notes
    setPlanningStep("result");
  };

  const getPlansForProposal = (proposalId: string) => {
    return savedPlans.filter(p => p.proposalId === proposalId);
  };

  const startPlanning = (proposal: Proposal) => {
    setPlanningProposal(proposal);
    setPlanningStep("resources");
    setSelectedResources([]);
    setEngineerNotes(""); // Reset engineer notes
    setPlanningResult(null);
  };

  const closePlanning = () => {
    setPlanningProposal(null);
    setPlanningStep("resources");
    setSelectedResources([]);
    setEngineerNotes(""); // Reset engineer notes
    setPlanningResult(null);
  };

  // Translation function
  const translateProposal = async (proposal: Proposal) => {
    // Check cache first
    if (translationCache.has(proposal.id)) {
      const updatedProposals = proposals.map(p =>
        p.id === proposal.id
          ? { ...p, translatedContent: translationCache.get(proposal.id) }
          : p
      );
      setProposals(updatedProposals);
      return;
    }

    setTranslatingProposalId(proposal.id);

    try {
      const response = await fetch('http://localhost:8000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: proposal.content,
          target_language: 'ja'
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const translatedText = data.translated_text;

      // Update cache
      const newCache = new Map(translationCache);
      newCache.set(proposal.id, translatedText);
      setTranslationCache(newCache);

      // Update proposals with translation
      const updatedProposals = proposals.map(p =>
        p.id === proposal.id
          ? { ...p, translatedContent: translatedText }
          : p
      );
      setProposals(updatedProposals);

      // Update viewing proposal if it's the one being viewed
      if (viewingProposal?.id === proposal.id) {
        setViewingProposal({ ...viewingProposal, translatedContent: translatedText });
      }

    } catch (error) {
      console.error('Translation error:', error);
      alert('翻訳に失敗しました。もう一度お試しください。');
    } finally {
      setTranslatingProposalId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">エンジニアダッシュボード</h1>
            <p className="text-sm text-muted-foreground">
              承認されたクライアント提案と要件を確認
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={loadProposals}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">総提案数</p>
                <p className="text-2xl font-bold">{proposals.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">承認済み</p>
                <p className="text-2xl font-bold">{proposals.filter(p => p.committed).length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">最新</p>
                <p className="text-sm font-medium">
                  {proposals.length > 0
                    ? proposals[0].timestamp.toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">承認された提案がありません</h3>
              <p className="text-muted-foreground mb-4">
                クライアントポータルからの提案の承認をお待ちください
              </p>
              <Button variant="outline" onClick={loadProposals}>
                <RefreshCw className="mr-2 h-4 w-4" />
                更新
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                承認済み提案 ({proposals.length})
              </h2>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                すべてエクスポート
              </Button>
            </div>

            <div className="grid gap-4">
              {proposals.map((proposal) => (
                <Card
                  key={proposal.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedProposal?.id === proposal.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{proposal.title}</h3>
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          承認済み
                        </Badge>
                        {getPlansForProposal(proposal.id).length > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {getPlansForProposal(proposal.id).length} プラン
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        提出日時: {proposal.timestamp.toLocaleString()}
                      </p>
                      <div className="prose prose-sm max-w-none line-clamp-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {proposal.content.substring(0, 200) + "..."}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <div className="flex gap-2">
                        {!proposal.translatedContent && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              translateProposal(proposal);
                              setShowTranslation(true);
                            }}
                            disabled={translatingProposalId === proposal.id}
                          >
                            {translatingProposalId === proposal.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            日本語に翻訳
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingProposal(proposal);
                            setShowTranslation(!!proposal.translatedContent);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          全文表示
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startPlanning(proposal);
                          }}
                        >
                          プラン作成
                        </Button>
                      </div>
                      {getPlansForProposal(proposal.id).length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewPlanHistory(proposal);
                          }}
                        >
                          <History className="h-4 w-4 mr-2" />
                          履歴表示 ({getPlansForProposal(proposal.id).length})
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{viewingProposal.title}</h2>
                <p className="text-sm text-muted-foreground mt-1" suppressHydrationWarning>
                  承認日時: {viewingProposal.timestamp.toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2">
                  {viewingProposal.translatedContent && (
                    <Badge variant="secondary">
                      日本語翻訳済み
                    </Badge>
                  )}
                  {viewingProposal.translatedContent && showTranslation && (
                    <Badge variant="outline">
                      日本語表示中
                    </Badge>
                  )}
                  {viewingProposal.translatedContent && !showTranslation && (
                    <Badge variant="outline">
                      原文表示中
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!viewingProposal.translatedContent ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      translateProposal(viewingProposal);
                      setShowTranslation(true);
                    }}
                    disabled={translatingProposalId === viewingProposal.id}
                  >
                    {translatingProposalId === viewingProposal.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    日本語に翻訳
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowTranslation(!showTranslation)}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    {showTranslation ? "原文を表示" : "翻訳を表示"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewingProposal(null)}
                >
                  <span className="text-2xl">&times;</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {viewingProposal.translatedContent && showTranslation
                    ? viewingProposal.translatedContent
                    : viewingProposal.content}
                </ReactMarkdown>
              </div>
            </div>
            <div className="border-t p-4 bg-muted/30 flex gap-3 justify-end flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setViewingProposal(null)}
              >
                閉じる
              </Button>
              <Button
                onClick={() => {
                  // TODO: Export as PDF or start planning
                  const blob = new Blob([viewingProposal.content], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${viewingProposal.title.replace(/\s+/g, '-')}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                ダウンロード
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Planning Modal */}
      {planningProposal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-8"
          onClick={closePlanning}
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step 1: Select Internal Resources */}
            {planningStep === "resources" && (
              <>
                <div className="border-b p-6 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold">内部リソースを選択</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      活用可能な社内プロジェクトとナレッジを確認・選択してください
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={closePlanning}>
                    <span className="text-2xl">&times;</span>
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <p className="text-sm">
                      <strong>AI推薦:</strong> 提案要件に基づき、関連性の高いリソース（関連度≥85%）{selectedResources.length}件を事前選択しました。必要に応じて追加・削除できます。
                    </p>
                  </div>

                  <div className="space-y-4">
                    {INTERNAL_RESOURCES
                      .sort((a, b) => b.relevance - a.relevance)
                      .map((resource) => {
                        const isSelected = selectedResources.includes(resource.id);
                        const typeColors = {
                          project: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
                          component: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                          knowledge: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        };

                        return (
                          <Card
                            key={resource.id}
                            className={`p-5 cursor-pointer transition-all ${
                              isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
                            }`}
                            onClick={() => toggleResource(resource.id)}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                }`}>
                                  {isSelected && (
                                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                                  )}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">{resource.name}</h3>
                                  <Badge className={typeColors[resource.type]} variant="secondary">
                                    {resource.type}
                                  </Badge>
                                  <Badge variant={resource.relevance >= 85 ? "default" : "outline"}>
                                    {resource.relevance}% match
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground mb-3">
                                  {resource.description}
                                </p>

                                <div className="flex items-center gap-4">
                                  <div className="flex flex-wrap gap-1">
                                    {resource.techStack.map((tech, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                  <p className="text-xs text-muted-foreground italic">
                                    {resource.estimatedReusability}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                  </div>

                  {/* Engineer's Additional Ideas */}
                  <Card className="p-6 mt-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">追加のアイデアと要件</h3>
                        <p className="text-sm text-muted-foreground">
                          技術プランに考慮したい追加のアイデア、具体的な要件、制約事項を入力してください
                        </p>
                      </div>
                      <Textarea
                        placeholder="例：モバイルアプリ対応必須、リアルタイム同期が必要、予算制約、特定の技術選好、スケジュール上の考慮事項など..."
                        value={engineerNotes}
                        onChange={(e) => setEngineerNotes(e.target.value)}
                        className="min-h-32"
                      />
                    </div>
                  </Card>
                </div>

                <div className="border-t p-4 bg-muted/30 flex gap-3 justify-between flex-shrink-0">
                  <p className="text-sm text-muted-foreground self-center">
                    {selectedResources.length} 件のリソースを選択中
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={closePlanning}>
                      キャンセル
                    </Button>
                    <Button onClick={generatePlan}>
                      プラン生成 →
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Generating Plan */}
            {planningStep === "generating" && (
              <>
                <div className="border-b p-6">
                  <h2 className="text-2xl font-bold">技術プランを生成中...</h2>
                </div>
                <div className="flex-1 flex items-center justify-center p-12">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">要件を分析中</h3>
                    <p className="text-muted-foreground">
                      AIが提案内容と選択されたリソースを分析し、最適なプランを生成しています...
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* History View */}
            {planningStep === "history" && viewingHistoryProposal && (
              <>
                <div className="border-b p-6 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold">プラン履歴</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {viewingHistoryProposal.title}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={closePlanning}>
                    <span className="text-2xl">&times;</span>
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-5xl space-y-4">
                    {getPlansForProposal(viewingHistoryProposal.id).length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <h3 className="text-lg font-semibold mb-2">まだプランがありません</h3>
                        <p className="text-muted-foreground">
                          プラン作成を開始して最初の技術プランを作成しましょう
                        </p>
                      </div>
                    ) : (
                      getPlansForProposal(viewingHistoryProposal.id).map((plan) => (
                        <Card
                          key={plan.id}
                          className="p-6 hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => loadExistingPlan(plan)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {plan.createdAt.toLocaleDateString()} のプラン
                                </h3>
                                {plan.comments.length > 0 && (
                                  <Badge variant="secondary" className="gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {plan.comments.length} コメント
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                作成日時: {plan.createdAt.toLocaleString()}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <p className="text-sm text-muted-foreground">
                                  {plan.selectedResources.length} 件の内部リソースを使用
                                </p>
                              </div>
                              {plan.engineerNotes && (
                                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-900">
                                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">エンジニアのメモ:</p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{plan.engineerNotes}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">コスト:</p>
                                  <p className="text-sm">${plan.result.estimatedCost.development.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">期間:</p>
                                  <p className="text-sm">{plan.result.timeline.length} フェーズ</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">チーム:</p>
                                  <p className="text-sm">{plan.result.teamRequirements.length} 役割</p>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadExistingPlan(plan);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              表示
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t p-4 bg-muted/30 flex gap-3 justify-between flex-shrink-0">
                  <Button variant="outline" onClick={closePlanning}>
                    閉じる
                  </Button>
                  <Button onClick={() => {
                    setPlanningStep("resources");
                    setSelectedResources([]);
                    setPlanningResult(null);
                    setCurrentPlanId(null);
                  }}>
                    新規プラン作成 →
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Show Planning Result */}
            {planningStep === "result" && planningResult && (
              <>
                <div className="border-b p-6 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold">技術実装プラン</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedResources.length} 件の内部リソースに基づいて生成
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={closePlanning}>
                    <span className="text-2xl">&times;</span>
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6 max-w-5xl">
                    {/* Engineer's Notes */}
                    {engineerNotes && (
                      <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          エンジニアの追加要件
                        </h3>
                        <p className="text-sm whitespace-pre-wrap">{engineerNotes}</p>
                      </Card>
                    )}

                    {/* Tech Stack */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">推奨技術スタック</h3>
                      <div className="flex flex-wrap gap-2">
                        {planningResult.techStack.map((tech, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </Card>

                    {/* Timeline */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">実装スケジュール</h3>
                      <div className="space-y-4">
                        {planningResult.timeline.map((phase, idx) => (
                          <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{phase.phase}</h4>
                              <Badge variant="outline">{phase.duration}</Badge>
                            </div>
                            <ul className="space-y-1">
                              {phase.tasks.map((task, tidx) => (
                                <li key={tidx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Team Requirements */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">チーム構成</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {planningResult.teamRequirements.map((req, idx) => (
                          <div key={idx} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium">{req.role}</p>
                              <Badge>{req.count}x</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{req.duration}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Cost Estimate */}
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                      <h3 className="text-lg font-semibold mb-4">コスト見積</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">開発費用</p>
                          <p className="text-3xl font-bold">${planningResult.estimatedCost.development.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">月額運用費用</p>
                          <p className="text-3xl font-bold">${planningResult.estimatedCost.monthly.toLocaleString()}/月</p>
                        </div>
                      </div>
                    </Card>

                    {/* Risks */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">リスク評価と軽減策</h3>
                      <div className="space-y-2">
                        {planningResult.risks.map((risk, idx) => (
                          <div key={idx} className="p-3 bg-muted rounded text-sm">
                            {risk}
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Recommendations */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">実装の推奨事項</h3>
                      <div className="space-y-2">
                        {planningResult.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-lg">{rec.startsWith('✅') ? '✅' : '⚠️'}</span>
                            <p className="text-sm">{rec.replace(/^[✅⚠️]\s*/, '')}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Comments Section */}
                    {currentPlanId && (
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          コメント・メモ
                        </h3>

                        {/* Display existing comments */}
                        <div className="space-y-3 mb-4">
                          {savedPlans.find(p => p.id === currentPlanId)?.comments.map((comment) => (
                            <div key={comment.id} className="bg-muted p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium">{comment.author}</p>
                                <p className="text-xs text-muted-foreground">
                                  {comment.timestamp.toLocaleString()}
                                </p>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          ))}
                          {(!savedPlans.find(p => p.id === currentPlanId)?.comments.length ||
                            savedPlans.find(p => p.id === currentPlanId)?.comments.length === 0) && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              まだコメントがありません。このプランについての考えやメモを追加してください。
                            </p>
                          )}
                        </div>

                        {/* Add new comment */}
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="コメントやメモを追加..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1"
                            rows={2}
                          />
                          <Button
                            onClick={addComment}
                            disabled={!newComment.trim()}
                            size="sm"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="border-t p-4 bg-muted/30 flex gap-3 justify-end flex-shrink-0">
                  <Button variant="outline" onClick={closePlanning}>
                    閉じる
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    プランをエクスポート
                  </Button>
                  <Button>
                    デモを生成 →
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
