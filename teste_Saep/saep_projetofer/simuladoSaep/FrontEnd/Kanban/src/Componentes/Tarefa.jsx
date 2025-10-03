import axios from "axios";  //é o hook que faz a comunicação com a internet (Http)
import { useState } from "react"; //para visualizar o estado das coisas
import { useNavigate } from "react-router-dom"; // navegação programática entre rotas no React Router
import { useDraggable } from "@dnd-kit/core";//funcionalidades de arrastar e soltar 



export function Tarefa({ tarefa, atualizarStatusTarefa }) {
  const navigate = useNavigate(); 
  //controlar o status selecionado no formulário
  const [novoStatus, setNovoStatus] = useState(tarefa.status);

  //configura o drag apenas no header usando usedraggable
  const { attributes, listeners, setNodeRef: setHandleRef, transform, isDragging  } = useDraggable({
    id: tarefa.id.toString(),
  });
  //estilo de transformação durante o drag
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        position: "relative",
      }
    : undefined;
  // essa funcao aqui é pra excluir tarefa depois da confirmação com a chamada da API
  async function excluirTarefa(id) {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/tarefa/${id}/`);
        alert("Tarefa excluída com sucesso!");
        window.location.reload();//atualiza a página
      } catch (error) {
        console.error("Erro ao excluir tarefa:", error);
        alert("Erro ao excluir tarefa.");
      }
    }
  }
  //leva de volta para a edicao de tarefa
  function handleEditar() {
    navigate(`/editarTarefa/${tarefa.id}`);
  }
  // muda o status da tarefa usando a api e atualiza o estado no componente principal
  async function alterarStatus(e) {
    e.preventDefault();
    try {
      await axios.patch(`http://127.0.0.1:8000/api/tarefa/${tarefa.id}/`, {
        status: novoStatus,
      });
      alert("Status alterado com sucesso!");
      atualizarStatusTarefa(tarefa.id, novoStatus);
    } catch (error) {
      console.error("Erro ao alterar status:", error.response?.data || error);
      alert("Erro ao alterar status.");
    }
  }

  return (
    <article className="card-tarefa" style={style}>
      {/* para arrastar */}
      <div
        ref={setHandleRef}
        {...listeners}
        {...attributes}
        style={{ cursor: "grab" }}
        className={isDragging ? "dragging" : ""}
        //aria
        role="button"
        aria-grabbed={isDragging}
        aria-labelledby={`tarefa-${tarefa.id}`}
      >
        {/* mostra as informações da tarefa */}
        <dl className="informtarefas">
          <div className="linha-info">
            <dt>Descrição:</dt>
            <dd id={`tarefa-${tarefa.id}`}>{tarefa.descricao}</dd>
          </div>
          <div className="linha-info">
            <dt>Setor:</dt>
            <dd>{tarefa.nomeSetor}</dd>
          </div>
          <div className="linha-info">
            <dt>Prioridade:</dt>
            <dd>{tarefa.prioridade}</dd>
          </div>
          <div className="linha-info">
            <dt>Vinculado a:</dt>
            <dd>{tarefa.usuario_nome}</dd>
          </div>
        </dl>
      </div>

      {/* botoes de editar e excluir a tarefa */}
      <div>
        <button onClick={handleEditar}>Editar</button>
        <button onClick={() => excluirTarefa(tarefa.id)}>Excluir</button>
      </div>
      {/* alterar o status */}
      <form className="tarefa__status" onSubmit={alterarStatus}>
        <label htmlFor={`status-${tarefa.id}`}>Status:</label>       
        <select
          id={`status-${tarefa.id}`}
          name="status"
          value={novoStatus}
          onChange={(e) => setNovoStatus(e.target.value)}
        >
          <option value="">Selecione</option>
          <option value="A">A fazer</option>
          <option value="F">Fazendo</option>
          <option value="P">Pronto</option>
        </select>
        <button type="submit">Alterar Status</button>
      </form>


    </article>
  );
}
