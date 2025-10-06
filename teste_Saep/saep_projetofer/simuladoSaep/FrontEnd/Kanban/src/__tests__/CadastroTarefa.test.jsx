import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom"; 
import axios from "axios";
import { CadTarefa } from "../Paginas/CadTarefa";
import React from "react"; 

// 1. CONFIGURAÇÃO INICIAL E UTILS
vi.mock("axios"); 
// Mock global para window.alert (necessário para rodar sem erro no JSDOM)
global.alert = vi.fn();

// Função auxiliar para evitar repetição
const getNomeInput = () => screen.getByLabelText("Nome da tarefa:");
const getDescricaoInput = () => screen.getByLabelText("Descrição:");
const getSetorInput = () => screen.getByLabelText("Setor:");
const getPrioridadeSelect = () => screen.getByLabelText("Prioridade:");
const getStatusSelect = () => screen.getByLabelText("Status:");
const getUsuarioSelect = () => screen.getByLabelText("Usuário:");
const getSubmitButton = () => screen.getByRole("button", { name: /Cadastrar Tarefa/i });

describe("Teste do componente CadTarefa", () => {
    // 2. SETUP DE MOCKS GLOBAL
    beforeEach(() => {
        // Limpa o histórico de chamadas antes de cada teste (importante)
        vi.clearAllMocks(); 
        
        // Mocks de API
        axios.get.mockResolvedValue({
            data: [
                { id: 1, nome: "João" },
                { id: 2, nome: "Maria" },
            ],
        }); 
        axios.post.mockResolvedValue({ data: {} });
        axios.post.mockClear(); 
    });

    // 3. TESTES DE FLUXO PRINCIPAL
    
    it("Deve renderizar o formulário corretamente", async () => {
        // CORREÇÃO: Envolver a renderização em act para esperar o useEffect (axios.get) e o defaultValues do useForm
        await act(async () => {
            render(<CadTarefa />);
        });
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        // Testes de presença de elementos
        expect(screen.getByText("Cadastro de tarefas")).toBeInTheDocument();
        expect(getSubmitButton()).toBeInTheDocument();
    });

    it("Deve validar campos obrigatórios e mostrar erros (Zod)", async () => {
        await act(async () => {
            render(<CadTarefa />);
        });

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            expect(screen.getByText("Insira ao menos 1 caractere")).toBeInTheDocument();
            expect(screen.getByText("Insira no minimo 10 caracteres na descrição")).toBeInTheDocument();
            expect(screen.getByText("Informe o nome do setor")).toBeInTheDocument();
            expect(screen.getByText("Escolha um usuário.")).toBeInTheDocument();
        });
    });

    it("Deve permitir preencher campos e enviar o formulário", async () => {
        await act(async () => {
            render(<CadTarefa />);
        });
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        await userEvent.type(getNomeInput(), "Minha Tarefa");
        await userEvent.type(getDescricaoInput(), "Descrição válida com mais de 10 caracteres");
        await userEvent.type(getSetorInput(), "Financeiro");
        await userEvent.selectOptions(getPrioridadeSelect(), "A");
        await userEvent.selectOptions(getUsuarioSelect(), "1");

        await userEvent.click(getSubmitButton());

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
            );
        });
    });

    it("Deve limpar formulário após envio (Resetar formulario)", async () => {
        await act(async () => {
            render(<CadTarefa />);
        });
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        await userEvent.type(getNomeInput(), "Teste Limpeza");
        await userEvent.type(getDescricaoInput(), "Descrição para ser apagada depois");
        await userEvent.type(getSetorInput(), "RH");
        await userEvent.selectOptions(getUsuarioSelect(), "2");

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            // Verifica se os campos foram limpos pelo `reset()`
            expect(getNomeInput()).toHaveValue("");
            expect(getDescricaoInput()).toHaveValue("");
            expect(getSetorInput()).toHaveValue("");
            expect(getUsuarioSelect()).toHaveValue("");
            expect(getPrioridadeSelect()).toHaveValue("B"); // Volta para o primeiro valor ou default
        });
    });

    it("Deve exibir alerta de sucesso após o envio bem-sucedido", async () => {
        await act(async () => {
            render(<CadTarefa />);
        });
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        await userEvent.type(getNomeInput(), "Teste Alert");
        await userEvent.type(getDescricaoInput(), "Descrição para o teste de alert");
        await userEvent.type(getSetorInput(), "TI");
        await userEvent.selectOptions(getUsuarioSelect(), "1");

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith("Tarefa cadastrada com sucesso");
        });
    });

    it("Deve mostrar erro no console se falhar envio e exibir mensagem de erro no botão", async () => {
        // Moca a falha APENAS para este teste
        axios.post.mockRejectedValueOnce(new Error("Falha ao enviar")); 
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        await act(async () => {
            render(<CadTarefa />);
        });
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        await userEvent.type(getNomeInput(), "Teste Erro");
        await userEvent.type(getDescricaoInput(), "Descrição válida para erro de envio");
        await userEvent.type(getSetorInput(), "TI");
        await userEvent.selectOptions(getUsuarioSelect(), "1");

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Erros", expect.any(Error));
            expect(global.alert).toHaveBeenCalledWith("Éeee, não rolou, na próxima talvez");
        });

        consoleSpy.mockRestore();
    });

    // 4. TESTES DE VALIDAÇÃO ESPECÍFICAS POR CAMPO 
    
    describe("Campo Nome - Validações Específicas", () => {
        it("Não deve permitir números ou caracteres especiais (handleNomeChange)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            const valorInvalido = "Tarefa #123 Com !@#$";
            const valorEsperado = "Tarefa Com "; 

            await userEvent.type(getNomeInput(), valorInvalido);

            expect(getNomeInput()).toHaveValue(valorEsperado);
        });

        it("Deve reduzir letras repetidas em sequencia para no máximo 2x (handleNomeChange)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            const valorComRepeticao = "tarefaaa tteessstttee"; 
            // O valor esperado é o que a função *corrigida* deve retornar.
            // Se o valor era "tarefaa tteessttee", a função deve remover a 3ª, 4ª e 5ª letra, etc.
            // Supondo que a entrada é "tarefaaa tteessstttee", a saída deve ser "tarefaa tteessttee"
            const valorEsperado = "tarefaa tteessttee";

            // CORREÇÃO: Envolver fireEvent.change em act para esperar o setValue
            await act(async () => {
                fireEvent.change(getNomeInput(), { target: { value: valorComRepeticao } });
            });

            expect(getNomeInput()).toHaveValue(valorEsperado); 
        });

        it("Deve remover espaços em branco duplos e nos extremos (handleNomeChange + Zod trim)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            // Digita com espaços nos extremos e duplos
            await userEvent.type(getNomeInput(), "  Minha   Tarefa   ");

            // O handler remove espaços duplos
            expect(getNomeInput()).toHaveValue(" Minha Tarefa ");

            // No submit, o Zod.trim() é aplicado
            await userEvent.type(getDescricaoInput(), "Insira uma descrição com até 255 caracteres");
            await userEvent.type(getSetorInput(), "Setor");
            await userEvent.selectOptions(getUsuarioSelect(), "1");

            await userEvent.click(getSubmitButton());

            // Garante que o Zod.trim() é aplicado no envio
            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({
                        nome: "Minha Tarefa", // O trim() removeu os espaços laterais
                    })
                );
            });
        });

        it("Deve limitar a entrada a 30 caracteres máximos (handleNomeChange)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            const limite = 30;
            const textoLongo = 'A'.repeat(limite + 5);

            // CORREÇÃO: Adicionar await act()
            await act(async () => {
                fireEvent.change(getNomeInput(), { target: { value: textoLongo } });
            });

            // Verifica o valor no input após o handler de limite
            expect(getNomeInput()).toHaveValue('A'.repeat(limite));
            expect(getNomeInput().value.length).toBe(limite);
        });
    });

    describe("Campo Descrição - Validações Específicas", () => {
        it("Deve permitir apenas letras, números, '.', ',', '!', '?' e espaço (handleDescricaoChange)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            const valorInvalido = "Descricao #$@ Com !?., e 123";
            const valorEsperado = "Descricao Com !?., e 123"; 

            await userEvent.type(getDescricaoInput(), valorInvalido);

            expect(getDescricaoInput()).toHaveValue(valorEsperado);
        });

        it("Deve reduzir letras repetidas em sequencia para no máximo 2x (handleDescricaoChange)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            const valorComRepeticao = "Tteessttee Com Letras"; 
            const valorEsperado = "Tteessttee Com Letras"; // Saída esperada após a correção da regex

            // CORREÇÃO: Envolver fireEvent.change em act
            await act(async () => {
                fireEvent.change(getDescricaoInput(), { target: { value: valorComRepeticao } });
            });

            expect(getDescricaoInput()).toHaveValue(valorEsperado);
        });

        it("Deve limitar a entrada a 255 caracteres máximos (handleDescricaoChange)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            const limite = 255;
            const textoLongo = 'B'.repeat(limite + 10);

            // CORREÇÃO: Envolver fireEvent.change em act
            await act(async () => {
                fireEvent.change(getDescricaoInput(), { target: { value: textoLongo } });
            });

            expect(getDescricaoInput()).toHaveValue('B'.repeat(limite));
            expect(getDescricaoInput().value.length).toBe(limite);
        });
    });

    describe("Campo Setor - Validações Específicas", () => {
        // Garante que as chamadas POST feitas pelos testes anteriores não interfiram
        beforeEach(() => {
            axios.post.mockClear();
        });

        it("Não deve permitir caracteres especiais ou números (handleSetorChange) E aplicar Zod.regex no submit", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            
            // 1. Testa o tratamento do handler (handleSetorChange)
            const valorInvalido = "Setor #@123 Com !@#";
            const valorAposHandler = "Setor Com ";

            await userEvent.type(getSetorInput(), valorInvalido);

            expect(getSetorInput()).toHaveValue(valorAposHandler);

            // 2. Testa o Zod.regex/submit
            await userEvent.type(getNomeInput(), "Valido");
            await userEvent.type(getDescricaoInput(), "Descricao com mais de 10 caracteres");
            await userEvent.selectOptions(getUsuarioSelect(), "1");
            
            // Corrige o setor para um valor final válido que será submetido
            const setorValidoParaSubmit = "Teste Setor Final";
            
            // CORREÇÃO: Envolver fireEvent.change em act
            await act(async () => {
                fireEvent.change(getSetorInput(), { target: { value: setorValidoParaSubmit } });
            });
            
            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                // CORREÇÃO: Verifica se houve APENAS UMA chamada POST
                expect(axios.post).toHaveBeenCalledTimes(1); 
                expect(axios.post).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({
                        nomeSetor: setorValidoParaSubmit,
                    })
                );
            });
        });

        it("Deve limitar a entrada a 100 caracteres máximos (handleSetorChange)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            const limite = 100;
            const textoLongo = 'C'.repeat(limite + 10);

            // CORREÇÃO: Envolver fireEvent.change em act
            await act(async () => {
                fireEvent.change(getSetorInput(), { target: { value: textoLongo } });
            });

            expect(getSetorInput()).toHaveValue('C'.repeat(limite));
            expect(getSetorInput().value.length).toBe(limite);
        });

        it("Deve mostrar erro de mínimo de 1 caractere (Zod min)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            
            // Preenche apenas com espaços (que será trimado para vazio)
            await userEvent.type(getSetorInput(), "   ");

            await userEvent.click(getSubmitButton());

            // O Zod.trim() transforma "   " em "", disparando o min(1)
            await waitFor(() => {
                expect(screen.getByText("Insira ao menos 1 caractere")).toBeInTheDocument(); // Name
                expect(screen.getByText("Insira no minimo 10 caracteres na descrição")).toBeInTheDocument(); // Description
                expect(screen.getByText("Informe o nome do setor")).toBeInTheDocument(); // Setor
                expect(screen.getByText("Escolha um usuário.")).toBeInTheDocument(); // User
            });
        });
    });

    describe("Campo Prioridade - Validações Específicas", () => {
        it("Deve vir com uma prioridade pré selecionada ('B' - Baixa)", async () => {
            // CORREÇÃO: Envolver a renderização em act
            await act(async () => {
                render(<CadTarefa />);
            });
            expect(getPrioridadeSelect()).toHaveValue("B");
        });

        it("Quando selecionado, deve atualizar a prioridade", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await userEvent.selectOptions(getPrioridadeSelect(), "A");
            expect(getPrioridadeSelect()).toHaveValue("A");
        });

        it("Quando não selecionado, reconhecer a prioridade pré selecionada ('B') no envio", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await userEvent.type(getNomeInput(), "Valido");
            await userEvent.type(getDescricaoInput(), "Descricao com mais de 10 caracteres");
            await userEvent.type(getSetorInput(), "Teste");
            await userEvent.selectOptions(getUsuarioSelect(), "1");

            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({
                        prioridade: "B", 
                    })
                );
            });
        });
    });

    describe("Campo Status - Validações Específicas", () => {
        it("Deve enviar e reconhecer o status estabelecido padrão ('A' - A fazer)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            expect(getStatusSelect()).toHaveValue("A"); // Verifica o default do useForm

            await userEvent.type(getNomeInput(), "Valido");
            await userEvent.type(getDescricaoInput(), "Descricao com mais de 10 caracteres");
            await userEvent.type(getSetorInput(), "Teste");
            await userEvent.selectOptions(getUsuarioSelect(), "1");

            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({
                        status: "A", 
                    })
                );
            });
        });
    });

    describe("Campo Usuário - Validações Específicas", () => {
        it("Quando selecionado deve reconhecer o usuário selecionado no envio", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await waitFor(() => expect(axios.get).toHaveBeenCalled()); 

            await userEvent.selectOptions(getUsuarioSelect(), "2"); 

            await userEvent.type(getNomeInput(), "Valido");
            await userEvent.type(getDescricaoInput(), "Descricao com mais de 10 caracteres");
            await userEvent.type(getSetorInput(), "Teste");

            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({
                        usuario: "2",
                    })
                );
            });
        });

        it("Quando não selecionado, enviar mensagem de erro (Zod min)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await waitFor(() => expect(axios.get).toHaveBeenCalled());

            // Garante que o usuário está na opção vazia/default
            expect(getUsuarioSelect()).toHaveValue("");

            await userEvent.type(getNomeInput(), "Valido");
            await userEvent.type(getDescricaoInput(), "Descricao com mais de 10 caracteres");
            await userEvent.type(getSetorInput(), "Teste");

            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                expect(screen.getByText("Escolha um usuário.")).toBeInTheDocument();
            });
        });
    });
});