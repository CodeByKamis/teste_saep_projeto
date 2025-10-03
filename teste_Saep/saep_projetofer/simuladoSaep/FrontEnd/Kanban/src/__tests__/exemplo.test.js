import { describe, it, expect  } from "vitest";
//describe = como eu descrevo o teste
describe("Matematica basica ", ()=>{
    //qual cenário de teste estou executando
    it("soma 2 + 2", ()=>{
        //o que eu espero receber como reposta
        expect(2 + 2).toBe(4)
    });
})