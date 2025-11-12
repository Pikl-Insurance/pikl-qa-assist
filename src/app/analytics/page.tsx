'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Phone, Users, Award, FileText, DollarSign, RefreshCw } from 'lucide-react';
import type { Call } from '@/types';

interface AnalyticsStats {
  totalCalls: number;
  averageScore: number;
  topPerformingAgent: { name: string; score: number } | null;
  scoreImprovement: number;
  callsByDay: { date: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
  totalQuotes: number;
  totalSales: number;
  totalRenewals: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const response = await fetch('/api/calls');
      const data = await response.json();

      // Handle API response format
      const calls: Call[] = data.success ? data.data.calls : [];

      const completeCalls = calls.filter((c) => c.status === 'complete' && c.overallScore);

      // Fetch analysis data for outcome metrics
      const analysesPromises = completeCalls.map(async (call) => {
        try {
          const analysisResponse = await fetch(`/api/analysis/${call.id}`);
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            return analysisData.data;
          }
        } catch (err) {
          console.error(`Failed to fetch analysis for ${call.id}:`, err);
        }
        return null;
      });

      const analyses = await Promise.all(analysesPromises);
      const validAnalyses = analyses.filter((a) => a !== null);

      // Calculate stats
      const totalCalls = completeCalls.length;
      const averageScore = totalCalls > 0
        ? completeCalls.reduce((sum, c) => sum + (c.overallScore || 0), 0) / totalCalls
        : 0;

      // Top performing agent
      const agentScores = new Map<string, { totalScore: number; count: number }>();
      completeCalls.forEach((call) => {
        if (call.agentName && call.overallScore) {
          const current = agentScores.get(call.agentName) || { totalScore: 0, count: 0 };
          agentScores.set(call.agentName, {
            totalScore: current.totalScore + call.overallScore,
            count: current.count + 1,
          });
        }
      });

      let topPerformingAgent = null;
      let highestScore = 0;
      agentScores.forEach((value, name) => {
        const avgScore = value.totalScore / value.count;
        if (avgScore > highestScore) {
          highestScore = avgScore;
          topPerformingAgent = { name, score: avgScore };
        }
      });

      // Score distribution
      const scoreRanges = [
        { range: '9-10', count: 0 },
        { range: '8-9', count: 0 },
        { range: '7-8', count: 0 },
        { range: '6-7', count: 0 },
        { range: '0-6', count: 0 },
      ];
      completeCalls.forEach((call) => {
        const score = call.overallScore || 0;
        if (score >= 9) scoreRanges[0].count++;
        else if (score >= 8) scoreRanges[1].count++;
        else if (score >= 7) scoreRanges[2].count++;
        else if (score >= 6) scoreRanges[3].count++;
        else scoreRanges[4].count++;
      });

      // Calls by day (last 7 days)
      const today = new Date();
      const callsByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = completeCalls.filter((c) => {
          const callDate = new Date(c.timestamp).toISOString().split('T')[0];
          return callDate === dateStr;
        }).length;
        callsByDay.push({ date: dateStr, count });
      }

      // Mock score improvement (calculate from first half vs second half)
      const halfPoint = Math.floor(completeCalls.length / 2);
      const firstHalfAvg = halfPoint > 0
        ? completeCalls.slice(0, halfPoint).reduce((sum, c) => sum + (c.overallScore || 0), 0) / halfPoint
        : 0;
      const secondHalfAvg = halfPoint > 0
        ? completeCalls.slice(halfPoint).reduce((sum, c) => sum + (c.overallScore || 0), 0) / (completeCalls.length - halfPoint)
        : 0;
      const scoreImprovement = secondHalfAvg - firstHalfAvg;

      // Calculate outcome metrics
      const totalQuotes = validAnalyses.reduce((sum, analysis) => {
        return sum + (analysis.outcomeMetrics?.quotesCompleted || 0);
      }, 0);

      const totalSales = validAnalyses.reduce((sum, analysis) => {
        return sum + (analysis.outcomeMetrics?.salesCompleted || 0);
      }, 0);

      const totalRenewals = validAnalyses.reduce((sum, analysis) => {
        return sum + (analysis.outcomeMetrics?.renewalsCompleted || 0);
      }, 0);

      setStats({
        totalCalls,
        averageScore,
        topPerformingAgent,
        scoreImprovement,
        callsByDay,
        scoreDistribution: scoreRanges,
        totalQuotes,
        totalSales,
        totalRenewals,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">No data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Performance insights and trends</p>
      </div>

      {/* Outcome Metrics */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotes Completed</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalQuotes}</div>
            <p className="text-xs text-muted-foreground mt-1">Insurance quotes provided</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Completed</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">Policies sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewals Completed</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalRenewals}</div>
            <p className="text-xs text-muted-foreground mt-1">Policy renewals processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls Analyzed</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <p className="text-xs text-muted-foreground">Completed and scored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average QA Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Across all agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Trend</CardTitle>
            {stats.scoreImprovement >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.scoreImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.scoreImprovement > 0 ? '+' : ''}{stats.scoreImprovement.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">First half vs second half</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.topPerformingAgent ? (
              <>
                <div className="text-2xl font-bold">{stats.topPerformingAgent.score.toFixed(1)}/10</div>
                <p className="text-xs text-muted-foreground">{stats.topPerformingAgent.name}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
          <CardDescription>Distribution of QA scores across all calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.scoreDistribution.map((item) => (
              <div key={item.range} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{item.range}</div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(item.count / stats.totalCalls) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm text-muted-foreground text-right">
                  {item.count} calls
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Calls Per Day (Last 7 Days)</CardTitle>
          <CardDescription>Daily call volume trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.callsByDay.map((item) => (
              <div key={item.date} className="flex items-center gap-4">
                <div className="w-28 text-sm font-medium">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${Math.max((item.count / Math.max(...stats.callsByDay.map((d) => d.count), 1)) * 100, 5)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm text-muted-foreground text-right">
                  {item.count} calls
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
