"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "dmark:visited-projects";
const STORAGE_EVENT = "dmark:visited-projects-change";

type StoredProject = {
  token: string;
  name: string;
  lastOpenedAt: number;
};

type DocsProjectSwitcherProps = {
  currentProject: {
    token: string;
    name: string;
  };
};

function parseProjectsSnapshot(snapshot: string) {
  try {
    const projects = JSON.parse(snapshot) as StoredProject[];

    return Array.isArray(projects)
      ? projects.filter(
          (project) =>
            typeof project.token === "string" &&
            typeof project.name === "string" &&
            typeof project.lastOpenedAt === "number"
        )
      : [];
  } catch {
    return [];
  }
}

function getLocalStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function getProjectsSnapshot() {
  return getLocalStorage()?.getItem(STORAGE_KEY) ?? "[]";
}

function getServerProjectsSnapshot() {
  return "[]";
}

function subscribeProjects(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

function rememberProject(project: DocsProjectSwitcherProps["currentProject"]) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  const projects = parseProjectsSnapshot(getProjectsSnapshot()).filter(
    (item) => item.token !== project.token
  );

  storage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      {
        token: project.token,
        name: project.name,
        lastOpenedAt: Date.now()
      },
      ...projects
    ])
  );
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function rememberOnlyProject(project: DocsProjectSwitcherProps["currentProject"]) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  storage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      {
        token: project.token,
        name: project.name,
        lastOpenedAt: Date.now()
      }
    ])
  );
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function DocsProjectSwitcher({ currentProject }: DocsProjectSwitcherProps) {
  const { name, token } = currentProject;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const projectsSnapshot = useSyncExternalStore(
    subscribeProjects,
    getProjectsSnapshot,
    getServerProjectsSnapshot
  );
  const projects = useMemo(() => {
    const byToken = new Map<string, StoredProject>();

    for (const project of parseProjectsSnapshot(projectsSnapshot)) {
      byToken.set(project.token, project);
    }

    byToken.set(token, {
      token,
      name,
      lastOpenedAt: Number.MAX_SAFE_INTEGER
    });

    return Array.from(byToken.values()).sort((left, right) => right.lastOpenedAt - left.lastOpenedAt);
  }, [name, token, projectsSnapshot]);
  const selectedToken = pendingToken ?? token;
  const isLoading = isPending || pendingToken !== null;

  useEffect(() => {
    rememberProject({ name, token });
  }, [name, token]);

  return (
    <div className="project-select">
      <label className="project-select-field">
        <span>项目</span>
        <span className="project-select-control">
          <select
            aria-busy={isLoading}
            value={selectedToken}
            onChange={(event) => {
              const nextToken = event.target.value;

              if (nextToken === token) {
                setPendingToken(null);
                return;
              }

              setPendingToken(nextToken);
              startTransition(() => {
                router.push(`/docs/${nextToken}`);
              });
            }}
          >
            {projects.map((project) => (
              <option key={project.token} value={project.token}>
                {project.name}
              </option>
            ))}
          </select>
        </span>
      </label>
      {isLoading ? (
        <span className="project-select-status" role="status" aria-live="polite">
          打开中
        </span>
      ) : null}
      {projects.length > 1 ? (
        <button
          className="project-clear-button"
          type="button"
          onClick={() => {
            setPendingToken(null);
            rememberOnlyProject({ name, token });
          }}
        >
          清除记录
        </button>
      ) : null}
    </div>
  );
}
