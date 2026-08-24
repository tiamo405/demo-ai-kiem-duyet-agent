import { calculatePearson, calculateRatio, detectSpike, detectStuck, mean, variance } from './analysisTools'
import type { AgentConfig, AnalysisExecution, AnomalyPoint, Evidence, ExecutionTrace, MeasurementRecord, Rule } from '../types'
import type { ScenarioId } from './mockDataGenerator'
import { generateMockData } from './mockDataGenerator'

const now = () => new Date().toISOString()
const delay = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
const trace = (agentCode: string, inputSummary: unknown, outputSummary: unknown, toolsUsed: ExecutionTrace['toolsUsed'] = []): ExecutionTrace => ({ id: `${agentCode}-${Date.now()}`, agentCode, status: 'SUCCESS', startedAt: now(), completedAt: now(), duration: 320 + (agentCode.length * 17) % 380, inputSummary, outputSummary, toolsUsed })

function resolveRules(rules: Rule[], parameter: string, environment: string) {
  return rules.filter((rule) => rule.enabled && (rule.environmentType === 'ALL' || rule.environmentType === environment) && (rule.targetParameters.length === 0 || rule.targetParameters.includes(parameter) || rule.driverParameters.includes(parameter)))
}

function analyze(rule: Rule, data: MeasurementRecord[], parameter: string, scenario: ScenarioId): Evidence {
  const values = data.map((record) => record.values[parameter]).filter((value): value is number => typeof value === 'number')
  const spike = detectSpike(values)
  const stuck = detectStuck(values)
  let violated = false
  let title = rule.name
  let description = `Không phát hiện vi phạm cho ${rule.code}.`
  let confidence = 0.82
  let statistics: Record<string, unknown> = { mean: Number(mean(values).toFixed(2)), variance: Number(variance(values).toFixed(4)) }
  let timestampRange = { start: data[0]?.timestamp ?? now(), end: data[data.length - 1]?.timestamp ?? now() }

  if (rule.code === 'TS02_SHORT_SPIKE') {
    violated = scenario === 'o3-night-spike' || scenario === 'co-spike'
    const peakIndex = values.indexOf(spike.peak)
    timestampRange = { start: data[Math.max(0, peakIndex - 1)]?.timestamp ?? timestampRange.start, end: data[Math.min(data.length - 1, peakIndex + 1)]?.timestamp ?? timestampRange.end }
    description = violated ? `${parameter} tăng đột biến tại ${timestampRange.start} và trở lại nền trong khoảng ngắn.` : description
    confidence = 0.94
    statistics = { baseline: Number(spike.baseline.toFixed(2)), peak: spike.peak, peakRatio: Number(spike.ratio.toFixed(2)), pointCount: 3 }
  }
  if (rule.code === 'TS04_STUCK') {
    violated = scenario === 'co-stuck'
    description = violated ? `${parameter} có variance ${stuck.variance.toFixed(4)} và range ${stuck.range.toFixed(3)} trong toàn bộ khoảng.` : `Variance ${stuck.variance.toFixed(3)} nằm trong vùng theo dõi.`
    confidence = 0.96
    statistics = { ...stuck, pointCount: values.length }
  }
  if (rule.code === 'AIR01_RADIATION_O3' && scenario === 'o3-night-spike') {
    violated = true
    title = 'Radiation - O3 không nhất quán'
    const peakIndex = values.indexOf(spike.peak)
    timestampRange = { start: data[peakIndex]?.timestamp ?? timestampRange.start, end: data[peakIndex]?.timestamp ?? timestampRange.end }
    description = 'O3 đạt đỉnh trong khi Radiation = 0, không phù hợp quan hệ kỳ vọng.'
    confidence = 0.88
    statistics = { radiation: 0, peakO3: Math.max(...values), pointCount: 1 }
  }
  if (rule.code === 'AIR03_PM25_PM10_RATIO' && scenario === 'pm-ratio') {
    violated = true
    title = 'PM2.5 / PM10 ngoài khoảng'
    const ratio = calculateRatio(data[0]?.values.PM25 ?? 0, data[0]?.values.PM10 ?? 0)
    description = `Tỷ lệ quan sát ${ratio.toFixed(2)} nằm ngoài khoảng 0.57 - 0.72.`
    confidence = 0.91
    statistics = { ratio, expected: [0.57, 0.72], pointCount: data.length }
  }
  if (rule.code === 'WATER02_TEMP_DO' && scenario === 'temp-do') {
    violated = true
    title = 'WaterTemp - DO không nhất quán'
    description = 'DO đi cùng chiều với WaterTemp trong các điểm quan sát, ngược quan hệ kỳ vọng.'
    confidence = 0.89
    statistics = { correlation: -0.72, direction: 'inconsistent', pointCount: data.length }
  }
  if (rule.code === 'AIR01_RADIATION_O3' && scenario !== 'o3-night-spike') statistics = { pearson: Number(calculatePearson(data.map((record) => record.values.Radiation), values).toFixed(2)), pointCount: data.length }
  return { id: `${rule.code}-${Date.now()}`, ruleId: rule.id, analyzer: rule.analyzer, status: violated ? 'VIOLATED' : 'PASS', confidence, title, description, statistics, timestampRange }
}

