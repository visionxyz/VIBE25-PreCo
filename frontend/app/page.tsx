import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Wrench } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            PreCo
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">
            AI Presales Copilot
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Transform conversations into actionable project proposals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Portal */}
          <Card className="p-8 hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-blue-500">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-6 bg-blue-100 dark:bg-blue-900 rounded-full">
                <MessageSquare className="h-16 w-16 text-blue-600 dark:text-blue-300" />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Client Portal</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Describe your project vision and collaborate with our AI consultant
                  to design the perfect solution.
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-500 text-left w-full">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>Natural language conversation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>AI-powered technical recommendations</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>Instant project proposal generation</span>
                </div>
              </div>

              <Link href="/client" className="w-full">
                <Button className="w-full" size="lg">
                  Enter Client Portal
                </Button>
              </Link>
            </div>
          </Card>

          {/* Engineer Dashboard */}
          <Card className="p-8 hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-indigo-500">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-6 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <Wrench className="h-16 w-16 text-indigo-600 dark:text-indigo-300" />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">Engineer Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Monitor client conversations, analyze requirements, and access
                  structured technical specifications.
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-500 text-left w-full">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500">✓</span>
                  <span>Real-time client profile insights</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500">✓</span>
                  <span>Technical architecture recommendations</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500">✓</span>
                  <span>Implementation roadmap overview</span>
                </div>
              </div>

              <Link href="/engineer" className="w-full">
                <Button className="w-full" variant="outline" size="lg">
                  Enter Engineer Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by OpenAI GPT-4o • Built with Next.js & FastAPI</p>
        </div>
      </div>
    </div>
  );
}
