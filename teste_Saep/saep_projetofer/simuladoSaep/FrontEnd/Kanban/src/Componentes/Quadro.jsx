import React, { useState, useEffect } from "react";
import axios from "axios";
import { Coluna } from "./Coluna";
import { DndContext } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

export function Quadro() {
  //armazena os dados da tarefa
  const [tarefas, setTarefas] = useState([]);
  //pega as informações da tarefa do backend
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/tarefa/")
      .then((response) => setTarefas(response.data)) //se der certo
      .catch((error) => console.error("Erro ao carregar tarefas:", error)); //se der errado
  }, []);
  //atualia o status da tarefa
  function atualizarStatusTarefa(id, novoStatus) {
    setTarefas((prev) =>
      prev.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, status: novoStatus } : tarefa
      )
    );
  }
  
  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active && active.id !== over.id) { //vai confirmar se a tarefa foi movida para uma coluna diferente
      const tarefaId = Number(active.id);
      const novaColuna = over.id;

      atualizarStatusTarefa(tarefaId, novaColuna);
      //atualiza o status do backend
      axios
        .patch(`http://127.0.0.1:8000/api/tarefa/${tarefaId}/`, {
          status: novaColuna,
        })
        .catch((err) => console.error("Erro ao atualizar status:", err));
    }
  }
//filtra as tarefas pelo status delas
  const tarefasAfazer = tarefas.filter((t) => t.status === "A");
  const tarefasFazendo = tarefas.filter((t) => t.status === "F");
  const tarefasPronto = tarefas.filter((t) => t.status === "P");

  return (
    //retornando as informações dos quadros e seus nomes, cada quadro esta filtrado por a fazer, fazendo ou pronto
    //serve para saber onde cada tarefa vai estar localizada
    <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
      <main>
        <div className="titulodapg">
          <h1>Meu quadro</h1>
        </div>
        <section className="sectionstatus">
          {/* coluna que armazena as atividades que tem como status a fazer */}
          <Coluna
            id="A"
            titulo="A fazer"
            tarefas={tarefasAfazer}
            atualizarStatusTarefa={atualizarStatusTarefa}
          />
          {/* coluna que armazena as atividades que tem como status fazendo */}
          <Coluna
            id="F"
            titulo="Fazendo"
            tarefas={tarefasFazendo}
            atualizarStatusTarefa={atualizarStatusTarefa}
          />
          {/* coluna que armazena as atividades que tem como status pronto */}
          <Coluna
            id="P"
            titulo="Pronto"
            tarefas={tarefasPronto}
            atualizarStatusTarefa={atualizarStatusTarefa}
          />
        </section>
      </main>
    </DndContext>
  );
}
