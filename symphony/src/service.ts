import fs from 'node:fs';
import path from 'node:path';
import type { Issue, LoadedWorkflow, Logger, RetryEntry } from './types.js';
import { WorkflowStore } from './workflow-store.js';
import { LinearTracker } from './tracker/linear.js';
import { WorkspaceManager } from './workspace.js';
import { AgentRunner } from './agent-runner.js';
import { ensureDir, sleep } from './utils.js';

interface RunningEntry {
  issue: Issue;
  attempt: number;
  abortController: AbortController;
}

interface CompletedRunEntry {
  issueId: string;
  identifier: string;
  fingerprint: string;
  completedAt: string;
}

interface CompletedRunsFile {
  completedRuns: Record<string, CompletedRunEntry>;
}

function computeRetryDelay(workflow: LoadedWorkflow, attempt: number): number {
  const raw = workflow.config.agent.retryBaseDelayMs * (2 ** Math.max(0, attempt - 1));
  return Math.min(raw, workflow.config.agent.retryMaxDelayMs);
}

export function buildIssueDispatchFingerprint(issue: Issue): string {
  return JSON.stringify({
    updatedAt: issue.updatedAt ?? null,
    stateId: issue.state.id ?? null,
    stateName: issue.state.name,
    branchName: issue.branchName ?? null,
    description: issue.description ?? null,
    labels: issue.labels,
  });
}

export class SymphonyService {
  private stopped = false;
  private readonly running = new Map<string, RunningEntry>();
  private readonly retries = new Map<string, RetryEntry>();
  private readonly completedRuns = new Map<string, CompletedRunEntry>();
  private completedRunsPath: string | null = null;

  constructor(
    private readonly workflowStore: WorkflowStore,
    private readonly logger: Logger,
  ) {}

  stop(): void {
    this.stopped = true;
    for (const running of this.running.values()) {
      running.abortController.abort();
    }
  }

  private getCompletedRunsPath(workflow: LoadedWorkflow): string {
    return path.resolve(workflow.config.workspace.root, '..', 'run-state.json');
  }

