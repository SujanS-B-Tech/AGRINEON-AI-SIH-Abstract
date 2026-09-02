# AGRONEON AI — Explainable AI for Smart Farming
**(PRODUCTION READY)**

AGRONEON AI is a comprehensive, AI-powered smart farming ecosystem designed specifically for small and marginal farmers in India. It transitions from a prototype into a robust production-ready web application offering contextual AI recommendations, market intelligence, voice assistance, and disease diagnostics.

## Features fully implemented with Real Backend Integration:

*   **Authentication**: JWT-based Secure Login & Registration.
*   **Database**: PostgreSQL with SQLAlchemy ORM handling 13+ related schema tables.
*   **Explainable AI Crop Advisory**: Backend AI engine generating context-aware crop recommendations.
*   **Economics Engine**: Computes seed, fertilizer, labor costs against expected yields to project net profits.
*   **Disease Diagnostics Engine**: Image analysis engine matching visual symptoms against an agricultural knowledge base.
*   **Voice/Chat Assistant**: A context-aware chatbot (AGRI-VOICE) working with real database data (Farm profile, tasks, soil). Supports English and Tamil.
*   **Market Intelligence**: Live dynamic sorting of market prices to maximize net return for the farmer's specific crop.
*   **Dynamic Farming Plans**: Auto-generated lifecycle task timelines based on the chosen crop.

---

## 🚀 How to Run the Production Application

### 1. Prerequisites
- **Node.js**: v18+ (for Frontend)
- **Python**: 3.10+ (for Backend FastApi)
- **PostgreSQL**: Running locally or via Docker
- **Git**

### 2. Database Setup (Docker or Local)
If using Docker, start the PostgreSQL container:
```bash
docker-compose up -d postgres
```
Otherwise, ensure your local PostgreSQL is running and create a database named `agroneon`.

### 3. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt

# Create .env file based on .env.example
copy .env.example .env

# Train the ML models (Optional but recommended)
cd ../ai
python generate_dataset.py
python train_crop_model.py
cd ../backend

# Run the FastAPI server
uvicorn app.main:app --reload --port 8000
```
*Note: The backend will automatically create all tables and run a seeding script on startup.*

### 4. Frontend Setup
```bash
cd frontend
npm install

# Run the Vite development server
npm run dev
```

### 5. Access the Application
- **Frontend**: Navigate to `http://localhost:5173`
- **Backend API Docs**: Navigate to `http://localhost:8000/docs`
- **Demo Account**: `farmer@agroneon.com` / `password123`

---

## Technical Stack
- **Frontend**: React 18, Vite, TailwindCSS, Recharts, Lucide Icons, Axios.
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Passlib (bcrypt), python-jose (JWT).
- **AI/ML**: Scikit-Learn (Random Forest), Rule-based heuristic engines.
- **Cloud/Deployment Ready**: Dockerfile and docker-compose configurations included.

## Project Structure
- `/frontend`: React SPA application.
- `/backend`: FastAPI service.
- `/ai`: Machine learning model training pipeline.
- `/database`: Initial SQL drafts (replaced by SQLAlchemy models).
- `/docs`: Contains original presentation PPT and abstract for SIH.
