import { redirect } from "next/navigation";
import Link from "next/link";
import { getRequesterIdentity } from "@/lib/identity";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const STATUS_LABEL: Record<string, { label: string; tone: "neutral" | "info" | "success" }> = {
  em_andamento: { label: "Em andamento", tone: "neutral" },
  aguardando_revisao: { label: "Aguardando revisão", tone: "info" },
  aprovado: { label: "Aprovado", tone: "success" },
  finalizado: { label: "Finalizado", tone: "success" },
};

export default async function DashboardPage() {
const identity = getRequesterIdentity() ?? {
  token: "__temporary_access__",
  name: "Acesso temporário",
  positionName: "Administrador",
  areaName: "Painel",
};

  const { rows: recentBriefings } = await db.query(
    `SELECT id, status, raw_need, created_at
     FROM briefing_sessions
     WHERE requester_token = $1
     ORDER BY created_at DESC
     LIMIT 5`,
    [identity!.token],
  );

  return (
    <main className="min-h-screen bg-mb-gray-100 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-mb-cyan">
              Martins Briefing
            </span>
            <h1 className="mt-1 text-2xl font-semibold text-mb-navy">
              Olá, {identity!.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-mb-gray-400">
              {identity!.positionName} · {identity!.areaName}
            </p>
          </div>
          <Link href="/briefings/novo">
            <Button>Novo Briefing</Button>
          </Link>
        </div>

        <Card className="mt-8">
          <h2 className="text-sm font-semibold text-mb-navy">
            Briefings recentes
          </h2>

          {recentBriefings.length === 0 ? (
            <p className="mt-2 text-sm text-mb-gray-400">
              Você ainda não criou nenhum briefing. Clique em "Novo Briefing"
              para começar.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {recentBriefings.map((b) => {
                const status = STATUS_LABEL[b.status] ?? {
                  label: b.status,
                  tone: "neutral" as const,
                };
                return (
                  <li key={b.id}>
                    <Link
                      href={`/briefings/${b.id}`}
                      className="flex items-center justify-between rounded border border-mb-gray-100 p-3 text-sm hover:border-mb-cyan"
                    >
                      <span className="truncate text-mb-navy">
                        {b.raw_need.slice(0, 60)}
                        {b.raw_need.length > 60 ? "..." : ""}
                      </span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}
