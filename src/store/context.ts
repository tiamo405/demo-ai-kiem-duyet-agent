import { createContext } from 'react'
import type { AgentConfig, AnalysisExecution, AppSettings, Rule } from '../types'
export interface AppContextValue { rules: Rule[]; agents: AgentConfig[]; executions: AnalysisExecution[]; settings: AppSettings; updateRule: (rule: Rule) => void; removeRule: (id: string) => void; updateAgent: (agent: AgentConfig) => void; addExecution: (execution: AnalysisExecution) => void; updateSettings: (settings: AppSettings) => void; reset: () => void }
export const AppContext = createContext<AppContextValue | null>(null)