function collectAnomalyPoints(data: MeasurementRecord[], parameter: string, evidence: Evidence[], label: string): AnomalyPoint[] {
  const violated = evidence.filter((item) => item.status === 'VIOLATED')
  const points: AnomalyPoint[] = []
  for (const item of violated) {
    const start = item.timestampRange?.start
    const end = item.timestampRange?.end
    for (const record of data) {
      if (start && end && record.timestamp >= start && record.timestamp <= end && typeof record.values[parameter] === 'number') points.push({ timestamp: record.timestamp, parameter, value: record.values[parameter], label, ruleIds: [item.ruleId], reason: item.description })
    }
  }
  return points.filter((point, index, all) => all.findIndex((candidate) => candidate.timestamp === point.timestamp && candidate.parameter === point.parameter) === index)
}

export async function runSimulation(input: { stationId: string; parameter: string; scenario: ScenarioId; environment: string; period?: { start: string; end: string } }, rules: Rule[], agents: AgentConfig[]): Promise<AnalysisExecution> {
  const startedAt = now()
  const period = input.period ?? { start: '2026-05-10T00:00:00', end: '2026-05-11T00:00:00' }
  const request = { ...input, period }
  const data = generateMockData(input.stationId, input.scenario, period.start, period.end)
  const applicableRules = resolveRules(rules, input.parameter, input.environment)
  const traces: ExecutionTrace[] = []
  const enabled = (code: string) => agents.find((agent) => agent.code === code)?.enabled ?? true
  await delay(120)
  traces.push(trace('ORCHESTRATOR', request, { taskType: 'Time-series anomaly review', target: input.parameter, period }))
  traces.push(trace('RULE_RESOLVER', { parameter: input.parameter, environment: input.environment }, { selected: applicableRules.map((rule) => ({ code: rule.code, version: rule.version })) }))
  traces.push(trace('DATA_PLANNER', { rules: applicableRules.map((rule) => rule.code) }, { requestedFields: ['timestamp', input.parameter, 'Radiation', 'Temp'], interval: '5 minutes', history: true }))
  traces.push(trace('DATA_QUALITY', { records: data.length, period }, { status: 'PASS', missing: 0, duplicates: 0, interval: '5 minutes' }))
  const evidence: Evidence[] = []
  for (const analyzer of ['TIME_SERIES_ANALYZER', 'RELATIONSHIP_ANALYZER', 'CONTEXT_ANALYZER'] as const) {
    if (!enabled(analyzer)) { traces.push({ id: `${analyzer}-skipped`, agentCode: analyzer, status: 'SKIPPED', startedAt: now(), inputSummary: 'Agent disabled', outputSummary: 'SKIPPED' }); continue }
    const generated = applicableRules.filter((rule) => rule.analyzer === analyzer).map((rule) => analyze(rule, data, input.parameter, input.scenario))
    evidence.push(...generated)
    traces.push(trace(analyzer, { rules: generated.map((item) => item.ruleId), records: data.length }, { evidence: generated.map((item) => ({ ruleId: item.ruleId, status: item.status, range: item.timestampRange })) }, generated.length ? [{ name: analyzer === 'TIME_SERIES_ANALYZER' ? 'detectSpike() / detectStuck()' : 'calculatePearson() / calculateRatio()', result: generated[0].statistics }] : []))
    await delay(80)
  }
  const violated = evidence.filter((item) => item.status === 'VIOLATED')
  const label = violated.some((item) => item.ruleId === 'TS04_STUCK') ? 'STUCK' : violated.some((item) => item.ruleId === 'TS02_SHORT_SPIKE') ? 'SHORT_HIGH' : violated.length ? 'RELATIONSHIP_VIOLATION' : 'NORMAL'
  const confidence = violated.length ? Math.max(...violated.map((item) => item.confidence)) : 0.86
  const anomalyPoints = collectAnomalyPoints(data, input.parameter, evidence, label)
  const explanation = violated.length ? `Phát hiện ${anomalyPoints.length} điểm bất thường trong khoảng ${period.start} đến ${period.end}, được hỗ trợ bởi ${violated.length} Evidence.` : `Không phát hiện điểm bất thường trong khoảng ${period.start} đến ${period.end}.`
  const decision = { label, confidence, explanation, anomalyPoints }
  const verification = { verification: 'PASS' as const, issues: [] as string[] }
  const report = { stationId: input.stationId, parameter: input.parameter, period, label, confidence, anomalyPoints, summary: explanation, verification: verification.verification }
  traces.push(trace('DECISION', { evidence: evidence.length, violated: violated.length }, decision))
  traces.push(trace('VERIFIER', decision, verification))
  traces.push(trace('REPORT', { label, anomalyPoints: anomalyPoints.length, evidence: evidence.length }, report))
  return { id: `exec-${Date.now()}`, request, plan: { targetParameters: [input.parameter], interval: '5 minutes', period }, rules: applicableRules, dataManifest: { records: data.length, interval: '5 minutes', period }, qualityResult: { status: 'PASS', missing: 0 }, evidence, decision, verification, report, traces, data, startedAt, completedAt: now() }
}
