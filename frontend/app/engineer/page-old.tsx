"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users, Lightbulb, FileText, Download } from "lucide-react";

interface UserProfile {
  industry?: string;
  technicalLevel?: string;
  mainRequests?: string[];
  budget?: string;
  timeline?: string;
}

interface ProjectIdea {
  features?: string[];
  techStack?: string[];
  architecture?: string;
}

export default function EngineerView() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("default");

  // 模拟从后端获取会话数据
  useEffect(() => {
    // TODO: 从后端API获取实际数据
    const mockData = [
      {
        id: "default",
        userProfile: {
          industry: "生物科技",
          technicalLevel: "中等(有基本编程经验)",
          mainRequests: [
            "AI驱动的药物溶解度预测",
            "移动端可访问",
            "实时数据分析",
          ],
          budget: "中等",
          timeline: "3-6个月",
        },
        projectIdeas: {
          features: [
            "分子特征提取器",
            "神经网络预测模型",
            "React移动端界面",
            "RESTful API",
          ],
          techStack: [
            "Python + PyTorch",
            "FastAPI",
            "React Native",
            "PostgreSQL",
          ],
          architecture: "微服务架构,前后端分离",
        },
      },
    ];
    setSessions(mockData);
  }, []);

  const currentSession = sessions.find((s) => s.id === selectedSession);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">工程师视图</h1>
        <p className="text-sm text-muted-foreground">
          客户需求分析和技术方案总结
        </p>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧:用户画像 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">用户画像</h2>
            </div>
            <Separator className="mb-4" />

            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                    行业领域
                  </h3>
                  <Badge variant="secondary" className="text-base">
                    {currentSession?.userProfile?.industry || "未知"}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                    技术背景
                  </h3>
                  <Badge variant="outline" className="text-base">
                    {currentSession?.userProfile?.technicalLevel || "未知"}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                    主要需求
                  </h3>
                  <ul className="space-y-2">
                    {currentSession?.userProfile?.mainRequests?.map(
                      (req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                      预算范围
                    </h3>
                    <p className="text-base">
                      {currentSession?.userProfile?.budget || "未提及"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                      时间要求
                    </h3>
                    <p className="text-base">
                      {currentSession?.userProfile?.timeline || "未提及"}
                    </p>
                  </div>
                </div>

                <Card className="bg-muted p-4 mt-6">
                  <h3 className="font-medium mb-2">建议</h3>
                  <p className="text-sm text-muted-foreground">
                    根据客户的技术背景,建议在项目初期提供技术培训,
                    并确保文档清晰易懂。客户对移动端有明确需求,
                    应优先考虑响应式设计或原生应用开发。
                  </p>
                </Card>
              </div>
            </ScrollArea>
          </Card>

          {/* 右侧:产品构思 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">产品构思</h2>
            </div>
            <Separator className="mb-4" />

            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">
                    核心功能模块
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentSession?.projectIdeas?.features?.map(
                      (feature: string, idx: number) => (
                        <Badge key={idx} variant="default">
                          {feature}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">
                    推荐技术栈
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentSession?.projectIdeas?.techStack?.map(
                      (tech: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {tech}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                    架构建议
                  </h3>
                  <Card className="p-4 bg-secondary/50">
                    <p>
                      {currentSession?.projectIdeas?.architecture || "待定"}
                    </p>
                  </Card>
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">
                    实施路线图
                  </h3>
                  <div className="space-y-3">
                    <Card className="p-3 border-l-4 border-l-primary">
                      <h4 className="font-medium text-sm">Phase 1: MVP开发</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        核心预测功能 + 基础API (4-6周)
                      </p>
                    </Card>
                    <Card className="p-3 border-l-4 border-l-blue-500">
                      <h4 className="font-medium text-sm">Phase 2: 前端开发</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        React移动端界面 + 数据可视化 (3-4周)
                      </p>
                    </Card>
                    <Card className="p-3 border-l-4 border-l-green-500">
                      <h4 className="font-medium text-sm">Phase 3: 优化部署</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        性能优化 + 云端部署 + 测试 (2-3周)
                      </p>
                    </Card>
                  </div>
                </div>

                <Card className="bg-muted p-4 mt-6">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    技术可行性
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ✅ 公司已有分子嵌入模块,可直接复用
                    <br />
                    ✅ FastAPI + React技术栈团队熟悉
                    <br />
                    ⚠️ 需要额外研究神经网络模型优化
                    <br />
                    ⚠️ 移动端开发需要增加React Native专家
                  </p>
                </Card>
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* 底部操作栏 */}
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出完整报告
          </Button>
          <Button>
            开始项目规划
          </Button>
        </div>
      </div>
    </div>
  );
}
