from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage, AIMessage

load_dotenv()

app = FastAPI(title="PreCo API - AI Presales Copilot")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量存储会话
sessions = {}


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    session_id: Optional[str] = "default"


class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = None


class ProposalRequest(BaseModel):
    messages: List[Message]


class TranslateRequest(BaseModel):
    text: str
    target_language: str = "ja"  # Default to Japanese


# 初始化OpenAI
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    api_key=openai_api_key
)

# System Prompt - Multi-role Presales Assistant
SYSTEM_PROMPT = """You are a professional AI presales consultant assistant. Your responsibilities are:

1. **Understand Client Needs**: Through conversation, deeply understand the client's business requirements, technical background, and expected goals
2. **Technical Solution Design**: Design feasible technical solutions based on the company's internal capabilities and codebase
3. **Iterative Optimization**: Continuously adjust and refine the solution based on client feedback
4. **Document Generation**: Generate structured project proposals and technical specification documents

Your conversation style:
- Professional yet friendly, avoiding overly technical jargon
- Skilled at asking key questions to clarify requirements
- Able to explain complex technical concepts in simple language
- Proactively suggest feasible solutions based on internal capabilities

During conversations, you should:
- Understand what kind of product/system the client wants to build
- Ask about key business scenarios and technical requirements
- Propose feasible technical solutions based on the internal knowledge base
- Record user preferences and decisions for final document generation

Please respond in English unless the user uses another language."""


def get_or_create_chain(session_id: str):
    """获取或创建会话链"""
    if session_id not in sessions:
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
        sessions[session_id] = {
            "memory": memory,
            "user_profile": {},
            "project_ideas": []
        }
    return sessions[session_id]


