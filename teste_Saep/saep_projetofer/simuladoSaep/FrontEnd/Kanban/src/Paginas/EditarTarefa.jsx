import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; //acessar informacoes da url
import { useForm } from 'react-hook-form'; //usar folumarios em rect
import { zodResolver } from '@hookform/resolvers/zod'; //integra o zod com o react-hok-form
import { z } from 'zod'; //validacao dos dados
import axios from 'axios'; //liga com o backend

//validacao com zod para os campos que da para mudar na tarefa
const schemaEditarTarefas = z.object({
  prioridade: z.enum(['Baixa', 'Média', 'Alta'], {
    required_error: 'Selecione uma prioridade válida',
  }),
  status: z.enum(['A fazer', 'Fazendo', 'Pronto'], {
    required_error: 'Selecione um status válido',
  }),
});
//edicao de tarefa
export function EditarTarefa() {
  const { id } = useParams();
  const [tarefa, setTarefa] = useState(null);

  const {
    register, //registra os input
    handleSubmit, //submit da informacao
    formState: { errors }, //os erros
    reset,
  } = useForm({ resolver: zodResolver(schemaEditarTarefas) }); //valida com o zod

  //carrega os dados da tarefa pegando do backend com a path
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/tarefa/${id}/`)
      .then((res) => {
        const data = res.data;
        setTarefa(data); //vai aarmazenar as informacoes
        reset({
          prioridade: data.prioridade === 'B' ? 'Baixa' : data.prioridade === 'M' ? 'Média' : 'Alta',
          status: data.status === 'A' ? 'A fazer' : data.status === 'F' ? 'Fazendo' : 'Pronto'
        });
      })
      .catch((err) => console.error("Erro ao buscar tarefa", err));
  }, [id, reset]); //se der erro ele aparece

  async function salvarEdicao(data) {
    const payload = {
      prioridade: data.prioridade === 'Baixa' ? 'B' : data.prioridade === 'Média' ? 'M' : 'A',
      status: data.status === 'A fazer' ? 'A' : data.status === 'Fazendo' ? 'F' : 'P',
    };
    try {
      await axios.patch(`http://127.0.0.1:8000/api/tarefa/${id}/`, payload);
      alert("Tarefa editada com sucesso"); //ele vai tentar rodar
    } catch (err) {
      console.error("Deu ruim", err);
      alert("Houve um erro ao editar a tarefa"); //se der erro o catch roda
    }
  }

  //enquanto as info n aparece, fica mostrando essa mensagem bonitinha
  if (!tarefa) return <p>Carregando...</p>;

  return (
    <section className='formulario'>
      {/* titulo principal da pagina */}
      <h2>Editar Tarefa</h2>
      {/* formulario com os campos para fazer o input das informacoes */}
      <form className='edicaoform' onSubmit={handleSubmit(salvarEdicao)} noValidate>
        <label htmlFor="descricao">Descrição:</label>
        <textarea id="descricao" value={tarefa.descricao} readOnly />

        <label htmlFor="setor">Setor:</label>
        <input id="setor" type="text" value={tarefa.nomeSetor} readOnly />

        <label htmlFor="prioridade">Prioridade:</label>
        <select
          id="prioridade"
          {...register('prioridade')}
          aria-invalid={!!errors.prioridade}
          aria-describedby={errors.prioridade ? "erro-prioridade" : undefined}
        >
          <option value="">Selecione</option>
          <option value="Baixa">Baixa</option>
          <option value="Média">Média</option>
          <option value="Alta">Alta</option>
        </select>
        {/* mensagem de erro para prioridade */}
        {errors.prioridade && (
          <p id="erro-prioridade" role="alert" className='mensagemdeerro'>
            {errors.prioridade.message}
          </p>
        )}

        <label htmlFor="status">Status:</label>
        <select
          id="status"
          {...register('status')}
          aria-invalid={!!errors.status}
          aria-describedby={errors.status ? "erro-status" : undefined}
        >
          <option value="A fazer">A fazer</option>
          <option value="Fazendo">Fazendo</option>
          <option value="Pronto">Pronto</option>
        </select>
        {/* mensagem de erro para status */}
        {errors.status && (
          <p id="erro-status" role="alert" className='error-message'>
            {errors.status.message}
          </p>
        )}
        {/* botao para dar submit no banco e salvar tudo no backend */}
        <button className='botao' type="submit">Editar</button>
      </form>
    </section>
  );
}
