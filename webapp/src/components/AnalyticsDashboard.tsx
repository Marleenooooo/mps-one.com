import React, { useEffect, useState } from 'react';
import { BridgeClient } from '../../../thebridge/sdk/client';
import { Card, CardContent, CardHeader, CardTitle } from './UI/card';
import { Badge } from './UI/badge';
import { Button } from './UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './UI/tabs';
import { TrendChart } from './TrendChart';
import { MetricCard } from './MetricCard';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Clock, AlertTriangle, TrendingUp, Target } from 'lucide-react';

interface FunnelData {
  steps: Array<{ name: string; count: number; conversion: number }>;
  period: string;
  totalValue: number;
  avgCycleTime: string;
}

interface SupplierPerformance {
  vendorId: string;
  overallScore: number;
  metrics: {
    onTimeDelivery: number;
    qualityRating: number;
    costCompetitiveness: number;
    communication: number;
  };
  trends: Array<{ month: string; score: number }>;
  comparisons: Array<{ vendorId: string; score: number; advantage: number }>;
}

interface CohortData {
  cohort: string;
  users: number;
  retention: number[];
  avgProcurementValue: number;
  behavior: string;
}

interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  entity: { type: string; id: string };
  detectedAt: string;
  status: string;
}

interface Forecast {
  budget: {
    current: number;
    projected: number;
    variance: number;
    confidence: number;
  };
  procurement: {
    volume: { current: number; projected: number; trend: string };
    cycleTime: { current: number; projected: number; improvement: number };
  };
  recommendations: string[];
}

export function AnalyticsDashboard() {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance | null>(null);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState('SUP-1');

  const bridgeClient = new BridgeClient('http://localhost:3001');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedVendor]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || 'dev-token';
      
      const [funnel, supplier, cohortData, anomalyData, forecastData] = await Promise.all([
        bridgeClient.getFunnelData(token),
        bridgeClient.getSupplierPerformance(selectedVendor, token),
        bridgeClient.getCohortData(token),
        bridgeClient.getAnomalies(token),
        bridgeClient.getForecast(token)
      ]);

      setFunnelData(funnel);
      setSupplierPerformance(supplier);
      setCohorts(cohortData);
      setAnomalies(anomalyData);
      setForecast(forecastData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Procurement Value"
          value={`$${(funnelData?.totalValue || 0).toLocaleString()}`}
          change="+12.5%"
          icon={DollarSign}
          trend="up"
        />
        <MetricCard
          title="Avg Cycle Time"
          value={funnelData?.avgCycleTime || '0 days'}
          change="-8.3%"
          icon={Clock}
          trend="down"
        />
        <MetricCard
          title="Active Users"
          value={cohorts.reduce((sum, c) => sum + c.users, 0).toString()}
          change="+15.2%"
          icon={Users}
          trend="up"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${((funnelData?.steps[4]?.conversion || 0) * 100).toFixed(1)}%`}
          change="+3.1%"
          icon={Target}
          trend="up"
        />
      </div>

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Performance</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Procurement Funnel</CardTitle>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Conversion rates through the procurement workflow
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData?.steps.map((step, index) => (
                  <div key={step.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-primary">{step.count}</div>
                      <div>
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Conversion: {(step.conversion * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    {index < funnelData.steps.length - 1 && (
                      <div className="text-muted-foreground">
                        <ArrowDownRight className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance</CardTitle>
              <CardDescription>
                Detailed metrics for supplier {selectedVendor}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <Badge variant="outline">{supplierPerformance?.overallScore}/100</Badge>
                  </div>
                  {supplierPerformance?.metrics && Object.entries(supplierPerformance.metrics).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(value as number) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {((value as number) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance Trend</h4>
                  {supplierPerformance?.trends && (
                    <TrendChart 
                      data={supplierPerformance.trends.map(t => ({ date: t.month, value: t.score }))}
                      height={200}
                    />
                  )}
                </div>
              </div>
              
              {supplierPerformance?.comparisons && supplierPerformance.comparisons.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Vendor Comparisons</h4>
                  <div className="space-y-2">
                    {supplierPerformance.comparisons.map((comp) => (
                      <div key={comp.vendorId} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{comp.vendorId}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{comp.score}/100</Badge>
                          <Badge variant="secondary" className="text-green-600">
                            +{comp.advantage}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Cohort Analysis</CardTitle>
              <CardDescription>
                User behavior patterns and retention analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cohorts.map((cohort) => (
                  <div key={cohort.cohort} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{cohort.cohort}</h4>
                      <Badge variant="outline">{cohort.behavior}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Users</span>
                        <span className="font-medium">{cohort.users}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Value</span>
                        <span className="font-medium">${cohort.avgProcurementValue.toLocaleString()}</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Retention</div>
                        <div className="flex space-x-1">
                          {cohort.retention.map((rate, idx) => (
                            <div key={idx} className="flex-1 text-center">
                              <div className="text-xs">{rate}%</div>
                              <div className="w-full bg-secondary rounded h-1 mt-1">
                                <div 
                                  className="bg-primary h-1 rounded" 
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>
                Unusual patterns detected in procurement data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {anomalies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No anomalies detected
                  </div>
                ) : (
                  anomalies.map((anomaly) => (
                    <div key={`${anomaly.type}-${anomaly.entity.id}`} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        anomaly.severity === 'high' ? 'text-red-500' :
                        anomaly.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{anomaly.description}</div>
                          <Badge variant={getSeverityColor(anomaly.severity)}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {anomaly.entity.type} • {anomaly.entity.id}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Detected: {new Date(anomaly.detectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forecasting & Predictions</CardTitle>
              <CardDescription>
                Budget and procurement forecasting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Budget Forecast</h4>
                  {forecast?.budget && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current</span>
                        <span className="font-medium">${forecast.budget.current.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Projected</span>
                        <span className="font-medium">${forecast.budget.projected.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Variance</span>
                        <Badge variant={forecast.budget.variance > 0 ? 'destructive' : 'secondary'}>
                          {forecast.budget.variance > 0 ? '+' : ''}{forecast.budget.variance}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence</span>
                        <Badge variant="outline">{(forecast.budget.confidence * 100).toFixed(0)}%</Badge>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Procurement Trends</h4>
                  {forecast?.procurement && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume Trend</span>
                        <Badge variant="outline">{forecast.procurement.volume.trend}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Volume</span>
                        <span className="font-medium">{forecast.procurement.volume.current}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Projected Volume</span>
                        <span className="font-medium">{forecast.procurement.volume.projected}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cycle Time Improvement</span>
                        <Badge variant="secondary" className="text-green-600">
                          +{forecast.procurement.cycleTime.improvement}%
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {forecast?.recommendations && forecast.recommendations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {forecast.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}