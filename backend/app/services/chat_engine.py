"""AGRONEON Chat/Voice Response Engine
Context-aware response generation using the user's real farm data from the database.
"""
from sqlalchemy.orm import Session
from app.models import (
    User, Farm, SoilReport, SoilParameter, CropRecommendation,
    CropPlan, CropTask, Market, MarketPrice, Notification,
    GovernmentScheme, Service, Event,
)


def _get_farm_context(db: Session, user_id: int) -> dict:
    """Gather all relevant farm data for context-aware responses."""
    ctx = {}
    farm = db.query(Farm).filter(Farm.user_id == user_id).first()
    if farm:
        ctx["farm"] = {
            "location": farm.location,
            "land_area": float(farm.land_area) if farm.land_area else None,
            "soil_type": farm.soil_type,
            "water": farm.water_availability,
            "season": farm.current_season,
            "current_crop": farm.current_crop,
            "crop_stage": farm.crop_stage,
        }

        # Get latest soil report
        report = db.query(SoilReport).filter(
            SoilReport.farm_id == farm.id
        ).order_by(SoilReport.uploaded_at.desc()).first()
        if report:
            params = db.query(SoilParameter).filter(
                SoilParameter.soil_report_id == report.id
            ).all()
            ctx["soil"] = {p.parameter_name: {"value": float(p.value) if p.value else None, "unit": p.unit, "status": p.status} for p in params}

        # Get selected crop recommendation
        selected = db.query(CropRecommendation).filter(
            CropRecommendation.farm_id == farm.id,
            CropRecommendation.is_selected == True,
        ).first()
        if selected:
            ctx["selected_crop"] = {
                "name": selected.crop_name,
                "profit": float(selected.estimated_profit) if selected.estimated_profit else None,
                "yield": float(selected.expected_yield) if selected.expected_yield else None,
                "risk": selected.risk_level,
            }

        # Get current farming plan
        plan = db.query(CropPlan).filter(
            CropPlan.farm_id == farm.id
        ).order_by(CropPlan.created_at.desc()).first()
        if plan:
            today_tasks = db.query(CropTask).filter(
                CropTask.crop_plan_id == plan.id,
                CropTask.completed == False,
            ).order_by(CropTask.scheduled_date).limit(3).all()
            ctx["tasks"] = [{"stage": t.stage, "task": t.task_description, "date": t.scheduled_date.isoformat() if t.scheduled_date else None} for t in today_tasks]

        # Get market prices for current crop
        if farm.current_crop:
            prices = db.query(MarketPrice).filter(
                MarketPrice.crop_name.ilike(f"%{farm.current_crop}%")
            ).join(Market).limit(3).all()
            if prices:
                ctx["market"] = [{"market": p.market.name if p.market else "Unknown", "price": float(p.price), "unit": p.unit} for p in prices]

    return ctx


def _detect_intent(query: str) -> str:
    """Detect user's intent from their query."""
    q = query.lower()

    crop_kw = ["crop", "grow", "plant", "sow", "seed", "harvest", "recommendation", "பயிர்", "விதை"]
    weather_kw = ["weather", "rain", "temperature", "humid", "climate", "வானிலை", "மழை"]
    market_kw = ["market", "price", "sell", "buy", "mandi", "apmc", "விலை", "சந்தை"]
    task_kw = ["task", "today", "schedule", "plan", "farming", "what should", "do today", "பணி"]
    soil_kw = ["soil", "ph", "nitrogen", "nutrient", "fertilizer", "manure", "மண்"]
    disease_kw = ["disease", "sick", "pest", "blight", "wilt", "yellow", "நோய்"]
    scheme_kw = ["scheme", "government", "subsidy", "pm-kisan", "kisan", "benefit", "திட்டம்"]
    service_kw = ["service", "lab", "office", "equipment", "rental", "kvk"]
    greeting_kw = ["hello", "hi", "hey", "good", "vanakkam", "வணக்கம்", "namaste"]
    help_kw = ["help", "what can", "how to", "உதவி"]

    for kw in greeting_kw:
        if kw in q:
            return "greeting"
    for kw in task_kw:
        if kw in q:
            return "task"
    for kw in crop_kw:
        if kw in q:
            return "crop"
    for kw in weather_kw:
        if kw in q:
            return "weather"
    for kw in market_kw:
        if kw in q:
            return "market"
    for kw in soil_kw:
        if kw in q:
            return "soil"
    for kw in disease_kw:
        if kw in q:
            return "disease"
    for kw in scheme_kw:
        if kw in q:
            return "scheme"
    for kw in service_kw:
        if kw in q:
            return "service"
    for kw in help_kw:
        if kw in q:
            return "help"

    return "general"


