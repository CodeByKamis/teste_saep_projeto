import axios from 'axios'; //é o hook que faz a comunicação com a internet (Http)
// são hooks que permite a validação de interação com o usuário... NUNCA DUVIDE DA CAPACIDADE DO USUÁRIO
// React é comum ver o zod
import { useForm } from 'react-hook-form'; // Hook (use) aqui permite a validação de formulario
import { z } from 'zod'; // zod é uma descrição de como eu validar, quais seriam as regras
import { zodResolver } from '@hookform/resolvers/zod'; // é o que liga o hook form com o zod
import { useState, useEffect } from 'react';

//validação de formulário -- estou usando as regras do zod, que pode ser consultada na web
const schemaCadTarefa = z.object({
    nome: z.string()
        .trim()
        .min(1, 'Insira ao menos 1 caractere')
        .max(30, 'Insira até 30 caracteres'),
    descricao: z.string()
        .trim()
        .min(10, 'Insira no minimo 10 caracteres na descrição ')
        .max(255, 'Insira uma escrição com até 255 carateres'),
    nomeSetor: z.string()
        .trim()
        .min(1, 'Informe o nome do setor')
        .max(100, 'Insira um com nome do setor até 100 carateres')
        .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/, 'o nome do setor não pode conter números ou símbolos'),
    prioridade: z.enum(['B', 'M', 'A']),
    status: z.enum(['A', 'F', 'P']),
    usuario: z.string().trim().min(1, "Escolha um usuário."),
})

export function CadTarefa() {

    const [usuarios, setUsuarios] = useState([]);

    const {
        register, //registra para mim o que o usuário faz
        handleSubmit, //no momento em que ele der uma submit (botão)
        formState: { errors }, //no formulario, se der ruim guarda os erros na variavel errors
        setValue,
        reset,
    } = useForm({
        resolver: zodResolver(schemaCadTarefa),
        mode: "onChange",
        defaultValues: {
            status: "A", 
        },
    });

    // setor
    const handleSetorChange = (e) => {
        let valor = e.target.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, '');
        setValue('nomeSetor', valor, { shouldValidate: true }); // validação em tempo real
    };

    // busca usuario
    useEffect(() => {
        async function fetchUsuarios() {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/usuario/');
                setUsuarios(response.data);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        }
        fetchUsuarios();
    }, []);

    async function criarTarefa(data) {
        console.log('dados informados pelo user:', data)

        //Para grande parte das interações com outra plataforma é necessário usar o try
        try {
            await axios.post("http://127.0.0.1:8000/api/tarefa/", data);
            alert("Tarefa cadastrado com sucesso");
            reset(); //limpo o formulário depois do cadastro
        } catch (error) { //se der ruim, aparece a mensagem de erro
            alert("Éeee, não rolou, na proxima talvez")
            console.log("Erros", error)
        }
    }

    return (
        // titulo importante do cadastro de tarefa
        <form className="formulario" onSubmit={handleSubmit(criarTarefa)} noValidate>
            <h2>Cadastro de tarefas</h2>
            {/* formulario para criar a tarefa */}
            <label htmlFor="nome">Nome da tarefa:</label>
            <input
                id="nome"
                type='text'
                placeholder='Digite o nome da tarefa aqui: '
                {...register("nome")}
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? "erro-nome" : undefined}
            />
            {/* mensagem de erro para o campo nome */}
            {errors.nome && <p id="erro-nome" role="alert">{errors.nome.message}</p>}

            <label htmlFor="descricao">Descrição:</label>
            <textarea
                id="descricao"
                placeholder='Digite sua descrição aqui: '
                {...register("descricao")}
                aria-invalid={!!errors.descricao}
                aria-describedby={errors.descricao ? "erro-descricao" : undefined}
            />
            {/* mensagem de erro para o campo descricao */}
            {errors.descricao && <p id="erro-descricao" role="alert">{errors.descricao.message}</p>}

            <label htmlFor="nomeSetor">Setor:</label>
            <input
                id="nomeSetor"
                type='text'
                placeholder='Digite seu setor aqui: '
                {...register("nomeSetor")}
                onChange={handleSetorChange}
                aria-invalid={!!errors.nomeSetor}
                aria-describedby={errors.nomeSetor ? "erro-nomeSetor" : undefined}
            />
            {/*mensagem de erro para para o campo nomeSetor */}
            {errors.nomeSetor && <p id="erro-nomeSetor" role="alert">{errors.nomeSetor.message}</p>}

            <label htmlFor="prioridade">Prioridade:</label>
            <select
                id="prioridade"
                placeholder='Escolha sua prioridade: '
                {...register("prioridade")}
                aria-invalid={!!errors.prioridade}
                aria-describedby={errors.prioridade ? "erro-prioridade" : undefined}
            >
                <option value="B">Baixa</option>
                <option value="M">Média</option>
                <option value="A">Alta</option>
            </select>
            {/* mensagem de erro para o campo prioridade */}
            {errors.prioridade && <p id="erro-prioridade" role="alert">{errors.prioridade.message}</p>}

            <label htmlFor="status">Status:</label>
            <select
                id="status"
                placeholder='Escolha seu status: '
                {...register("status")}
                aria-invalid={!!errors.status}
                aria-describedby={errors.status ? "erro-status" : undefined}
            >
                <option value="A">A fazer</option>
                
            </select>
            {/*mensagem de erro para o campo status */}
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
            {/* mensagem de erro para o campo usuario */}
            {errors.usuario && <p id="erro-usuario" role="alert">{errors.usuario.message}</p>}

            <button type='submit'>Cadastrar Tarefa</button>
        </form>
    );
}
