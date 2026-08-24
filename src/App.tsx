import { useState, type ReactNode } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Boxes,
  Check,
  ChevronRight,
  Database,
  Gauge,
  GitBranch,
  History,
  Menu,
  Play,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppProvider } from "./store/appStore";
import { useApp } from "./store/useApp";
import { runSimulation } from "./services/simulationEngine";
import type { AgentConfig, AnalysisExecution, Rule } from "./types";
import "./App.css";

const nav = [
  { label: "TỔNG QUAN", items: [["Dashboard", "/", Gauge]] },
  {
    label: "DANH MỤC",
    items: [
      ["Trạm quan trắc", "/stations", Activity],
      ["Thông số", "/parameters", SlidersHorizontal],
    ],
  },
  {
    label: "KIỂM DUYỆT",
    items: [
      ["Rule Registry", "/rules", ShieldCheck],
      ["AI Agents", "/agents", Bot],
      ["Workflow", "/workflow", GitBranch],
    ],
  },
  {
    label: "MÔ PHỎNG",
    items: [
      ["Dữ liệu Demo", "/demo-data", Database],
      ["Chạy kiểm duyệt", "/analyze", Play],
      ["Execution Trace", "/execution/latest", History],
      ["Kết quả", "/results", BarChart3],
    ],
  },
  { label: "HỆ THỐNG", items: [["Cài đặt", "/settings", Settings]] },
] as const;
function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <div>
            <strong>
              ENV<span>GUARD</span>
            </strong>
            <small>Multi-agent review</small>
          </div>
        </div>
        <nav>
          {nav.map((group) => (
            <div className="nav-group" key={group.label}>
              <small>{group.label}</small>
              {group.items.map(([label, path, Icon]) => (
                <Link
                  className={
                    location.pathname === path ||
                    (path === "/execution/latest" &&
                      location.pathname.startsWith("/execution"))
                      ? "nav-item active"
                      : "nav-item"
                  }
                  to={path}
                  key={path}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="live-dot" /> Offline workspace
          <div className="sidebar-footnote">No API connection</div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button
            className="icon-btn menu-btn"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <div className="breadcrumb">
              Workspace <ChevronRight size={13} />{" "}
              {location.pathname === "/"
                ? "Overview"
                : location.pathname.slice(1).replaceAll("-", " ")}
            </div>
            <h1>Environmental data review</h1>
          </div>
          <div className="top-actions">
            <span className="offline-pill">
              <span /> OFFLINE DEMO
            </span>
            <div className="avatar">NT</div>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function Metric({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Gauge;
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <Boxes size={25} />
      <span>{text}</span>
    </div>
  );
}
function Dashboard() {
  const { stations, parameters, rules, agents, executions } = useApp();
  return (
    <>
      <PageTitle
        eyebrow="OPERATIONS / OVERVIEW"
        title="Control room"
        description="Theo dõi sức khỏe dữ liệu và hoạt động của multi-agent pipeline."
        action={
          <Link className="primary-btn" to="/analyze">
            <Play size={16} /> Chạy kiểm duyệt
          </Link>
        }
      />
      <div className="metrics">
        <Metric
          label="Trạm quan trắc"
          value={stations.length}
          detail="5 active · 1 maintenance"
          icon={Activity}
          tone="mint"
        />
        <Metric
          label="Parameters"
          value={parameters.length}
          detail="Air & water coverage"
          icon={SlidersHorizontal}
          tone="blue"
        />
        <Metric
          label="Business rules"
          value={rules.length}
          detail="Registry governed"
          icon={ShieldCheck}
          tone="amber"
        />
        <Metric
          label="AI agents"
          value={agents.length}
          detail={`${agents.filter((agent) => agent.enabled).length} enabled`}
          icon={Bot}
          tone="coral"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel pipeline-panel">
          <div className="panel-head">
            <div>
              <h3>Review pipeline</h3>
              <p>Deterministic simulation architecture</p>
            </div>
            <Link className="text-btn" to="/workflow">
              Open workflow <ChevronRight size={15} />
            </Link>
          </div>
          <div className="mini-pipeline">
            {[
              "Request",
              "Orchestrator",
              "Rules",
              "Data quality",
              "Analyze",
              "Decision",
              "Verify",
              "Report",
            ].map((item, index) => (
              <div className="pipeline-step" key={item}>
                <div className={`pipeline-node ${index === 5 ? "hot" : ""}`}>
                  {index + 1}
                </div>
                <span>{item}</span>
                {index < 7 && <ChevronRight size={14} />}
              </div>
            ))}
          </div>
          <div className="architecture-note">
            <GitBranch size={18} />
            <span>
              <strong>Rule → Evidence → Decision → Label</strong>
              <small>
                Agents never create business rules or skip evidence.
              </small>
            </span>
          </div>
        </section>
        <section className="panel status-panel">
          <div className="panel-head">
            <div>
              <h3>Agent readiness</h3>
              <p>Configuration status</p>
            </div>
            <Link className="text-btn" to="/agents">
              Configure <ChevronRight size={15} />
            </Link>
          </div>
          <div className="agent-status-list">
            {agents.slice(0, 6).map((agent) => (
              <div className="status-row" key={agent.id}>
                <span className="status-agent">
                  <Bot size={15} />
                  {agent.name.replace(" Agent", "")}
                </span>
                <Badge tone={agent.enabled ? "success" : "muted"}>
                  {agent.enabled ? "READY" : "DISABLED"}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-head">
          <div>
            <h3>Recent executions</h3>
            <p>Latest local analysis records</p>
          </div>
          <Link className="text-btn" to="/results">
            View all <ChevronRight size={15} />
          </Link>
        </div>
        {executions.length === 0 ? (
          <Empty text="Chưa có execution nào. Chạy một scenario để bắt đầu." />
        ) : (
          <ExecutionTable executions={executions.slice(0, 4)} />
        )}
      </section>
    </>
  );
}
function ExecutionTable({ executions }: { executions: AnalysisExecution[] }) {
  const navigate = useNavigate();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Station</th>
            <th>Parameter</th>
            <th>Scenario</th>
            <th>Decision</th>
            <th>Confidence</th>
            <th>Verify</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((execution) => (
            <tr
              key={execution.id}
              onClick={() => navigate(`/execution/${execution.id}`)}
            >
              <td>
                <strong>{execution.request.stationId}</strong>
              </td>
              <td>{execution.request.parameter}</td>
              <td>{execution.request.scenario}</td>
              <td>
                <Badge
                  tone={
                    execution.decision.label === "NORMAL" ? "success" : "danger"
                  }
                >
                  {execution.decision.label}
                </Badge>
              </td>
              <td>{Math.round(execution.decision.confidence * 100)}%</td>
              <td>
                <Badge tone="success">
                  <Check size={12} /> PASS
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Stations({ parameters = false }: { parameters?: boolean }) {
  const { stations, parameters: params } = useApp();
  const rows = parameters ? params : stations;
  return (
    <>
      <PageTitle
        eyebrow="CATALOG"
        title={parameters ? "Parameters" : "Monitoring stations"}
        description={
          parameters
            ? "Danh mục thông số và khoảng vận hành tham chiếu."
            : "Các điểm quan trắc đang được quản lý trong workspace."
        }
      />
      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <SlidersHorizontal size={16} />
            <input placeholder="Search records" />
          </div>
          <Badge tone="info">{rows.length} records</Badge>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {parameters ? (
                  <>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Unit</th>
                    <th>Environment</th>
                    <th>Normal range</th>
                  </>
                ) : (
                  <>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Environment</th>
                    <th>Province</th>
                    <th>Status</th>
                    <th>Parameters</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
                parameters ? (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.code}</strong>
                    </td>
                    <td>{row.name}</td>
                    <td>{row.unit}</td>
                    <td>
                      <Badge tone="info">
                        {row.environmentTypes?.join(" · ")}
                      </Badge>
                    </td>
                    <td>
                      {row.normalRange
                        ? `${row.normalRange.min} — ${row.normalRange.max}`
                        : "—"}
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.code}</strong>
                    </td>
                    <td>{row.name}</td>
                    <td>
                      <Badge tone="info">{row.environmentType}</Badge>
                    </td>
                    <td>{row.province}</td>
                    <td>
                      <Badge
                        tone={row.status === "ACTIVE" ? "success" : "warning"}
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td>{row.parameterIds?.length ?? 0} fields</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function Rules() {
  const { rules, updateRule, removeRule } = useApp();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Rule | null>(null);
  const filtered = rules.filter((rule) =>
    `${rule.code} ${rule.name}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="GOVERNANCE / BUSINESS KNOWLEDGE"
        title="Rule Registry"
        description="Quản lý quy tắc nghiệp vụ được dùng trong quá trình kiểm duyệt."
        action={
          <button
            className="primary-btn"
            onClick={() =>
              setEditing({
                ...rules[0],
                id: `new-${Date.now()}`,
                code: "NEW_RULE",
                name: "New business rule",
                version: "1.0",
              })
            }
          >
            <Sparkles size={16} /> Tạo Rule
          </button>
        }
      />
      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <SlidersHorizontal size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search code or rule name"
            />
          </div>
          <div className="filter-pills">
            <Badge tone="info">All environments</Badge>
            <Badge>All categories</Badge>
            <Badge>All analyzers</Badge>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Business rule</th>
                <th>Environment</th>
                <th>Category</th>
                <th>Analyzer</th>
                <th>Severity</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <strong className="mono">{rule.code}</strong>
                    <small className="table-sub">v{rule.version}</small>
                  </td>
                  <td>
                    {rule.name}
                    <small className="table-sub">{rule.description}</small>
                  </td>
                  <td>
                    <Badge tone="info">{rule.environmentType}</Badge>
                  </td>
                  <td>{rule.category}</td>
                  <td>
                    <span className="type-label rule">
                      <ShieldCheck size={12} /> RULE
                    </span>
                    <small className="table-sub">
                      {rule.analyzer.replace("_ANALYZER", "")}
                    </small>
                  </td>
                  <td>
                    <Badge
                      tone={rule.severity === "HIGH" ? "danger" : "warning"}
                    >
                      {rule.severity}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="switch"
                      aria-label="Toggle rule"
                      onClick={() =>
                        updateRule({ ...rule, enabled: !rule.enabled })
                      }
                    >
                      <span className={rule.enabled ? "on" : ""} />
                    </button>
                  </td>
                  <td>
                    <button
                      className="small-btn"
                      onClick={() => setEditing({ ...rule })}
                    >
                      Edit
                    </button>
                    <button
                      className="icon-btn danger-icon"
                      onClick={() => removeRule(rule.id)}
                      aria-label="Delete rule"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {editing && (
        <RuleDrawer
          rule={editing}
          close={() => setEditing(null)}
          save={(rule) => {
            updateRule(rule);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
function RuleDrawer({
  rule,
  close,
  save,
}: {
  rule: Rule;
  close: () => void;
  save: (rule: Rule) => void;
}) {
  const [draft, setDraft] = useState(rule);
  const [tab, setTab] = useState("Info");
  return (
    <div className="drawer-backdrop" onClick={close}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <div className="eyebrow">BUSINESS RULE</div>
            <h3>{draft.code}</h3>
          </div>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="tabs">
          {["Info", "Logic", "Data requirement", "Raw JSON"].map((item) => (
            <button
              className={tab === item ? "selected" : ""}
              onClick={() => setTab(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        {tab === "Raw JSON" ? (
          <textarea
            className="json-editor"
            value={JSON.stringify(draft, null, 2)}
            onChange={(event) => {
              try {
                setDraft(JSON.parse(event.target.value) as Rule);
              } catch {
                /* Invalid JSON stays visible until corrected. */
              }
            }}
          />
        ) : (
          <div className="form-grid">
            <label>
              Rule name
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </label>
            <label>
              Code
              <input
                value={draft.code}
                onChange={(event) =>
                  setDraft({ ...draft, code: event.target.value })
                }
              />
            </label>
            <label>
              Environment
              <select
                value={draft.environmentType}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    environmentType: event.target
                      .value as Rule["environmentType"],
                  })
                }
              >
                <option>ALL</option>
                <option>AIR</option>
                <option>SURFACE_WATER</option>
                <option>GROUND_WATER</option>
              </select>
            </label>
            <label>
              Severity
              <select
                value={draft.severity}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    severity: event.target.value as Rule["severity"],
                  })
                }
              >
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
              </select>
            </label>
            <label className="full">
              Description
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
              />
            </label>
            <div className="rule-callout">
              <ShieldCheck size={16} />
              <span>
                <strong>Rule is business knowledge</strong>
                <small>
                  Prompt của Agent không chứa tri thức này. Analyzer chỉ tạo
                  Evidence.
                </small>
              </span>
            </div>
          </div>
        )}
        <div className="drawer-foot">
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button
            className="primary-btn"
            onClick={() =>
              save({
                ...draft,
                version: draft.version === "1.0" ? "1.1" : draft.version,
                updatedAt: new Date().toISOString(),
              })
            }
          >
            <Save size={15} /> Save rule
          </button>
        </div>
      </aside>
    </div>
  );
}
function Agents() {
  const { agents, updateAgent } = useApp();
  const [editing, setEditing] = useState<AgentConfig | null>(null);
  return (
    <>
      <PageTitle
        eyebrow="GOVERNANCE / AI CONFIGURATION"
        title="AI Agents"
        description="Prompt là instruction cho Agent; business knowledge luôn lấy từ Rule Registry."
      />
      <div className="agent-grid">
        {agents.map((agent) => (
          <div className="agent-card" key={agent.id}>
            <div className="agent-card-top">
              <div className="agent-icon">
                <Bot size={20} />
              </div>
              <Badge tone={agent.enabled ? "success" : "muted"}>
                {agent.enabled ? "ENABLED" : "DISABLED"}
              </Badge>
            </div>
            <h3>{agent.name}</h3>
            <p>{agent.description}</p>
            <div className="agent-meta">
              <span>
                Model <strong>{agent.model}</strong>
              </span>
              <span>
                Prompt <strong>{agent.promptVersion}</strong>
              </span>
            </div>
            <div className="agent-actions">
              <button
                className="small-btn"
                onClick={() =>
                  updateAgent({ ...agent, enabled: !agent.enabled })
                }
              >
                {agent.enabled ? "Disable" : "Enable"}
              </button>
              <button
                className="primary-btn compact"
                onClick={() => setEditing({ ...agent })}
              >
                Configure <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <AgentDrawer
          agent={editing}
          close={() => setEditing(null)}
          save={(agent) => {
            updateAgent(agent);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
function AgentDrawer({
  agent,
  close,
  save,
}: {
  agent: AgentConfig;
  close: () => void;
  save: (agent: AgentConfig) => void;
}) {
  const [draft, setDraft] = useState(agent);
  const [tab, setTab] = useState("General");
  return (
    <div className="drawer-backdrop" onClick={close}>
      <aside
        className="drawer agent-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          <div>
            <div className="eyebrow">AI AGENT CONFIGURATION</div>
            <h3>{draft.name}</h3>
          </div>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="tabs">
          {["General", "Instruction Prompt", "Input / Output"].map((item) => (
            <button
              className={tab === item ? "selected" : ""}
              onClick={() => setTab(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        {tab === "Instruction Prompt" ? (
          <div className="prompt-area">
            <div className="prompt-warning">
              <AlertTriangle size={16} />
              <span>
                Instruction cho Agent. Không khai báo business rule tại đây.
              </span>
            </div>
            <textarea
              className="prompt-editor"
              value={draft.prompt}
              onChange={(event) =>
                setDraft({ ...draft, prompt: event.target.value })
              }
            />
            <small>
              Saving creates a new prompt version. Current:{" "}
              {draft.promptVersion}
            </small>
          </div>
        ) : (
          <div className="form-grid">
            <label>
              Agent name
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </label>
            <label>
              Mock model
              <input
                value={draft.model}
                onChange={(event) =>
                  setDraft({ ...draft, model: event.target.value })
                }
              />
            </label>
            <label>
              Temperature
              <input
                type="number"
                step="0.1"
                value={draft.temperature}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    temperature: Number(event.target.value),
                  })
                }
              />
            </label>
            <label>
              Reasoning
              <select
                value={draft.reasoning}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    reasoning: event.target.value as AgentConfig["reasoning"],
                  })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label className="toggle-line full">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(event) =>
                  setDraft({ ...draft, enabled: event.target.checked })
                }
              />{" "}
              Agent enabled
            </label>
          </div>
        )}
        <div className="drawer-foot">
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button
            className="primary-btn"
            onClick={() =>
              save({
                ...draft,
                promptVersion:
                  draft.prompt !== agent.prompt ? "v1.1" : draft.promptVersion,
                updatedAt: new Date().toISOString(),
              })
            }
          >
            <Save size={15} /> Save configuration
          </button>
        </div>
      </aside>
    </div>
  );
}
function Analyze() {
  const { stations, scenarios, rules, agents, addExecution } = useApp();
  const navigate = useNavigate();
  const [stationId, setStationId] = useState(stations[0].code);
  const [scenario, setScenario] = useState(scenarios[1].id);
  const [start, setStart] = useState("2026-05-10T00:00");
  const [end, setEnd] = useState("2026-05-11T00:00");
  const [running, setRunning] = useState(false);
  const selected =
    scenarios.find((item) => item.id === scenario) ?? scenarios[0];
  async function run() {
    if (new Date(end) <= new Date(start)) {
      window.alert("End time must be after start time.");
      return;
    }
    setRunning(true);
    const station =
      stations.find((item) => item.code === stationId) ?? stations[0];
    const execution = await runSimulation(
      {
        stationId: station.code,
        parameter: selected.parameter,
        scenario: selected.id as never,
        environment: station.environmentType,
        period: { start, end },
      },
      rules,
      agents,
    );
    addExecution(execution);
    setRunning(false);
    navigate(`/execution/${execution.id}`);
  }
  return (
    <>
      <PageTitle
        eyebrow="SIMULATION / RUN ANALYSIS"
        title="Run multi-agent review"
        description="Chọn một preset deterministic để quan sát Agent, Rule và Tool phối hợp."
      />
      <div className="analyze-grid">
        <section className="panel run-form">
          <div className="panel-head">
            <div>
              <h3>Analysis request</h3>
              <p>Không có API AI hoặc backend thật.</p>
            </div>
            <Badge tone="info">MOCK EXECUTOR</Badge>
          </div>
          <label>
            Station
            <select
              value={stationId}
              onChange={(event) => setStationId(event.target.value)}
            >
              {stations.map((station) => (
                <option key={station.id}>{station.code}</option>
              ))}
            </select>
          </label>
          <label>
            Scenario
            <select
              value={scenario}
              onChange={(event) => setScenario(event.target.value)}
            >
              {scenarios.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Start time
            <input
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              required
            />
          </label>
          <label>
            End time
            <input
              type="datetime-local"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              required
            />
          </label>
          <div className="scenario-preview">
            <div className="scenario-icon">
              <AlertTriangle size={18} />
            </div>
            <div>
              <strong>{selected.description}</strong>
              <span>
                Expected label:{" "}
                <Badge tone="danger">{selected.expectedLabel}</Badge>
              </span>
            </div>
          </div>
          <button className="run-btn" disabled={running} onClick={run}>
            {running ? (
              <>
                <Activity className="spin" size={18} /> Running pipeline...
              </>
            ) : (
              <>
                <Play size={18} /> Run Multi-Agent Analysis
              </>
            )}
          </button>
        </section>
        <section className="panel run-side">
          <div className="panel-head">
            <div>
              <h3>Execution contract</h3>
              <p>Rules are resolved before analysis.</p>
            </div>
          </div>
          <div className="contract-list">
            {[
              ["01", "Orchestrator", "Create plan"],
              ["02", "Rule Resolver", "Select enabled rules"],
              ["03", "Analyzers", "Generate evidence"],
              ["04", "Decision", "Create candidate label"],
              ["05", "Verifier", "Challenge result"],
            ].map(([number, name, detail]) => (
              <div key={number}>
                <span>{number}</span>
                <strong>
                  {name}
                  <small>{detail}</small>
                </strong>
                <ChevronRight size={15} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
function Workflow() {
  const steps = [
    "User request",
    "Orchestrator",
    "Rule Resolver",
    "Data Planner",
    "Mock Data",
    "Data Quality",
    "Analysis Router",
    "Time Series",
    "Relationship",
    "Context",
    "Evidence",
    "Decision Agent",
    "Verifier",
    "Report Agent",
    "Final result",
  ];
  return (
    <>
      <PageTitle
        eyebrow="ORCHESTRATION"
        title="Workflow map"
        description="Luồng thực thi minh họa ranh giới Agent, Rule và Tool."
        action={
          <Link className="primary-btn" to="/analyze">
            <Play size={16} /> Start simulation
          </Link>
        }
      />
      <section className="panel workflow-panel">
        <div className="flow-grid">
          {steps.map((step, index) => (
            <div
              className={`flow-node ${index === 10 ? "evidence-node" : ""}`}
              key={step}
            >
              <div className="flow-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <strong>{step}</strong>
                <small>
                  {["Time Series", "Relationship", "Context"].includes(step)
                    ? "AI AGENT"
                    : step === "Evidence"
                      ? "BUSINESS OUTPUT"
                      : "PIPELINE STEP"}
                </small>
              </div>
              {index < steps.length - 1 && <div className="flow-arrow">↓</div>}
            </div>
          ))}
        </div>
        <div className="legend">
          <span>
            <i className="legend-agent" /> AI AGENT
          </span>
          <span>
            <i className="legend-rule" /> BUSINESS RULE
          </span>
          <span>
            <i className="legend-tool" /> TOOL
          </span>
        </div>
      </section>
    </>
  );
}
function Execution({ latest = false }: { latest?: boolean }) {
  const { executions } = useApp();
  const params = useParams();
  const execution = latest
    ? executions[0]
    : executions.find((item) => item.id === params.id);
  if (!execution)
    return (
      <>
        <PageTitle
          eyebrow="EXECUTION TRACE"
          title="No execution found"
          description="Hãy chạy một scenario trước."
        />
        <Empty text="No local execution available." />
      </>
    );
  return (
    <>
      <PageTitle
        eyebrow="EXECUTION TRACE / AUDIT"
        title="Execution trace"
        description={`${execution.request.stationId} · ${execution.request.parameter} · ${execution.request.scenario}`}
        action={
          <Link className="primary-btn" to={`/results/${execution.id}`}>
            <BarChart3 size={16} /> View result
          </Link>
        }
      />
      <div className="trace-layout">
        <section className="panel trace-panel">
          <div className="trace-summary">
            <Badge tone="success">SUCCESS</Badge>
            <strong>{execution.decision.label}</strong>
            <span>
              {Math.round(execution.decision.confidence * 100)}% confidence
            </span>
          </div>
          <div className="timeline">
            {execution.traces.map((item, index) => (
              <details
                className="trace-item"
                open={index === execution.traces.length - 1}
                key={item.id}
              >
                <summary>
                  <span className="trace-check">
                    <Check size={13} />
                  </span>
                  <strong>{item.agentCode.replaceAll("_", " ")}</strong>
                  <Badge tone={item.status === "SKIPPED" ? "muted" : "success"}>
                    {item.status}
                  </Badge>
                  <time>{item.duration ?? 0} ms</time>
                </summary>
                <div className="trace-body">
                  <div>
                    <span className="type-label agent">
                      <Bot size={12} /> AI AGENT
                    </span>
                    <small>Input / Output</small>
                    <pre>
                      {JSON.stringify(
                        {
                          input: item.inputSummary,
                          output: item.outputSummary,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                  {item.toolsUsed && item.toolsUsed.length > 0 && (
                    <div>
                      <span className="type-label tool">
                        <SlidersHorizontal size={12} /> TOOL
                      </span>
                      <small>Deterministic tool call</small>
                      <pre>{JSON.stringify(item.toolsUsed, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
        <aside className="panel audit-panel">
          <h3>Audit context</h3>
          <p>Configuration captured at execution time.</p>
          <div className="audit-list">
            <div>
              <span>Rules selected</span>
              <strong>{execution.rules.length}</strong>
            </div>
            <div>
              <span>Records analyzed</span>
              <strong>{execution.data.length}</strong>
            </div>
            <div>
              <span>Quality</span>
              <Badge tone="success">PASS</Badge>
            </div>
            <div>
              <span>Verifier</span>
              <Badge tone="success">PASS</Badge>
            </div>
          </div>
          <h4>Evidence generated</h4>
          {execution.evidence.slice(0, 5).map((evidence) => (
            <div className="evidence-mini" key={evidence.id}>
              <Badge
                tone={evidence.status === "VIOLATED" ? "danger" : "success"}
              >
                {evidence.status}
              </Badge>
              <span>{evidence.ruleId}</span>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
function Results({ detail = false }: { detail?: boolean }) {
  const { executions } = useApp();
  const params = useParams();
  const execution = detail
    ? executions.find((item) => item.id === params.id)
    : undefined;
  if (detail && !execution) return <Empty text="Result not found." />;
  if (execution) return <ResultDetail execution={execution} />;
  return (
    <>
      <PageTitle
        eyebrow="RESULTS"
        title="Review results"
        description="Các quyết định đã được verifier xác nhận trong local workspace."
      />
      <section className="panel">
        <ExecutionTable executions={executions} />
      </section>
    </>
  );
}
function ResultDetail({ execution }: { execution: AnalysisExecution }) {
  const chartData = execution.data
    .slice(0, 28)
    .map((record) => ({
      time: record.timestamp.slice(11, 16),
      value: record.values[execution.request.parameter] ?? 0,
      radiation: record.values.Radiation ?? 0,
    }));
  return (
    <>
      <PageTitle
        eyebrow="RESULT DETAIL"
        title="AI final report"
        description={`${execution.request.stationId} · ${execution.request.parameter} · ${execution.request.period.start} → ${execution.request.period.end}`}
        action={
          <Link className="secondary-btn" to={`/execution/${execution.id}`}>
            <History size={15} /> Trace
          </Link>
        }
      />
      <div className="result-hero">
        <div>
          <span className="result-kicker">FINAL LABEL</span>
          <strong>{execution.report.label}</strong>
          <p>{execution.report.summary}</p>
          <small className="report-period">
            {execution.report.anomalyPoints.length} anomaly point(s) found in
            the selected period
          </small>
        </div>
        <div className="confidence">
          <span>Confidence</span>
          <strong>{Math.round(execution.report.confidence * 100)}%</strong>
          <Badge tone="success">
            <Check size={13} /> VERIFIED
          </Badge>
        </div>
      </div>
      <div className="result-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Measurement signal</h3>
              <p>{execution.request.parameter} and context signal</p>
            </div>
            <div className="chart-legend">
              <span>
                <i className="line-main" /> {execution.request.parameter}
              </span>
              <span>
                <i className="line-secondary" /> Radiation
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" tick={{ fill: "#718096", fontSize: 11 }} />
              <YAxis tick={{ fill: "#718096", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #dbe3e8" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e05a47"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="radiation"
                stroke="#2d8f88"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className="panel evidence-panel">
          <div className="panel-head">
            <div>
              <h3>Anomaly points</h3>
              <p>Timestamp-level results from the time-series</p>
            </div>
            <Badge tone="info">
              {execution.report.anomalyPoints.length} points
            </Badge>
          </div>
          {execution.report.anomalyPoints.slice(0, 8).map((point) => (
            <div
              className="evidence-card"
              key={`${point.timestamp}-${point.parameter}`}
            >
              <div className="evidence-top">
                <Badge tone="danger">
                  <AlertTriangle size={12} /> {point.label}
                </Badge>
                <span>{point.timestamp.slice(11, 16)}</span>
              </div>
              <strong>
                {point.parameter}: {point.value}
              </strong>
              <p>{point.reason}</p>
              <small>{point.ruleIds.join(", ")}</small>
            </div>
          ))}
          {execution.report.anomalyPoints.length === 0 && (
            <Empty text="Không có điểm bất thường trong khoảng đã chọn." />
          )}
        </section>
      </div>
    </>
  );
}
function DemoData() {
  const { stations, scenarios } = useApp();
  const [scenario, setScenario] = useState(scenarios[0].id);
  return (
    <>
      <PageTitle
        eyebrow="SIMULATION / DATA"
        title="Demo data"
        description="Dataset viewer và các scenario dùng để tạo dữ liệu deterministic."
      />
      <div className="panel scenario-panel">
        <div className="panel-head">
          <div>
            <h3>Scenario presets</h3>
            <p>Chọn preset để xem mục tiêu kiểm duyệt.</p>
          </div>
          <Badge tone="info">JSON source</Badge>
        </div>
        <div className="scenario-grid">
          {scenarios.map((item) => (
            <button
              className={
                scenario === item.id
                  ? "scenario-card selected"
                  : "scenario-card"
              }
              onClick={() => setScenario(item.id)}
              key={item.id}
            >
              <span>
                {item.id === "normal-o3" ? <Check /> : <AlertTriangle />}
              </span>
              <strong>{item.name}</strong>
              <p>{item.description}</p>
              <small>
                Expected <b>{item.expectedLabel}</b>
              </small>
            </button>
          ))}
        </div>
        <div className="dataset-toolbar">
          <label>
            Station
            <select>
              <option>{stations[0].code}</option>
            </select>
          </label>
          <label>
            Interval
            <select>
              <option>5 minutes</option>
              <option>1 hour</option>
            </select>
          </label>
          <button className="secondary-btn">
            <Database size={15} /> Export JSON
          </button>
        </div>
      </div>
    </>
  );
}
function SettingsPage() {
  const { settings, updateSettings, reset } = useApp();
  return (
    <>
      <PageTitle
        eyebrow="SYSTEM"
        title="Settings"
        description="Điều chỉnh cách simulation chạy trong trình duyệt."
      />
      <section className="panel settings-panel">
        <label>
          Simulation speed
          <select
            value={settings.simulationSpeed}
            onChange={(event) =>
              updateSettings({
                ...settings,
                simulationSpeed: event.target
                  .value as typeof settings.simulationSpeed,
              })
            }
          >
            <option>Fast</option>
            <option>Normal</option>
            <option>Slow</option>
          </select>
        </label>
        <label>
          Verifier max retry
          <input
            type="number"
            min="0"
            max="5"
            value={settings.verifierMaxRetry}
            onChange={(event) =>
              updateSettings({
                ...settings,
                verifierMaxRetry: Number(event.target.value),
              })
            }
          />
        </label>
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={settings.autoSave}
            onChange={(event) =>
              updateSettings({ ...settings, autoSave: event.target.checked })
            }
          />{" "}
          Auto save configuration
        </label>
        <hr />
        <button
          className="secondary-btn danger-btn"
          onClick={() => {
            if (window.confirm("Reset toàn bộ dữ liệu demo?")) reset();
          }}
        >
          <RotateCcw size={15} /> Reset Demo Data
        </button>
      </section>
    </>
  );
}
function AppRoutes() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/parameters" element={<Stations parameters />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/demo-data" element={<DemoData />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/execution/latest" element={<Execution latest />} />
        <Route path="/execution/:id" element={<Execution />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results/:id" element={<Results detail />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Shell>
  );
}
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
export default function RootApp() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
