import type { AgentConfig, Parameter, Rule, Scenario, Station } from '../types'

export const stations: Station[] = [
  { id: 'st-hn-a01', code: 'HN_A01', name: 'Cau Giay Urban Monitor', environmentType: 'AIR', status: 'ACTIVE', province: 'Ha Noi', metadata: { stationType: 'Roadside', trafficLevel: 'HIGH', industrialZone: false }, parameterIds: ['O3', 'Radiation', 'Temp', 'PM1', 'PM25', 'PM10', 'Rain', 'CO', 'NOx', 'SO2', 'Pressure'] },
  { id: 'st-hn-a02', code: 'HN_A02', name: 'West Lake Background', environmentType: 'AIR', status: 'ACTIVE', province: 'Ha Noi', metadata: { stationType: 'Urban background', trafficLevel: 'LOW', industrialZone: false }, parameterIds: ['O3', 'Radiation', 'Temp', 'PM25', 'PM10', 'Rain', 'CO', 'NOx', 'SO2'] },
  { id: 'st-hp-a01', code: 'HP_A01', name: 'Dinh Vu Industrial', environmentType: 'AIR', status: 'MAINTENANCE', province: 'Hai Phong', metadata: { stationType: 'Industrial', industrialZone: true }, parameterIds: ['O3', 'Radiation', 'Temp', 'PM25', 'PM10', 'SO2', 'CO'] },
  { id: 'st-sw-hn01', code: 'SW_HN01', name: 'Red River Surface Water', environmentType: 'SURFACE_WATER', status: 'ACTIVE', province: 'Ha Noi', metadata: { waterType: 'River', terrain: 'Flat' }, parameterIds: ['WaterTemp', 'pH', 'DO', 'Pressure', 'Flow', 'TSS', 'Turbidity', 'NH4', 'NH3', 'COD', 'BOD', 'Salinity', 'EC', 'Rain'] },
  { id: 'st-sw-hp01', code: 'SW_HP01', name: 'Cam River Estuary', environmentType: 'SURFACE_WATER', status: 'ACTIVE', province: 'Hai Phong', metadata: { waterType: 'Estuary', terrain: 'Flat' }, parameterIds: ['WaterTemp', 'pH', 'DO', 'Flow', 'TSS', 'Turbidity', 'COD', 'BOD', 'Salinity', 'EC', 'Rain'] },
  { id: 'st-gw-hn01', code: 'GW_HN01', name: 'Thanh Tri Groundwater', environmentType: 'GROUND_WATER', status: 'ACTIVE', province: 'Ha Noi', metadata: { waterType: 'Groundwater', terrain: 'Steep' }, parameterIds: ['WaterTemp', 'pH', 'DO', 'Pressure', 'NH4', 'NH3', 'Salinity', 'EC'] },
]

const air: Parameter[] = [
  ['O3', 'Ozone', 'µg/m3'], ['Radiation', 'Solar radiation', 'W/m2'], ['Temp', 'Temperature', '°C'], ['PM1', 'PM1', 'µg/m3'], ['PM25', 'PM2.5', 'µg/m3'], ['PM10', 'PM10', 'µg/m3'], ['Rain', 'Rainfall', 'mm'], ['CO', 'Carbon monoxide', 'mg/m3'], ['NOx', 'Nitrogen oxides', 'µg/m3'], ['SO2', 'Sulfur dioxide', 'µg/m3'], ['Pressure', 'Pressure', 'hPa'],
].map(([code, name, unit]) => ({ id: code, code, name, unit, environmentTypes: ['AIR'] as const, normalRange: { min: 0, max: code === 'O3' ? 120 : 100 } }))
const water: Parameter[] = [
  ['WaterTemp', 'Water temperature', '°C'], ['pH', 'pH', 'pH'], ['DO', 'Dissolved oxygen', 'mg/L'], ['Pressure', 'Pressure', 'hPa'], ['Flow', 'Flow', 'm3/s'], ['TSS', 'Total suspended solids', 'mg/L'], ['Turbidity', 'Turbidity', 'NTU'], ['NH4', 'Ammonium', 'mg/L'], ['NH3', 'Ammonia', 'mg/L'], ['COD', 'Chemical oxygen demand', 'mg/L'], ['BOD', 'Biochemical oxygen demand', 'mg/L'], ['Salinity', 'Salinity', 'ppt'], ['EC', 'Electrical conductivity', 'µS/cm'], ['Rain', 'Rainfall', 'mm'],
].map(([code, name, unit]) => ({ id: code, code, name, unit, environmentTypes: ['SURFACE_WATER', 'GROUND_WATER'] as const, normalRange: { min: 0, max: code === 'pH' ? 14 : 100 } }))
export const parameters = [...air, ...water.filter((item, index, all) => all.findIndex((candidate) => candidate.code === item.code) === index)]

