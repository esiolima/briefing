"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/FormFields";
import { Badge } from "@/components/ui/Badge";

interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  active: boolean;
}

const CATEGORIES = [
  "empresa",
  "area",
  "cargo",
  "tipo_demanda",
  "campanha",
  "material",
];

export default function AdminKnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    (KnowledgeItem & { similarity: number })[] | null
  >(null);
  const [searching, setSearching] = useState(false);

  async function loadItems() {
    const res = await fetch("/api/admin/knowledge");
    setItems(await res.json());
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, title, content }),
    });
    setTitle("");
    setContent("");
    setSaving(false);
    loadItems();
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    const res = await fetch(
      `/api/admin/knowledge/search?q=${encodeURIComponent(query)}`,
    );
    setResults(await res.json());
    setSearching(false);
  }

  return (
    <main className="min-h-screen bg-mb-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-mb-cyan">
            Martins Briefing · Admin
          </span>
          <h1 className="mt-1 text-2xl font-semibold text-mb-navy">
            Banco de conhecimento
          </h1>
          <p className="text-sm text-mb-gray-400">
            Cadastre informações institucionais aqui — a IA usa isso antes de
            perguntar qualquer coisa ao solicitante.
          </p>
        </div>

        <Card>
          <h2 className="text-sm font-semibold text-mb-navy">Novo item</h2>
          <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                className="w-full rounded border border-mb-gray-100 bg-white px-3 py-2 text-sm text-mb-navy focus:border-mb-cyan focus:outline-none focus:ring-1 focus:ring-mb-cyan"
              />
            </div>
            <Button type="submit" disabled={saving} className="self-start">
              {saving ? "Salvando..." : "Adicionar ao conhecimento"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-mb-navy">
            Testar busca semântica
          </h2>
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ex.: "ação para motivar o time comercial"'
            />
            <Button type="submit" disabled={searching}>
              {searching ? "Buscando..." : "Buscar"}
            </Button>
          </form>

          {results && (
            <ul className="mt-4 space-y-2">
              {results.length === 0 && (
                <li className="text-sm text-mb-gray-400">
                  Nenhum item relacionado encontrado.
                </li>
              )}
              {results.map((r) => (
                <li
                  key={r.id}
                  className="rounded border border-mb-gray-100 p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-mb-navy">{r.title}</span>
                    <Badge tone="info">
                      {(r.similarity * 100).toFixed(0)}% similar
                    </Badge>
                  </div>
                  <p className="mt-1 text-mb-gray-400">{r.content}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-mb-navy">
            Itens cadastrados ({items.length})
          </h2>
          <ul className="mt-4 space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded border border-mb-gray-100 p-3 text-sm"
              >
                <div>
                  <span className="font-medium text-mb-navy">{item.title}</span>
                  <span className="ml-2 text-mb-gray-400">{item.category}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await fetch(`/api/admin/knowledge/${item.id}`, {
                      method: "DELETE",
                    });
                    loadItems();
                  }}
                >
                  Excluir
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
