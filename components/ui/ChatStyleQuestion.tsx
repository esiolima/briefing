"use client";

import { useState } from "react";
import { Input } from "./FormFields";

export interface QuestionData {
  id: string;
  text: string;
  type: "opcoes" | "texto";
  options?: string[];
}

export function ChatStyleQuestion({
  question,
  onAnswer,
}: {
  question: QuestionData;
  onAnswer: (id: string, answer: string) => void;
}) {
  const [customValue, setCustomValue] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  if (question.type === "texto") {
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-mb-navy">{question.text}</p>
        <Input
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onAnswer(question.id, e.target.value);
          }}
          placeholder="Sua resposta"
        />
      </div>
    );
  }

  const options = [...(question.options ?? []), "Outro"];

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-mb-navy">{question.text}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              setSelected(opt);
              if (opt !== "Outro") onAnswer(question.id, opt);
              else onAnswer(question.id, customValue);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              selected === opt
                ? "border-mb-cyan bg-mb-cyan/10 text-mb-blue"
                : "border-mb-gray-100 text-mb-gray-400 hover:border-mb-cyan"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected === "Outro" && (
        <Input
          className="mt-2"
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onAnswer(question.id, e.target.value);
          }}
          placeholder="Descreva"
        />
      )}
    </div>
  );
}
