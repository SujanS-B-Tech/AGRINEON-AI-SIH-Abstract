"""Database Seeding Script for AGRONEON"""
from sqlalchemy.orm import Session
from app.models import User, Farm, Market, MarketPrice, Service, GovernmentScheme, Event
from app.core.security import hash_password

def seed_database(db: Session):
    # Check if demo user already exists
    demo_user = db.query(User).filter(User.email == "farmer@agroneon.com").first()
    if demo_user:
        return  # Database already seeded

    print("Seeding database...")
    
    # 1. Create Demo User
    user = User(
        name="Ramesh Kumar",
        email="farmer@agroneon.com",
        phone="+919876543210",
        password_hash=hash_password("password123"),
        preferred_language="English"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Create Demo Farm
    farm = Farm(
        user_id=user.id,
        location="Thanjavur, Tamil Nadu",
        land_area=2.5,
        soil_type="Alluvial",
        water_availability="Abundant",
        previous_crop="Paddy",
        current_season="Kharif",
        latitude=10.7870,
        longitude=79.1378
    )
    db.add(farm)
    db.commit()

    # 3. Create Markets & Prices
    markets_data = [
        {"name": "Thanjavur APMC Market", "distance": "12 km", "price": 2800, "unit": "₹/quintal", "grade": "Grade A", "transport_cost": 1500},
        {"name": "Trichy Wholesale Market", "distance": "45 km", "price": 3100, "unit": "₹/quintal", "grade": "Grade A", "transport_cost": 4500},
        {"name": "Kumbakonam Mandi", "distance": "28 km", "price": 2950, "unit": "₹/quintal", "grade": "Grade A", "transport_cost": 2800}
    ]
    for idx, md in enumerate(markets_data):
        market = Market(
            name=md["name"],
            location=md["distance"],
            is_demo=True
        )
        db.add(market)
        db.commit()
        db.refresh(market)
        price = MarketPrice(
            market_id=market.id,
            crop_name="Paddy / Tomato",
            price=md["price"],
            unit=md["unit"],
            grade=md["grade"],
            transport_cost=md["transport_cost"]
        )
        db.add(price)
    
    db.commit()

    # 4. Services
    services_data = [
        {"name": "Govt Soil Testing Lab", "type": "Soil Testing", "location": "District Collectorate Campus, Thanjavur", "contact": "04362-230123", "website": "https://tnagrisnet.tn.gov.in"},
        {"name": "Krishi Vigyan Kendra (KVK)", "type": "Research Centre", "location": "Needamangalam", "contact": "04367-260666", "website": "https://kvk.icar.gov.in"},
        {"name": "GreenTech Agri Rentals", "type": "Equipment Rental", "location": "Medical College Road", "contact": "+91 98765 43211", "website": None},
        {"name": "Agriculture Extension Center", "type": "Government Office", "location": "Orathanadu", "contact": "04362-246777", "website": None}
    ]
    for sd in services_data:
        db.add(Service(
            name=sd["name"], service_type=sd["type"], location=sd["location"], contact=sd["contact"], website=sd["website"], is_demo=True
        ))
    
    # 5. Schemes
    schemes_data = [
        {"name": "PM-KISAN Samman Nidhi", "eligibility": "Small and marginal farmers (<2 hectares)", "category": "General", "benefit": "₹6,000 per year in 3 equal installments", "application": "Register via CSC or pmkisan.gov.in", "source": "https://pmkisan.gov.in/"},
        {"name": "Soil Health Card Scheme", "eligibility": "All farmers", "category": "Soil & Fertilizer", "benefit": "Free soil testing and nutrient recommendation card", "application": "Contact nearest Agriculture Extension Office", "source": "https://soilhealth.dac.gov.in/"},
        {"name": "Pradhan Mantri Fasal Bima Yojana", "eligibility": "Farmers growing notified crops", "category": "Insurance", "benefit": "Comprehensive crop insurance against natural calamities", "application": "Bank branch or PMFBY portal", "source": "https://pmfby.gov.in/"}
    ]
    for sc in schemes_data:
        db.add(GovernmentScheme(
            name=sc["name"], eligibility=sc["eligibility"], farmer_category=sc["category"], benefit=sc["benefit"], application_info=sc["application"], official_source=sc["source"], is_demo=True
        ))

    # 6. Events
    events_data = [
        {"type": "Training", "title": "Modern Irrigation Techniques Workshop", "date": "Oct 15, 2025", "location": "KVK Needamangalam", "source": "TNAU Extension"},
        {"type": "Camp", "title": "Free Soil Testing Camp", "date": "Oct 20, 2025", "location": "Village Panchayat Office", "source": "Dept of Agriculture, TN"},
        {"type": "Exhibition", "title": "AgriTech Expo 2025", "date": "Nov 05-07, 2025", "location": "CODISSIA, Coimbatore", "source": "AgriTech Organizers"}
    ]
    from datetime import datetime
    for ev in events_data:
        dt = datetime.strptime(ev["date"].split(",")[0].split("-")[0], "%b %d").replace(year=2025).date()
        db.add(Event(
            title=ev["title"], event_type=ev["type"], event_date=dt, location=ev["location"], source=ev["source"], is_demo=True
        ))

    db.commit()
    print("Database seeded successfully with demo data.")
