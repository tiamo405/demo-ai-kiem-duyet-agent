import type { MeasurementRecord } from '../types'
export const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
export const variance = (values: number[]) => { const average = mean(values); return mean(values.map((value) => (value - average) ** 2)) }
export const standardDeviation = (values: number[]) => Math.sqrt(variance(values))
export const min = (values: number[]) => Math.min(...values)
export const max = (values: number[]) => Math.max(...values)
export const calculateRatio = (numerator: number, denominator: number) => denominator === 0 ? 0 : numerator / denominator
export const calculatePearson = (left: number[], right: number[]) => { const leftMean = mean(left); const rightMean = mean(right); const numerator = left.reduce((sum, value, index) => sum + (value - leftMean) * (right[index] - rightMean), 0); const denominator = Math.sqrt(left.reduce((sum, value) => sum + (value - leftMean) ** 2, 0) * right.reduce((sum, value) => sum + (value - rightMean) ** 2, 0)); return denominator ? numerator / denominator : 0 }
export const detectSpike = (values: number[]) => { const average = mean(values); const peak = max(values); return { peak, baseline: average, index: values.indexOf(peak), ratio: average ? peak / average : 0 } }
export const detectStuck = (values: number[]) => ({ variance: variance(values), range: max(values) - min(values), stuck: variance(values) < 0.01 })
export const detectMissing = (records: MeasurementRecord[], parameter: string) => records.filter((record) => typeof record.values[parameter] !== 'number').length
