<div align="center">

<img src="https://raw.githubusercontent.com/mr-aniket-2004/Journey/main/assets/banner.png" alt="SecScan Banner" width="100%"/>

# 🛡️ SecScan Engine

### Automated GitHub Security, Secret Detection & Dependency Auditor

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1000&color=46E3B7&center=true&vCenter=true&width=600&lines=Clone+%E2%86%92+Scan+%E2%86%92+Audit+%E2%86%92+Report;Catch+Leaked+API+Keys+Before+Attackers+Do;Full-Stack+Security+Automation+Platform" alt="Typing SVG" />

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://secure-scan-plum.vercel.app/)
[![Backend Status](https://img.shields.io/badge/API_Status-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://securescan-9cv9.onrender.com/docs)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#-license)

[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](#)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](#)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](#)

<br/>

![GitHub Repo stars](https://img.shields.io/github/stars/mr-aniket-2004/SecureScan?style=social)
![GitHub forks](https://img.shields.io/github/forks/mr-aniket-2004/SecureScan?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/mr-aniket-2004/SecureScan?color=46E3B7)
![GitHub issues](https://img.shields.io/github/issues/mr-aniket-2004/SecureScan?color=orange)

</div>

---

**SecScan Engine** is a high-performance, full-stack security platform that performs automated threat audits on public GitHub repositories. It clones repositories, executes regex-based pattern matching to catch leaked API secrets, scans package manifests for known vulnerabilities, and generates downloadable, executive-ready PDF security reports — all in the background, without blocking the user.

<br/>

## ✨ Key Features

<table>
<tr>
<td width="50%" valign="top">

### 🔐 Secret Detection
High-speed regex engine scans every file in a cloned repository for leaked API keys, tokens, and credentials before they become a breach.

### 📦 Dependency Auditing
Automatically parses package manifests (`package.json`, `requirements.txt`, etc.) and flags known vulnerable dependencies.

</td>
<td width="50%" valign="top">

### 📄 Executive PDF Reports
Every scan produces a clean, downloadable PDF report — perfect for sharing with stakeholders or compliance teams.

### ⚡ Async Background Processing
Scans run as background jobs so the API responds instantly while the heavy lifting happens behind the scenes.

</td>
</tr>
</table>

<br/>

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite) · Tailwind CSS · Axios · Vercel |
| **Backend** | FastAPI (Python 3.10+) · Uvicorn |
| **Database** | Supabase (PostgreSQL) · SQLAlchemy |
| **Processing** | FastAPI `BackgroundTasks` |
| **Hosting** | Vercel (Frontend) · Render (Backend) |

</div>

<br/>

## 📁 Repository Structure

```text
SecureScan/
├── secret-scanner/             # FastAPI Backend Service
│   ├── src/
│   │   ├── api/                # Pydantic schemas & route definitions
│   │   ├── db/                 # Database models, connection & migrations
│   │   └── scanner/            # Scan orchestrator, regex engine & PDF builder
│   ├── main_api.py             # FastAPI entry point & CORS configuration
│   └── requirements.txt        # Backend dependencies
│
├── frontend/                   # React.js Frontend Service
│   ├── public/                 # Favicon & static assets
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # Axios API configuration
│   │   ├── App.jsx             # Main dashboard view
│   │   └── main.jsx
│   └── package.json            # Frontend dependencies
│
└── README.md
```

<br/>

## 🔄 System Architecture & Flow

```text
[ React Frontend (Vercel) ]
           │
           │  1. POST /api/v1/scan (Repo URL)
           ▼
[ FastAPI Backend (Render) ]
           │
           ├─► 2. Creates ScanJob (Status: PENDING) in Supabase PostgreSQL
           │
           ├─► 3. Returns 201 Created Response to Frontend immediately
           │
           └─► 4. Spawns Background Task:
                      │
                      ├── Clones GitHub Repo into Memory
                      ├── Scans for Secrets & API Keys (Regex Engine)
                      ├── Audits Package Manifests for Vulnerabilities
                      ├── Generates PDF Security Report
                      └── Updates ScanJob (Status: COMPLETED / FAILED)
```

<br/>

## 🚀 Local Installation & Setup

### Prerequisites

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Git](https://img.shields.io/badge/Git-Required-F05032?style=flat-square&logo=git&logoColor=white)

### 1. Clone the Repository

```bash
git clone https://github.com/mr-aniket-2004/SecureScan.git
cd SecureScan
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd secret-scanner

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend development server
uvicorn main_api:app --reload --port 8000
```

> 📘 API docs will be available locally at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> 🌐 The application UI will be accessible at `http://localhost:5173`

<br/>

## 🌐 Live Deployment

<div align="center">

| Service | Host | Live URL |
|---|---|---|
| 🎨 **Frontend UI** | Vercel | [secure-scan-plum.vercel.app](https://secure-scan-plum.vercel.app/) |
| ⚙️ **Backend API** | Render | [securescan-9cv9.onrender.com](https://securescan-9cv9.onrender.com) |
| 📖 **Swagger Docs** | Render | [securescan-9cv9.onrender.com/docs](https://securescan-9cv9.onrender.com/docs) |

</div>

<br/>

## 🗺️ Roadmap

- [x] Secret & API key detection engine
- [x] Dependency vulnerability auditing
- [x] Async background scan processing
- [x] PDF report generation
- [ ] GitHub App / Webhook integration for CI pipelines
- [ ] Slack / Discord scan notifications
- [ ] Historical scan trend dashboard

<br/>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/mr-aniket-2004/SecureScan/issues) or open a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br/>

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<br/>

<div align="center">

### ⭐ If you find this project useful, consider giving it a star!

<img src="https://raw.githubusercontent.com/mr-aniket-2004/Journey/main/assets/banner.png" alt="footer" width="60%"/>

</div>
