"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
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

function forgetProject(token: string) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  storage.setItem(
    STORAGE_KEY,
    JSON.stringify(parseProjectsSnapshot(getProjectsSnapshot()).filter((project) => project.token !== token))
  );
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function DocsProjectSwitcher({ currentProject }: DocsProjectSwitcherProps) {
  const { name, token } = currentProject;
  const router = useRouter();
  const switcherRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [confirmingToken, setConfirmingToken] = useState<string | null>(null);
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setConfirmingToken(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setConfirmingToken(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="project-switcher" ref={switcherRef}>
      <button
        aria-busy={isLoading}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="project-switcher-trigger"
        type="button"
        onClick={() => {
          setIsOpen((value) => !value);
          setConfirmingToken(null);
        }}
      >
        <span className="project-switcher-name">{name}</span>
        <span aria-hidden="true" className="project-switcher-caret" />
      </button>
      {isLoading ? (
        <span className="project-switcher-status" role="status" aria-live="polite">
          打开中
        </span>
      ) : null}
      {isOpen ? (
        <div className="project-switcher-menu" aria-label="切换项目">
          {projects.map((project) => {
            const isCurrent = project.token === selectedToken;
            const isConfirming = confirmingToken === project.token;

            return (
              <div className="project-switcher-item" key={project.token}>
                {isConfirming ? (
                  <div className="project-delete-confirm" role="group" aria-label={`删除 ${project.name} 的访问记录`}>
                    <span>删除这条访问记录？</span>
                    <button
                      className="project-delete-cancel"
                      type="button"
                      onClick={() => setConfirmingToken(null)}
                    >
                      取消
                    </button>
                    <button
                      className="project-delete-confirm-button"
                      type="button"
                      onClick={() => {
                        setPendingToken(null);
                        setConfirmingToken(null);
                        forgetProject(project.token);
                      }}
                    >
                      删除
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="project-switcher-option"
                      disabled={isCurrent}
                      type="button"
                      onClick={() => {
                        if (project.token === token) {
                          setPendingToken(null);
                          setIsOpen(false);
                          return;
                        }

                        setPendingToken(project.token);
                        setIsOpen(false);
                        startTransition(() => {
                          router.push(`/docs/${project.token}`);
                        });
                      }}
                    >
                      <span aria-hidden="true" className="project-switcher-check">
                        {isCurrent ? "✓" : ""}
                      </span>
                      <span className="project-switcher-option-name">{project.name}</span>
                    </button>
                    {project.token === token ? (
                      <span className="project-switcher-current">当前</span>
                    ) : (
                      <button
                        className="project-delete-button"
                        type="button"
                        onClick={() => setConfirmingToken(project.token)}
                      >
                        删除
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
