import { render, screen, fireEvent, waitFor } from "@testing-library/react"; // funções para renderizar, buscar elementos, simular eventos e esperar resultados
import { describe, it, expect, vi } from "vitest"; // funções para estruturar e rodar testes
import axios from "axios"; // biblioteca para fazer requisições HTTP
import { CadUsuario } from "../Paginas/CadUsuario"; // componente que será testado

vi.mock("axios"); // cria um mock do axios para evitar chamadas reais

describe("Cadastro de usuario", () => {
  // describe agrupa os testes relacionados ao Cadastro de Usuário

  it("A tela é exibida", () => {
    // it descreve um caso de teste: verificar se a tela carrega corretamente
    render(<CadUsuario />); // renderiza o componente

    const nomeInput = screen.getByLabelText(/Nome/i); // busca o input do nome pelo label
    const emailInput = screen.getByLabelText(/Email/i); // busca o input do email pelo label
    const botao = screen.getByRole("button", { name: /Cadastrar/i }); // busca o botão pelo role e nome

    expect(nomeInput).toBeTruthy(); // verifica se o input do nome existe
    expect(emailInput).toBeTruthy(); // verifica se o input do email existe
    expect(botao).toBeTruthy(); // verifica se o botão existe
  });

  it("deve mostrar erros quando campos estiverem vazios", async () => {
    // caso de teste: verificar erros quando campos estiverem vazios
    render(<CadUsuario />); // renderiza o componente

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i })); // simula clique no botão cadastrar

    await waitFor(() => {
      expect(screen.getByText("Insira ao menos 1 caractere")).toBeTruthy(); // verifica mensagem de erro do nome
      expect(
        screen.getByText("Insira um endereço de email com até 30 carateres")
      ).toBeTruthy(); // verifica mensagem de erro do email
    });
  });

  it("Formato de email invalido", async () => {
    // caso de teste: verificar validação de email inválido
    render(<CadUsuario />); // renderiza o componente

    fireEvent.input(screen.getByLabelText(/Nome/i), {
      target: { value: "Maria da Silva" }, // insere nome válido
    });
    fireEvent.input(screen.getByLabelText(/Email/i), {
      target: { value: "emailinvalido" }, // insere email inválido
    });

    fireEvent.submit(screen.getByRole("button", { name: /Cadastrar/i })); // submete o formulário

    await waitFor(() => {
      expect(screen.getByText(/Formato de email inválido/i)).toBeTruthy(); // verifica mensagem de erro do email
    });
  });

  it("deve resetar os campos após submissão", async () => {
    axios.post.mockResolvedValueOnce({ data: {} }); // Mock de sucesso para axios.post

    render(<CadUsuario />); // renderiza o componente

    const nomeInput = screen.getByLabelText(/Nome/i); // pega o input nome
    const emailInput = screen.getByLabelText(/Email/i); // pega o input email

    fireEvent.input(nomeInput, { target: { value: "Maria da Silva" } }); // preenche o nome
    fireEvent.input(emailInput, { target: { value: "maria@email.com" } }); // preenche o email

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i })); // clica no botão cadastrar

    await waitFor(() => {
      expect(nomeInput.value).toBe(""); // verifica se o nome foi resetado
      expect(emailInput.value).toBe(""); // verifica se o email foi resetado
    });
  });
});