def generate_response(query: str, language: str, db: Session, user_id: int) -> dict:
    """Generate a context-aware response using the user's real farm data."""
    ctx = _get_farm_context(db, user_id)
    intent = _detect_intent(query)
    is_tamil = language.lower() in ["tamil", "ta"]

    farm = ctx.get("farm", {})
    soil = ctx.get("soil", {})
    crop = ctx.get("selected_crop", {})
    tasks = ctx.get("tasks", [])
    market = ctx.get("market", [])

    if intent == "greeting":
        name = farm.get("location", "")
        if is_tamil:
            reply = f"வணக்கம்! நான் AGRONEON குரல் உதவியாளர். உங்கள் பண்ணை பற்றி எனிடம் கேளுங்கள் — பயிர் நிலை, சந்தை விலை, இன்றைய பணிகள், மண் தகவல், அரசு திட்டங்கள்."
        else:
            reply = f"Hello! I'm AGRONEON, your farming assistant. Ask me about your crop status, market prices, today's tasks, soil parameters, or government schemes."
        return {"reply": reply, "source": "system"}

    elif intent == "task":
        if tasks:
            task_list = "; ".join([f"{t['stage']}: {t['task']}" for t in tasks[:2]])
            if is_tamil:
                reply = f"உங்கள் வரவிருக்கும் பணிகள்: {task_list}"
            else:
                reply = f"Your upcoming farming tasks: {task_list}"
        elif crop.get("name"):
            if is_tamil:
                reply = f"உங்கள் {crop['name']} பயிருக்கு தற்போது குறிப்பிட்ட பணிகள் திட்டமிடப்படவில்லை. பயிர் ஆலோசனை பக்கத்தில் பயிர் தேர்வு செய்யவும்."
            else:
                reply = f"No specific tasks scheduled for your {crop['name']} crop yet. Select a crop in Crop Advisory to generate your farming plan."
        else:
            if is_tamil:
                reply = "பயிர் பணிகளைக் காண, முதலில் பயிர் ஆலோசனை பக்கத்தில் ஒரு பயிரைத் தேர்ந்தெடுக்கவும்."
            else:
                reply = "To see farming tasks, first select a crop from the Crop Advisory page."
        return {"reply": reply, "source": "database"}

    elif intent == "crop":
        if crop.get("name"):
            stage = farm.get("crop_stage", "In Progress")
            profit = crop.get("profit")
            profit_str = f"₹{int(profit):,}" if profit else "Not estimated"
            if is_tamil:
                reply = f"உங்கள் தற்போதைய பயிர் {crop['name']}, நிலை: {stage}. எதிர்பார்க்கப்படும் லாபம்: {profit_str}."
            else:
                reply = f"Your current crop is {crop['name']}, stage: {stage}. Estimated profit: {profit_str}. Risk level: {crop.get('risk', 'N/A')}."
        else:
            if is_tamil:
                reply = "தற்போது பயிர் தேர்ந்தெடுக்கப்படவில்லை. பயிர் ஆலோசனை பக்கத்தில் AI பரிந்துரைகளைப் பெறவும்."
            else:
                reply = "No crop selected yet. Visit the Crop Advisory page to get AI-powered recommendations based on your soil and farm data."
        return {"reply": reply, "source": "database"}

    elif intent == "market":
        if market:
            mkt_info = ", ".join([f"{m['market']}: {m['price']} {m['unit']}" for m in market[:3]])
            crop_name = farm.get("current_crop", "your crop")
            if is_tamil:
                reply = f"{crop_name} சந்தை விலைகள்: {mkt_info}"
            else:
                reply = f"Market prices for {crop_name}: {mkt_info}"
        else:
            if is_tamil:
                reply = "சந்தை விலைத் தகவல்கள் கிடைக்கவில்லை. சந்தை நுண்ணறிவு பக்கத்தைப் பார்க்கவும்."
            else:
                reply = "No market price data available yet. Check the Market Intelligence page for comparisons."
        return {"reply": reply, "source": "database"}

    elif intent == "soil":
        if soil:
            soil_info = ", ".join([f"{k}: {v['value']}{' ' + v['unit'] if v['unit'] else ''} ({v['status']})" for k, v in list(soil.items())[:4]])
            if is_tamil:
                reply = f"உங்கள் மண் அளவுருக்கள்: {soil_info}"
            else:
                reply = f"Your soil parameters: {soil_info}"
        else:
            if is_tamil:
                reply = "மண் தகவல் கிடைக்கவில்லை. மண் அறிக்கை பக்கத்தில் அளவுருக்களை உள்ளிடவும் அல்லது மண் அறிக்கை பதிவேற்றவும்."
            else:
                reply = "No soil data available. Upload a soil report or enter parameters manually in the Soil Report page."
        return {"reply": reply, "source": "database"}

    elif intent == "weather":
        location = farm.get("location", "your area")
        if is_tamil:
            reply = f"{location} பகுதியில் தற்போதைய உள்ளூர் வானிலை நிலவரத்தை வானிலை சேவைகள் மூலம் சரிபார்க்கவும். டாஷ்போர்டில் வானிலை சுருக்கம் கிடைக்கும்."
        else:
            reply = f"Weather data for {location}: Check the dashboard for current weather summary. For accurate forecasts, configure the WEATHER_API_KEY in your environment settings."
        return {"reply": reply, "source": "system"}

    elif intent == "disease":
        if is_tamil:
            reply = "AI பயிர் மருத்துவர் பக்கத்தில் பாதிக்கப்பட்ட இலை அல்லது பயிர் படத்தை பதிவேற்றி நோயைக் கண்டறியவும்."
        else:
            reply = "Upload an image of the affected leaf or crop in the AI Crop Doctor page for disease identification and treatment recommendations."
        return {"reply": reply, "source": "system"}

    elif intent == "scheme":
        schemes = db.query(GovernmentScheme).limit(3).all()
        if schemes:
            scheme_info = "; ".join([f"{s.name}: {s.benefit}" for s in schemes])
            if is_tamil:
                reply = f"கிடைக்கும் அரசு திட்டங்கள்: {scheme_info}"
            else:
                reply = f"Available government schemes: {scheme_info}"
        else:
            if is_tamil:
                reply = "அரசு திட்டங்கள் பக்கத்தில் தகுதியான திட்டங்களைக் காணவும்."
            else:
                reply = "Check the Government Schemes page for eligible schemes and benefits."
        return {"reply": reply, "source": "database"}

    elif intent == "help":
        if is_tamil:
            reply = "நான் உதவ முடியும்: 1) பயிர் நிலை, 2) இன்றைய பணிகள், 3) சந்தை விலை, 4) மண் தகவல், 5) வானிலை, 6) நோய் கண்டறிதல், 7) அரசு திட்டங்கள். கேளுங்கள்!"
        else:
            reply = "I can help with: 1) Crop status & recommendations, 2) Today's farming tasks, 3) Market prices, 4) Soil parameters, 5) Weather info, 6) Disease detection, 7) Government schemes. Just ask!"
        return {"reply": reply, "source": "system"}

    else:
        if is_tamil:
            reply = "மன்னிக்கவும், உங்கள் கேள்வியைப் புரிந்துகொள்ள முடியவில்லை. பயிர், பணிகள், சந்தை, மண், வானிலை பற்றி கேளுங்கள்."
        else:
            reply = "I can help with crop information, farming tasks, market prices, soil data, weather, and government schemes. Please ask about one of these topics."
        return {"reply": reply, "source": "system"}
