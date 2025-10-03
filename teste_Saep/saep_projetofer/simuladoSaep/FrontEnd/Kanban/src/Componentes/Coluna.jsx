import { Tarefa } from "./Tarefa"; //importanto tarefa
import { useDroppable } from "@dnd-kit/core"; //para importar o dragindrop

export function Coluna({ id, titulo, tarefas = [], atualizarStatusTarefa }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <section
      className="colunatarefa" ref={setNodeRef}>
      {/* o titulo de coluna */}
      <h2>{titulo}</h2>
      {/* informações da tarefa */}
      {tarefas.map((tarefa) => (<Tarefa key={tarefa.id} tarefa={tarefa} atualizarStatusTarefa={atualizarStatusTarefa}/>))}
    </section>
  );
}
