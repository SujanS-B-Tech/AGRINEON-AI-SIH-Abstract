# AGRONEON Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FARMER (Browser/Mobile)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  React Frontend  │
                    │  (Vite + Tailwind)│
                    │  Offline Storage │
                    └────────┬────────┘
                             │ REST API (Axios)
                    ┌────────▼────────┐
                    │  FastAPI Backend │
                    │  JWT Auth        │
                    └────────┬────────┘
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼──────┐  ┌───▼────────┐
     │ PostgreSQL  │  │  AI/ML      │  │ External   │
     │ Database    │  │  Pipeline   │  │ APIs       │
     └─────────────┘  └─────────────┘  └────────────┘
```

## Data Flow: Crop Recommendation

```
Soil Report + Farm Data + Climate
         │
         ▼
  Feature Engineering
         │
         ▼
  Random Forest Model
         │
    ┌────┴────┐
    ▼         ▼
 Top 3     SHAP Values
 Crops     (Explainable AI)
    │         │
    └────┬────┘
         ▼
  Economics + Risk Engine
         │
         ▼
  Crop Selection → Farming Plan
```

## Module Map

| Module | Frontend Page | Backend API | AI Component |
|--------|--------------|-------------|--------------|
| Auth | Login, Register | /auth/* | — |
| Farm Profile | Farm Profile | /farms | — |
| Land Analysis | Land Analysis | /land/analyze | Image preprocessing |
| Soil Report | Soil Report | /soil/* | — |
| Crop Advisory | Crop Advisory | /crop/recommend | Random Forest + SHAP |
| Crop Details | Crop Details | /crop/{id} | Economics engine |
| Farming Plan | Farming Plan | /crop/plan/{id} | Crop calendar KB |
| Crop Doctor | Crop Doctor | /disease/predict | CNN classifier |
| Market | Market Intelligence | /markets/* | — |
| Services | Nearby Services | /services/nearby | — |
| Schemes | Government Schemes | /schemes | — |
| Voice | Voice Assistant | /voice | STT/TTS |
| Chat | (embedded) | /chat | Context-aware |

## Database ER (Simplified)

```
users ──1:N── farms ──1:N── soil_reports ──1:N── soil_parameters
  │              │
  │              ├──1:N── crop_recommendations
  │              ├──1:N── crop_plans ──1:N── crop_tasks
  │              └──1:N── disease_predictions
  │
  ├──1:N── notifications
  └──1:N── market_listings

markets ──1:N── market_prices
services (standalone)
government_schemes (standalone)
events (standalone)
```

## Deployment

```
Docker Compose
├── postgres (5432)
├── backend (8000)
└── frontend (5173)
```

## Security

- JWT bearer tokens for API auth
- bcrypt password hashing
- CORS restricted to frontend origin
- File upload size limits
- Input validation via Pydantic
- No secrets in git (.env.example only)
