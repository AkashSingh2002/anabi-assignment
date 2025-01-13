from fastapi import FastAPI, File, UploadFile, Depends
from typing import List
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import io
from fastapi.security import OAuth2PasswordBearer

# FastAPI instance
app = FastAPI()

# OAuth2 Authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

# Endpoint to analyze CSV
@app.post("/analyze_sentiment/")
async def analyze_sentiment(file: UploadFile = File(...)):
    # Read CSV file content
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    
    results = []
    for index, row in df.iterrows():
        sentiment_score = analyzer.polarity_scores(row['text'])
        sentiment_label = "positive" if sentiment_score['compound'] > 0.05 else "negative" if sentiment_score['compound'] < -0.05 else "neutral"
        results.append({
            "id": row['id'],
            "text": row['text'],
            "timestamp": row.get('timestamp', ''),
            "sentiment": sentiment_label
        })
    
    return {"results": results}
