import { describe, it, expect, beforeEach, vi } from "vitest"; // funções principais do vitest que serve pra organizar e executar os testes

import { render, screen, fireEvent, waitFor } from "@testing-library/react"; // serve pra renderizar componentes, buscar elementos, simular eventos e esperar mudancas

import axios from "axios"; // liga com o backend

import { CadTarefa } from "../Paginas/CadTarefa"; // a pagina que vai ser testada
import React from "react"; //chamando o react

vi.mock("axios"); //com ele da pra simular respostar de sucesso e de erro de forma controlada

describe("Teste do componente CadTarefa", () => { // agrupa todos os casos de teste para CadTarefa

  beforeEach(() => {
  // tem que configurar os mocks para ter um status correto
    axios.get.mockResolvedValue({
      data: [
        { id: 1, nome: "João" },
        { id: 2, nome: "Maria" },
      ],
    }); // simula a busca de usuários

    axios.post.mockResolvedValue({ data: {} }); // mock para simular envio de tarefa com sucesso
  });

  it("Deve renderizar o formulário corretamente", async () => {
    render(<CadTarefa />);
    // renderizando o componente CadTarefa

    // espera até que a chamada GET seja feita
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    //todos esses campos verificam se as coisas existem mesmo
    expect(screen.getByText("Cadastro de tarefas")).toBeTruthy(); // verifica se o título existe
    expect(screen.getByLabelText("Nome da tarefa:")).toBeTruthy(); // verifica se o campo existe
    expect(screen.getByLabelText("Descrição:")).toBeTruthy();
    expect(screen.getByLabelText("Setor:")).toBeTruthy();
    expect(screen.getByLabelText("Prioridade:")).toBeTruthy();
    expect(screen.getByLabelText("Status:")).toBeTruthy();
    expect(screen.getByLabelText("Usuário:")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Cadastrar Tarefa/i })).toBeTruthy(); // verifica botão
  });

  it("Deve validar campos obrigatórios e mostrar erros", async () => {
    render(<CadTarefa />);
    // renderiza o formulário

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar Tarefa/i }));
    // simula clique no botão sem preencher campos

    await waitFor(() => {
      //valida todas essas informações
      expect(screen.getByText("Insira ao menos 1 caractere")).toBeTruthy(); // valida nome
      expect(screen.getByText("Insira no minimo 10 caracteres na descrição")).toBeTruthy();
      expect(screen.getByText("Informe o nome do setor")).toBeTruthy(); 
      expect(screen.getByText("Escolha um usuário.")).toBeTruthy(); // valida usuário
    });
  });

  it("Deve permitir preencher campos e enviar o formulário", async () => {
    render(<CadTarefa />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled()); // espera o GET

    fireEvent.change(screen.getByLabelText("Nome da tarefa:"), {
      //preenche todos os campos
      target: { value: "Minha Tarefa" },
    }); // preenche nome da tarefa

    fireEvent.change(screen.getByLabelText("Descrição:"), {
      target: { value: "Descrição válida com mais de 10 caracteres" },
    }); // preenche descrição

    fireEvent.change(screen.getByLabelText("Setor:"), {
      target: { value: "Financeiro" },
    });

    fireEvent.change(screen.getByLabelText("Prioridade:"), {
      target: { value: "A" },
    });

    fireEvent.change(screen.getByLabelText("Usuário:"), {
      target: { value: "1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar Tarefa/i }));
    // envia formulário

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/tarefa/",
        expect.objectContaining({
          nome: "Minha Tarefa",
          descricao: "Descrição válida com mais de 10 caracteres",
          nomeSetor: "Financeiro",
          prioridade: "A",
          status: "A",
          usuario: "1",
        })
      ); // verifica se POST foi chamado com os dados corretos
    });
  });

  it("Deve limpar formulário após envio", async () => {
    render(<CadTarefa />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    //esse teste ta verificando se depois que o formulario é enviado, se as informações são limpas, voltando com o formulario em branco

    //preenchimento dos campos
    fireEvent.change(screen.getByLabelText("Nome da tarefa:"), {
      target: { value: "Teste Limpeza" },
    });
    fireEvent.change(screen.getByLabelText("Descrição:"), {
      target: { value: "Descrição válida após envio" },
    });
    fireEvent.change(screen.getByLabelText("Setor:"), {
      target: { value: "RH" },
    });
    fireEvent.change(screen.getByLabelText("Prioridade:"), {
      target: { value: "B" },
    });
    fireEvent.change(screen.getByLabelText("Usuário:"), {
      target: { value: "2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar Tarefa/i })); // clica no botao cadastrar

    await waitFor(() => { //ve se os campos foram limpos
      expect(screen.getByLabelText("Nome da tarefa:").value).toBe(""); // confirma limpeza
      expect(screen.getByLabelText("Descrição:").value).toBe("");
      expect(screen.getByLabelText("Setor:").value).toBe("");
    });
  });

  it("Deve mostrar erro no console se falhar envio", async () => { //ve se tem tratamento de erro quando o envio falha
    axios.post.mockRejectedValueOnce(new Error("Falha ao enviar"));
    // mocka falha no envio

    render(<CadTarefa />); //o render é sempre chamado no inicio de um teste, ele coloca o projeto em uma "sala de teste" para colocar o teste em pratica
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    //testa o preenchimento com respostas que vao dar erro para testar o tratamento de erro quando o envio falhar
    fireEvent.change(screen.getByLabelText("Nome da tarefa:"), {
      target: { value: "Teste Erro" },
    });
    fireEvent.change(screen.getByLabelText("Descrição:"), {
      target: { value: "Descrição válida para erro" },
    });
    fireEvent.change(screen.getByLabelText("Setor:"), {
      target: { value: "TI" },
    });
    fireEvent.change(screen.getByLabelText("Prioridade:"), {
      target: { value: "M" },
    });
    fireEvent.change(screen.getByLabelText("Usuário:"), {
      target: { value: "1" },
    });

    const consoleSpy = vi.spyOn(console, "log");
    // espiona chamadas de console.log

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar Tarefa/i }));
    // tenta enviar formulário

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Erros", expect.any(Error));
      // verifica se o erro foi logado no console
    });
  });
});
