import { BarraNavegacao } from "../Componentes/BarraNavegacao";
import { Cabecalho } from "../Componentes/Cabecalho";
import { Outlet } from "react-router-dom"; //importa o Outlet para renderizar rotas filhas do React Router


export function Inicial(){
    return(
        <>
            <Cabecalho/>
            <BarraNavegacao/>
            {/* //SPA: single page Application - da um espaço em branco que vai ser preenchido com o componente da Rota  quantdo estover com "/" então mostra quadro*/}
            <Outlet/>
        </>
    )
}