"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/FormFields";
import { ErrorState } from "@/components/ui/StateMessages";

interface Option {
  id: string;
  name: string;
}

export default function IdentificacaoPage() {
  const router = useRouter();
  const [areas, setAreas] = useState<Option[]>([]);
  const [positions, setPositions] = useState<Option[]>([]);
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/areas")
      .then((res) => res.json())
      .then(setAreas)
      .catch(() => setError("load"));
  }, []);

  useEffect(() => {
    if (!areaId) {
      setPositions([]);
      setPositionId("");
      return;
    }
    fetch(`/api/positions?areaId=${areaId}`)
      .then((res) => res.json())
      .then(setPositions)
      .catch(() => setError("load"));
  }, [areaId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, areaId, positionId }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível salvar sua identificação.");
      return;
    }

    router.push("/dashboard");
  }

  if (error === "load") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mb-gray-100">
        <ErrorState onRetry={() => window.location.reload()} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-mb-gray-100 px-4">
      <Card className="w-full max-w-md">
        <span className="text-xs font-medium uppercase tracking-wide text-mb-cyan">
          Martins Briefing
        </span>
        <h1 className="mt-1 text-xl font-semibold text-mb-navy">
          Antes de começar, quem é você?
        </h1>
        <p className="mt-1 text-sm text-mb-gray-400">
          Só precisamos do essencial para contextualizar sua solicitação.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <Label htmlFor="area">Área</Label>
            <Select
              id="area"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="position">Cargo</Label>
            <Select
              id="position"
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              disabled={!areaId}
              required
            >
              <option value="">Selecione</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </Select>
          </div>

          {error && error !== "load" && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Salvando..." : "Continuar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
