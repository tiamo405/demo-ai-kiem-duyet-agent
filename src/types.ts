export type EnvironmentType = 'AIR' | 'SURFACE_WATER' | 'GROUND_WATER' | 'ALL'
export type AnalyzerType = 'TIME_SERIES_ANALYZER' | 'RELATIONSHIP_ANALYZER' | 'CONTEXT_ANALYZER'
export type RuleCategory = 'TIME_SERIES' | 'RELATIONSHIP' | 'CONTEXT' | 'CONDITIONAL' | 'CROSS_CONTEXT'
export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH'
export type AgentStatus = 'READY' | 'DISABLED' | 'RUNNING' | 'SUCCESS' | 'SKIPPED'
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'WARNING' | 'FAILED' | 'RETRY' | 'SKIPPED'
export type EvidenceStatus = 'PASS' | 'VIOLATED' | 'UNCERTAIN'

export interface Station { id: string; code: string; name: string; environmentType: Exclude<EnvironmentType, 'ALL'>; status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'; province: string; metadata: { stationType?: string; terrain?: string; waterType?: string; trafficLevel?: string; industrialZone?: boolean }; parameterIds: string[]; unit?: string; environmentTypes?: string[]; normalRange?: { min: number; max: number } }
export interface Parameter { id: string; code: string; name: string; unit: string; environmentTypes: Exclude<EnvironmentType, 'ALL'>[]; normalRange?: { min: number; max: number }; environmentType?: Exclude<EnvironmentType, 'ALL'>; status?: Station['status']; province?: string; parameterIds?: string[] }
export interface Rule { id: string; code: string; name: string; description: string; environmentType: EnvironmentType; category: RuleCategory; type: string; targetParameters: string[]; driverParameters: string[]; contextFields: string[]; requiredDataFields: string[]; analyzer: AnalyzerType; enabled: boolean; severity: RuleSeverity; version: string; updatedAt: string; config: Record<string, unknown> }
export interface AgentConfig { id: string; code: string; name: string; description: string; prompt: string; enabled: boolean; model: string; temperature: number; reasoning: 'Low' | 'Medium' | 'High'; promptVersion: string; updatedAt: string }
export interface MeasurementRecord { timestamp: string; stationId: string; values: Record<string, number>; context?: { rain?: number; trafficLevel?: number; tide?: string; upstreamDischarge?: boolean } }
export interface Evidence { id: string; ruleId: string; analyzer: AnalyzerType; status: EvidenceStatus; confidence: number; title: string; description: string; statistics?: Record<string, unknown>; timestampRange?: { start: string; end: string } }
export interface AnomalyPoint { timestamp: string; parameter: string; value: number; label: string; ruleIds: string[]; reason: string }
export interface FinalReport { stationId: string; parameter: string; period: { start: string; end: string }; label: string; confidence: number; anomalyPoints: AnomalyPoint[]; summary: string; verification: 'PASS' | 'REJECT' | 'NEED_MORE_DATA' }
export interface ExecutionTrace { id: string; agentCode: string; status: ExecutionStatus; startedAt: string; completedAt?: string; duration?: number; inputSummary: unknown; outputSummary: unknown; toolsUsed?: { name: string; result: unknown }[] }
export interface AnalysisExecution { id: string; request: { stationId: string; parameter: string; scenario: string; period: { start: string; end: string } }; plan: unknown; rules: Rule[]; dataManifest: unknown; qualityResult: unknown; evidence: Evidence[]; decision: { label: string; confidence: number; explanation: string; anomalyPoints: AnomalyPoint[] }; verification: { verification: 'PASS' | 'REJECT' | 'NEED_MORE_DATA'; issues: string[] }; report: FinalReport; traces: ExecutionTrace[]; data: MeasurementRecord[]; startedAt: string; completedAt?: string }
export interface Scenario { id: string; name: string; description: string; expectedLabel: string; parameter: string }
export interface AppSettings { simulationSpeed: 'Fast' | 'Normal' | 'Slow'; verifierMaxRetry: number; autoSave: boolean }
