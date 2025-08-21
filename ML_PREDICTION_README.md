# ML Risk Prediction System

This document describes the Machine Learning Risk Prediction system that has been integrated into the Hospital Analytics platform.

## Overview

The ML Risk Prediction system uses a trained XGBoost model to predict user risk scores based on various activity parameters. The system consists of:

1. **FastAPI ML Service** (`backend/ml_service.py`) - Python service that hosts the trained model
2. **Express.js API Integration** (`backend/src/routes/risk.js`) - Backend routes that connect to the ML service
3. **React Frontend Component** (`frontend/components/risk-prediction-form.tsx`) - User interface for making predictions

## Architecture

```
Frontend (React/Next.js) 
    ↓ HTTP Request
Backend API (Express.js) 
    ↓ HTTP Request
ML Service (FastAPI/Python)
    ↓ Model Prediction
Trained XGBoost Model + Encoders
```

## Model Details

- **Algorithm**: XGBoost Regressor
- **Input Features**:
  - `ip_region`: Geographic location (Vietnam, Nigeria, US, etc.)
  - `device_type`: Device familiarity (new, known)
  - `user_role`: User's role (employee, guest)
  - `action`: User action (login, logout, page_view_home, page_view_it_request)
  - `hour`: Hour of day (0-23)
  - `sessionPeriod`: Session duration in minutes

- **Output**: Risk score (0-1, converted to 0-100% in API)
- **Risk Levels**: 
  - Low: 0-39%
  - Medium: 40-69%
  - High: 70-100%

## Files Structure

```
├── backend/
│   ├── ml_service.py              # FastAPI ML service
│   ├── requirements.txt           # Python dependencies
│   ├── encoders.pkl              # Trained label encoders
│   ├── start-ml-service.ps1      # ML service startup script
│   └── src/routes/risk.js        # Updated API routes
├── frontend/
│   ├── components/
│   │   └── risk-prediction-form.tsx  # Prediction form component
│   └── app/
│       └── risk-prediction/
│           └── page.tsx          # Prediction page
├── start-dev-with-ml.ps1         # Complete development startup
└── test-ml-prediction.ps1        # Testing script
```

## Quick Start

### 1. Start All Services

```powershell
# Start all services (Frontend, Backend, ML Service)
.\start-dev-with-ml.ps1
```

### 2. Process Existing Audit Logs with ML

After starting the services, you can apply ML predictions to all existing audit logs directly from the User Activity page:

1. **Navigate to User Activity**: http://localhost:3001/dashboard/audit
2. **View ML Status** - see prediction progress at the top of the page
3. **Click "Predict Risk Scores"** to process all unpredicted logs
4. **Monitor Progress** - see real-time status and results
5. **View Updated Logs** - ML-predicted scores appear with blue "ML" indicators

### 2. Manual Service Startup

If you prefer to start services individually:

```powershell
# Terminal 1: Start ML Service
cd backend
.\start-ml-service.ps1

# Terminal 2: Start Backend API
cd backend
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3003
- **ML Service**: http://localhost:8000
- **ML API Docs**: http://localhost:8000/docs

## API Endpoints

### ML Service (FastAPI)

- `GET /health` - Health check and service status
- `POST /predict` - Single risk prediction
- `POST /predict-batch` - Batch risk predictions

### Backend API (Express.js)

**Individual Predictions:**
- `POST /api/risk/predict` - ML-powered risk prediction with fallback
- `POST /api/risk/predict-batch` - Batch predictions
- `GET /api/risk/ml-health` - ML service health check

**Batch Processing (Audit Logs):**
- `POST /api/logs/predict-all` - Process all audit logs with ML predictions
- `GET /api/logs/prediction-status` - Get batch prediction status and progress
- `POST /api/logs/reset-predictions` - Reset ML predictions (for testing)

## Usage Examples

### Single Prediction (Direct ML Service)

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "ip_region": "Vietnam",
    "device_type": "known",
    "user_role": "employee", 
    "action": "login",
    "hour": 14,
    "sessionPeriod": 15
  }'
```

### Single Prediction (Through Backend API)

```bash
curl -X POST "http://localhost:3003/api/risk/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "ip_region": "Vietnam",
    "device_type": "known",
    "user_role": "employee",
    "action": "login", 
    "hour": 14,
    "sessionPeriod": 15
  }'
```

## Frontend Usage

### Automatic ML Risk Prediction for Audit Logs

1. Navigate to http://localhost:3001
2. Login with `admin` / `admin`
3. Go to "User Activity" in the navigation
4. View the ML prediction status panel at the top:
   - See total logs, predicted logs, and completion percentage
   - View how many logs are pending prediction
5. Click "Predict Risk Scores" to process all unpredicted logs automatically
6. Monitor real-time progress and results
7. View updated risk scores with blue "ML" indicators in the audit log table

### Understanding Risk Score Indicators

- **Risk scores with blue "ML" badge**: Calculated using the trained XGBoost model
- **Risk scores without "ML" badge**: Calculated using rule-based fallback
- **Progress statistics**: Show prediction completion percentage
- **Automatic refresh**: ML status updates when logs are refreshed

### Workflow

1. **Initial State**: All audit logs have 0% risk score (default)
2. **Run Predictions**: Click "Predict Risk Scores" to process logs with ML model
3. **View Results**: Risk scores update automatically with ML predictions
4. **Ongoing**: New logs can be processed incrementally

## Fallback Behavior

If the ML service is unavailable, the backend API automatically falls back to a rule-based risk calculation that considers:
- Device type (new devices = higher risk)
- User role (guests = higher risk)
- Geographic location (certain regions = higher risk)
- Time of day (off-hours = higher risk)
- Session duration (longer sessions = slight risk increase)
- Action type (sensitive actions = higher risk)

## Testing

Run the comprehensive test script:

```powershell
.\test-ml-prediction.ps1
```

This will verify:
- ML service health
- Backend API connectivity
- ML integration through backend
- Frontend accessibility

## Environment Variables

### Backend (.env)
```env
ML_SERVICE_URL=http://localhost:8000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3003
```

## Dependencies

### Python (ML Service)
- fastapi==0.104.1
- uvicorn==0.24.0
- pandas==2.1.4
- numpy==1.24.3
- scikit-learn==1.3.2
- xgboost==2.0.2
- pydantic==2.5.0

### Node.js (Backend)
- express
- node-fetch
- cors
- dotenv

### Frontend (React/Next.js)
- react-hook-form
- zod
- @radix-ui components
- tailwindcss

## Troubleshooting

### ML Service Won't Start
1. Ensure Python is installed and accessible
2. Check that all dependencies are installed: `pip install -r requirements.txt`
3. Verify encoders.pkl exists in the backend directory
4. Check port 8000 is not in use

### Predictions Return Fallback Results
1. Check ML service health: http://localhost:8000/health
2. Verify ML service is running on port 8000
3. Check backend logs for connection errors
4. Ensure ML_SERVICE_URL environment variable is correct

### Frontend Form Errors
1. Verify backend API is running on port 3003
2. Check NEXT_PUBLIC_BACKEND_URL in frontend/.env.local
3. Ensure CORS is properly configured in backend

## Model Training Information

The model was trained on security event data with the following characteristics:
- **Features**: IP region, device type, user role, action, hour, session period
- **Target**: Risk score (0-1 range)
- **Model Type**: XGBoost Regressor
- **Preprocessing**: Label encoding for categorical variables
- **Performance**: Metrics shown in training notebook

To retrain the model:
1. Prepare your dataset with the same feature columns
2. Train using XGBoost with similar hyperparameters
3. Save the model and encoders using pickle
4. Replace the model files in the backend directory