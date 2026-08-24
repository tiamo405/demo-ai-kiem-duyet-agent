import type { MeasurementRecord } from '../types'
export type ScenarioId = 'normal-o3' | 'o3-night-spike' | 'co-spike' | 'co-stuck' | 'pm-ratio' | 'temp-do'

const intervalMilliseconds = 5 * 60 * 1000
const round = (value: number, digits = 2) => Number(value.toFixed(digits))

export function generateMockData(stationId: string, scenario: ScenarioId, start = '2026-05-10T00:00:00', end = '2026-05-11T00:00:00'): MeasurementRecord[] {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const count = Math.max(2, Math.min(10081, Math.floor((endTime - startTime) / intervalMilliseconds) + 1))
  const fallbackIndex = Math.max(2, Math.floor(count * 0.55))
  return Array.from({ length: count }, (_, index) => {
    const time = startTime + index * intervalMilliseconds
    const date = new Date(time)
    const hour = date.getHours()
    const minuteOfDay = hour * 60 + date.getMinutes()
    const dailyWave = Math.sin((minuteOfDay / 1440) * Math.PI * 2)
    const shortWave = Math.sin(index * 0.71) * 0.5 + Math.cos(index * 0.19) * 0.25
    const daylight = hour >= 6 && hour <= 18
    const radiation = daylight ? round(680 + Math.max(0, dailyWave) * 180 + shortWave * 18, 1) : 0
    const rain = index % 97 >= 90 ? round(2 + (index % 5) * 0.7, 1) : 0
    const values: Record<string, number> = { O3: round(daylight ? 62 + Math.max(0, dailyWave) * 32 + shortWave * 4 : 32 + shortWave * 2, 1), Radiation: radiation, Temp: round(27 + dailyWave * 5 + shortWave, 1), PM1: round(24 + Math.max(0, -dailyWave) * 9 + shortWave * 2, 1), PM25: round(39 + Math.max(0, -dailyWave) * 14 + shortWave * 2, 1), PM10: round(62 + Math.max(0, -dailyWave) * 18 + shortWave * 3, 1), Rain: rain, CO: round(1.8 + Math.max(0, -dailyWave) * 0.9 + shortWave * 0.08, 2), NOx: round(28 + Math.max(0, -dailyWave) * 12 + shortWave * 2, 1), SO2: round(17 + Math.max(0, -dailyWave) * 8 + shortWave, 1), WaterTemp: round(27 + dailyWave * 2 + shortWave * 0.3, 1), pH: round(7.1 - dailyWave * 0.12, 2), DO: round(6.4 - Math.max(0, dailyWave) * 0.7 - shortWave * 0.1, 2), COD: round(22 + Math.max(0, -dailyWave) * 8 + shortWave, 1), BOD: round(8 + Math.max(0, -dailyWave) * 3 + shortWave * 0.5, 1), Salinity: round(3 + shortWave * 0.1, 2), EC: round(420 + shortWave * 18 - rain * 2, 1) }
    const targetHour = scenario === 'o3-night-spike' ? 2 : scenario === 'co-spike' ? 8 : -1
    const anomalyIndex = targetHour >= 0 ? Array.from({ length: count }, (_, candidate) => candidate).find((candidate) => new Date(startTime + candidate * intervalMilliseconds).getHours() === targetHour) ?? fallbackIndex : fallbackIndex
    if (scenario === 'o3-night-spike' && index >= anomalyIndex && index <= anomalyIndex + 2) values.O3 = 300 + (index - anomalyIndex) * 10
    if (scenario === 'co-spike' && index >= anomalyIndex && index <= anomalyIndex + 1) values.CO = 80 + (index - anomalyIndex) * 4
    if (scenario === 'co-stuck') values.CO = 1.14 + (index % 2) * 0.005
    if (scenario === 'pm-ratio') values.PM25 = 10
    if (scenario === 'temp-do') { values.WaterTemp = 35 + index % 4; values.DO = 10 - index % 2 }
    return { timestamp: date.toISOString(), stationId, values, context: { rain: values.Rain, trafficLevel: hour >= 7 && hour <= 9 ? 90 : 30 } }
  })
}
