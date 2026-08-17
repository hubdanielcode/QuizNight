import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import NotFound from "@/app/not-found";

/* - Testando o conteúdo estático - */

test("should render the 404 message", () => {
  render(<NotFound />);

  expect(screen.getByText("404")).toBeInTheDocument();
  expect(screen.getByText(/Não Encontrada/i)).toBeInTheDocument();
});

/* - Testando o link de volta - */

test("should render a link back to the home page", () => {
  render(<NotFound />);

  const link = screen.getByText("Voltar à Página Principal");

  expect(link).toHaveAttribute("href", "/");
});