@app.get("/")
def read_root():
    return {"message": "PreCo API is running", "version": "1.0.0"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """聊天端点 - 支持多轮对话"""
    try:
        session = get_or_create_chain(request.session_id)
        memory = session["memory"]

        # 获取最新的用户消息
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")

        latest_message = request.messages[-1].content

        # 构建对话历史
        chat_history = []
        for msg in request.messages[:-1]:
            if msg.role == "user":
                chat_history.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                chat_history.append(AIMessage(content=msg.content))

        # 使用LLM生成响应
        messages_for_llm = [
            {"role": "system", "content": SYSTEM_PROMPT},
        ]

        for msg in request.messages:
            messages_for_llm.append({
                "role": msg.role if msg.role != "assistant" else "assistant",
                "content": msg.content
            })

        # 调用OpenAI
        from openai import OpenAI
        client = OpenAI(api_key=openai_api_key)

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages_for_llm,
            temperature=0.7,
            max_tokens=2000
        )

        assistant_response = response.choices[0].message.content

        # TODO: 添加RAG检索,目前先使用纯LLM对话
        sources = []

        # 分析和存储用户信息
        if "想要" in latest_message or "需要" in latest_message:
            session["project_ideas"].append(latest_message)

        return ChatResponse(
            response=assistant_response,
            sources=sources
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-proposal")
async def generate_proposal(request: ProposalRequest):
    """生成项目提案文档"""
    try:
        # 分析对话历史
        conversation_summary = "\n\n".join([
            f"**{msg.role.upper()}**: {msg.content}"
            for msg in request.messages
        ])

        # Detect conversation language
        sample_text = " ".join([msg.content for msg in request.messages[:3]])  # Sample first 3 messages

        # Simple language detection
        from openai import OpenAI
        client = OpenAI(api_key=openai_api_key)

        lang_detect_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a language detector. Reply with only one word: 'English', 'Chinese', 'Japanese', 'Spanish', 'French', or 'Other'."},
                {"role": "user", "content": f"What language is this text in? Text: {sample_text[:500]}"}
            ],
            temperature=0.3,
            max_tokens=10
        )

        detected_language = lang_detect_response.choices[0].message.content.strip()

        # Set language instruction based on detected language
        language_instruction = ""
        if "Chinese" in detected_language or "中文" in detected_language:
            language_instruction = "Please generate the entire proposal in Chinese (简体中文)."
        elif "Japanese" in detected_language or "日本" in detected_language:
            language_instruction = "Please generate the entire proposal in Japanese (日本語)."
        elif "Spanish" in detected_language:
            language_instruction = "Please generate the entire proposal in Spanish (Español)."
        elif "French" in detected_language:
            language_instruction = "Please generate the entire proposal in French (Français)."
        else:
            language_instruction = "Please generate the entire proposal in English."

        # Generate structured proposal using LLM
        prompt = f"""Based on the following conversation history, generate a comprehensive, professional project proposal document.

{language_instruction}

IMPORTANT: Write the ENTIRE document in the specified language, including all headers, sections, tables, and content.

Conversation History:
{conversation_summary}

Please generate a detailed, well-formatted Markdown document with the following structure:

---
# 📋 PROJECT PROPOSAL
## AI-Powered Financial Investment Report Generator

**Prepared for:** [Client Company Name based on conversation]
**Prepared by:** AI Solutions Team
**Date:** {__import__('datetime').datetime.now().strftime('%B %d, %Y')}
**Project Code:** PROJ-{__import__('datetime').datetime.now().strftime('%Y%m%d')}

---

## 📊 Executive Summary

[Write a compelling 2-3 paragraph executive summary highlighting:
- The client's challenge and pain points
- Proposed solution overview
- Key benefits and expected ROI
- Investment required and timeline]

---

## 🏢 Client Profile & Current Situation

### Business Overview
- **Industry:** [Specify industry]
- **Company Type:** [Type of business]
- **Current Scale:** [Number of clients, reports, etc.]
- **Team Size:** [Technical team composition]

### Current Challenges
[List 3-5 specific challenges the client is facing with their current manual process]

### Business Objectives
[List 3-5 specific goals they want to achieve]

---

## 💡 Proposed Solution

### Solution Overview
[Provide a high-level description of the automated system you're proposing]

### Core Features & Capabilities

#### 1. Automated Report Generation
- **Description:** [Detail what this does]
- **Key Benefits:** [List benefits]
- **Output Formats:** [PDF, Excel, Web, etc.]

#### 2. AI Analysis Engine
- **Data Sources:** [List data sources]
- **Analysis Types:** [Market analysis, risk assessment, etc.]
- **AI Models:** [What AI technology is used]

#### 3. Real-Time Alert System
- **Monitoring Capabilities:** [What it monitors]
- **Notification Channels:** [Email, SMS, etc.]
- **Customization:** [How alerts can be customized]

#### 4. Customization & Branding
- **Report Templates:** [Customizable templates]
- **Brand Integration:** [Logo, colors, style]
- **Client-Specific:** [Per-client customization]

#### 5. Security & Compliance
- **Data Protection:** [Encryption, access control]
- **Compliance:** [SOC 2, GDPR, etc.]
- **Audit Trail:** [Logging and monitoring]

---

## 🏗️ Technical Architecture

### System Components
[Describe the technical architecture in business-friendly language]

### Technology Stack
**Backend Infrastructure:**
- [List technologies with brief explanations]

**AI & Machine Learning:**
- [AI technologies being used]

**Data & Analytics:**
- [Databases, data processing]

**Security & Compliance:**
- [Security technologies]

### Integration Points
- [List systems that will be integrated]

---

## 📅 Implementation Roadmap

### Phase 1: Discovery & Planning (Weeks 1-2)
- ☐ Kickoff meeting with stakeholders
- ☐ Requirements gathering & documentation
- ☐ Data source analysis
- ☐ Sample report collection (20-30 reports)
- ☐ Final specification approval

### Phase 2: Foundation (Month 1)
- ☐ Infrastructure setup & security configuration
- ☐ Data pipeline development
- ☐ Core database architecture
- ☐ AI model training initiation
- ☐ **Deliverable:** System architecture document

### Phase 3: AI Development (Month 2)
- ☐ AI model training on client reports
- ☐ Report generation engine development
- ☐ Template system creation
- ☐ Alert system implementation
- ☐ **Deliverable:** Working prototype demo

### Phase 4: Platform Development (Month 3)
- ☐ Admin dashboard development
- ☐ User interface & UX implementation
- ☐ Customization features
- ☐ Integration testing
- ☐ **Deliverable:** Beta version for testing

### Phase 5: Testing & Launch (Month 4)
- ☐ Comprehensive system testing
- ☐ Security audit & penetration testing
- ☐ Team training (2-day workshop)
- ☐ Pilot launch with select clients
- ☐ **Deliverable:** Production-ready system

### Phase 6: Post-Launch Support (Month 5+)
- ☐ Daily monitoring (first week)
- ☐ Performance optimization
- ☐ User feedback collection
- ☐ Continuous improvements

---

## 💰 Investment Breakdown

### Development Costs

| Component | Cost | Description |
|-----------|------|-------------|
| Software Development | $100,000 | Core system development, APIs, integrations |
| AI Model Training | $20,000 | Custom AI model training on client data |
| UI/UX Design | $10,000 | Dashboard and report template design |
| Security Implementation | $5,000 | Security audit, encryption, compliance |
| **Total Development** | **$135,000** | |

### Additional Investment
| Item | Cost |
|------|------|
| Project Management | $10,000 |
| Testing & QA | $5,000 |
| **Total Project Cost** | **$150,000** |

### Monthly Operating Costs

| Component | Monthly Cost | Description |
|-----------|--------------|-------------|
| Cloud Infrastructure | $4,000 | Hosting, storage, compute resources |
| AI Processing | $3,000 | GPT-4 API usage (100 reports/day) |
| Market Data Feeds | $2,000 | Real-time financial data subscriptions |
| Real-time Streaming | $2,000 | Alert system infrastructure |
| Maintenance & Support | $1,000 | Ongoing technical support |
| **Total Monthly** | **$12,000** | |

### Annual Operating Cost: $144,000

---

## 📈 ROI Analysis

### Current Situation
- **Reports per day:** 50-100
- **Time per report:** 2-3 hours
- **Total daily hours:** 100-300 hours
- **Annual cost (estimated):** $[calculated based on analyst time]

### With AI Solution
- **Time per report:** 5-10 minutes (review + approval)
- **Daily hours saved:** 90-290 hours
- **Annual savings:** $[calculated]
- **Payback Period:** ~[X] months

### Additional Benefits
- ✅ **Consistency:** Standardized quality across all reports
- ✅ **Scalability:** Can easily handle 2-3x more clients
- ✅ **Speed:** 24/7 report generation capability
- ✅ **Accuracy:** Reduced human error
- ✅ **Insights:** Data-driven recommendations

---

## ⚡ Key Success Factors

### What Makes This Project Feasible

1. **Existing Infrastructure:** We have proven AI models for financial analysis
2. **Right Timeline:** 4-month timeline is realistic for MVP
3. **Budget Alignment:** $150K budget matches project scope
4. **Team Readiness:** Client's 8-person IT team can support deployment
5. **Clear Requirements:** Well-defined use cases and success criteria

---

## 🎯 Expected Deliverables

### Technical Deliverables
- ✅ Fully functional AI report generation system
- ✅ Admin dashboard with analytics
- ✅ Real-time alert system
- ✅ API documentation
- ✅ Security & compliance documentation

### Training & Support
- ✅ 2-day comprehensive training workshop
- ✅ User documentation & guides
- ✅ Video tutorials for common tasks
- ✅ 30 days intensive post-launch support
- ✅ Dedicated account manager

### Ongoing Services
- ✅ 24/7 technical support
- ✅ Monthly system health reports
- ✅ Quarterly AI model updates
- ✅ Feature enhancement roadmap

---

## 🔒 Risk Mitigation

### Technical Risks
| Risk | Mitigation Strategy |
|------|---------------------|
| Data quality issues | Multi-source validation, anomaly detection |
| System downtime | 99.9% SLA, redundant systems, auto-failover |
| AI accuracy concerns | Human review workflow, confidence scoring |
| Integration challenges | Phased rollout, comprehensive testing |

### Business Risks
| Risk | Mitigation Strategy |
|------|---------------------|
| Budget overrun | Fixed-price contract, clear scope |
| Timeline delays | Agile methodology, weekly check-ins |
| Adoption resistance | Change management, thorough training |
| Security concerns | SOC 2 compliance, regular audits |

---

## 🚀 Next Steps

### Immediate Actions
1. **Review & Approval** - Review this proposal with stakeholders (Week 1)
2. **Contract Execution** - Sign agreements and finalize terms (Week 1-2)
3. **Kickoff Meeting** - Schedule project kickoff (Week 2)
4. **Resource Allocation** - Assign team members from both sides (Week 2)
5. **Project Initiation** - Begin Phase 1 discovery (Week 3)

### Decision Timeline
- **Proposal Review:** [Date]
- **Decision Deadline:** [Date + 2 weeks]
- **Planned Project Start:** [Date + 1 month]
- **Target Go-Live:** [Date + 4 months]

---

## 📞 Contact Information

**Project Lead:** [Name]
**Email:** [email]
**Phone:** [phone]
**Support:** support@company.com
**Website:** www.company.com

---

## 📄 Appendix

### A. Technical Specifications Summary
[Brief technical details for IT team review]

### B. Security & Compliance Details
[Detailed security measures and compliance certifications]

### C. Sample Reports & Mockups
[Visual examples of what reports will look like]

### D. References & Case Studies
[Similar projects we've completed successfully]

---

<div align="center">

**🤖 Generated by AI Presales Copilot**

*This proposal leverages our company's existing AI research infrastructure and proven financial analysis models to deliver a custom solution tailored to your specific needs.*

**Confidential & Proprietary**
© {__import__('datetime').datetime.now().year} [Company Name]. All rights reserved.

</div>
"""

        from openai import OpenAI
        client = OpenAI(api_key=openai_api_key)

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a professional technical documentation expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=3000
        )

        proposal = response.choices[0].message.content

        return {"proposal": proposal}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "openai_configured": bool(openai_api_key)}


@app.post("/api/translate")
async def translate_text(request: TranslateRequest):
    """Translate text to target language (default: Japanese)"""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=openai_api_key)

        language_names = {
            "ja": "Japanese",
            "en": "English",
            "zh": "Chinese",
            "es": "Spanish",
            "fr": "French"
        }

        target_lang_name = language_names.get(request.target_language, request.target_language)

        translation_prompt = f"""Translate the following text to {target_lang_name}.
Preserve all markdown formatting, including headers, lists, tables, and code blocks.
Keep technical terms accurate and professional.

Text to translate:
{request.text}

Translation:"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"You are a professional translator specializing in technical and business documents. Translate accurately to {target_lang_name} while preserving markdown formatting."},
                {"role": "user", "content": translation_prompt}
            ],
            temperature=0.3,  # Lower temperature for more consistent translations
            max_tokens=4000
        )

        translated_text = response.choices[0].message.content

        return {
            "translated_text": translated_text,
            "source_language": "auto-detected",
            "target_language": request.target_language
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # 改为字符串形式,支持热重载
        host="0.0.0.0",
        port=8000,
        reload=True,  # 启用热重载
        reload_dirs=["./"]  # 监听当前目录
    )
