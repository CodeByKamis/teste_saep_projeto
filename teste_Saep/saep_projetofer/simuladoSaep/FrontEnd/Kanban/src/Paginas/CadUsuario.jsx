import axios from 'axios'; //é o hook que faz a comunicação com a internet (Http)
// são hooks que permite a validação de interação com o usuário... NUNCA DUVIDE DA CAPACIDADE DO USUÁRIO
// React é comum ver o zod
import { useForm } from 'react-hook-form'; // Hook (use) aqui permite a validação de formulario
import { z } from 'zod'; // zod é uma descrição de como eu validar, quais seriam as regras
import { zodResolver } from '@hookform/resolvers/zod'; // é o que liga o hook form com o zod

//validação de formulário -- estou usando as regras do zod, que pode ser consultada na web
const schemaCadUsuario = z.object({
    nome: z.string()
        .min(1, 'Insira ao menos 1 caractere') //é o minimo
        .max(30, 'Insira até 30 caracteres') //e o maximo
        .regex(
        /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/,
        "Digite nome completo (nome e sobrenome), sem números ou símbolos, sem espaços no início/fim"
        ),
    email: z.string()
        .min(1, 'Insira um endereço de email com até 30 carateres')
        .max(30, 'Insira um endereço de email com até 30 carateres')
        .email("Formato de email inválido")
        .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Formato de email inválido"
        ),
})

export function CadUsuario() {

    const {
        register, //registra para mim o que o usuário faz
        handleSubmit, //serve pra o momento em que der submit
        formState: { errors }, //no formulario, se der ruim guarda os erros na variavel errors
        setValue,
        reset,
    } = useForm({
        resolver: zodResolver(schemaCadUsuario),
        mode: "onChange",
    });

    // tratando o campo nome para prevenir entrada inválida antes do submit
    const handleNomeChange = (e) => {
        let valor = e.target.value;

        valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, ""); // só letras e espaço
        valor = valor.replace(/\s{2,}/g, " "); // evita espaços duplos
        valor = valor.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])\1{2,}/g, "$1$1"); // evita repetições exageradas de letras (ex: "mmmmaria" -> "mmaria")
        if (valor.length > 30) valor = valor.slice(0, 30); // máximo 30 caracter

        setValue("nome", valor);
    };

    // tratando o campo email
    const handleEmailChange = (e) => {
        let valor = e.target.value.trim();
        if (valor.length > 50) valor = valor.slice(0, 50); // máximo 50 caracter
        setValue("email", valor);
    };
    
    async function obterdados(data) {
        console.log('dados informados pelo user:', data)

        //try é para ele tentar executar a função
        try {
            await axios.post("http://127.0.0.1:8000/api/usuario/", data);
            alert("Usuário cadastrado com sucesso");
            reset(); //para limpar o formulário depois de submeter as informações
        } catch (error) { //se der ruim, aparece a mensagem de erro
            alert("Éeee, não rolou, na proxima talvez")
            console.log("Erros", error)
        }
    }

    return (
        <form className="formularios" onSubmit={handleSubmit(obterdados)} noValidate>
            <h2>Cadastro do Usuário</h2>
            {/* campo para preencher o nome */}

            <label htmlFor='nome'>Nome:</label>
            <input
                type='text'
                id='nome'
                placeholder='Jose da Silva'
                {...register("nome")}
                onChange={handleNomeChange}
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? "erro-nome" : undefined}
            />
            {/* mensagem de erro para campo nome */}
            {errors.nome && <p id="erro-nome" role="alert">{errors.nome.message}</p>}
            {/* campo para preencher o email */}
            <label htmlFor='email'>Email</label>
            <input
                type='email'
                id='email'
                placeholder='email@email.com'
                {...register("email")}
                onChange={handleEmailChange}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "erro-email" : undefined}
            />
            {/* mensagem de erro para o campo email */}
            {errors.email && <p id="erro-email" role="alert">{errors.email.message}</p>}
            {/* botao pra submeter as informções depois de preenchidad adequadamente*/}
            <button id='botao' type='submit'>Cadastrar</button>
        </form>
    )
}
