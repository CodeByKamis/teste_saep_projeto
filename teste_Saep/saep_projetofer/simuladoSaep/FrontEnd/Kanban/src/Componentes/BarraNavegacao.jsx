import { Link } from "react-router-dom"; 

export function BarraNavegacao (){
    //retornando o que vai ser visualizado na tela quando a barranavegação for chamada
    return(
       <nav className="barradenavegacao">
        <ul>
            {/* links de navegação */}
           <li><Link to = '/cadUsuario'>Cadastro de Usuário</Link></li>
           <li><Link to = '/cadTarefa'>Cadastro de Tarefa</Link></li>
           <li><Link to = '/'>Gerenciamento de tarefas</Link></li>
        </ul>
       </nav> 
    )
}