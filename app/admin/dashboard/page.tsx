import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-mb-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <span className="text-xs font-medium uppercase tracking-wide text-mb-cyan">
          Martins Briefing · Admin
        </span>
        <h1 className="mt-1 text-2xl font-semibold text-mb-navy">
          Painel administrativo
        </h1>

        <Card className="mt-8">
          <Link
            href="/admin/knowledge"
            className="text-sm font-medium text-mb-cyan hover:underline"
          >
            Gerenciar banco de conhecimento →
          </Link>
          <p className="mt-3 text-sm text-mb-gray-400">
            A gestão de áreas, cargos, tipos de demanda, campanhas, materiais
            e perguntas do Droni chega na Etapa 7. Por enquanto essas
            entidades já têm API própria (CRUD) por trás — só falta a tela.
          </p>
        </Card>
      </div>
    </main>
  );
}
