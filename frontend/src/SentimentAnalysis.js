import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import CSVReader from "react-csv-reader";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary components from Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SentimentAnalysis = () => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        label: "Sentiment Distribution",
        data: [0, 0, 0],
        backgroundColor: ["#4caf50", "#ffeb3b", "#f44336"],
      },
    ],
  });

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze_sentiment/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.data?.results) {
        setData(response.data.results);

        const sentimentCounts = response.data.results.reduce(
          (acc, curr) => {
            acc[curr.sentiment] += 1;
            return acc;
          },
          { positive: 0, neutral: 0, negative: 0 }
        );

        setChartData({
          labels: ["Positive", "Neutral", "Negative"],
          datasets: [
            {
              label: "Sentiment Distribution",
              data: [
                sentimentCounts.positive,
                sentimentCounts.neutral,
                sentimentCounts.negative,
              ],
              backgroundColor: ["#4caf50", "#ffeb3b", "#f44336"],
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sentiment Analysis</h1>
      <CSVReader
        onFileLoaded={(data) => handleFileUpload(data)}
        cssClass="csv-reader-input"
        label="Upload your CSV file"
        inputStyle={{
          marginBottom: "20px",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <div style={{ maxWidth: "600px", margin: "20px auto" }}>
        <Bar data={chartData} />
      </div>
      {data.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Text</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Timestamp</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{entry.id}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{entry.text}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{entry.timestamp}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{entry.sentiment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SentimentAnalysis;
