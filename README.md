# EnvGuard Offline Demo

Web demo React + TypeScript mô phỏng hệ thống multi-agent kiểm duyệt dữ liệu quan trắc môi trường. Demo chạy hoàn toàn trong trình duyệt, không backend, database hay API AI thật.

## Chạy project

```bash
npm install
npm run dev
```

Kiểm tra production:

```bash
npm run lint
npm run build
```

## Kiến trúc

```text
Request -> Orchestrator -> Rule Resolver -> Data Planner -> Mock Data
-> Data Quality -> Analyzers -> Evidence -> Decision -> Verifier -> Report
```

- **AI Agent** chỉ thực hiện instruction prompt và điều phối vai trò.
- **Business Rule** nằm trong Rule Registry, có thể sửa, bật/tắt và version hóa.
- **Tool** là các hàm deterministic trong `src/services/analysisTools.ts`.
- Analyzer tạo Evidence. Decision Agent mới tạo Label.
- Cấu hình và execution được lưu qua localStorage.

## Cấu trúc dữ liệu offline

Demo không có database server. `src/data/seed.ts` là nguồn dữ liệu ban đầu, còn localStorage là repository hiện tại với các key:

- `env-agent-demo:rules`: Rule Registry và version rule.
- `env-agent-demo:agents`: Agent config, prompt và prompt version.
- `env-agent-demo:executions`: các lần chạy, dataset time-series, Evidence, Decision, Verification và Report.
- `env-agent-demo:settings`: tốc độ simulation và giới hạn retry.

Một measurement record có dạng `{ timestamp, stationId, values, context }`. Khi chạy simulation, Data Planner lấy các record cách nhau 5 phút trong khoảng period. Report không dự đoán một giá trị tương lai; nó kiểm duyệt các điểm đã quan sát trong period và trả `anomalyPoints` với timestamp, parameter, value, ruleIds và reason.

Luồng kết quả là:

```text
time-series records -> Rule Analyzer -> Evidence(timestampRange)
-> Decision(anomalyPoints) -> Verifier -> Report(structured JSON)
```

## Các scenario

- Normal O3 day
- O3 Night Spike -> `SHORT_HIGH`
- CO Short Spike -> `SHORT_HIGH`
- CO Stuck Sensor -> `STUCK`
- PM ratio violation -> `RELATIONSHIP_VIOLATION`
- Temperature / DO mismatch -> `RELATIONSHIP_VIOLATION`

## Cấu trúc chính

- `src/data/seed.ts`: stations, parameters, rules, agents, scenarios.
- `src/types.ts`: các interface và union type.
- `src/services/analysisTools.ts`: deterministic statistics và detectors.
- `src/services/mockDataGenerator.ts`: tạo measurement records theo scenario.
- `src/services/simulationEngine.ts`: MockAgentExecutor và execution pipeline.
- `src/store/`: React Context, Provider và localStorage-backed state.
- `src/App.tsx`: routes và các màn hình dashboard.
- `src/App.css`: visual system responsive cho dashboard.

## Thay Mock Agent bằng AI thật sau này

Giữ contract của simulation engine, tách phần thực thi Agent thành một `AgentExecutor` implementation mới. Implementation mới nhận `AgentConfig` và input đã chuẩn hóa, trả output cùng shape với mock executor. UI, Rule Registry, Evidence, Decision và audit version không cần thay đổi.
