"use client";

import { Cards } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { errorCards } from "@/types/cards";
import { useRouter } from "next/navigation";

const ErrorBoundary = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full px-6 bg-[radial-gradient(circle_at_75%_30%,#2E1F5E_0%,#1A1235_45%,#0D0818_100%),linear-gradient(135deg,rgba(64,118,195,0.08)_0%,transparent_50%)] bg-blend-screen">
      <div className="relative z-10 w-full max-w-md text-center space-y-6">
        <div className="space-y-1">
          <h1 className="text-white font-black text-5xl leading-none tracking-tight">Ops.</h1>

          <h2 className="font-black text-4xl leading-tight tracking-tight">
            <span className="text-blue-400">Algo deu</span>{" "}
            <span className="text-yellow-400">errado.</span>
          </h2>
        </div>

        <p className="text-[#C9C1EE] text-sm leading-relaxed max-w-xs mx-auto">
          Não conseguimos buscar a pergunta no banco de dados. Verifique sua conexão e tente
          novamente.
        </p>

        <Cards
          className="text-left max-w-full"
          cards={errorCards}
        />

        <div className="flex justify-center gap-3 pt-1">
          <Button
            text="Voltar para a página inicial"
            onClick={() => router.push("/")}
          />
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
