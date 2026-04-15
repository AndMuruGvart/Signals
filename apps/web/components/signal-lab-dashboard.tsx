"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  Database,
  Gauge,
  LoaderCircle,
  Logs,
  ShieldAlert,
} from "lucide-react";
import { startTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { ObsLinkCard } from "@/components/obs-link-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listScenarioRuns,
  runScenario,
  type ScenarioPayload,
  type ScenarioRun,
} from "@/lib/api";

const scenarioOptions = [
  {
    value: "traffic_burst",
    label: "traffic_burst",
    helper:
      "Healthy synthetic burst that should create logs and success metrics.",
  },
  {
    value: "latency_spike",
    label: "latency_spike",
    helper: "Longer-running path to surface duration metrics in Grafana.",
  },
  {
    value: "system_error",
    label: "system_error",
    helper:
      "Intentional failure to produce an error signal in Sentry-compatible storage.",
  },
] as const;

const intensityOptions = ["low", "medium", "high"] as const;

const formSchema = z.object({
  scenario: z.enum(["traffic_burst", "latency_spike", "system_error"]),
  intensity: z.enum(["low", "medium", "high"]),
  note: z.string().max(180).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const obsLinks = [
  {
    title: "Prometheus Metrics",
    description:
      "Raw metrics endpoint for the API service. Use this to validate that counters moved after a run.",
    href:
      process.env.NEXT_PUBLIC_PROMETHEUS_METRICS_URL ??
      "http://localhost:3001/metrics",
    eyebrow: "metrics",
  },
  {
    title: "Grafana Dashboard",
    description:
      "Provisioned dashboard with scenario volume, duration, and logs panels already wired to Prometheus and Loki.",
    href: "/grafana",
    eyebrow: "dashboard",
  },
  {
    title: "Loki Viewer",
    description:
      "Queryable HTML viewer backed by Loki so logs are inspectable without extra setup.",
    href: process.env.NEXT_PUBLIC_LOKI_VIEWER_URL ?? "http://localhost:3100",
    eyebrow: "logs",
  },
  {
    title: "Error Inbox",
    description:
      "Sentry-compatible local sink that stores captured exception envelopes for the demo.",
    href: "/sentry",
    eyebrow: "errors",
  },
] as const;

function statusTone(status: ScenarioRun["status"]) {
  if (status === "succeeded") {
    return "success" as const;
  }

  if (status === "failed") {
    return "destructive" as const;
  }

  return "secondary" as const;
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const seconds = Math.max(Math.round(diff / 1000), 0);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function SignalLabDashboard() {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scenario: "system_error",
      intensity: "medium",
      note: "Interview smoke test",
    },
  });

  const historyQuery = useQuery({
    queryKey: ["scenario-history"],
    queryFn: () => listScenarioRuns(12),
  });

  const mutation = useMutation({
    mutationFn: (payload: ScenarioPayload) => runScenario(payload),
    onSuccess: (result) => {
      startTransition(() => {
        form.reset({
          scenario: result.scenario,
          intensity: result.intensity,
          note: "",
        });
      });

      void queryClient.invalidateQueries({ queryKey: ["scenario-history"] });

      toast.success(
        `Scenario ${result.scenario} finished with status ${result.status}.`,
      );
    },
    onError: () => {
      toast.error(
        "Scenario request failed before the API could persist the run.",
      );
    },
  });

  const selectedScenario = useWatch({
    control: form.control,
    name: "scenario",
  });
  const selectedMeta =
    scenarioOptions.find((option) => option.value === selectedScenario) ??
    scenarioOptions[0];

  return (
    <main className="signal-grid flex-1">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <Card className="signal-surface overflow-hidden">
            <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
              <div className="space-y-5">
                <div className="inline-flex items-center rounded-full border border-border bg-white/45 px-3 py-1 text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
                  Signal Lab
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                    Launch synthetic incidents and verify the whole
                    observability chain in one screen.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Each run persists in PostgreSQL through Prisma, emits
                    Prometheus metrics, ships structured logs to Loki, and
                    pushes intentional failures into a Sentry-compatible inbox.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Badge variant="outline" className="status-dot text-accent">
                    Next.js + shadcn/ui
                  </Badge>
                  <Badge variant="outline" className="status-dot text-primary">
                    NestJS + Prisma
                  </Badge>
                  <Badge variant="outline" className="status-dot text-warning">
                    Prometheus + Loki + Grafana
                  </Badge>
                  <Badge
                    variant="outline"
                    className="status-dot text-destructive"
                  >
                    Sentry-compatible inbox
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 self-start rounded-3xl border border-border bg-[#1e1b18] p-4 text-[#f8f2eb] shadow-2xl shadow-orange-950/10">
                <div className="flex items-center gap-3 text-sm font-medium text-[#e8d8c6]">
                  <Gauge className="h-4 w-4" />
                  Demo flow
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-[#c4aa91]">
                    1
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#f6eee7]">
                    Run{" "}
                    <span className="font-mono text-[#ffb79b]">
                      system_error
                    </span>
                    .
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-[#c4aa91]">
                    2
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#f6eee7]">
                    Check Prometheus and Grafana for metric movement.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-[#c4aa91]">
                    3
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#f6eee7]">
                    Open Loki Viewer and Error Inbox to inspect structured
                    evidence.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="signal-surface">
            <CardHeader>
              <CardTitle className="text-2xl">Run Scenario</CardTitle>
              <CardDescription>
                Form state is managed by React Hook Form. Results invalidate
                TanStack Query history automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-5"
                onSubmit={form.handleSubmit((values) =>
                  mutation.mutate(values),
                )}
              >
                <div className="grid gap-2">
                  <Label htmlFor="scenario">Scenario</Label>
                  <Controller
                    control={form.control}
                    name="scenario"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="scenario">
                          <SelectValue placeholder="Choose scenario" />
                        </SelectTrigger>
                        <SelectContent>
                          {scenarioOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedMeta.helper}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="intensity">Intensity</Label>
                  <Controller
                    control={form.control}
                    name="intensity"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="intensity">
                          <SelectValue placeholder="Choose intensity" />
                        </SelectTrigger>
                        <SelectContent>
                          {intensityOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="note">Run note</Label>
                  <Input
                    id="note"
                    maxLength={180}
                    placeholder="Optional operator note"
                    {...form.register("note")}
                  />
                </div>

                <Button
                  className="w-full"
                  disabled={mutation.isPending}
                  type="submit"
                >
                  {mutation.isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldAlert className="h-4 w-4" />
                  )}
                  Run scenario
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {obsLinks.map((link) => (
            <ObsLinkCard key={link.title} {...link} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="signal-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Database className="h-5 w-5 text-primary" />
                Run History
              </CardTitle>
              <CardDescription>
                Stored in PostgreSQL and loaded through TanStack Query from the
                NestJS API.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {historyQuery.isLoading ? (
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-white/55 px-4 py-6 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading scenario history.
                </div>
              ) : historyQuery.data && historyQuery.data.length > 0 ? (
                historyQuery.data.map((run) => (
                  <div
                    key={run.id}
                    className="grid gap-3 rounded-2xl border border-border bg-white/60 p-4 transition hover:-translate-y-0.5 hover:border-primary"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold">
                          {run.scenario}
                        </div>
                        <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">
                          {run.intensity} intensity
                        </div>
                      </div>
                      <Badge variant={statusTone(run.status)}>
                        {run.status}
                      </Badge>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <div>Started {relativeTime(run.createdAt)}</div>
                      <div>
                        {run.durationMs
                          ? `${run.durationMs} ms`
                          : "duration pending"}
                      </div>
                    </div>

                    {run.summary ? (
                      <div className="text-sm leading-6">{run.summary}</div>
                    ) : null}
                    {run.errorMessage ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                        {run.errorMessage}
                      </div>
                    ) : null}
                    {run.note ? (
                      <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        note: {run.note}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                  No runs yet. Launch a scenario to seed metrics, logs, and
                  errors.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="signal-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="h-5 w-5 text-accent" />
                What each signal proves
              </CardTitle>
              <CardDescription>
                The UI is intentionally opinionated so the demo can be executed
                in under fifteen minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm leading-6 text-muted-foreground">
              <div className="rounded-2xl border border-border bg-white/60 p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <Gauge className="h-4 w-4 text-primary" />
                  Prometheus
                </div>
                `signal_lab_scenario_runs_total` and
                `signal_lab_scenario_duration_ms` move after each run.
              </div>
              <div className="rounded-2xl border border-border bg-white/60 p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <Logs className="h-4 w-4 text-accent" />
                  Loki
                </div>
                JSON log lines include run id, scenario, intensity, duration,
                and final status.
              </div>
              <div className="rounded-2xl border border-border bg-white/60 p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Sentry-compatible inbox
                </div>
                `system_error` produces a captured exception envelope with
                scenario metadata and event id.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
