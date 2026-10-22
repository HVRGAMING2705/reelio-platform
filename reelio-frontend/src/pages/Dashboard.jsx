import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  createSeedWorkspace,
  inr,
  loadWorkspace,
  saveWorkspace,
} from "../demoStore";

const CONTENT_STAGES = ["Idea", "Scripting", "Filming", "Editing", "Review", "Scheduled", "Published"];
const TABS = [
  ["overview", "Overview"],
  ["clients", "Clients"],
  ["content", "Content pipeline"],
  ["campaigns", "Campaigns"],
];

function todayLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());
}

function makeLocalId(prefix, seed) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}-${uuid}`;
  const slug = String(seed || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${prefix}-${slug}-${String(seed || "").length}`;
}

export default function Dashboard({ user }) {
  const [workspace, setWorkspace] = useState(() => loadWorkspace(user));
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", niche: "", nextStep: "", deliverables: "" });
  const [contentForm, setContentForm] = useState({ title: "", client: "Rithm Cafe", format: "Reel", due: "Tomorrow · 10:00 AM", status: "Idea" });
  const [campaignForm, setCampaignForm] = useState({ name: "", client: "Rithm Cafe", objective: "", budget: "50000" });
  const toastTimer = useRef(null);

  useEffect(() => {
    saveWorkspace(user, workspace);
  }, [user, workspace]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const metrics = useMemo(() => {
    const activeCampaigns = workspace.campaigns.filter((item) => item.status === "Active");
    return {
      clients: workspace.clients.length,
      activeClients: workspace.clients.filter((item) => item.progress < 100).length,
      contentMoving: workspace.contentItems.filter((item) => item.status !== "Published").length,
      scheduled: workspace.contentItems.filter((item) => item.status === "Scheduled").length,
      campaigns: activeCampaigns.length,
      leads: workspace.campaigns.reduce((sum, item) => sum + Number(item.leads || 0), 0),
      budget: workspace.campaigns.reduce((sum, item) => sum + Number(item.budget || 0), 0),
      spent: workspace.campaigns.reduce((sum, item) => sum + Number(item.spent || 0), 0),
      tasksDone: workspace.tasks.filter((item) => item.done).length,
    };
  }, [workspace]);

  if (!user) return <Navigate to="/auth" replace />;

  function announce(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3400);
  }

  function addActivity(current, message) {
    return [message, ...current.activity.filter((item) => item !== message)].slice(0, 8);
  }

  function mutate(updater, message) {
    setWorkspace((current) => {
      const next = updater(current);
      return { ...next, activity: addActivity(next, message) };
    });
    announce(message);
  }

  function openCampaignCreator() {
    setActiveTab("campaigns");
    setShowCampaignForm(true);
  }

  function toggleTask(taskId) {
    const task = workspace.tasks.find((item) => item.id === taskId);
    mutate(
      (current) => ({
        ...current,
        tasks: current.tasks.map((item) =>
          item.id === taskId ? { ...item, done: !item.done } : item,
        ),
      }),
      task?.done ? `Task reopened: ${task.label}` : `Task completed: ${task?.label}`,
    );
  }

  function submitClient(event) {
    event.preventDefault();
    if (clientForm.name.trim().length < 2 || clientForm.niche.trim().length < 2) {
      announce("Add a client name and niche before saving.");
      return;
    }
    const client = {
      id: makeLocalId("client", clientForm.name),
      name: clientForm.name.trim(),
      niche: clientForm.niche.trim(),
      stage: "Discovery",
      health: "New",
      progress: 18,
      nextStep: clientForm.nextStep.trim() || "Book the positioning call",
      deliverables: clientForm.deliverables.trim() || "Starter content plan",
    };
    mutate(
      (current) => ({ ...current, clients: [client, ...current.clients] }),
      `${client.name} added to the workspace.`,
    );
    setClientForm({ name: "", niche: "", nextStep: "", deliverables: "" });
    setShowClientForm(false);
  }

  function completeClientCheckin(client) {
    mutate(
      (current) => ({
        ...current,
        clients: current.clients.map((item) =>
          item.id === client.id
            ? {
                ...item,
                health: "On track",
                progress: Math.min(96, item.progress + 4),
                nextStep: "Review the next deliverable in this sprint",
              }
            : item,
        ),
      }),
      `${client.name} check-in completed for ${todayLabel()}.`,
    );
  }

  function submitContent(event) {
    event.preventDefault();
    if (contentForm.title.trim().length < 4) {
      announce("Give the content item a clearer title before adding it.");
      return;
    }
    const item = {
      id: makeLocalId("content", contentForm.title),
      ...contentForm,
      title: contentForm.title.trim(),
      owner: "Reelio team",
    };
    mutate(
      (current) => ({ ...current, contentItems: [item, ...current.contentItems] }),
      `${item.title} added to the content pipeline.`,
    );
    setContentForm({ title: "", client: "Rithm Cafe", format: "Reel", due: "Tomorrow · 10:00 AM", status: "Idea" });
    setShowContentForm(false);
  }

  function advanceContent(item) {
    if (item.status === "Published") {
      const copy = {
        ...item,
        id: makeLocalId("content-follow-up", item.title),
        title: `${item.title} — follow-up`,
        status: "Idea",
        due: "Next sprint",
      };
      mutate(
        (current) => ({ ...current, contentItems: [copy, ...current.contentItems] }),
        `A follow-up brief was created from ${item.title}.`,
      );
      return;
    }
    const nextStatus = CONTENT_STAGES[CONTENT_STAGES.indexOf(item.status) + 1] || "Published";
    mutate(
      (current) => ({
        ...current,
        contentItems: current.contentItems.map((content) =>
          content.id === item.id ? { ...content, status: nextStatus } : content,
        ),
      }),
      `${item.title} moved to ${nextStatus}.`,
    );
  }

  function submitCampaign(event) {
    event.preventDefault();
    const budget = Number(campaignForm.budget);
    if (campaignForm.name.trim().length < 4 || !budget || budget < 1000) {
      announce("Add a campaign name and a budget of at least ₹1,000.");
      return;
    }
    const campaign = {
      id: makeLocalId("campaign", campaignForm.name),
      name: campaignForm.name.trim(),
      client: campaignForm.client,
      objective: campaignForm.objective.trim() || "Build reach and qualified enquiries for the selected client.",
      budget,
      spent: 0,
      reach: "0",
      leads: 0,
      status: "Active",
      progress: 4,
    };
    mutate(
      (current) => ({ ...current, campaigns: [campaign, ...current.campaigns] }),
      `${campaign.name} created and set active.`,
    );
    setCampaignForm({ name: "", client: "Rithm Cafe", objective: "", budget: "50000" });
    setShowCampaignForm(false);
  }

  function toggleCampaign(campaign) {
    const nextStatus = campaign.status === "Active" ? "Paused" : "Active";
    mutate(
      (current) => ({
        ...current,
        campaigns: current.campaigns.map((item) =>
          item.id === campaign.id ? { ...item, status: nextStatus } : item,
        ),
      }),
      `${campaign.name} is now ${nextStatus.toLowerCase()}.`,
    );
  }

  function exportSnapshot() {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reelio-demo-workspace.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    announce("Workspace snapshot downloaded as JSON.");
  }

  function resetWorkspace() {
    const fresh = createSeedWorkspace(user);
    setWorkspace(fresh);
    saveWorkspace(user, fresh);
    setShowResetConfirm(false);
    setActiveTab("overview");
    announce("Demo workspace reset to the original seeded example.");
  }

  return (
    <main className="dashboard">
      <header className="dashboard-head">
        <div>
          <div className="demo-badge">Demo workspace · sample operating data</div>
          <h1>Workspace</h1>
          <p>Welcome, {user.name || user.email}. This is a complete local demonstration of the Reelio operating system.</p>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="btn black-btn" onClick={exportSnapshot}>Export snapshot</button>
          <button type="button" className="btn white-btn" onClick={openCampaignCreator}>Create campaign</button>
        </div>
      </header>

      {toast && <div className="toast" role="status">{toast}</div>}

      <nav className="dashboard-tabs" aria-label="Workspace sections">
        {TABS.map(([key, label]) => (
          <button
            type="button"
            key={key}
            className={activeTab === key ? "active" : ""}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <section className="dashboard-view">
          <div className="metric-grid">
            {[
              ["Active clients", metrics.activeClients, `${metrics.clients} total in the workspace`],
              ["Content moving", metrics.contentMoving, `${metrics.scheduled} already scheduled`],
              ["Live campaigns", metrics.campaigns, `${inr(metrics.spent)} of ${inr(metrics.budget)} deployed`],
              ["Qualified leads", metrics.leads, "Across the seeded campaigns"],
            ].map(([label, value, text]) => (
              <article className="metric-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{text}</p>
              </article>
            ))}
          </div>

          <div className="overview-grid">
            <article className="workspace-panel sprint-panel">
              <div className="panel-head"><div><span>Sprint focus</span><h3>Finish the festive content cycle</h3></div><strong>{metrics.tasksDone}/{workspace.tasks.length} tasks</strong></div>
              <p>The immediate goal is to move review items into scheduled posts, close creator inputs, and keep two paid campaigns learning without creative bottlenecks.</p>
              <div className="task-list">
                {workspace.tasks.map((task) => (
                  <label key={task.id} className={task.done ? "task done" : "task"}>
                    <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                    <span>{task.label}</span>
                  </label>
                ))}
              </div>
            </article>

            <article className="workspace-panel">
              <div className="panel-head"><div><span>Coming up</span><h3>Content calendar</h3></div><button type="button" className="text-button" onClick={() => setActiveTab("content")}>Open pipeline</button></div>
              <div className="calendar-list">
                {workspace.contentItems.slice(0, 5).map((item) => (
                  <div key={item.id}><time>{item.due}</time><strong>{item.title}</strong><span>{item.client} · {item.status}</span></div>
                ))}
              </div>
            </article>
          </div>

          <div className="overview-grid lower">
            <article className="workspace-panel">
              <div className="panel-head"><div><span>Campaign pulse</span><h3>What is live now</h3></div><button type="button" className="text-button" onClick={() => setActiveTab("campaigns")}>Manage campaigns</button></div>
              {workspace.campaigns.map((campaign) => (
                <div className="campaign-pulse" key={campaign.id}>
                  <div><strong>{campaign.name}</strong><span>{campaign.client} · {campaign.status}</span></div>
                  <div className="progress-track"><span style={{ width: `${campaign.progress}%` }}></span></div>
                  <b>{campaign.progress}%</b>
                </div>
              ))}
            </article>

            <article className="workspace-panel activity-panel">
              <div className="panel-head"><div><span>Recent activity</span><h3>Workspace log</h3></div></div>
              <ul>
                {workspace.activity.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
              </ul>
              <button type="button" className="btn black-btn" onClick={() => setShowResetConfirm(true)}>Reset demo data</button>
            </article>
          </div>
        </section>
      )}

      {activeTab === "clients" && (
        <section className="dashboard-view">
          <div className="view-head">
            <div><span>Client portfolio</span><h2>Every account has a next step.</h2></div>
            <button type="button" className="btn white-btn" onClick={() => setShowClientForm((current) => !current)}>{showClientForm ? "Close form" : "Add client"}</button>
          </div>

          {showClientForm && (
            <form className="workspace-form" onSubmit={submitClient}>
              <label>Client name<input value={clientForm.name} onChange={(event) => setClientForm({ ...clientForm, name: event.target.value })} placeholder="e.g. Bloom Salon" /></label>
              <label>Niche / location<input value={clientForm.niche} onChange={(event) => setClientForm({ ...clientForm, niche: event.target.value })} placeholder="e.g. Salon · Hyderabad" /></label>
              <label>Next step<input value={clientForm.nextStep} onChange={(event) => setClientForm({ ...clientForm, nextStep: event.target.value })} placeholder="e.g. Approve launch calendar" /></label>
              <label>Deliverables<input value={clientForm.deliverables} onChange={(event) => setClientForm({ ...clientForm, deliverables: event.target.value })} placeholder="e.g. 3 reels · 4 stories" /></label>
              <button type="submit" className="btn white-btn">Save client</button>
            </form>
          )}

          <div className="client-grid">
            {workspace.clients.map((client) => (
              <article className="client-card" key={client.id}>
                <div className="card-topline"><span>{client.stage}</span><b>{client.health}</b></div>
                <h3>{client.name}</h3>
                <p>{client.niche}</p>
                <div className="progress-track large"><span style={{ width: `${client.progress}%` }}></span></div>
                <div className="client-meta"><span>Delivery progress</span><strong>{client.progress}%</strong></div>
                <dl>
                  <div><dt>Next step</dt><dd>{client.nextStep}</dd></div>
                  <div><dt>Deliverables</dt><dd>{client.deliverables}</dd></div>
                </dl>
                <button type="button" className="btn black-btn full" onClick={() => completeClientCheckin(client)}>Complete check-in</button>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "content" && (
        <section className="dashboard-view">
          <div className="view-head">
            <div><span>Production board</span><h2>Move every idea toward published.</h2></div>
            <button type="button" className="btn white-btn" onClick={() => setShowContentForm((current) => !current)}>{showContentForm ? "Close form" : "Add content"}</button>
          </div>

          {showContentForm && (
            <form className="workspace-form" onSubmit={submitContent}>
              <label>Content title<input value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })} placeholder="e.g. Founder explains the new menu" /></label>
              <label>Client<select value={contentForm.client} onChange={(event) => setContentForm({ ...contentForm, client: event.target.value })}>{workspace.clients.map((client) => <option key={client.id}>{client.name}</option>)}</select></label>
              <label>Format<select value={contentForm.format} onChange={(event) => setContentForm({ ...contentForm, format: event.target.value })}><option>Reel</option><option>Carousel</option><option>Story set</option><option>Creator post</option><option>Ad creative</option></select></label>
              <label>Due<input value={contentForm.due} onChange={(event) => setContentForm({ ...contentForm, due: event.target.value })} /></label>
              <label>Starting stage<select value={contentForm.status} onChange={(event) => setContentForm({ ...contentForm, status: event.target.value })}>{CONTENT_STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
              <button type="submit" className="btn white-btn">Add to pipeline</button>
            </form>
          )}

          <div className="pipeline-board">
            {CONTENT_STAGES.map((stage) => {
              const items = workspace.contentItems.filter((item) => item.status === stage);
              return (
                <div className="pipeline-column" key={stage}>
                  <div className="pipeline-head"><h3>{stage}</h3><span>{items.length}</span></div>
                  {items.length === 0 && <p className="empty-column">No items at this stage.</p>}
                  {items.map((item) => (
                    <article className="content-card" key={item.id}>
                      <span>{item.format} · {item.client}</span>
                      <h4>{item.title}</h4>
                      <p>{item.due}<br />Owner: {item.owner}</p>
                      <button type="button" onClick={() => advanceContent(item)}>
                        {item.status === "Published" ? "Create follow-up" : `Move to ${CONTENT_STAGES[CONTENT_STAGES.indexOf(item.status) + 1]}`}
                      </button>
                    </article>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "campaigns" && (
        <section className="dashboard-view">
          <div className="view-head">
            <div><span>Campaign control</span><h2>Creative and media, visible together.</h2></div>
            <button type="button" className="btn white-btn" onClick={() => setShowCampaignForm((current) => !current)}>{showCampaignForm ? "Close form" : "Create campaign"}</button>
          </div>

          {showCampaignForm && (
            <form className="workspace-form" onSubmit={submitCampaign}>
              <label>Campaign name<input value={campaignForm.name} onChange={(event) => setCampaignForm({ ...campaignForm, name: event.target.value })} placeholder="e.g. Weekend Brunch Push" /></label>
              <label>Client<select value={campaignForm.client} onChange={(event) => setCampaignForm({ ...campaignForm, client: event.target.value })}>{workspace.clients.map((client) => <option key={client.id}>{client.name}</option>)}</select></label>
              <label>Objective<input value={campaignForm.objective} onChange={(event) => setCampaignForm({ ...campaignForm, objective: event.target.value })} placeholder="What should this campaign achieve?" /></label>
              <label>Budget (₹)<input type="number" min="1000" step="500" value={campaignForm.budget} onChange={(event) => setCampaignForm({ ...campaignForm, budget: event.target.value })} /></label>
              <button type="submit" className="btn white-btn">Create active campaign</button>
            </form>
          )}

          <div className="campaign-grid">
            {workspace.campaigns.map((campaign) => (
              <article className="campaign-card" key={campaign.id}>
                <div className="card-topline"><span>{campaign.client}</span><b className={campaign.status === "Active" ? "status-active" : ""}>{campaign.status}</b></div>
                <h3>{campaign.name}</h3>
                <p>{campaign.objective}</p>
                <div className="campaign-stats">
                  <span>Budget<strong>{inr(campaign.budget)}</strong></span>
                  <span>Spent<strong>{inr(campaign.spent)}</strong></span>
                  <span>Reach<strong>{campaign.reach}</strong></span>
                  <span>Leads<strong>{campaign.leads}</strong></span>
                </div>
                <div className="progress-track large"><span style={{ width: `${campaign.progress}%` }}></span></div>
                <div className="client-meta"><span>Campaign progress</span><strong>{campaign.progress}%</strong></div>
                <button type="button" className="btn black-btn full" onClick={() => toggleCampaign(campaign)}>
                  {campaign.status === "Active" ? "Pause campaign" : "Resume campaign"}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {showResetConfirm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowResetConfirm(false)}>
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title" onMouseDown={(event) => event.stopPropagation()}>
            <span>Reset demo data?</span>
            <h3 id="reset-title">Restore the original seeded workspace</h3>
            <p>This replaces clients, pipeline items, campaigns, tasks and activity saved for this demo account in this browser. Your demo login stays signed in.</p>
            <div>
              <button type="button" className="btn black-btn" onClick={() => setShowResetConfirm(false)}>Keep my changes</button>
              <button type="button" className="btn danger-btn" onClick={resetWorkspace}>Reset workspace</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
