import axios from 'axios'; //é o hook que faz a comunicação com a internet (Http)
import { useForm } from 'react-hook-form'; // Hook (use) aqui permite a validação de formulario
import { z } from 'zod'; // zod é uma descrição de como eu validar, quais seriam as regras
import { zodResolver } from '@hookform/resolvers/zod'; // é o que liga o hook form com o zod
import { useState, useEffect } from 'react'; //para gerenciar o status das coisas que sao puxadas do backend

//validação de formulário -- estou usando as regras do zod, que pode ser consultada na web
const schemaCadTarefa = z.object({
    nome: z.string()
        .trim()
        .min(1, 'Insira ao menos 1 caractere') //mesma mensagem que uso na hora de fazer o teste
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
        register,  //registra para mim a tarefa
        handleSubmit, //no momento que der submit
        formState: { errors }, //no formulario, se der ruim guarda os erros na variavel errors
        setValue,
        reset,} = useForm({
        resolver: zodResolver(schemaCadTarefa),
        mode: "onChange",
        defaultValues: {
            status: "A",
            prioridade: "B", // garante um valor padrão na hora do select
        },
    });

    // tratando o campo nome (previne entrada inválida antes do submit)
    const handleNomeChange = (e) => {
        let valor = e.target.value;

        valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, ""); // só letras e espaço
        valor = valor.replace(/\s{2,}/g, " "); // evita espaços duplos
        valor = valor.replace(/(.)\1{2,}/g, "$1$1"); 
        
        // max de 30 caracteres
        if (valor.length > 30) valor = valor.slice(0, 30); 

        setValue("nome", valor, { shouldValidate: true });
    };

    // tratando o campo descricao previne entrada inválida antes la no submit
    const handleDescricaoChange = (e) => {
        let valor = e.target.value;

        valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9,.!?\s]+/g, ""); // só letras, números e alguns símbolos básicos
        valor = valor.replace(/\s{2,}/g, " "); // evita espaços duplos
        valor = valor.replace(/(.)\1{2,}/g, "$1$1"); 
        
        // max de 255 caracteres
        if (valor.length > 255) valor = valor.slice(0, 255); 

        setValue("descricao", valor, { shouldValidate: true });
    };

    // campo setor, serve para previnir entrada inválida antes de submeter
    const handleSetorChange = (e) => {
        let valor = e.target.value;

        valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, ""); // só letras e espaço
        valor = valor.replace(/\s{2,}/g, " "); // evita espaços duplos
        valor = valor.replace(/(.)\1{2,}/g, "$1$1"); 
        
        // Limite de 100 caracteres
        if (valor.length > 100) valor = valor.slice(0, 100); 

        setValue("nomeSetor", valor, { shouldValidate: true });
    };

    // busca os usuários
    useEffect(() => {
       
        async function fetchUsuarios() {
            try {
                // mockar o axios.get no teste para evitar este erro em ambiente de teste
                const response = await axios.get('http://127.0.0.1:8000/api/usuario/');
                setUsuarios(response.data);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
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
            {/* cadastranod o nome da tarefa */}
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
            {/* cadastranod a descricao da tarefa */}
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
            {/*cadastrando o setor da tarefa */}
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
            {/* informando a prioridade da tarefa */}
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
            {/* o status ja vem predefinido nesse momento e sem possibilidade de alterar */}
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
            {/* informando os usuarios cadastrados no sistema para selecionar um*/}
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
                {/* botao para submeter essas informações */}
            <button type='submit'>Cadastrar Tarefa</button>
        </form>
    );
}