const prompt = (name: string, task: string) => `Bạn là ${name} của hệ thống kiểm duyệt dữ liệu môi trường.\n\nNHIỆM VỤ:\n${task}\n\nKHÔNG ĐƯỢC:\n- tự tạo Rule nghiệp vụ;\n- tự tạo Evidence ngoài input;\n- đưa ra Final Label nếu không phải Decision Agent.\n\nOUTPUT: JSON có cấu trúc rõ ràng.`
export const agents: AgentConfig[] = [
  ['ORCHESTRATOR', 'Orchestrator Agent', 'Điều phối execution plan', 'Hiểu yêu cầu, xác định trạm, thông số, thời gian và năng lực cần dùng.'],
  ['RULE_RESOLVER', 'Rule Resolver Agent', 'Chọn Rule từ Rule Registry', 'Chỉ chọn Rule đang enabled và phù hợp môi trường, parameter.'],
  ['DATA_PLANNER', 'Data Planner Agent', 'Lập data manifest', 'Xác định field, lịch sử, lookback và context cần lấy.'],
  ['DATA_QUALITY', 'Data Quality Agent', 'Kiểm tra dataset', 'Kiểm tra missing, gap, duplicate, datatype và continuity; không xóa outlier.'],
  ['TIME_SERIES_ANALYZER', 'Time Series Analyzer', 'Phân tích chuỗi thời gian', 'Đánh giá baseline, spike, history, stuck và historical range.'],
  ['RELATIONSHIP_ANALYZER', 'Relationship Analyzer', 'Phân tích quan hệ', 'Dùng ratio, trend và correlation; không suy diễn correlation thành causation.'],
  ['CONTEXT_ANALYZER', 'Context Analyzer', 'Đánh giá bối cảnh', 'Đánh giá thời gian, traffic, terrain, rainfall và station metadata.'],
  ['DECISION', 'Decision Agent', 'Tổng hợp Evidence', 'Tạo Preliminary Decision từ Evidence, không tạo Evidence mới.'],
  ['VERIFIER', 'Verifier Agent', 'Phản biện kết luận', 'Tìm thiếu dữ liệu, dùng sai Rule, nhầm correlation và confidence quá cao.'],
  ['REPORT', 'Report Agent', 'Tạo báo cáo cuối', 'Chuyển kết quả đã verify thành báo cáo dễ đọc, không thay đổi label.'],
].map(([code, name, description, task], index) => ({ id: code, code, name, description, prompt: prompt(name, task), enabled: true, model: 'mock-reasoning-model', temperature: index > 6 ? 0.2 : 0.1, reasoning: index > 6 ? 'High' : 'Medium', promptVersion: 'v1.0', updatedAt: '2026-08-24T09:00:00Z' }))

const ruleDefs: Array<[string, string, Rule['environmentType'], Rule['category'], Rule['analyzer'], string[], string[], string]> = [
  ['TS01_LOW_BASELINE', 'Số liệu thấp hơn nhiều so với nền dài hạn', 'ALL', 'TIME_SERIES', 'TIME_SERIES_ANALYZER', [], [], 'Phát hiện baseline thấp kéo dài so với lịch sử hoặc trạm lân cận.'],
  ['TS02_SHORT_SPIKE', 'Số liệu quá cao trong thời gian ngắn', 'ALL', 'TIME_SERIES', 'TIME_SERIES_ANALYZER', [], [], 'Giá trị tăng vọt rồi nhanh chóng trở lại bình thường.'],
  ['TS03_LONG_HIGH_HISTORY', 'Số liệu quá cao kéo dài so với lịch sử', 'ALL', 'TIME_SERIES', 'TIME_SERIES_ANALYZER', [], [], 'So sánh hôm trước, tuần trước, tháng trước và cùng kỳ.'],
  ['TS04_STUCK', 'Số liệu quá ổn định / treo dữ liệu', 'ALL', 'TIME_SERIES', 'TIME_SERIES_ANALYZER', [], [], 'Variance cực thấp trong khoảng thời gian dài.'],
  ['TS05_OUTSIDE_HISTORICAL_RANGE', 'Số liệu ngoài khoảng lịch sử', 'ALL', 'TIME_SERIES', 'TIME_SERIES_ANALYZER', [], [], 'Dải min/max lấy từ historical data, không phải giới hạn pháp luật.'],
  ['AIR01_RADIATION_O3', 'Bức xạ mặt trời và O3', 'AIR', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['O3'], ['Radiation'], 'Radiation cao thì O3 có xu hướng cao.'],
  ['AIR02_PM_CORRELATION', 'Tương quan PM1 - PM2.5 - PM10', 'AIR', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['PM1', 'PM25', 'PM10'], [], 'Kiểm tra nhóm PM đồng biến hợp lý.'],
  ['AIR03_PM25_PM10_RATIO', 'Tỷ lệ PM2.5 / PM10', 'AIR', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['PM25'], ['PM10'], 'PM2.5 / PM10 thường nằm trong khoảng 0.57 - 0.72.'],
  ['AIR04_RAIN_PM', 'Mưa và PM', 'AIR', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['PM1', 'PM25', 'PM10'], ['Rain'], 'Rain tăng thì PM có xu hướng giảm.'],
  ['AIR05_TRAFFIC_CO', 'Giao thông và CO', 'AIR', 'CONTEXT', 'CONTEXT_ANALYZER', ['CO'], [], 'Trạm ven đường có CO cao hơn vào giờ cao điểm.'],
  ['AIR06_TRAFFIC_NOX', 'Giao thông và NOx', 'AIR', 'CONTEXT', 'CONTEXT_ANALYZER', ['NOx'], [], 'Trạm ven đường có NOx cao hơn vào giờ cao điểm.'],
  ['AIR07_TEMP_SO2', 'Nhiệt độ và SO2', 'AIR', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['SO2'], ['Temp'], 'Temp tăng thì SO2 có xu hướng tăng.'],
  ['AIR08_INDUSTRIAL_SO2', 'Khu công nghiệp và SO2', 'AIR', 'CONTEXT', 'CONTEXT_ANALYZER', ['SO2'], [], 'Industrial zone là context hỗ trợ.'],
  ['WATER01_TEMP_PH', 'WaterTemp và pH', 'ALL', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['pH'], ['WaterTemp'], 'WaterTemp tăng thì pH giảm.'],
  ['WATER02_TEMP_DO', 'WaterTemp và DO', 'ALL', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['DO'], ['WaterTemp'], 'WaterTemp tăng thì DO giảm.'],
  ['WATER03_PRESSURE_DO', 'Pressure và DO', 'ALL', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['DO'], ['Pressure'], 'Pressure tăng thì DO tăng.'],
  ['WATER04_FLOW_DO', 'Flow và DO', 'ALL', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['DO'], ['Flow'], 'Flow tăng thì DO tăng.'],
  ['WATER05_STATIC_DO', 'Nước tĩnh và DO thấp', 'ALL', 'CONTEXT', 'CONTEXT_ANALYZER', ['DO'], ['Flow'], 'Static water hỗ trợ giải thích DO thấp.'],
  ['WATER06_TERRAIN_FLOW', 'Địa hình dốc và Flow', 'ALL', 'CONTEXT', 'CONTEXT_ANALYZER', ['Flow'], [], 'Steep terrain hỗ trợ flow mạnh.'],
  ['WATER07_TSS_TURBIDITY', 'TSS và Turbidity', 'ALL', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['Turbidity'], ['TSS'], 'TSS tăng thì Turbidity tăng.'],
  ['WATER08_GW_NH4', 'NH4 groundwater và surface water', 'ALL', 'CROSS_CONTEXT', 'CONTEXT_ANALYZER', ['NH4'], [], 'NH4 groundwater thường cao hơn surface water.'],
  ['WATER09_PH_AMMONIA', 'pH quyết định NH4/NH3', 'ALL', 'CONDITIONAL', 'CONTEXT_ANALYZER', ['NH4', 'NH3'], ['pH'], 'pH <= 7 hỗ trợ NH4, pH > 9 hỗ trợ NH3.'],
  ['WATER10_COD_BOD', 'COD và BOD', 'ALL', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['BOD'], ['COD'], 'COD tăng thì BOD tăng.'],
  ['WATER11_COD_DO', 'COD và DO', 'ALL', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['DO'], ['COD'], 'COD tăng thì DO giảm.'],
  ['WATER12_SALINITY_EC', 'Salinity và EC', 'ALL', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['EC'], ['Salinity'], 'Salinity tăng thì EC tăng.'],
  ['WATER13_RAIN_EC', 'Rain và EC', 'ALL', 'RELATIONSHIP', 'RELATIONSHIP_ANALYZER', ['EC'], ['Rain'], 'Rain tăng thì EC giảm.'],
  ['WATER14_DISCHARGE_EC', 'Upstream discharge và EC', 'ALL', 'CONTEXT', 'CONTEXT_ANALYZER', ['EC'], [], 'Upstream discharge hỗ trợ EC giảm.'],
  ['WATER15_TIDE_EC', 'High tide và EC', 'ALL', 'CONTEXT', 'CONTEXT_ANALYZER', ['EC'], [], 'High tide hỗ trợ EC tăng.'],
]
export const rules: Rule[] = ruleDefs.map(([code, name, environmentType, category, analyzer, targetParameters, driverParameters, description]) => ({ id: code, code, name, description, environmentType, category, analyzer, targetParameters, driverParameters, contextFields: ['timestamp'], requiredDataFields: ['timestamp', ...targetParameters, ...driverParameters], type: category === 'RELATIONSHIP' ? 'RELATIONSHIP' : category, enabled: true, severity: code.includes('TS02') || code.includes('AIR01') ? 'HIGH' : 'MEDIUM', version: '1.0', updatedAt: '2026-08-24T09:00:00Z', config: code.includes('RATIO') ? { numerator: 'PM25', denominator: 'PM10', expectedMin: 0.57, expectedMax: 0.72 } : {} }))
export const scenarios: Scenario[] = [
  { id: 'normal-o3', name: 'Normal O3 day', description: 'Diễn biến O3 bình thường theo ánh sáng.', expectedLabel: 'NORMAL', parameter: 'O3' },
  { id: 'o3-night-spike', name: 'O3 Night Spike', description: 'O3 tăng vọt ban đêm khi Radiation bằng 0.', expectedLabel: 'SHORT_HIGH', parameter: 'O3' },
  { id: 'co-spike', name: 'CO Short Spike', description: 'CO spike ngắn rồi trở lại nền.', expectedLabel: 'SHORT_HIGH', parameter: 'CO' },
  { id: 'co-stuck', name: 'CO Stuck Sensor', description: 'CO gần như không đổi trong nhiều giờ.', expectedLabel: 'STUCK', parameter: 'CO' },
  { id: 'pm-ratio', name: 'PM ratio violation', description: 'PM2.5 / PM10 nằm ngoài khoảng kỳ vọng.', expectedLabel: 'RELATIONSHIP_VIOLATION', parameter: 'PM25' },
  { id: 'temp-do', name: 'Temperature / DO mismatch', description: 'Nhiệt độ nước và DO đi ngược quan hệ.', expectedLabel: 'RELATIONSHIP_VIOLATION', parameter: 'DO' },
]
