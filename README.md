<<<<<<< HEAD
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
=======
# 🌱 AGRONEON

### Explainable AI-Powered Smart Farming Ecosystem for Small and Marginal Farmers

**Smart India Hackathon 2026**

**Problem Statement ID:** SIHI018
**Problem Statement:** Smart Crop Advisory System for Small and Marginal Farmers
**Team Name:** TECH NEON
**Category:** Software

---

## 📌 About the Project

**AGRONEON** is an Explainable AI-powered smart farming ecosystem designed to support small and marginal farmers throughout the complete agricultural lifecycle — from **Soil to Sale**.

The platform combines Artificial Intelligence, Machine Learning, Computer Vision, Explainable AI, multilingual voice assistance, agricultural data, and offline-first functionality to provide personalized and practical farming decision support.

---

## 🎯 Problem Being Addressed

Small and marginal farmers face challenges such as improper crop selection, changing weather conditions, crop diseases, limited access to expert guidance, fluctuating market prices, and dependence on intermediaries.

Existing agricultural advisory solutions may provide generic recommendations without sufficiently considering individual farm conditions, soil information, location, season, water availability, financial constraints, and market conditions.

AGRONEON aims to address these challenges through a unified, farmer-first digital platform.

---

## 💡 Our Solution

AGRONEON provides personalized agricultural guidance using:

* 🌱 Land suitability analysis
* 🧪 Verified soil-test report integration
* 🌾 AI-based crop recommendation
* 🧠 Explainable AI
* 📊 Yield, cost, profit and risk estimation
* 📅 Daily crop lifecycle guidance
* 🩺 AI-based crop disease detection
* 🌦️ Weather and agricultural information
* 🚜 Nearby farming equipment information
* 🏢 Research centre and government office information
* 💰 Government schemes and subsidy information
* 📈 Market price and market comparison
* 🤝 Farmer-to-buyer connectivity
* 🗣️ Multilingual voice assistance
* 📴 Offline-first access to essential information

---

## 🔄 How It Works

```text
Farmer Registration
        ↓
Farm Location + Land Details
        ↓
Land Image Analysis
        ↓
Soil Test Recommendation
        ↓
Verified Soil Report Upload
        ↓
AI Land & Crop Suitability Analysis
        ↓
Top-3 Crop Recommendations
        ↓
Explainable Recommendation
        ↓
Cost + Yield + Profit + Risk Analysis
        ↓
Daily Farming Assistance
        ↓
Crop Disease Detection
        ↓
Harvest Support
        ↓
Market Comparison
        ↓
Farmer-to-Buyer Connectivity
```

---

## ⭐ Key Innovation

AGRONEON focuses on three core pillars:

### 🧠 Explainable AI

The system does not simply recommend a crop. It explains the major factors behind the recommendation so that farmers can understand the decision.

### 💰 Profit-Driven Intelligence

The platform considers estimated cultivation cost, expected yield, market price, potential revenue, profit, and risk to support better financial decisions.

### 📴 Offline-First Resilience

Essential farming information and previously synchronized recommendations remain accessible even when internet connectivity is limited.

---

## 👨‍🌾 Target Beneficiaries

The primary beneficiaries are:

* Small and marginal farmers
* Farmer Producer Organizations (FPOs)
* Agricultural extension officers
* Government agricultural departments
* Agricultural researchers
* Buyers and agribusinesses

---

## 🚀 Future Scope

The future roadmap includes:

* IoT-based soil sensors
* Drone-based crop monitoring
* Satellite-based agricultural analysis
* Smart irrigation
* Advanced precision agriculture
* Expanded farmer marketplace
* Advanced agricultural forecasting

---

## 🏆 Hackathon

This project is developed as part of **Smart India Hackathon 2026** under the problem statement:

**SIHI018 – Smart Crop Advisory System for Small and Marginal Farmers**

### Team

**TECH NEON**

---

## 📄 Project Abstract

The detailed project abstract is available in this repository as a separate document.

---

### 🌱 Vision

> **“Empowering Every Farmer with Explainable AI – From Soil to Sale.”**
>>>>>>> origin/main
