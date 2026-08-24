import { useContext } from 'react'
import { agents as seedAgents, rules as seedRules, stations, parameters, scenarios } from '../data/seed'
import { AppContext } from './context'
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error('useApp must be used inside AppProvider'); return { ...value, stations, parameters, scenarios, seedAgents, seedRules } }
