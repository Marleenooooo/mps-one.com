import { supplierService } from './supplierService';

export interface SupplierPerformanceMetric {
  id: number;
  supplier_id: number;
  metric_type: 'delivery_timeliness' | 'quality_rating' | 'cost_competitiveness' | 'communication' | 'compliance';
  period_start: string;
  period_end: string;
  score: number; // 0-100
  weight: number; // 0-1
  target_score: number;
  actual_value: number;
  target_value: number;
  unit: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierScorecard {
  id: number;
  supplier_id: number;
  period_start: string;
  period_end: string;
  overall_score: number; // 0-100
  performance_category: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'poor';
  metrics: SupplierPerformanceMetric[];
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

export interface SupplierPerformanceTrend {
  supplier_id: number;
  period: string;
  overall_score: number;
  category: string;
  trend_direction: 'improving' | 'stable' | 'declining';
  change_percentage: number;
}

export interface SupplierBenchmark {
  supplier_id: number;
  benchmark_type: 'industry' | 'peer_group' | 'historical';
  metric_type: string;
  supplier_score: number;
  benchmark_score: number;
  gap: number; // supplier - benchmark
  percentile: number;
  created_at: string;
}

// Mock data storage
const SCORECARDS_KEY = 'mock_supplier_scorecards';
const METRICS_KEY = 'mock_supplier_metrics';
const TRENDS_KEY = 'mock_supplier_trends';
const BENCHMARKS_KEY = 'mock_supplier_benchmarks';

function getMockScorecards(): any[] {
  try {
    const raw = localStorage.getItem(SCORECARDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  try { localStorage.setItem(SCORECARDS_KEY, JSON.stringify([])); } catch {}
  return [];
}

function setMockScorecards(rows: any[]) {
  try { localStorage.setItem(SCORECARDS_KEY, JSON.stringify(rows)); } catch {}
}

function getMockMetrics(): any[] {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  try { localStorage.setItem(METRICS_KEY, JSON.stringify([])); } catch {}
  return [];
}

function setMockMetrics(rows: any[]) {
  try { localStorage.setItem(METRICS_KEY, JSON.stringify(rows)); } catch {}
}

function getMockTrends(): any[] {
  try {
    const raw = localStorage.getItem(TRENDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  try { localStorage.setItem(TRENDS_KEY, JSON.stringify([])); } catch {}
  return [];
}

function setMockTrends(rows: any[]) {
  try { localStorage.setItem(TRENDS_KEY, JSON.stringify(rows)); } catch {}
}

function getMockBenchmarks(): any[] {
  try {
    const raw = localStorage.getItem(BENCHMARKS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  try { localStorage.setItem(BENCHMARKS_KEY, JSON.stringify([])); } catch {}
  return [];
}

function setMockBenchmarks(rows: any[]) {
  try { localStorage.setItem(BENCHMARKS_KEY, JSON.stringify(rows)); } catch {}
}

class SupplierPerformanceService {
  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private calculateOverallScore(metrics: SupplierPerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    
    const weightedScore = metrics.reduce((sum, metric) => {
      return sum + (metric.score * metric.weight);
    }, 0);
    
    const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  private getPerformanceCategory(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'satisfactory';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }

  private generateRecommendations(metrics: SupplierPerformanceMetric[]): string[] {
    const recommendations: string[] = [];
    
    metrics.forEach(metric => {
      if (metric.score < metric.target_score) {
        switch (metric.metric_type) {
          case 'delivery_timeliness':
            recommendations.push('Improve delivery scheduling and communication');
            break;
          case 'quality_rating':
            recommendations.push('Enhance quality control processes');
            break;
          case 'cost_competitiveness':
            recommendations.push('Review pricing strategy and cost structure');
            break;
          case 'communication':
            recommendations.push('Improve response times and communication clarity');
            break;
          case 'compliance':
            recommendations.push('Strengthen compliance procedures and documentation');
            break;
        }
      }
    });
    
    return recommendations;
  }

  async getSupplierScorecards(supplierId: number): Promise<SupplierScorecard[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const scorecards = getMockScorecards();
    return scorecards.filter(s => s.supplier_id === supplierId);
  }

  async getSupplierScorecard(id: number): Promise<SupplierScorecard | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const scorecards = getMockScorecards();
    return scorecards.find(s => s.id === id) || null;
  }

  async createScorecard(supplierId: number, periodStart: string, periodEnd: string): Promise<SupplierScorecard> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate mock metrics for the period
    const metrics: SupplierPerformanceMetric[] = [
      {
        id: this.generateId(),
        supplier_id: supplierId,
        metric_type: 'delivery_timeliness',
        period_start: periodStart,
        period_end: periodEnd,
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        weight: 0.25,
        target_score: 90,
        actual_value: Math.floor(Math.random() * 10) + 85, // 85-95%
        target_value: 95,
        unit: '%',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        supplier_id: supplierId,
        metric_type: 'quality_rating',
        period_start: periodStart,
        period_end: periodEnd,
        score: Math.floor(Math.random() * 25) + 75, // 75-100
        weight: 0.30,
        target_score: 85,
        actual_value: Math.floor(Math.random() * 15) + 85, // 85-100%
        target_value: 90,
        unit: '%',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        supplier_id: supplierId,
        metric_type: 'cost_competitiveness',
        period_start: periodStart,
        period_end: periodEnd,
        score: Math.floor(Math.random() * 35) + 65, // 65-100
        weight: 0.20,
        target_score: 80,
        actual_value: Math.floor(Math.random() * 20) + 80, // 80-100%
        target_value: 85,
        unit: '%',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        supplier_id: supplierId,
        metric_type: 'communication',
        period_start: periodStart,
        period_end: periodEnd,
        score: Math.floor(Math.random() * 20) + 80, // 80-100
        weight: 0.15,
        target_score: 90,
        actual_value: Math.floor(Math.random() * 15) + 85, // 85-100%
        target_value: 90,
        unit: '%',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        supplier_id: supplierId,
        metric_type: 'compliance',
        period_start: periodStart,
        period_end: periodEnd,
        score: Math.floor(Math.random() * 25) + 75, // 75-100
        weight: 0.10,
        target_score: 95,
        actual_value: Math.floor(Math.random() * 10) + 90, // 90-100%
        target_value: 95,
        unit: '%',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const overallScore = this.calculateOverallScore(metrics);
    const category = this.getPerformanceCategory(overallScore);
    const recommendations = this.generateRecommendations(metrics);
    
    const scorecard: SupplierScorecard = {
      id: this.generateId(),
      supplier_id: supplierId,
      period_start: periodStart,
      period_end: periodEnd,
      overall_score: overallScore,
      performance_category: category as any,
      metrics: metrics,
      recommendations: recommendations,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store metrics and scorecard
    const allMetrics = getMockMetrics();
    allMetrics.push(...metrics);
    setMockMetrics(allMetrics);
    
    const allScorecards = getMockScorecards();
    allScorecards.push(scorecard);
    setMockScorecards(allScorecards);
    
    return scorecard;
  }

  async updateScorecardMetric(metricId: number, updates: Partial<SupplierPerformanceMetric>): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const metrics = getMockMetrics();
    const metricIndex = metrics.findIndex(m => m.id === metricId);
    
    if (metricIndex === -1) return false;
    
    metrics[metricIndex] = {
      ...metrics[metricIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    setMockMetrics(metrics);
    return true;
  }

  async getPerformanceTrends(supplierId: number, periods: number = 6): Promise<SupplierPerformanceTrend[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const trends: SupplierPerformanceTrend[] = [];
    
    const currentDate = new Date();
    for (let i = periods - 1; i >= 0; i--) {
      const periodDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const period = periodDate.toISOString().slice(0, 7); // YYYY-MM
      
      // Generate mock trend data
      const baseScore = 75;
      const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10
      const score = Math.max(60, Math.min(100, baseScore + variation));
      
      const prevScore = i < periods - 1 ? trends[trends.length - 1]?.overall_score || baseScore : baseScore;
      const change = score - prevScore;
      const changePercentage = prevScore > 0 ? (change / prevScore) * 100 : 0;
      
      let trendDirection: 'improving' | 'stable' | 'declining';
      if (Math.abs(changePercentage) < 2) {
        trendDirection = 'stable';
      } else if (changePercentage > 2) {
        trendDirection = 'improving';
      } else {
        trendDirection = 'declining';
      }
      
      trends.push({
        supplier_id: supplierId,
        period,
        overall_score: score,
        category: this.getPerformanceCategory(score),
        trend_direction: trendDirection,
        change_percentage: changePercentage
      });
    }
    
    setMockTrends(trends);
    return trends;
  }

  async getSupplierBenchmarks(supplierId: number): Promise<SupplierBenchmark[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const benchmarks: SupplierBenchmark[] = [];
    
    const benchmarkTypes = ['industry', 'peer_group', 'historical'];
    const metricTypes = ['delivery_timeliness', 'quality_rating', 'cost_competitiveness', 'communication', 'compliance'];
    
    benchmarkTypes.forEach(benchmarkType => {
      metricTypes.forEach(metricType => {
        const supplierScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const benchmarkScore = Math.floor(Math.random() * 25) + 75; // 75-100
        const gap = supplierScore - benchmarkScore;
        const percentile = Math.floor(Math.random() * 40) + 30; // 30-70th percentile
        
        benchmarks.push({
          supplier_id: supplierId,
          benchmark_type: benchmarkType as any,
          metric_type: metricType,
          supplier_score: supplierScore,
          benchmark_score: benchmarkScore,
          gap,
          percentile,
          created_at: new Date().toISOString()
        });
      });
    });
    
    setMockBenchmarks(benchmarks);
    return benchmarks;
  }

  async generatePerformanceReport(supplierId: number, periodStart: string, periodEnd: string): Promise<{
    scorecard: SupplierScorecard;
    trends: SupplierPerformanceTrend[];
    benchmarks: SupplierBenchmark[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get or create scorecard
    let scorecard = await this.getSupplierScorecards(supplierId).then(cards => 
      cards.find(c => c.period_start === periodStart && c.period_end === periodEnd)
    );
    
    if (!scorecard) {
      scorecard = await this.createScorecard(supplierId, periodStart, periodEnd);
    }
    
    // Get trends and benchmarks
    const trends = await this.getPerformanceTrends(supplierId);
    const benchmarks = await this.getSupplierBenchmarks(supplierId);
    
    return {
      scorecard,
      trends,
      benchmarks
    };
  }
}

export const supplierPerformanceService = new SupplierPerformanceService();
