import React, { useState, useEffect } from 'react';
import { useModule } from '../../hooks/useModule';
import { useI18n } from '../../hooks/useI18n';
import { canPerform } from '../../utils/permissions';
import { DataTable, Column } from '../../components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/card';
import { Badge } from '../../components/UI/badge';
import { Button } from '../../components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/UI/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Award, 
  Target, 
  BarChart3,
  FileText,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import { supplierPerformanceService, SupplierScorecard, SupplierPerformanceMetric, SupplierPerformanceTrend, SupplierBenchmark } from '../../services/supplierPerformanceService';
import { useToast } from '../../hooks/useToast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SupplierScorecardsManager() {
  const { module } = useModule();
  const { t } = useI18n();
  const { push } = useToast();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [scorecards, setScorecards] = useState<SupplierScorecard[]>([]);
  const [currentScorecard, setCurrentScorecard] = useState<SupplierScorecard | null>(null);
  const [performanceTrends, setPerformanceTrends] = useState<SupplierPerformanceTrend[]>([]);
  const [benchmarks, setBenchmarks] = useState<SupplierBenchmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierPerformance(selectedSupplier.id);
    }
  }, [selectedSupplier]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getSuppliers(1);
      setSuppliers(data);
      if (data.length > 0) {
        setSelectedSupplier(data[0]);
      }
    } catch (error) {
      push({ message: 'Failed to load suppliers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierPerformance = async (supplierId: number) => {
    try {
      setLoading(true);
      const [scorecardsData, trendsData, benchmarksData] = await Promise.all([
        supplierPerformanceService.getSupplierScorecards(supplierId),
        supplierPerformanceService.getPerformanceTrends(supplierId),
        supplierPerformanceService.getSupplierBenchmarks(supplierId)
      ]);
      
      setScorecards(scorecardsData);
      setPerformanceTrends(trendsData);
      setBenchmarks(benchmarksData);
      
      if (scorecardsData.length > 0) {
        setCurrentScorecard(scorecardsData[0]);
      }
    } catch (error) {
      push({ message: 'Failed to load performance data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScorecard = async () => {
    if (!selectedSupplier) return;
    
    try {
      setGenerating(true);
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      
      const report = await supplierPerformanceService.generatePerformanceReport(
        selectedSupplier.id,
        periodStart,
        periodEnd
      );
      
      setScorecards(prev => [report.scorecard, ...prev.filter(s => s.id !== report.scorecard.id)]);
      setCurrentScorecard(report.scorecard);
      setPerformanceTrends(report.trends);
      setBenchmarks(report.benchmarks);
      
      push({ message: 'Performance scorecard generated successfully', type: 'success' });
    } catch (error) {
      push({ message: 'Failed to generate scorecard', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleRefreshData = async () => {
    if (selectedSupplier) {
      await loadSupplierPerformance(selectedSupplier.id);
      push({ message: 'Performance data refreshed', type: 'success' });
    }
  };

  const getPerformanceBadge = (category: string) => {
    const variants = {
      excellent: 'success',
      good: 'default',
      satisfactory: 'warning',
      needs_improvement: 'destructive',
      poor: 'destructive'
    } as Record<string, any>;
    return <Badge variant={variants[category] || 'secondary'}>{category.replace('_', ' ')}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricColor = (score: number, target: number) => {
    if (score >= target) return '#10b981'; // green
    if (score >= target - 10) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const scorecardColumns: Column<SupplierScorecard>[] = [
    { key: 'period_start', header: 'Period Start' },
    { key: 'period_end', header: 'Period End' },
    { key: 'overall_score', header: 'Overall Score', render: (_v, row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold">{row.overall_score}</span>
          <Badge variant="outline">/100</Badge>
        </div>
      ) },
    { key: 'performance_category', header: 'Category', render: (_v, row) => getPerformanceBadge(row.performance_category) },
    { key: 'id', header: 'Actions', render: (_v, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCurrentScorecard(row)}
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      ) }
  ];

  const trendChartData = performanceTrends.map(trend => ({
    period: trend.period,
    score: trend.overall_score,
    trend: trend.trend_direction
  }));

  const benchmarkChartData = benchmarks
    .filter(b => b.benchmark_type === 'industry')
    .map(benchmark => ({
      metric: benchmark.metric_type.replace('_', ' '),
      supplier: benchmark.supplier_score,
      industry: benchmark.benchmark_score,
      gap: benchmark.gap
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('supplier_scorecards_manager')}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canPerform(module, 'generate_scorecard') && (
            <Button
              onClick={handleGenerateScorecard}
              disabled={!selectedSupplier || generating}
            >
              <Award className="h-4 w-4 mr-2" />
              Generate Scorecard
            </Button>
          )}
        </div>
      </div>

      {/* Supplier Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedSupplier?.id || ''}
            onChange={(e) => {
              const supplier = suppliers.find(s => s.id === parseInt(e.target.value));
              setSelectedSupplier(supplier || null);
            }}
          >
            <option value="">Select a supplier...</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.company_name} ({supplier.supplier_code})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedSupplier && currentScorecard && (
        <>
          {/* Current Scorecard Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Performance Scorecard</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Overall Score</p>
                    <p className="text-2xl font-bold">{currentScorecard.overall_score}/100</p>
                  </div>
                  {getPerformanceBadge(currentScorecard.performance_category)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {currentScorecard.metrics.map(metric => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium capitalize">
                        {metric.metric_type.replace('_', ' ')}
                      </h4>
                      <Target className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{metric.score}</span>
                        <Badge variant="outline">/100</Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>Actual: {metric.actual_value}{metric.unit}</div>
                        <div>Target: {metric.target_value}{metric.unit}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${metric.score}%`,
                            backgroundColor: getMetricColor(metric.score, metric.target_score)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Performance Trends</span>
                <div className="flex items-center gap-2">
                  {performanceTrends.length > 0 && (
                    <div className="flex items-center gap-2">
                      {getTrendIcon(performanceTrends[performanceTrends.length - 1].trend_direction)}
                      <span className="text-sm">
                        {performanceTrends[performanceTrends.length - 1].change_percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Benchmark Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmark Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="supplier" fill="#3b82f6" name="Supplier" />
                    <Bar dataKey="industry" fill="#6b7280" name="Industry" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Performance Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentScorecard.recommendations.length > 0 ? (
                  currentScorecard.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2" />
                      <p className="text-sm text-amber-800">{recommendation}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>Excellent performance! No recommendations at this time.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Scorecards History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Scorecard History</span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={scorecardColumns} data={scorecards} />
        </CardContent>
      </Card>
    </div>
  );
}
