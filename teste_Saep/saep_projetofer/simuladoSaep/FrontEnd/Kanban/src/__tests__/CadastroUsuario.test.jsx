import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CadUsuario } from '../Paginas/CadUsuario'
//render: renderiza a minha tela
//screen: eu vejo os elementos que estão sendo exibidos
//fireEvent: simula o que usuário pode fazer em tela
//waitfor: espera o resultado do evento

describe("Cadastro de usuario", () => {
  it("A tela é exibida", () => {
    render(<CadUsuario />);

    const nomeInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const botao = screen.getByRole("button", { name: /Cadastrar/i });

    expect(nomeInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(botao).toBeTruthy();
  });

  it("deve mostrar erros quando campos estiverem vazios", async () => {
    render(<CadUsuario />);

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Insira ao menos 1 caractere")).toBeTruthy();
      expect(screen.getByText("Insira um endereço de email com até 30 carateres")).toBeTruthy();
    });
  });

  it("Formato de email invalido", async () => {
    render(<CadUsuario />);

    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria" } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "emailinvalido" } });

    // submete pelo botão
    fireEvent.submit(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Formato de email inválido/i)).toBeTruthy();
    });
  });

  it("deve resetar os campos após submissão", async () => {
    render(<CadUsuario />);

    const nomeInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/Email/i);

    fireEvent.input(nomeInput, { target: { value: "Maria" } });
    fireEvent.input(emailInput, { target: { value: "maria@email.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(nomeInput.value).toBe("");
      expect(emailInput.value).toBe("");
    });
  });
});
