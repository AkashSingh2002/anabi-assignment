from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from textblob import TextBlob
import pandas as pd
import io

app = FastAPI()

# Add CORS middleware to allow your React app to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all domains; adjust as needed
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.post("/analyze_sentiment/")
async def analyze_sentiment(file: UploadFile = File(...)):
    # Load the CSV file into a pandas DataFrame
    contents = await file.read()
    data = pd.read_csv(io.StringIO(contents.decode("utf-8")))

    results = []
    for index, row in data.iterrows():
        text = row.get("text", "")
        analysis = TextBlob(text)
        sentiment = "neutral"
        if analysis.sentiment.polarity > 0:
            sentiment = "positive"
        elif analysis.sentiment.polarity < 0:
            sentiment = "negative"

        # Append all fields
        results.append({
            "id": row.get("id", index),
            "text": text,
            "timestamp": row.get("timestamp", ""),
            "sentiment": sentiment
        })

    return {"results": results}
