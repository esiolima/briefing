import { notFound, redirect } from "next/navigation";
import { getRequesterIdentity } from "@/lib/identity";
import { loadOwnedSession } from "@/lib/briefing-session";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STATUS_LABEL: Record<string, string> = {
  em_andamento: "Em andamento",
  aguardando_revisao: "Aguardando revisão",
  aprovado: "Aprovado",
  finalizado: "Finalizado",
};

const FIELD_LABELS: Record<string, string> = {
  objetivo: "Objetivo",
  contexto: "Contexto",
  publico: "Público",
  mensagem: "Mensagem",
  periodo: "Período",
  canais: "Canais",
  entregaveis: "Entregáveis",
  restricoes: "Restrições",
  resumo: "Resumo",
};

export default async function BriefingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!getRequesterIdentity()) {
    redirect("/identificacao");
  }

  const { session } = await loadOwnedSession(params.id);
  if (!session) notFound();

  const briefing = (session.briefing_final ?? {}) as Record<string, string>;

  return (
    <main className="min-h-screen bg-mb-gray-100 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-mb-cyan">
            Martins Briefing
          </span>
          <Badge tone={session.status === "aprovado" ? "success" : "info"}>
            {STATUS_LABEL[session.status] ?? session.status}
          </Badge>
        </div>

        <h1 className="mt-2 text-xl font-semibold text-mb-navy">
          Necessidade original
        </h1>
        <Card className="mt-2">
          <p className="text-sm text-mb-navy">{session.raw_need}</p>
        </Card>

        {Object.keys(briefing).length > 0 && (
          <>
            <h2 className="mt-6 text-lg font-semibold text-mb-navy">Briefing</h2>
            <div className="mt-2 flex flex-col gap-3">
              {Object.entries(FIELD_LABELS).map(([field, label]) =>
                briefing[field] ? (
                  <Card key={field}>
                    <span className="text-xs font-semibold uppercase text-mb-gray-400">
                      {label}
                    </span>
                    <p className="mt-1 text-sm text-mb-navy">{briefing[field]}</p>
                  </Card>
                ) : null,
              )}
            </div>
          </>
        )}

        {Object.keys(briefing).length === 0 && (
          <p className="mt-6 text-sm text-mb-gray-400">
            Este briefing ainda não foi gerado.
          </p>
        )}
      </div>
    </main>
  );
}
