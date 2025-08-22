"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Bell, TrendingUp, Building2, Search, Gauge } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("Company XYZ");
  const [predictedRating, setPredictedRating] = useState<number | null>(null);
  const [ratingLabel, setRatingLabel] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [featureData, setFeatureData] = useState<any[]>([]);
  const [topFeatureData, setTopFeatureData] = useState<any[]>([]);
  const [snapshot, setSnapshot] = useState<any | null>(null);
  const [message, setMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:8000/company?symbol=${encodeURIComponent(search)}`
      );
      const data = await res.json();

      // --- Trend data ---
      const trend = (data.history || []).map((d: any) => ({
        date: d.date,
        score: d.predictedRating,
        confidence: d.confidence,
      }));

      // --- Latest top_features (for last day) ---
      const topFeatureData =
        data.history?.slice(-1)[0]?.top_features?.map((f: any) => ({
          feature: f.feature,
          contribution: f.contribution,
        })) || [];
     setFeatureData(topFeatureData);
      // console.log(topFeatureData);
      console.log(featureData);
      
      const snapshotObj = data.features || {};

      setCompany(data.symbol || "Unknown");
      setPredictedRating(data.history?.slice(-1)[0]?.predictedRating ?? null);
      setConfidence(data.history?.slice(-1)[0]?.confidence ?? null);
      setTrendData(trend);
      
      setSnapshot(snapshotObj);
      // 
      // setTopFeatureData(topFeatures);

      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Error talking to backend");
    }
  };

  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      {/* Search Bar */}
      <div className="col-span-12">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search company name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" variant="default">
            Search
          </Button>
        </form>
        {message && <p className="text-red-500 mt-2">{message}</p>}
      </div>

      {/* Company Overview */}
      <Card className="col-span-3 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-5 h-5" /> {company}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-green-600">
            {predictedRating ?? "--"}
          </p>
          <p className="text-sm text-muted-foreground">Predicted Rating</p>
          <p className="text-xl font-semibold mt-2">{ratingLabel}</p>
          <p className="text-sm text-muted-foreground">
            Confidence: {confidence ? (confidence * 100).toFixed(1) + "%" : "--"}
          </p>
        </CardContent>
      </Card>

      {/* Score Trend */}
      <Card className="col-span-8 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#16a34a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

 <Card className="col-span-6 shadow-xl rounded-2xl ">
  <CardHeader>
    <CardTitle>Feature Contributions</CardTitle>
  </CardHeader>
  <CardContent className="h-64 text-lg">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={featureData}
        layout="vertical"
        margin={{ left: 120, right: 20, top: 20, bottom: 20 }}  >
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="feature"
          tick={{ fontSize: 10 }} 
          width={110} 
          interval={0} 
          className="font-medium text-base"
        />
        <Tooltip 
          formatter={(value: number) => value.toFixed(4)}
          labelFormatter={(label) => `Feature: ${label}`}
        />
        <Bar dataKey="contribution" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

      <Card className="col-span-12 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" /> Financial Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          {snapshot ? (
            <div className="grid grid-cols-3 gap-4 text-sm">
              {Object.entries(snapshot).map(([key, value]) => (
                <div key={key} className="p-2 border rounded-lg">
                  <p className="font-medium">{key}</p>
                  <p className="text-muted-foreground">
                    {typeof value === "number"
                      ? value.toFixed(3)
                      : String(value)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No snapshot available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

