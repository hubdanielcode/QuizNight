import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import Loading from "@/app/quiz/loading";

/* - loading.tsx só reexporta o componente Loading; testando que o re-export realmente renderiza o indicador de carregamento - */

test("should render the loading indicator", async () => {
  render(<Loading />);

  expect(await screen.findByText(/Carregando/i)).toBeInTheDocument();
});
