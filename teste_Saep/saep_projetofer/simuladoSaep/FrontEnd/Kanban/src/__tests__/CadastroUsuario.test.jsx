import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CadUsuario } from "../paginas/CadUsuario";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import '@testing-library/jest-dom';


vi.mock("axios");

describe("CadUsuario", () => {
  beforeEach(() => {
    window.alert = vi.fn();
    vi.clearAllMocks();
  });

  it("deve renderizar todos os campos do formulário", () => {
    render(<CadUsuario />);
    expect(screen.getByLabelText(/Nome/i)).toBeTruthy();
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Cadastrar/i })).toBeTruthy();
  });

  it("deve mostrar erros quando campos estiverem vazios", async () => {
    render(<CadUsuario />);
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Insira ao menos 1 caractere")).toBeTruthy();
      expect(screen.getByText("Insira um endereço de email com até 30 carateres")).toBeTruthy();
    });
  });

  it("deve mostrar erro quando o email tiver formato inválido", async () => {
    render(<CadUsuario />);
    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "emailinvalido" } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Formato de email inválido/i)).toBeTruthy();
    });
  });

  it("deve resetar os campos após submissão com sucesso", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "ok" } });
    render(<CadUsuario />);
    const nomeInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const botao = screen.getByRole("button", { name: /Cadastrar/i });

    fireEvent.input(nomeInput, { target: { value: "Maria Silva" } });
    fireEvent.input(emailInput, { target: { value: "maria@email.com" } });
    fireEvent.click(botao);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Usuário cadastrado com sucesso");
    });

    expect(nomeInput.value).toBe("");
    expect(emailInput.value).toBe("");
  });

  // Testes para o campo nome conforme regex e mensagens do novo schema
  it("deve mostrar erro se o nome não tiver sobrenome", async () => {
    render(<CadUsuario />);
    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria" } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "maria@email.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Digite nome completo \(nome e sobrenome\), sem números ou símbolos, sem espaços no início\/fim/i)).toBeTruthy();
    });
  });

  it("deve aceitar nome válido com sobrenome", async () => {
    render(<CadUsuario />);
    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "maria@email.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Digite nome completo/i)).toBeNull();
    });
  });

  it("deve mostrar erro para nome com caracteres especiais", async () => {
    render(<CadUsuario />);
    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria@123" } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "maria@email.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Digite nome completo/i)).toBeTruthy();
    });
  });

  it("deve limitar nome a 30 caracteres e evitar caracteres inválidos no onChange", () => {
    render(<CadUsuario />);
    const nomeInput = screen.getByLabelText(/Nome/i);
    fireEvent.input(nomeInput, { target: { value: "Maria Silva 1234567890!@#$%" } });

    // O onChange do componente deve limpar caracteres inválidos e limitar a 30 chars
    expect(nomeInput.value).toMatch(/^[A-Za-zÀ-ÖØ-öø-ÿ ]{1,30}$/);
    expect(nomeInput.value.length).toBeLessThanOrEqual(30);
  });

  it("não deve permitir enviar nome com espaços antes ou depois", async () => {
    render(<CadUsuario />);
    const nomeInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.input(nomeInput, { target: { value: "  Maria Silva  " } });
    fireEvent.input(emailInput, { target: { value: "maria@email.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  // Testes para o campo email
  it("deve aceitar email válido dentro do limite", async () => {
    render(<CadUsuario />);
    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "maria@email.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Formato de email inválido/i)).toBeNull();
      expect(screen.queryByText(/Insira um endereço de email com até 30 carateres/i)).toBeNull();
    });
  });

  it("deve mostrar erro se o email exceder 30 caracteres", async () => {
    render(<CadUsuario />);
    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
    const longEmail = "a".repeat(31) + "@email.com"; // maior que 30 chars
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: longEmail } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Insira um endereço de email com até 30 carateres/i)).toBeTruthy();
    });
  });

  it("deve mostrar erro se o email contiver apenas espaços", async () => {
    render(<CadUsuario />);
    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "    " } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Insira um endereço de email com até 30 carateres/i)).toBeTruthy();
    });
  });

  it("deve limpar espaços antes/depois do email no onChange", () => {
    render(<CadUsuario />);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.input(emailInput, { target: { value: "   maria@email.com   " } });
    expect(emailInput.value).toBe("maria@email.com");
  });

  it("não deve permitir enviar email com espaços antes ou depois", async () => {
    render(<CadUsuario />);
    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "   maria@email.com  " } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe("Botão no CadUsuario", () => {
    beforeEach(() => {
      window.alert = vi.fn();
      vi.clearAllMocks();
    });

    it("deve renderizar o botão 'Cadastrar' habilitado inicialmente", () => {
      render(<CadUsuario />);
      const botao = screen.getByRole("button", { name: /Cadastrar/i });
      expect(botao).not.toBeDisabled();
    });

    it("deve manter o botão habilitado mesmo com campos vazios (porque mode: onChange)", async () => {
      render(<CadUsuario />);
      const botao = screen.getByRole("button", { name: /Cadastrar/i });

      expect(botao).not.toBeDisabled();

      fireEvent.click(botao);

      await waitFor(() => {
        expect(screen.getByText("Insira ao menos 1 caractere")).toBeTruthy();
        expect(screen.getByText("Insira um endereço de email com até 30 carateres")).toBeTruthy();
      });
    });

    it("deve disparar submit e chamar alert quando dados são válidos", async () => {
      axios.post.mockResolvedValueOnce({ data: { message: "ok" } });
      render(<CadUsuario />);

      const nomeInput = screen.getByLabelText(/Nome/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const botao = screen.getByRole("button", { name: /Cadastrar/i });

      fireEvent.change(nomeInput, { target: { value: "Maria Silva" } });
      fireEvent.change(emailInput, { target: { value: "maria@email.com" } });

      fireEvent.click(botao);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Usuário cadastrado com sucesso");
        expect(axios.post).toHaveBeenCalledTimes(1);
      });
    });

    it("não deve disparar submit nem chamar alert se dados inválidos", async () => {
      render(<CadUsuario />);

      const nomeInput = screen.getByLabelText(/Nome/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const botao = screen.getByRole("button", { name: /Cadastrar/i });

      fireEvent.change(nomeInput, { target: { value: "Maria@" } }); // inválido
      fireEvent.change(emailInput, { target: { value: "emailinvalido" } }); // inválido

      fireEvent.click(botao);

      await waitFor(() => {
        expect(window.alert).not.toHaveBeenCalled();
        expect(axios.post).not.toHaveBeenCalled();
        expect(screen.getByText(/Digite nome completo/)).toBeTruthy();
        expect(screen.getByText(/Formato de email inválido/)).toBeTruthy();
      });
    });
  });
});
