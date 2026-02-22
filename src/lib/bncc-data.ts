import { LibraryItem } from "./data";

export const bnccData: LibraryItem[] = [
    // --- EDUCAÇÃO INFANTIL (BE, MAT, JARDIM) ---
    { id: "bncc-ei-o-eu-o-outro-e-nos", type: "skill", code: "EI01EO01", name: "O eu, o outro e o nós", description: "Perceber que suas ações têm efeitos nas outras crianças e nos adultos.", isBNCC: true, subGroup: "Educação Infantil", grade: "infantil" },
    { id: "bncc-ei-corpo-gestos-movimentos", type: "skill", code: "EI01CG01", name: "Corpo, gestos e movimentos", description: "Movimentar as partes do corpo para exprimir corporalmente emoções, necessidades e desejos.", isBNCC: true, subGroup: "Educação Infantil", grade: "infantil" },
    { id: "bncc-ei-tracos-sons-cores-formas", type: "skill", code: "EI01TS01", name: "Traços, sons, cores e formas", description: "Explorar sons produzidos com o próprio corpo e com objetos do cotidiano.", isBNCC: true, subGroup: "Educação Infantil", grade: "infantil" },
    { id: "bncc-ei-escuta-fala-pensamento-imag-01", type: "skill", code: "EI02EF01", name: "Escuta, fala, pensamento e imaginação", description: "Dialogar com crianças e adultos, expressando seus desejos, necessidades, sentimentos e opiniões.", isBNCC: true, subGroup: "Educação Infantil", grade: "infantil" },
    { id: "bncc-ei-espacos-tempos-quantidades-01", type: "skill", code: "EI03ET01", name: "Espaços, tempos, quantidades, relações e transformações", description: "Estabelecer relações de comparação entre objetos, observando suas propriedades.", isBNCC: true, subGroup: "Educação Infantil", grade: "infantil" },

    // --- LÍNGUA PORTUGUESA (1º ao 5º ano) ---
    { id: "bncc-lp-ef01lp01", type: "skill", code: "EF01LP01", name: "Sistema de escrita alfabética", description: "Reconhecer que textos são lidos e escritos da esquerda para a direita e de cima para baixo da página.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "1ano" },
    { id: "bncc-lp-ef01lp02", type: "skill", code: "EF01LP02", name: "Escrita autônoma", description: "Escrever, espontaneamente ou por ditado, palavras e frases de forma alfabética – usando letras/grafemas que representem fonemas.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "1ano" },
    { id: "bncc-lp-ef01lp05", type: "skill", code: "EF01LP05", name: "Compreensão de leitura", description: "Reconhecer o sistema de escrita alfabética como representação dos sons da fala.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "1ano" },
    { id: "bncc-lp-ef02lp01", type: "skill", code: "EF02LP01", name: "Leitura de palavras", description: "Utilizar, ao produzir o texto, grafia correta de palavras conhecidas ou com estruturas silábicas já dominadas.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "2ano" },
    { id: "bncc-lp-ef02lp04", type: "skill", code: "EF02LP04", name: "Leitura e compreensão", description: "Ler e compreender, em colaboração com os colegas e com a ajuda do professor e, mais tarde, de maneira autônoma, textos curtos com nível de textualidade adequado.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "2ano" },
    { id: "bncc-lp-ef03lp01", type: "skill", code: "EF03LP01", name: "Fluência de leitura", description: "Ler e compreender, com autonomia, textos breves com nível de textualidade adequado.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "3ano" },
    { id: "bncc-lp-ef03lp05", type: "skill", code: "EF03LP05", name: "Produção de textos", description: "Identificar o número de sílabas de palavras, classificando-as em monossílabas, dissílabas, trissílabas e polissílabas.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "3ano" },
    { id: "bncc-lp-ef04lp01", type: "skill", code: "EF04LP01", name: "Compreensão de textos", description: "Grafar palavras utilizando regras de correspondência fonema-grafema regulares diretas e contextuais.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "4ano" },
    { id: "bncc-lp-ef04lp05", type: "skill", code: "EF04LP05", name: "Análise linguística", description: "Identificar a função na leitura e usar na escrita ponto final, ponto de interrogação, ponto de exclamação.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "4ano" },
    { id: "bncc-lp-ef05lp01", type: "skill", code: "EF05LP01", name: "Estratégia de leitura", description: "Grafar palavras utilizando regras de correspondência fonema-grafema regulares, contextuais e morfológicas.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "5ano" },
    { id: "bncc-lp-ef05lp15", type: "skill", code: "EF05LP15", name: "Compreensão de textos", description: "Ler/compreender e produzir contos, fábulas, lendas, mitos, relatos, entre outros, considerando a situação comunicativa.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "5ano" },

    // --- MATEMÁTICA (1º ao 5º ano) ---
    { id: "bncc-ma-ef01ma01", type: "skill", code: "EF01MA01", name: "Números Naturais", description: "Utilizar numbers naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas.", isBNCC: true, subGroup: "Matemática", grade: "1ano" },
    { id: "bncc-ma-ef01ma06", type: "skill", code: "EF01MA06", name: "Adição e Subtração", description: "Construir fatos básicos da adição e utilizá-los em procedimentos de cálculo para resolver problemas.", isBNCC: true, subGroup: "Matemática", grade: "1ano" },
    { id: "bncc-ma-ef01ma11", type: "skill", code: "EF01MA11", name: "Geometria Espacial", description: "Descrever a localização de pessoas e de objetos no espaço em relação à sua própria posição.", isBNCC: true, subGroup: "Matemática", grade: "1ano" },
    { id: "bncc-ma-ef02ma01", type: "skill", code: "EF02MA01", name: "Sistema de Numeração Decimal", description: "Comparar e ordenar números naturais (até a ordem de centenas) pela compreensão de características do sistema de numeração decimal.", isBNCC: true, subGroup: "Matemática", grade: "2ano" },
    { id: "bncc-ma-ef02ma05", type: "skill", code: "EF02MA05", name: "Problemas de Adição e Subtração", description: "Construir fatos básicos da adição e subtração e utilizá-los no cálculo mental ou escrito.", isBNCC: true, subGroup: "Matemática", grade: "2ano" },
    { id: "bncc-ma-ef03ma03", type: "skill", code: "EF03MA03", name: "Multiplicação", description: "Construir e utilizar fatos básicos da adição e da multiplicação para o cálculo mental ou escrito.", isBNCC: true, subGroup: "Matemática", grade: "3ano" },
    { id: "bncc-ma-ef03ma13", type: "skill", code: "EF03MA13", name: "Geometria de Figuras", description: "Associar figuras geométricas espaciais (cubo, bloco retangular, pirâmide, cone, cilindro e esfera) a objetos do mundo físico.", isBNCC: true, subGroup: "Matemática", grade: "3ano" },
    { id: "bncc-ma-ef04ma02", type: "skill", code: "EF04MA02", name: "Problemas Aritméticos", description: "Mostrar, por decomposição e composição, que todo número natural pode ser escrito por meio de adições e multiplicações.", isBNCC: true, subGroup: "Matemática", grade: "4ano" },
    { id: "bncc-ma-ef04ma17", type: "skill", code: "EF04MA17", name: "Decimais e Frações", description: "Associar frações 1/2, 1/3, 1/4, 1/5, 1/10 e 1/100 à ideia de divisão.", isBNCC: true, subGroup: "Matemática", grade: "4ano" },
    { id: "bncc-ma-ef05ma07", type: "skill", code: "EF05MA07", name: "Resolução de Problemas", description: "Resolver e elaborar problemas de adição e subtração com números naturais e com números racionais.", isBNCC: true, subGroup: "Matemática", grade: "5ano" },
    { id: "bncc-ma-ef05ma19", type: "skill", code: "EF05MA19", name: "Medidas", description: "Resolver e elaborar problemas envolvendo medidas das grandezas comprimento, área, massa, tempo.", isBNCC: true, subGroup: "Matemática", grade: "5ano" },

    // --- CIÊNCIAS (1º ao 5º ano) ---
    { id: "bncc-ci-ef01ci01", type: "skill", code: "EF01CI01", name: "Características dos Materiais", description: "Comparar características de diferentes materiais presentes em objetos de uso cotidiano.", isBNCC: true, subGroup: "Ciências", grade: "1ano" },
    { id: "bncc-ci-ef02ci04", type: "skill", code: "EF02CI04", name: "Plantas e Animais", description: "Descrever características de plantas e animais (tamanho, forma, cor, fase da vida).", isBNCC: true, subGroup: "Ciências", grade: "2ano" },
    { id: "bncc-ci-ef03ci04", type: "skill", code: "EF03CI04", name: "Animais Vertebrados", description: "Identificar características sobre o modo de vida o que comem, como se reproduzem.", isBNCC: true, subGroup: "Ciências", grade: "3ano" },
    { id: "bncc-ci-ef04ci01", type: "skill", code: "EF04CI01", name: "Misturas", description: "Identificar misturas na vida diária, com base em suas propriedades físicas observáveis.", isBNCC: true, subGroup: "Ciências", grade: "4ano" },
    { id: "bncc-ci-ef05ci02", type: "skill", code: "EF05CI02", name: "Ciclo da Água", description: "Aplicar os conhecimentos sobre as mudanças de estado físico da água para explicar o ciclo hidrológico.", isBNCC: true, subGroup: "Ciências", grade: "5ano" },

    // --- GEOGRAFIA (1º ao 5º ano) ---
    { id: "bncc-ge-ef01ge01", type: "skill", code: "EF01GE01", name: "O lugar e o sujeito", description: "Descrever características observadas de seus lugares de vivência (moradia, escola etc.)", isBNCC: true, subGroup: "Geografia", grade: "1ano" },
    { id: "bncc-ge-ef02ge01", type: "skill", code: "EF02GE01", name: "O lugar de vivência", description: "Descrever a história das migrações no bairro ou comunidade em que vive.", isBNCC: true, subGroup: "Geografia", grade: "2ano" },
    { id: "bncc-ge-ef03ge01", type: "skill", code: "EF03GE01", name: "A cidade e o campo", description: "Identificar e comparar aspectos culturais dos grupos sociais de seus lugares de vivência.", isBNCC: true, subGroup: "Geografia", grade: "3ano" },
    { id: "bncc-ge-ef04ge01", type: "skill", code: "EF04GE01", name: "Território brasileiro", description: "Selecionar na cidade ou na região de vivência, órgãos do poder público.", isBNCC: true, subGroup: "Geografia", grade: "4ano" },
    { id: "bncc-ge-ef05ge01", type: "skill", code: "EF05GE01", name: "Regiões Brasileiras", description: "Descrever a dinâmica populacional brasileira (crescimento e distribuição).", isBNCC: true, subGroup: "Geografia", grade: "5ano" },

    // --- HISTÓRIA (1º ao 5º ano) ---
    { id: "bncc-hi-ef01hi01", type: "skill", code: "EF01HI01", name: "O sujeito e seu lugar", description: "Identificar aspectos do seu crescimento por meio do registro das lembranças particulares.", isBNCC: true, subGroup: "História", grade: "1ano" },
    { id: "bncc-hi-ef02hi01", type: "skill", code: "EF02HI01", name: "Tempo histórico", description: "Reconhecer espaços de sociabilidade e identificar os motivos que aproximam as pessoas.", isBNCC: true, subGroup: "História", grade: "2ano" },
    { id: "bncc-hi-ef03hi01", type: "skill", code: "EF03HI01", name: "Espaço urbano e rural", description: "Identificar os grupos populacionais que formam a cidade de residência.", isBNCC: true, subGroup: "História", grade: "3ano" },
    { id: "bncc-hi-ef04hi01", type: "skill", code: "EF04HI01", name: "Circulação de pessoas", description: "Reconhecer a história como resultado da ação de diferentes grupos e sujeitos.", isBNCC: true, subGroup: "História", grade: "4ano" },
    { id: "bncc-hi-ef05hi01", type: "skill", code: "EF05HI01", name: "Registros e memórias", description: "Identificar e analisar o papel das culturas e das religiões na estruturação das sociedades.", isBNCC: true, subGroup: "História", grade: "5ano" },

    // --- ARTES (1º ao 5º ano) ---
    { id: "bncc-ar-ef15ar01", type: "skill", code: "EF15AR01", name: "Artes Visuais: Apreciação", description: "Identificar e apreciar formas distintas das artes visuais tradicionais e contemporâneas.", isBNCC: true, subGroup: "Artes", grade: "all" },
    { id: "bncc-ar-ef15ar02", type: "skill", code: "EF15AR02", name: "Artes Visuais: Exploração", description: "Explorar e reconhecer elementos constitutivos das artes visuais (ponto, linha, forma).", isBNCC: true, subGroup: "Artes", grade: "all" },
    { id: "bncc-ar-ef15ar08", type: "skill", code: "EF15AR08", name: "Dança: Exploração", description: "Experimentar e apreciar formas distintas de manifestações da dança.", isBNCC: true, subGroup: "Artes", grade: "all" },

    // --- EDUCAÇÃO FÍSICA (1º ao 5º ano) ---
    { id: "bncc-ef-ef12ef01", type: "skill", code: "EF12EF01", name: "Brincadeiras populares", description: "Experimentar, fruir e recriar diferentes brincadeiras e jogos da cultura popular.", isBNCC: true, subGroup: "Educação Física", grade: "1ano" },
    { id: "bncc-ef-ef35ef01", type: "skill", code: "EF35EF01", name: "Brincadeiras do Brasil", description: "Experimentar e recriar jogos e brincadeiras populares do Brasil.", isBNCC: true, subGroup: "Educação Física", grade: "3ano" },

    // --- CONTEÚDOS GERAIS BNCC (Mapeados) ---
    { id: "bncc-co-inf-01", type: "content", name: "Cores e Formas no Ambiente", description: "Identificação de cores primárias e formas básicas através da observação direta.", isBNCC: true, subGroup: "Educação Infantil", grade: "infantil" },
    { id: "bncc-co-lp-01", type: "content", name: "Gêneros Textuais: Fábulas e Contos", description: "Estudo da estrutura de fábulas clássicas e contos folclóricos.", isBNCC: true, subGroup: "Língua Portuguesa", grade: "2ano" },
    { id: "bncc-co-ma-01", type: "content", name: "Sistema Monetário Brasileiro", description: "Uso de cédulas e moedas para resolver problemas de troco e valores.", isBNCC: true, subGroup: "Matemática", grade: "3ano" },
    { id: "bncc-co-ci-01", type: "content", name: "Sistema Solar", description: "Introdução aos planetas e ao Sol como estrela central.", isBNCC: true, subGroup: "Ciências", grade: "4ano" },
    { id: "bncc-co-hi-01", type: "content", name: "História do Município", description: "Estudo sobre fundação e fatos marcos da cidade local.", isBNCC: true, subGroup: "História", grade: "4ano" },
];
