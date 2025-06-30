# Business CRM - Agent MCP Example

This is an example e-commerce application built using Multi-Agent Collaboration Protocol (MCP) with Vue.js, Supabase, and shadcn/ui.

**Built in 7 hours with 400 user messages and over 2000 agent-to-agent messages.**

## 🎯 What This Demonstrates

This project showcases how multiple AI agents can collaborate to build a complete application using:

- **Agent Coordination**: Multiple specialized agents working together
- **MCP Database**: Shared context and task management (`.agent` directory)
- **Real Implementation**: Full-featured e-commerce platform with authentication, products, cart, and admin features

## 🏗️ Architecture

- **Frontend**: Vue.js 3 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite
- **Agent Coordination**: MCP (Multi-Agent Collaboration Protocol)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- MCP server (for agent coordination)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🤖 Agent MCP Database

The `.agent` directory contains the MCP database that tracks:

- **Agent Coordination**: How agents communicate and share tasks
- **Project Context**: Shared knowledge between agents
- **Task Management**: Distributed task tracking and completion
- **File Coordination**: Preventing conflicts when multiple agents edit files

This serves as a real-world example of how AI agents can collaborate on complex software projects.

## 📋 Features Implemented

### Core E-commerce Features
- ✅ Product catalog and browsing
- ✅ Shopping cart and checkout
- ✅ User authentication and registration
- ✅ User profiles and order history
- ✅ Admin dashboard for product/order management
- ✅ Responsive design for mobile and desktop

### Agent Collaboration Features
- ✅ Multi-agent task coordination
- ✅ Shared context management
- ✅ Distributed file editing with conflict prevention
- ✅ Real-time progress tracking
- ✅ Automated testing and QA workflows

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations in the `supabase/` directory
3. Configure your environment variables in `.env`

### Agent MCP Setup

The `.agent` directory contains example configurations for:
- Agent tokens and permissions
- Project context sharing
- Task assignment and tracking
- File coordination protocols

## 🧪 Testing

The project includes comprehensive testing implemented by AI agents:

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build
```

## 📖 Learning from This Example

This repository demonstrates:

1. **Agent Specialization**: Different agents handle different aspects (UI, database, testing, etc.)
2. **Coordination Patterns**: How agents avoid conflicts and share information
3. **Real-world Complexity**: Managing a full application with multiple moving parts
4. **Quality Assurance**: Automated testing and validation workflows

## 🛠️ Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Supabase** - Backend-as-a-Service
- **Vite** - Fast build tool
- **Pinia** - State management
- **Vue Router** - Client-side routing

## 🤝 Contributing

This is an example repository showcasing Agent MCP collaboration. Feel free to:

- Study the agent coordination patterns
- Adapt the MCP database structure for your projects
- Learn from the multi-agent development workflow

## 📄 License

This project is provided as an educational example of Agent MCP collaboration.

---

*Built collaboratively by AI agents using Multi-Agent Collaboration Protocol (MCP)*