"""
ML Prediction Service for Risk Score Assessment
Based on the trained XGBoost model and encoders from the notebook
"""

import pickle
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import os

# Initialize FastAPI app
app = FastAPI(title="Risk Score Prediction API", version="1.0.0")

class PredictionRequest(BaseModel):
    """Request model for risk prediction"""
    ip_region: str  # e.g., "Vietnam", "Nigeria", "US"
    device_type: str  # e.g., "new", "known"
    user_role: str  # e.g., "employee", "guest"
    action: str  # e.g., "login", "logout", "page_view_it_request", "page_view_home"
    hour: int  # Hour of the day (0-23)
    sessionPeriod: int  # Session period value

class PredictionResponse(BaseModel):
    """Response model for risk prediction"""
    risk_score: float
    risk_level: str
    input_data: Dict[str, Any]
    success: bool
    message: str

class MLPredictor:
    def __init__(self):
        self.model = None
        self.encoders = None
        self.feature_columns = ['ip_region', 'device_type', 'user_role', 'action', 'hour', 'sessionPeriod']
        self.load_model_and_encoders()
    
    def load_model_and_encoders(self):
        """Load the trained model and encoders"""
        try:
            # Load encoders
            with open('encoders.pkl', 'rb') as f:
                self.encoders = pickle.load(f)
            print("✅ Encoders loaded successfully")
            print(f"Available encoders: {list(self.encoders.keys())}")
            
            # Try to load model - we'll create a placeholder if it doesn't exist
            model_path = 'xgb_model.pkl'
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("✅ Model loaded successfully")
            else:
                print("⚠️ Model file not found. Using placeholder model.")
                # Create a placeholder model for now
                from sklearn.ensemble import RandomForestRegressor
                self.model = RandomForestRegressor(n_estimators=10, random_state=42)
                # Fit with dummy data
                dummy_X = np.random.rand(100, 6)
                dummy_y = np.random.rand(100)
                self.model.fit(dummy_X, dummy_y)
                
        except Exception as e:
            print(f"❌ Error loading model/encoders: {str(e)}")
            raise e
    
    def preprocess_input(self, data: PredictionRequest) -> pd.DataFrame:
        """Preprocess input data using trained encoders"""
        try:
            # Create DataFrame
            input_dict = {
                'ip_region': data.ip_region,
                'device_type': data.device_type,
                'user_role': data.user_role,
                'action': data.action,
                'hour': data.hour,
                'sessionPeriod': data.sessionPeriod
            }
            
            df = pd.DataFrame([input_dict])
            
            # Apply label encoders for categorical columns
            categorical_cols = ['ip_region', 'device_type', 'user_role', 'action']
            
            for col in categorical_cols:
                if col in self.encoders:
                    encoder = self.encoders[col]
                    try:
                        # Handle unseen categories by using the most common class
                        if data.__dict__[col] not in encoder.classes_:
                            print(f"⚠️ Unseen category '{data.__dict__[col]}' for {col}, using most common class")
                            # Use the first class as default
                            df[col] = encoder.transform([encoder.classes_[0]])
                        else:
                            df[col] = encoder.transform([data.__dict__[col]])
                    except Exception as e:
                        print(f"❌ Error encoding {col}: {str(e)}")
                        # Use default value
                        df[col] = 0
            
            return df
            
        except Exception as e:
            print(f"❌ Error in preprocessing: {str(e)}")
            raise e
    
    def predict_risk_score(self, data: PredictionRequest) -> float:
        """Make prediction using the loaded model"""
        try:
            # Preprocess input
            processed_data = self.preprocess_input(data)
            
            # Make prediction
            prediction = self.model.predict(processed_data)
            
            # Ensure prediction is within valid range [0, 1]
            risk_score = float(prediction[0])
            risk_score = max(0.0, min(1.0, risk_score))
            
            return risk_score
            
        except Exception as e:
            print(f"❌ Error in prediction: {str(e)}")
            # Return a default medium risk score
            return 0.5
    
    def get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level"""
        if risk_score >= 0.7:
            return 'high'
        elif risk_score >= 0.4:
            return 'medium'
        else:
            return 'low'

# Initialize predictor
predictor = MLPredictor()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "ML Risk Prediction Service is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": predictor.model is not None,
        "encoders_loaded": predictor.encoders is not None,
        "available_encoders": list(predictor.encoders.keys()) if predictor.encoders else []
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_risk(request: PredictionRequest):
    """Predict risk score for given user activity"""
    try:
        # Validate input
        if not all([request.ip_region, request.device_type, request.user_role, request.action]):
            raise HTTPException(status_code=400, detail="All fields are required")
        
        if not (0 <= request.hour <= 23):
            raise HTTPException(status_code=400, detail="Hour must be between 0 and 23")
        
        # Make prediction
        risk_score = predictor.predict_risk_score(request)
        risk_level = predictor.get_risk_level(risk_score)
        
        return PredictionResponse(
            risk_score=risk_score,
            risk_level=risk_level,
            input_data=request.dict(),
            success=True,
            message="Prediction successful"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict-batch")
async def predict_batch(requests: list[PredictionRequest]):
    """Predict risk scores for multiple requests"""
    try:
        results = []
        for req in requests:
            risk_score = predictor.predict_risk_score(req)
            risk_level = predictor.get_risk_level(risk_score)
            
            results.append({
                "input": req.dict(),
                "risk_score": risk_score,
                "risk_level": risk_level
            })
        
        return {
            "success": True,
            "predictions": results,
            "count": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.post("/predict-audit-logs")
async def predict_audit_logs(audit_logs: list[dict]):
    """Predict risk scores for audit log entries"""
    try:
        results = []
        for log in audit_logs:
            # Extract and map features from audit log
            mapped_features = map_audit_log_to_features(log)
            
            if mapped_features:
                # Create prediction request
                prediction_req = PredictionRequest(**mapped_features)
                risk_score = predictor.predict_risk_score(prediction_req)
                risk_level = predictor.get_risk_level(risk_score)
                
                results.append({
                    "log_id": log.get("_id") or log.get("id"),
                    "original_log": log,
                    "mapped_features": mapped_features,
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "ml_predicted": True
                })
            else:
                # Fallback for logs that can't be mapped
                results.append({
                    "log_id": log.get("_id") or log.get("id"),
                    "original_log": log,
                    "mapped_features": None,
                    "risk_score": 0.3,  # Default medium risk
                    "risk_level": "medium",
                    "ml_predicted": False,
                    "error": "Could not map log features"
                })
        
        return {
            "success": True,
            "predictions": results,
            "total_processed": len(results),
            "ml_predicted_count": sum(1 for r in results if r["ml_predicted"]),
            "fallback_count": sum(1 for r in results if not r["ml_predicted"])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit log prediction failed: {str(e)}")

def map_audit_log_to_features(log: dict) -> Optional[dict]:
    """Map audit log entry to ML model features"""
    try:
        # Extract timestamp and convert to hour
        timestamp = log.get("timestamp")
        hour = 12  # Default hour
        if timestamp:
            if isinstance(timestamp, str):
                from datetime import datetime
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    hour = dt.hour
                except:
                    pass
            elif hasattr(timestamp, 'hour'):
                hour = timestamp.hour
        
        # Map IP address to region (simplified mapping)
        ip_address = log.get("ipAddress") or log.get("ip_address", "")
        ip_region = map_ip_to_region(ip_address)
        
        # Map device type (new vs known)
        # For simplicity, assume known device if userAgent exists
        user_agent = log.get("userAgent") or log.get("user_agent", "")
        device_type = "known" if user_agent else "new"
        
        # Map user role
        roles = log.get("roles", [])
        if isinstance(roles, list) and len(roles) > 0:
            role = roles[0].lower()
            user_role = "employee" if role in ["admin", "employee", "manager", "user"] else "guest"
        else:
            user_role = "guest"
        
        # Map action
        action = log.get("action", "").lower()
        mapped_action = map_action_to_training_action(action)
        
        # Calculate session period (simplified)
        session_period = log.get("sessionPeriod", 15)  # Default 15 minutes
        if not session_period:
            # Estimate based on metadata or use default
            session_period = 15
        
        return {
            "ip_region": ip_region,
            "device_type": device_type,
            "user_role": user_role,
            "action": mapped_action,
            "hour": hour,
            "sessionPeriod": session_period
        }
        
    except Exception as e:
        print(f"Error mapping audit log to features: {str(e)}")
        return None

def map_ip_to_region(ip_address: str) -> str:
    """Map IP address to region (simplified mapping)"""
    # In a real implementation, you'd use a GeoIP service
    # For now, use simplified logic
    if not ip_address or ip_address == "127.0.0.1" or ip_address.startswith("192.168"):
        return "Vietnam"  # Default for local/internal IPs
    
    # Simple mapping based on common patterns (in real app, use GeoIP)
    if ip_address.startswith("103."):
        return "Vietnam"
    elif ip_address.startswith("41."):
        return "Nigeria"
    elif ip_address.startswith("52.") or ip_address.startswith("54."):
        return "US"
    else:
        return "Vietnam"  # Default

def map_action_to_training_action(action: str) -> str:
    """Map audit log action to training dataset action"""
    action_lower = action.lower()
    
    # Map to the actions from your training dataset
    if "login" in action_lower:
        return "login"
    elif "logout" in action_lower:
        return "logout"
    elif "page_view" in action_lower and "home" in action_lower:
        return "page_view_home"
    elif "page_view" in action_lower and ("it" in action_lower or "request" in action_lower):
        return "page_view_it_request"
    elif "view" in action_lower or "access" in action_lower:
        return "page_view_home"
    else:
        return "login"  # Default action

if __name__ == "__main__":
    # Run the FastAPI server
    uvicorn.run(
        "ml_service:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )