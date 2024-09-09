const readline = require('node:readline');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


class Zoo {
    constructor() {
        this.animais = new Map(); 
        this.recintos = []; 
    }

   
    iniciarAnimais() {
        this.animais.set("LEAO", new Animais(3, ["savana"]));
        this.animais.set("LEOPARDO", new Animais(2, ["savana"]));
        this.animais.set("CROCODILO", new Animais(3, ["rio"]));
        this.animais.set("MACACO", new Animais(1, ["savana", "floresta"]));
        this.animais.set("GAZELA", new Animais(2, ["savana"]));
        this.animais.set("HIPOPOTAMO", new Animais(4, ["savana", "rio"]));
    }

 
    analisaRecintos(especie, quantidade) {
        let resultado = {};

       
        if (!this.animais.has(especie)) {
            resultado.erro = "Animal inválido";
            return resultado;
        }

        
        if (quantidade <= 0) {
            resultado.erro = "Quantidade inválida";
            return resultado;
        }

        const info = this.animais.get(especie); 
        let recintosViaveis = [];

        // Verifica os recintos para ver quais são compatíveis com o animal
        for (const recinto of this.recintos) {
            if (recinto.compativel(especie, quantidade, info.tamanho, info.bioma)) {
                let espacoLivreAposInclusao = recinto.espaco() - (quantidade * info.tamanho);
                if (!recinto.animaisExistentes.includes(especie) && recinto.animaisExistentes.length > 0) {
                    espacoLivreAposInclusao -= 1; // Reduz o espaço caso haja outra espécie no recinto
                }
                recintosViaveis.push(`Recinto ${recinto.numero} (espaço livre: ${espacoLivreAposInclusao}, total: ${recinto.tamanhoTotal})`);
            }
        }

        // Verifica se há recintos viáveis
        if (recintosViaveis.length === 0) {
            resultado.erro = "Não há recinto viável";
        } else {
            recintosViaveis.sort(); // Ordena os recintos
            resultado.recintosViaveis = recintosViaveis;
        }

        return resultado;
    }
}


class Animais {
    constructor(tamanho, biomas) {
        this.tamanho = tamanho;
        this.bioma = biomas;
    }

    // Método para verificar se o animal é carnívoro
    carnivoro(especie) {
        return ["LEAO", "LEOPARDO", "CROCODILO"].includes(especie);
    }
}

// Classe Recinto que representa o habitat dos animais no zoológico
class Recinto {
    constructor(numero, bioma, tamanhoTotal, animaisExistentes, ocupacao) {
        this.numero = numero;
        this.bioma = bioma;
        this.tamanhoTotal = tamanhoTotal; // Tamanho total do recinto
        this.animaisExistentes = animaisExistentes; // Lista de animais que já estão no recinto
        this.ocupacao = ocupacao; // Espaço ocupado no recinto
    }

   
    espaco() {
        return this.tamanhoTotal - this.ocupacao;
    }


    soMesmaEspecie(especie) {
        return this.animaisExistentes.every(animal => animal === especie);
    }

    // Método para verificar se o recinto é compatível com a espécie e quantidade de animais
    compativel(especie, quantidade, tamanho, biomas) {
      
        if (!biomas.includes(this.bioma)) {
            return false;
        }

        // Carnívoros só podem habitar com a própria espécie
        if (this.animaisExistentes.length > 0 && new Animais().carnivoro(especie) && !this.soMesmaEspecie(especie)) {
            return false;
        }

        // Hipopótamos só aceitam outros animais se o recinto tiver savana e rio
        if (especie === "HIPOPOTAMO" && !(this.bioma.includes("savana") && this.bioma.includes("rio"))) {
            return false;
        }

        // Macacos não gostam de ficar sozinhos no recinto
        if (especie === "MACACO" && this.animaisExistentes.length === 0) {
            return false;
        }

        // Calcula o espaço necessário para acomodar os animais
        let espacoNecessario = quantidade * tamanho;
        if (this.animaisExistentes.length > 0 && !this.animaisExistentes.includes(especie)) {
            espacoNecessario += 1; // Considera 1 espaço extra se houver mais de uma espécie no recinto
        }

        return this.espaco() >= espacoNecessario;
    }
}


const zoo = new Zoo();
zoo.iniciarAnimais();


rl.question("Digite a espécie e quantidade no formato 'especie,quantidade': ", (input) => {
    const [especie, quantidadeStr] = input.split(',');
    const quantidade = parseInt(quantidadeStr);

   
    if (!especie || isNaN(quantidade)) {
        console.log("use o formato 'especie,quantidade'.");
    } else {
        const resultado = zoo.analisaRecintos(especie.toUpperCase(), quantidade);

        if (resultado.erro) {
            console.log(resultado.erro);
        } else {
            console.log("Recintos viáveis: ", resultado.recintosViaveis);
        }
    }


    rl.close();
});