  private loadCompletedRuns(workflow: LoadedWorkflow): void {
    const nextPath = this.getCompletedRunsPath(workflow);
    if (this.completedRunsPath === nextPath) {
      return;
    }

    this.completedRuns.clear();
    this.completedRunsPath = nextPath;

    if (!fs.existsSync(nextPath)) {
      return;
    }

    try {
      const raw = fs.readFileSync(nextPath, 'utf8');
      const parsed = JSON.parse(raw) as CompletedRunsFile;
      for (const entry of Object.values(parsed.completedRuns ?? {})) {
        this.completedRuns.set(entry.issueId, entry);
      }
    } catch (error) {
      this.logger.warn('completed_runs.load_failed', {
        path: nextPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private writeCompletedRuns(): void {
    if (!this.completedRunsPath) {
      return;
    }

    ensureDir(path.dirname(this.completedRunsPath));
    const payload: CompletedRunsFile = {
      completedRuns: Object.fromEntries(
        [...this.completedRuns.entries()].map(([issueId, entry]) => [issueId, entry]),
      ),
    };
    fs.writeFileSync(this.completedRunsPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }

  private markIssueCompleted(issue: Issue): void {
    const entry: CompletedRunEntry = {
      issueId: issue.id,
      identifier: issue.identifier,
      fingerprint: buildIssueDispatchFingerprint(issue),
      completedAt: new Date().toISOString(),
    };
    this.completedRuns.set(issue.id, entry);
    this.writeCompletedRuns();
  }

  private clearCompletedIssue(issueId: string): void {
    if (!this.completedRuns.delete(issueId)) {
      return;
    }
    this.writeCompletedRuns();
  }

  private async cleanupTerminalWorkspaces(workflow: LoadedWorkflow, tracker: LinearTracker, workspaceManager: WorkspaceManager): Promise<void> {
    const terminalIssues = await tracker.listTerminalIssues(
      workflow.config.tracker.projectSlug,
      workflow.config.tracker.terminalStates,
    );

    for (const issue of terminalIssues) {
      await workspaceManager.removeWorkspace(issue.identifier);
      this.retries.delete(issue.id);
      this.clearCompletedIssue(issue.id);
    }
  }

  private scheduleRetry(workflow: LoadedWorkflow, issue: Issue, attempt: number, error: string | null): void {
    const delay = computeRetryDelay(workflow, attempt);
    this.retries.set(issue.id, {
      issueId: issue.id,
      identifier: issue.identifier,
      attempt,
      dueAtMs: Date.now() + delay,
      error,
    });
    this.logger.warn('issue.retry_scheduled', {
      issue: issue.identifier,
      attempt,
      delayMs: delay,
      error,
    });
  }

  private canDispatch(issue: Issue): { allowed: boolean; attempt: number } {
    if (this.running.has(issue.id)) {
      return { allowed: false, attempt: 0 };
    }

    const retry = this.retries.get(issue.id);
    if (!retry) {
      return { allowed: true, attempt: 0 };
    }

    if (retry.dueAtMs > Date.now()) {
      return { allowed: false, attempt: retry.attempt };
    }

    return { allowed: true, attempt: retry.attempt };
  }

  private async launchIssue(workflow: LoadedWorkflow, tracker: LinearTracker, workspaceManager: WorkspaceManager, issue: Issue, attempt: number): Promise<void> {
    const abortController = new AbortController();
    this.running.set(issue.id, { issue, attempt, abortController });
    this.retries.delete(issue.id);

    try {
      const workspace = await workspaceManager.ensureWorkspace(issue);
      this.logger.info('issue.run_started', {
        issue: issue.identifier,
        attempt,
        workspacePath: workspace.path,
      });
      const runner = new AgentRunner(workflow, this.logger);
      const result = await runner.run(issue, workspace, attempt, abortController.signal);
      this.logger.info('issue.run_completed', {
        issue: issue.identifier,
        attempt,
        status: result.status,
        threadId: result.threadId,
        turnId: result.turnId,
        error: result.error ?? null,
      });
      if (result.status !== 'completed') {
        this.scheduleRetry(workflow, issue, attempt + 1, result.error ?? null);
      } else {
        this.markIssueCompleted(issue);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('issue.run_failed', {
        issue: issue.identifier,
        attempt,
        error: message,
      });
      this.scheduleRetry(workflow, issue, attempt + 1, message);
    } finally {
      this.running.delete(issue.id);
    }
  }

  async start(): Promise<void> {
    while (!this.stopped) {
      const workflow = this.workflowStore.reloadIfChanged();
      this.loadCompletedRuns(workflow);
      const tracker = new LinearTracker(workflow.config.tracker.apiKey, this.logger);
      const workspaceManager = new WorkspaceManager(workflow.config, this.logger);

      try {
        await this.cleanupTerminalWorkspaces(workflow, tracker, workspaceManager);
        const issues = await tracker.listActiveIssues(
          workflow.config.tracker.projectSlug,
          workflow.config.tracker.activeStates,
        );

        const activeIssueIds = new Set(issues.map((issue) => issue.id));
        for (const [issueId, running] of this.running.entries()) {
          if (!activeIssueIds.has(issueId)) {
            this.logger.warn('issue.no_longer_active', { issue: running.issue.identifier });
            running.abortController.abort();
          }
        }

        let availableSlots = workflow.config.agent.maxConcurrentAgents - this.running.size;
        for (const issue of issues) {
          if (availableSlots <= 0) {
            break;
          }
          const completed = this.completedRuns.get(issue.id);
          const fingerprint = buildIssueDispatchFingerprint(issue);
          if (completed && completed.fingerprint === fingerprint) {
            continue;
          }
          if (completed && completed.fingerprint !== fingerprint) {
            this.clearCompletedIssue(issue.id);
          }
          const gate = this.canDispatch(issue);
          if (!gate.allowed) {
            continue;
          }
          availableSlots -= 1;
          void this.launchIssue(workflow, tracker, workspaceManager, issue, gate.attempt);
        }
      } catch (error) {
        this.logger.error('service.poll_failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      await sleep(this.workflowStore.get().config.polling.intervalMs);
    }
  }
}
