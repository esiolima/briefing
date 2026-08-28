import { redirect } from "next/navigation";
import { getRequesterIdentity } from "@/lib/identity";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const identity = getRequesterIdentity();

  if (!identity) {
    redirect("/identificacao");
  }

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
          <Button disabled title="Disponível na próxima etapa">
            Novo Briefing
          </Button>
        </div>

        <Card className="mt-8">
          <h2 className="text-sm font-semibold text-mb-navy">
            Briefings recentes
          </h2>
          <p className="mt-2 text-sm text-mb-gray-400">
            Você ainda não criou nenhum briefing. Quando o fluxo de criação
            estiver disponível, ele vai aparecer aqui.
          </p>
        </Card>
      </div>
    </main>
  );
}
