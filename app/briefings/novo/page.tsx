"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingMessage, ErrorState } from "@/components/ui/StateMessages";
import { ChatStyleQuestion } from "@/components/ui/ChatStyleQuestion";
import type { QuestionData } from "@/components/ui/ChatStyleQuestion";
import { wizardSteps } from "@/lib/design-tokens";

type Stage = "necessidade" | "carregando" | "perguntas" | "briefing" | "erro";

interface BriefingDraft {
  objetivo?: string;
  contexto?: string;
  publico?: string;
  mensagem?: string;
  periodo?: string;
  canais?: string;
  entregaveis?: string;
  restricoes?: string;
  resumo?: string;
}

const LOADING_MESSAGES = {
  interpretar:
    "Analisando sua necessidade e consultando o conhecimento disponível...",
  gerar: "Organizando seu briefing...",
} as const;

export default function NovoBriefingPage() {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("necessidade");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [rawNeed, setRawNeed] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [briefing, setBriefing] = useState<BriefingDraft>({});
  const [approved, setApproved] = useState(false);

  async function handleSubmitNeed(e: FormEvent) {
    e.preventDefault();
    setStage("carregando");
    setLoadingMessage(
      LOADING_MESSAGES.interpretar ?? "Analisando sua necessidade..."
    );

    try {
      const createRes = await fetch("/api/briefings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawNeed }),
      });
      if (!createRes.ok) throw new Error();
      const created = await createRes.json();
      setSessionId(created.id);

      const interpretRes = await fetch(`/api/briefings/${created.id}/interpret`, {
        method: "POST",
      });
      if (!interpretRes.ok) throw new Error();
      const interpreted = await interpretRes.json();

      if (!interpreted.questions || interpreted.questions.length === 0) {
        await handleGenerateBriefing(created.id);
        return;
      }

      setQuestions(interpreted.questions);
      setStage("perguntas");
    } catch {
      setStage("erro");
    }
  }

  async function handleSubmitAnswers() {
    if (!sessionId) return;
    setStage("carregando");
    setLoadingMessage("Registrando suas respostas...");

    try {
      const res = await fetch(`/api/briefings/${sessionId}/questions/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error();
      await handleGenerateBriefing(sessionId);
    } catch {
      setStage("erro");
    }
  }

  async function handleGenerateBriefing(id: string) {
  setStage("carregando");
  setLoadingMessage(LOADING_MESSAGES.gerar);

    try {
      const res = await fetch(`/api/briefings/${id}/generate-briefing`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBriefing(data.briefing ?? {});
      setStage("briefing");
    } catch {
      setStage("erro");
    }
  }

  async function handleApprove() {
    if (!sessionId) return;
    await fetch(`/api/briefings/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefingFinal: briefing, status: "aprovado" }),
    });
    setApproved(true);
  }

  async function handleSaveEdits() {
    if (!sessionId) return;
    await fetch(`/api/briefings/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefingFinal: briefing }),
    });
  }

  const currentStepIndex =
    stage === "necessidade" || stage === "carregando" && !questions.length
      ? 1
      : stage === "perguntas"
        ? 2
        : 3;

  return (
    <main className="min-h-screen bg-mb-gray-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <ProgressBar steps={[...wizardSteps]} currentStepIndex={currentStepIndex} />

        <Card className="mt-6">
          {stage === "necessidade" && (
            <>
              <h1 className="text-xl font-semibold text-mb-navy">
                O que você precisa criar?
              </h1>
              <p className="mt-1 text-sm text-mb-gray-400">
                Conte com suas palavras o que você precisa. Não se preocupe em
                escrever um briefing perfeito. Explique a necessidade como se
                estivesse contando para alguém da agência.
              </p>
              <form onSubmit={handleSubmitNeed} className="mt-4 flex flex-col gap-4">
                <textarea
                  value={rawNeed}
                  onChange={(e) => setRawNeed(e.target.value)}
                  required
                  minLength={10}
                  rows={6}
                  placeholder="Ex.: Preciso criar uma campanha de incentivo para os vendedores. A campanha começa em setembro e queremos uma comunicação que motive a equipe a participar."
                  className="w-full rounded border border-mb-gray-100 bg-white px-3 py-2 text-sm text-mb-navy focus:border-mb-cyan focus:outline-none focus:ring-1 focus:ring-mb-cyan"
                />
                <p className="text-xs text-mb-gray-400">
                  💡 Não precisa saber fazer um briefing. Conte o que você
                  sabe e deixe o Martins Briefing ajudar você a completar as
                  informações.
                </p>
                <Button type="submit" className="self-start">
                  Continuar
                </Button>
              </form>
            </>
          )}

          {stage === "carregando" && <LoadingMessage message={loadingMessage} />}

          {stage === "erro" && (
            <ErrorState onRetry={() => setStage("necessidade")} />
          )}

          {stage === "perguntas" && (
            <>
              <h1 className="text-xl font-semibold text-mb-navy">
                Para deixar sua solicitação mais clara
              </h1>
              <p className="mt-1 text-sm text-mb-gray-400">
                Só mais {questions.length}{" "}
                {questions.length === 1 ? "pergunta" : "perguntas"}.
              </p>
              <div className="mt-4 flex flex-col gap-5">
                {questions.map((q) => (
                  <ChatStyleQuestion
                    key={q.id}
                    question={q}
                    onAnswer={(id, answer) =>
                      setAnswers((prev) => ({ ...prev, [id]: answer }))
                    }
                  />
                ))}
              </div>
              <Button onClick={handleSubmitAnswers} className="mt-6">
                Continuar
              </Button>
            </>
          )}

          {stage === "briefing" && !approved && (
            <>
              <h1 className="text-xl font-semibold text-mb-navy">
                Seu briefing está pronto para revisão
              </h1>
              <p className="mt-1 text-sm text-mb-gray-400">
                Seu briefing foi organizado com base nas informações que você
                forneceu e no conhecimento disponível. Revise antes de
                continuar — você pode editar qualquer parte.
              </p>

              <div className="mt-4 flex flex-col gap-4">
                {(
                  [
                    ["objetivo", "Objetivo"],
                    ["contexto", "Contexto"],
                    ["publico", "Público"],
                    ["mensagem", "Mensagem"],
                    ["periodo", "Período"],
                    ["canais", "Canais"],
                    ["entregaveis", "Entregáveis"],
                    ["restricoes", "Restrições"],
                    ["resumo", "Resumo"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field}>
                    <label className="mb-1 block text-sm font-medium text-mb-navy">
                      {label}
                    </label>
                    <textarea
                      value={(briefing[field] as string) ?? ""}
                      onChange={(e) =>
                        setBriefing((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      onBlur={handleSaveEdits}
                      rows={field === "resumo" ? 3 : 2}
                      className="w-full rounded border border-mb-gray-100 bg-white px-3 py-2 text-sm text-mb-navy focus:border-mb-cyan focus:outline-none focus:ring-1 focus:ring-mb-cyan"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => sessionId && handleGenerateBriefing(sessionId)}
                >
                  Regenerar
                </Button>
                <Button onClick={handleApprove}>Aprovar</Button>
              </div>
            </>
          )}

          {stage === "briefing" && approved && (
            <div className="text-center">
              <h1 className="text-xl font-semibold text-mb-navy">
                Briefing aprovado ✓
              </h1>
              <p className="mt-2 text-sm text-mb-gray-400">
                As respostas prontas para colar no Droni chegam na próxima
                etapa. Por enquanto, seu briefing já está salvo no histórico.
              </p>
              <Button className="mt-4" onClick={() => router.push("/dashboard")}>
                Voltar ao início
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
