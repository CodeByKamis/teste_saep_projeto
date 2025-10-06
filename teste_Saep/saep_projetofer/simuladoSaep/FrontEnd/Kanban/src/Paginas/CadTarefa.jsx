import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';

// validação de formulário
const schemaCadTarefa = z.object({
    nome: z.string()
        .trim()
        .min(1, 'Insira ao menos 1 caractere')
        .max(30, 'Insira até 30 caracteres'),
    descricao: z.string()
        .trim()
        .min(10, 'Insira no minimo 10 caracteres na descrição')
        .max(255, 'Insira uma descrição com até 255 caracteres'),
    nomeSetor: z.string()
        .trim()
        .min(1, 'Informe o nome do setor')
        .max(100, 'Insira um nome do setor até 100 caracteres')
        .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/, 'O nome do setor não pode conter números ou símbolos'),
    prioridade: z.enum(['B', 'M', 'A']),
    status: z.enum(['A', 'F', 'P']),
    usuario: z.string().trim().min(1, "Escolha um usuário."),
});

export function CadTarefa() {

    const [usuarios, setUsuarios] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm({
        resolver: zodResolver(schemaCadTarefa),
        mode: "onChange",
        defaultValues: {
            status: "A",
            prioridade: "B", // Adicionado para garantir um valor padrão no select
        },
    });

    // tratando o campo nome (previne entrada inválida antes do submit)
    const handleNomeChange = (e) => {
        let valor = e.target.value;

        valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, ""); // só letras e espaço
        valor = valor.replace(/\s{2,}/g, " "); // evita espaços duplos
        // CORREÇÃO: Usa (.) para pegar QUALQUER caractere e limitar repetições
        valor = valor.replace(/(.)\1{2,}/g, "$1$1"); 
        
        // Limite de 30 caracteres (verificado depois das substituições)
        if (valor.length > 30) valor = valor.slice(0, 30); 

        setValue("nome", valor, { shouldValidate: true });
    };

    // tratando o campo descricao (previne entrada inválida antes do submit)
    const handleDescricaoChange = (e) => {
        let valor = e.target.value;

        valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9,.!?\s]+/g, ""); // só letras, números e alguns símbolos básicos
        valor = valor.replace(/\s{2,}/g, " "); // evita espaços duplos
        // CORREÇÃO: Usa (.) para pegar QUALQUER caractere e limitar repetições
        valor = valor.replace(/(.)\1{2,}/g, "$1$1"); 
        
        // Limite de 255 caracteres
        if (valor.length > 255) valor = valor.slice(0, 255); 

        setValue("descricao", valor, { shouldValidate: true });
    };

    // tratando o campo setor (previne entrada inválida antes do submit)
    const handleSetorChange = (e) => {
        let valor = e.target.value;

        valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, ""); // só letras e espaço
        valor = valor.replace(/\s{2,}/g, " "); // evita espaços duplos
        // CORREÇÃO: Usa (.) para pegar QUALQUER caractere e limitar repetições
        valor = valor.replace(/(.)\1{2,}/g, "$1$1"); 
        
        // Limite de 100 caracteres
        if (valor.length > 100) valor = valor.slice(0, 100); 

        setValue("nomeSetor", valor, { shouldValidate: true });
    };

    // busca usuários
    useEffect(() => {
        // ... (fetchUsuarios permanece igual, mas se der erro no teste de Prioridade,
        // pode ser necessário mockar o retorno desta função no arquivo de teste)
        async function fetchUsuarios() {
            try {
                // Mockar o axios.get no teste para evitar este erro em ambiente de teste
                const response = await axios.get('http://127.0.0.1:8000/api/usuario/');
                setUsuarios(response.data);
            } catch (error) {
                // console.error('Erro ao buscar usuários:', error);
            }
        }
        fetchUsuarios();
    }, []);

    async function criarTarefa(data) {
        console.log('dados informados pelo user:', data);

        try {
            await axios.post("http://127.0.0.1:8000/api/tarefa/", data);
            alert("Tarefa cadastrada com sucesso");
            reset(); // limpa o formulário depois do cadastro
        } catch (error) {
            alert("Éeee, não rolou, na próxima talvez");
            console.log("Erros", error);
        }
    }

    return (
        <form className="formulario" onSubmit={handleSubmit(criarTarefa)} noValidate>
            <h2>Cadastro de tarefas</h2>

            <label htmlFor="nome">Nome da tarefa:</label>
            <input
                id="nome"
                type='text'
                placeholder='Digite o nome da tarefa aqui'
                {...register("nome")}
                onChange={handleNomeChange}
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? "erro-nome" : undefined}
            />
            {errors.nome && <p id="erro-nome" role="alert">{errors.nome.message}</p>}

            <label htmlFor="descricao">Descrição:</label>
            <textarea
                id="descricao"
                placeholder='Digite sua descrição aqui'
                {...register("descricao")}
                onChange={handleDescricaoChange}
                aria-invalid={!!errors.descricao}
                aria-describedby={errors.descricao ? "erro-descricao" : undefined}
            />
            {errors.descricao && <p id="erro-descricao" role="alert">{errors.descricao.message}</p>}

            <label htmlFor="nomeSetor">Setor:</label>
            <input
                id="nomeSetor"
                type='text'
                placeholder='Digite seu setor aqui'
                {...register("nomeSetor")}
                onChange={handleSetorChange}
                aria-invalid={!!errors.nomeSetor}
                aria-describedby={errors.nomeSetor ? "erro-nomeSetor" : undefined}
            />
            {errors.nomeSetor && <p id="erro-nomeSetor" role="alert">{errors.nomeSetor.message}</p>}

            <label htmlFor="prioridade">Prioridade:</label>
            <select
                id="prioridade"
                {...register("prioridade")}
                aria-invalid={!!errors.prioridade}
                aria-describedby={errors.prioridade ? "erro-prioridade" : undefined}
            >
                <option value="B">Baixa</option>
                <option value="M">Média</option>
                <option value="A">Alta</option>
            </select>
            {errors.prioridade && <p id="erro-prioridade" role="alert">{errors.prioridade.message}</p>}

            <label htmlFor="status">Status:</label>
            <select
                id="status"
                {...register("status")}
                aria-invalid={!!errors.status}
                aria-describedby={errors.status ? "erro-status" : undefined}
            >
                <option value="A">A fazer</option>
            </select>
            {errors.status && <p id="erro-status" role="alert">{errors.status.message}</p>}

            <label htmlFor="usuario">Usuário:</label>
            <select
                id="usuario"
                {...register('usuario')}
                aria-invalid={!!errors.usuario}
                aria-describedby={errors.usuario ? "erro-usuario" : undefined}
            >
                <option value="">Selecione um usuário</option>
                {usuarios.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.nome}
                    </option>
                ))}
            </select>
            {errors.usuario && <p id="erro-usuario" role="alert">{errors.usuario.message}</p>}

            <button type='submit'>Cadastrar Tarefa</button>
        </form>
    );
}