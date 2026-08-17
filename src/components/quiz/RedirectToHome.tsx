"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { finishSession } from "@/actions/quiz";

/* - Sempre que a página for carregada por um reload (F5, Ctrl+R, botão de recarregar do navegador etc), manda o usuário de volta pra home, não importa em qual página ele estava. Navegação normal (clique em link, router.push) não é afetada aqui - */

const RedirectToHome = () => {
  const router = useRouter();

  useEffect(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

    if (navigation?.type === "reload") {
      router.replace("/");
    }
  }, [router]);

  return null;
};

/* - Impede que o usuário use os botões de voltar/avançar do navegador pra manipular a navegação entre as páginas do quiz (ex: voltar pra roleta depois de ver uma pergunta, ou forçar a entrada numa categoria antiga). Qualquer tentativa de voltar ou avançar joga o usuário pra home - */

const BlockBrowserNavigation = () => {
  useEffect(() => {
    /* - Empilha uma entrada extra no histórico, que vai ser "consumida" quando o usuário apertar voltar ou avançar - */

    window.history.pushState(null, "", window.location.href);

    const handlePopState = async () => {
      /* - Reempilha a entrada pra manter a armadilha ativa em tentativas seguintes, encerra a sessão no banco e manda o usuário de volta pra home - */

      window.history.pushState(null, "", window.location.href);
      await finishSession("leftGame");
      window.location.href = "/";
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return null;
};

export { RedirectToHome, BlockBrowserNavigation };
