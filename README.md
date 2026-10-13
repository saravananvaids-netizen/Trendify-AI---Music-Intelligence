# Trendify AI – Trending Music Analyzer 2026

> **Discover Trends. Analyze Music. Predict Tomorrow.**

Trendify AI is an end-to-end music intelligence and trajectory forecasting platform. Built with a Spotify-inspired dark aesthetic, it analyzes verified YouTube Data API v3 statistics, computes multi-dimensional engagement ratios, tracks historical SQLite snapshots, compares multi-artist performances, and runs a Scikit-learn **RandomForestRegressor** to project future video playback momentum.

---

## 🚀 Key Features

1. **Main KPI Dashboard**:
   - Total tracked music videos, total cumulative views, total positive ratings (likes), and average engagement rate.
   - Fastest-growing tracked song indicator with differential daily velocity.
   - Top 10 trending songs bar chart, Views vs. Likes correlation scatter plot, Seaborn correlation heatmap, and Country-wise distribution.

2. **Trending Music Explorer**:
   - Filter by Top 10, Top 25, and Top 50 limits.
   - Regional filtering: United States (US), India (IN), Japan (JP), Brazil (BR), United Kingdom (GB), and Global.
   - Release year filter (including 2026 releases).
   - Multi-metric sorting: Views, Likes, Engagement Rate, Short-term Growth, and Transparent Popularity Score.
   - Direct YouTube player links and verified thumbnails.

3. **Engagement Analytics**:
   - **Like Rate**: `(Likes / Views) × 100`
   - **Comment Rate**: `(Comments / Views) × 100`
   - **Interaction Rate**: `((Likes + Comments) / Views) × 100`
   - **Transparent Popularity Score (0–100)**:
     - 40% Normalized Log View Volume
     - 30% Interaction Intensity
     - 20% Velocity & Recency Momentum
     - 10% Short-term Growth Momentum bonus
   - *Public share counts are labeled as "Unavailable" in strict compliance with public API limitations.*

4. **Machine Learning Trend Prediction (Scikit-Learn)**:
   - Regression engine using `RandomForestRegressor(n_estimators=100, max_depth=6)`.
   - Feature weights extracted directly from tree splits: Log Views, Log Likes, Interaction Rate, Growth Rate, Catalog Age, Daily Velocity, and Like-to-Comment ratio.
   - Configurable forecast horizons: 7, 14, 30, and 60 days.
   - Popularity classification into **Low**, **Medium**, or **High** momentum tiers.
   - Cross-validation metrics: Mean Absolute Error (MAE) and R² coefficient.
   - Prominently labeled **Simulated Demo Mode** for testing without waiting for multi-week observation intervals.

5. **Historical Trend Tracker (SQLite)**:
   - Persistent relational database (`trendify_music.db`).
   - Time-series observation snapshots logging timestamp, views, likes, comments, and engagement.
   - One-click **CSV Dataset Export**.

6. **Multi-Artist Comparison**:
   - Compare 2 to 5 artists side-by-side on volume, average engagement density, and catalog performance.
   - Explicit disclaimer noting that numbers reflect videos collected in the app's catalog, not total all-time discography.

7. **AI Music Insights**:
   - Synthesizes trends using Google Gemini (`gemini-3.8-flash`) or deterministic statistical analysis grounded purely in observed facts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons |
| **Backend REST API** | Python, FastAPI, Uvicorn, Pydantic |
| **Data Science / ML** | Scikit-learn, Pandas, NumPy, Matplotlib, Seaborn |
| **Database** | SQLite 3 (`trendify_music.db`) |
| **External APIs** | YouTube Data API v3 (`categoryId=10`), Google Gemini API (`gemini-3.8-flash`) |

---

## 💻 Windows & VS Code Installation & Execution Guide

### Prerequisites
1. **Node.js**: Install Node.js v18+ from [nodejs.org](https://nodejs.org/).
2. **Python**: Install Python 3.10+ from [python.org](https://www.python.org/) (*make sure to check "Add Python to PATH" during installation*).
3. **VS Code**: Visual Studio Code with the Python and ESLint extensions.

---

### Step 1: Clone or Open the Project
Open the project directory in VS Code:
```bash
code .
```

---

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
Inside `.env`, configure your optional API keys:
```env
# Optional: Get from Google Cloud Console
YOUTUBE_API_KEY="your_youtube_api_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"
```
*(If no keys are provided, Trendify AI automatically activates its high-fidelity 2026 regional music baseline catalog and deterministic analytics engine).*

---

### Step 3: Run Full-Stack via Node Dev Server (Easiest)
Trendify AI includes a unified server (`server.ts`) that serves both the React client and the complete API engine with zero extra configuration:
```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### Step 4: Run the Standalone Python FastAPI Backend (Optional)
If you want to run the pure Python FastAPI backend and scikit-learn training process separately:

1. Open a new terminal in VS Code:
```bash
# Create a Python virtual environment
python -m venv venv

# Activate virtual environment on Windows:
venv\Scripts\activate

# Install Python data science dependencies
pip install -r requirements.txt
```

2. Start the FastAPI server:
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
You can now access:
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

---

## 🧪 Testing Backend Endpoints

Run the automated backend test suite using `pytest`:
```bash
# Make sure your virtual environment is active
pytest backend/tests/test_api.py -v
```

### Manual Endpoint Verification (cURL / PowerShell)
```powershell
# Check health and database status
Invoke-RestMethod -Uri "http://localhost:3000/api/health"

# Get top 10 trending music tracks
Invoke-RestMethod -Uri "http://localhost:3000/api/trending?limit=10&region=GLOBAL"

# Test machine learning prediction for a video
Invoke-RestMethod -Uri "http://localhost:3000/api/predictions/kPa7bsKwL-8?horizon_days=14&demo_mode=true"

# Export CSV dataset
Invoke-WebRequest -Uri "http://localhost:3000/api/export/csv" -OutFile "trendify_export.csv"
```

---

## ⚙️ Troubleshooting Common Setup & API Issues

| Issue | Cause | Solution |
|---|---|---|
| `YouTube API 403: QuotaExceeded` | Daily free limit (10,000 units) exhausted. | Trendify AI automatically falls back to cached baseline entries. To increase quota, apply in Google Cloud Console. |
| `pip: command not found` | Python was installed without pip or PATH. | Re-run Python installer and check "Add Python to environment variables". |
| `FastAPI CORS error` | Origin mismatch when running frontend on custom port. | `backend/main.py` has `allow_origins=["*"]` configured. Verify backend URL in `.env`. |
| `Empty predictions` | Video has fewer than 2 snapshots. | Enable the **Simulated Demo Mode** switch in the UI, or wait for multiple observation cycles. |
| `Share count missing` | YouTube Data API v3 does not expose public shares. | Trendify AI displays "Unavailable" rather than fabricating fake share metrics. |

---

## 📄 License
Apache-2.0 License. Built for Trendify AI (2026).
