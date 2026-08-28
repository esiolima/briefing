import { Button } from "./Button";

export function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-mb-gray-400">
      <span className="h-2 w-2 animate-pulse rounded-full bg-mb-cyan" />
      {message}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-mb-gray-100 p-6 text-center">
      <p className="text-sm text-mb-navy">
        Não consegui concluir essa etapa agora. Tente novamente.
      </p>
      <Button variant="secondary" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}
