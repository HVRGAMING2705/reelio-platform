import { useEffect, useState } from "react";
import { getPortfolio, getMyProjects } from "../api";
import { useAuth } from "../auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getPortfolio().then((res) => setPortfolio(res.portfolio || [])).catch(() => {});
    getMyProjects().then((res) => setProjects(res.projects || [])).catch(() => {});
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div>
          <h1>Workspace</h1>
          <p className="muted">Welcome back, {user?.email}</p>
        </div>

        <button className="btn btn-dark">Create Project</button>
      </div>

      <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="grid">
          <div className="card">
            <div className="icon"></div>
            <h3>Portfolio</h3>
            <p>{portfolio.length} published assets connected to your platform.</p>
          </div>

          <div className="card">
            <div className="icon"></div>
            <h3>Projects</h3>
            <p>{projects.length} active projects in your workspace.</p>
          </div>

          <div className="card">
            <div className="icon"></div>
            <h3>Account</h3>
            <p>Your workspace is authenticated and secured.</p>
          </div>
        </div>
      </section>
    </div>
  );
}