CREATE TYPE "ScenarioName" AS ENUM ('traffic_burst', 'latency_spike', 'system_error');
CREATE TYPE "ScenarioIntensity" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "ScenarioStatus" AS ENUM ('running', 'succeeded', 'failed');

CREATE TABLE "ScenarioRun" (
  "id" TEXT NOT NULL,
  "scenario" "ScenarioName" NOT NULL,
  "intensity" "ScenarioIntensity" NOT NULL,
  "status" "ScenarioStatus" NOT NULL,
  "note" TEXT,
  "summary" TEXT,
  "errorMessage" TEXT,
  "sentryEventId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "durationMs" INTEGER,

  CONSTRAINT "ScenarioRun_pkey" PRIMARY KEY ("id")
);