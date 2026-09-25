import type { CityGuide } from './travel-guide';

export const parisGuide: CityGuide = {
  market: [
    {
      id: 'macarons',
      group: 'sweets',
      name: { en: 'Macarons', 'pt-BR': 'Macarons' },
      description: {
        en: "Paris's signature sweet: two almond-meringue shells around a ganache or jam filling. Pierre Hermé is known for bold flavours such as Ispahan (rose, lychee, raspberry); Ladurée, on Rue Royale since 1862, for the classic pastel boxes. They keep 5 days in the fridge, per Pierre Hermé — carry the box in your hand luggage and take them out 30 minutes before eating.",
        'pt-BR': 'O doce-símbolo de Paris: duas cascas de merengue de amêndoa com recheio de ganache ou geleia. A Pierre Hermé é famosa por sabores ousados como o Ispahan (rosa, lichia e framboesa); a Ladurée, na Rue Royale desde 1862, pelas clássicas caixas em tons pastel. Segundo a Pierre Hermé, duram 5 dias na geladeira — leve a caixa na bagagem de mão e tire da geladeira 30 minutos antes de comer.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Various_Pierre_Herme_macarons.jpg/500px-Various_Pierre_Herme_macarons.jpg',
        alt: { en: 'Assorted Pierre Hermé macarons', 'pt-BR': 'Macarons variados da Pierre Hermé' },
        credit: 'Tristan Ferne / Wikimedia Commons (CC BY 2.0)',
      },
      where: ['par-pierre-herme', 'par-laduree-royale'],
    },
    {
      id: 'fine-chocolates',
      group: 'sweets',
      name: { en: 'Fine chocolates', 'pt-BR': 'Bombons finos' },
      description: {
        en: "Paris chocolatiers sell ganaches and pralinés by the piece or boxed. Patrick Roger, a Meilleur Ouvrier de France, is known for the Amazone, a green half-sphere filled with Brazilian-lime ganache; À la Mère de Famille, at the same address since 1761, is the city's oldest chocolate and sweet shop. Brazil's Vigiagro list lets chocolate in freely — just keep the box away from heat.",
        'pt-BR': 'Os chocolatiers de Paris vendem ganaches e pralinés por unidade ou em caixas. Patrick Roger, Meilleur Ouvrier de France, é famoso pelo Amazone, uma meia-esfera verde recheada com ganache de limão brasileiro; a À la Mère de Famille, no mesmo endereço desde 1761, é a chocolateria e confeitaria mais antiga da cidade. A lista do Vigiagro libera chocolate na bagagem — só mantenha a caixa longe do calor.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Life_is_like_a_box_of_chocolates_%2830010653303%29.jpg/500px-Life_is_like_a_box_of_chocolates_%2830010653303%29.jpg',
        alt: {
          en: 'A Patrick Roger box of chocolates, green half-spheres included',
          'pt-BR': 'Caixa de bombons Patrick Roger, com as meias-esferas verdes',
        },
        credit: 'Sheila Sund from Salem, United States / Wikimedia Commons (CC BY 2.0)',
      },
      where: ['par-patrick-roger-madeleine', 'par-mere-de-famille-faubourg-montmartre'],
    },
    {
      id: 'salted-butter-caramels',
      group: 'sweets',
      name: { en: 'Salted-butter caramels', 'pt-BR': 'Caramelos de manteiga salgada' },
      description: {
        en: "Soft caramels made with salted butter, a Breton speciality. Henri Le Roux created his trademarked CBS (caramel au beurre salé) in Quiberon in 1977 and sells it in Saint-Germain; Jacques Genin's Marais chocolaterie makes some of Paris's most praised caramels, in flavours like mango-passion fruit and ginger. Individually wrapped, they travel well, and candy is allowed into Brazil.",
        'pt-BR': 'Caramelos macios feitos com manteiga salgada, especialidade da Bretanha. Henri Le Roux criou o CBS (caramel au beurre salé, marca registrada) em Quiberon, em 1977, e o vende em Saint-Germain; a chocolateria de Jacques Genin, no Marais, faz alguns dos caramelos mais elogiados de Paris, em sabores como manga com maracujá e gengibre. Embalados um a um, viajam bem, e bala pode entrar no Brasil.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/CARAMEL_CBS.jpeg/500px-CARAMEL_CBS.jpeg',
        alt: {
          en: 'Two wrapped Le Roux CBS salted-butter caramels',
          'pt-BR': 'Dois caramelos CBS da Le Roux embalados',
        },
        credit: 'Fortetclair75 / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-jacques-genin-marais', 'par-le-roux-saint-germain'],
    },
    {
      id: 'poilane-punitions',
      group: 'sweets',
      name: { en: 'Poilâne punitions', 'pt-BR': 'Punitions da Poilâne' },
      description: {
        en: "Small, thin butter shortbreads from Paris's most famous sourdough bakery, founded on Rue du Cherche-Midi in 1932. The name ('punishments') recalls a grandmother who called the children for their 'punishment', then opened her hand to reveal biscuits. Sold in sealed, labelled bags from 135 g, they pack easily.",
        'pt-BR': "Biscoitinhos finos amanteigados da padaria de fermentação natural mais famosa de Paris, fundada na Rue du Cherche-Midi em 1932. O nome ('castigos') lembra uma avó que chamava as crianças para o 'castigo' e abria a mão cheia de biscoitos. Vêm em pacotes lacrados e rotulados a partir de 135 g, fáceis de levar.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Le_v%C3%A9ritable_petit_sabl%C3%A9.jpg/500px-Le_v%C3%A9ritable_petit_sabl%C3%A9.jpg',
        alt: {
          en: 'Round golden French butter sablés, similar to Poilâne punitions (generic photo, not Poilâne)',
          'pt-BR': 'Sablés franceses redondos e dourados, parecidos com os punitions da Poilâne (foto genérica, não é da Poilâne)',
        },
        credit: 'Antoine mf Pelletier / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-poilane-cherche-midi', 'par-poilane'],
    },
    {
      id: 'supermarket-biscuits',
      group: 'sweets',
      name: {
        en: 'Supermarket biscuits (LU, St Michel, Bonne Maman)',
        'pt-BR': 'Biscoitos de supermercado (LU, St Michel, Bonne Maman)',
      },
      description: {
        en: "The cheapest edible souvenirs: LU Petit Beurre (created in Nantes in 1886), St Michel butter galettes and Bonne Maman madeleines. Factory-sealed and labelled, they survive the suitcase and meet Brazil's rules for industrial biscuits. Multipacks of individually wrapped portions make the easiest gifts.",
        'pt-BR': 'Os souvenirs comestíveis mais baratos: LU Petit Beurre (criado em Nantes em 1886), galettes amanteigadas St Michel e madeleines Bonne Maman. Lacrados e rotulados de fábrica, aguentam a mala e cumprem a regra do Brasil para biscoitos industrializados. Os pacotes com porções embaladas uma a uma são os presentes mais fáceis.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Petit_Beurre_LU.JPG/500px-Petit_Beurre_LU.JPG',
        alt: {
          en: "A LU Petit Beurre biscuit stamped 'Nantes'",
          'pt-BR': "Um biscoito LU Petit Beurre com a marca 'Nantes'",
        },
        credit: 'Plbcr / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-monoprix-rivoli'],
    },
    {
      id: 'brie-de-meaux',
      group: 'cheese',
      name: { en: 'Brie de Meaux AOP', 'pt-BR': 'Brie de Meaux AOP' },
      description: {
        en: "Île-de-France's own cheese, made from raw cow's milk in the Brie country east of Paris; at the 1815 Congress of Vienna it was hailed 'prince of cheeses'. Ask the fromager for a slice 'à point' to eat the same day, at room temperature, with a baguette. It cannot go home to Brazil: the 2026 Vigiagro list bars cheese from unpasteurised French cow's milk.",
        'pt-BR': "O queijo da própria Île-de-France, feito com leite de vaca cru na região de Brie, a leste de Paris; no Congresso de Viena, em 1815, foi aclamado 'príncipe dos queijos'. Peça ao fromager uma fatia 'à point' para comer no mesmo dia, em temperatura ambiente, com baguete. Não dá para levar ao Brasil: a lista do Vigiagro de 2026 proíbe queijo francês de leite de vaca não pasteurizado.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Brie_de_Meaux_au_march%C3%A9.jpg/500px-Brie_de_Meaux_au_march%C3%A9.jpg',
        alt: {
          en: 'A wheel of Brie de Meaux with its AOP label at a market stall',
          'pt-BR': 'Roda de Brie de Meaux com selo AOP numa banca de feira',
        },
        credit: 'Dinkum / Wikimedia Commons (CC0)',
      },
      where: ['par-marie-anne-cantin-champ-de-mars', 'par-monoprix-rivoli'],
    },
    {
      id: 'comte',
      group: 'cheese',
      name: { en: 'Comté and other AOP cheeses', 'pt-BR': 'Comté e outros queijos AOP' },
      description: {
        en: "Aged Comté from the Jura (AOC since 1958) is France's classic hard cheese and one of the sturdiest travellers; ask for it vacuum-packed ('sous vide'). Laurent Dubois, a Meilleur Ouvrier de France, runs one of Paris's best cheese counters at Maubert. For Brazil, Comté is out (raw cow's milk): take a pasteurised or sheep's-milk cheese, such as Roquefort, in its factory-sealed, labelled pack.",
        'pt-BR': "O Comté maturado do Jura (AOC desde 1958) é o queijo duro clássico da França e um dos que melhor aguentam viagem; peça embalado a vácuo ('sous vide'). Laurent Dubois, Meilleur Ouvrier de France, tem um dos melhores balcões de queijo de Paris, em Maubert. Para o Brasil, o Comté não passa (leite de vaca cru): leve um queijo pasteurizado ou de leite de ovelha, como o Roquefort, na embalagem lacrada e rotulada de fábrica.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Comte_AOP.jpg/500px-Comte_AOP.jpg',
        alt: {
          en: 'A wedge of Comté with its green AOP band on a wooden board',
          'pt-BR': 'Pedaço de Comté com a faixa verde da AOP sobre tábua de madeira',
        },
        credit: 'Myrabella / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-laurent-dubois-maubert', 'par-grande-epicerie-rive-gauche'],
    },
    {
      id: 'french-butter',
      group: 'cheese',
      name: { en: 'French butter (Bordier, Échiré)', 'pt-BR': 'Manteiga francesa (Bordier, Échiré)' },
      description: {
        en: 'Good butter on a fresh baguette is a Paris revelation. The famous names are Bordier, kneaded the traditional way in Saint-Malo and sold plain or flavoured (Espelette pepper, vanilla), and Échiré, an AOP butter churned in wooden churns; Isigny, in the photo, is another AOP. Eat it in Paris: butter needs the fridge, and Brazil accepts only factory-sealed, labelled butter from pasteurised milk.',
        'pt-BR': "Uma boa manteiga na baguete fresca é uma revelação em Paris. Os nomes famosos são a Bordier, trabalhada à moda antiga em Saint-Malo e vendida pura ou aromatizada (pimenta d'Espelette, baunilha), e a Échiré, manteiga AOP batida em barris de madeira; a Isigny, da foto, é outra AOP. Aproveite em Paris: manteiga precisa de geladeira, e o Brasil só aceita manteiga lacrada e rotulada de fábrica, feita com leite pasteurizado.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Beurre_d%27Isigny_%2825360349311%29.jpg/500px-Beurre_d%27Isigny_%2825360349311%29.jpg',
        alt: {
          en: 'A pack of Isigny Sainte-Mère AOP churned butter',
          'pt-BR': 'Tablete de manteiga AOP Isigny Sainte-Mère',
        },
        credit: 'Edsel Little / Wikimedia Commons (CC BY-SA 2.0)',
      },
      where: ['par-grande-epicerie-rive-gauche', 'par-lafayette-gourmet-haussmann', 'par-monoprix-rivoli'],
    },
    {
      id: 'foie-gras-tins',
      group: 'cheese',
      name: { en: 'Foie gras in tins and jars', 'pt-BR': 'Foie gras em lata ou vidro' },
      description: {
        en: "A festive French delicacy sold ready to eat: 'entier' means whole lobe, 'bloc' is reconstituted and cheaper. Shelf-stable tins and jars ('conserve') are the ones to fly with, in the checked bag; the fresher 'mi-cuit' needs the fridge. Cooked, sterilised duck or goose products in factory-sealed, labelled packs are allowed into Brazil.",
        'pt-BR': "Iguaria de festa na França, vendida pronta para comer: 'entier' é o lóbulo inteiro, 'bloc' é reconstituído e mais barato. As latas e os vidros de conserva, que dispensam geladeira, são os que viajam, na mala despachada; o 'mi-cuit', mais fresco, precisa de geladeira. Produtos de pato ou ganso cozidos e esterilizados, lacrados e rotulados de fábrica, podem entrar no Brasil.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Foie_gras_d%27oie_en_conserve.jpg/500px-Foie_gras_d%27oie_en_conserve.jpg',
        alt: {
          en: 'An opened tin of goose foie gras, some spread on bread',
          'pt-BR': 'Lata aberta de foie gras de ganso, com um pouco passado no pão',
        },
        credit: 'Alexandre Delbos / Wikimedia Commons (CC BY 2.0)',
      },
      where: ['par-grande-epicerie-rive-gauche', 'par-lafayette-gourmet-haussmann', 'par-monoprix-rivoli'],
    },
    {
      id: 'saucisson-sec',
      group: 'cheese',
      name: { en: 'Saucisson sec', 'pt-BR': 'Saucisson sec (salame curado)' },
      description: {
        en: 'Dry-cured pork sausage, the backbone of a French picnic with cheese, a baguette and fruit. Charcuteries sell it by the piece, and supermarkets have good vacuum-packed ones. Eat it in France: Brazil bars dry-cured pork products even when factory-sealed.',
        'pt-BR': 'Embutido curado de porco, a base do piquenique francês com queijo, baguete e fruta. As charcutarias vendem por peça, e o supermercado tem bons embalados a vácuo. Coma na França: o Brasil proíbe embutidos curados de porco mesmo lacrados de fábrica.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Saucisson_sec_de_l%27Aveyron.jpg/500px-Saucisson_sec_de_l%27Aveyron.jpg',
        alt: {
          en: 'A dry-cured saucisson, partly sliced, with a knife',
          'pt-BR': 'Saucisson curado, parcialmente fatiado, com faca',
        },
        credit: 'INRA DIST / Wikimedia Commons (CC BY 2.0)',
      },
      where: ['par-arnaud-nicolas-caulaincourt', 'par-rue-cler', 'par-monoprix-rivoli'],
    },
    {
      id: 'maille-mustard',
      group: 'pantry',
      name: { en: 'Maille mustard', 'pt-BR': 'Mostarda Maille' },
      description: {
        en: 'Maille opened its first Paris shop in 1747; its Place de la Madeleine boutique pumps fresh mustard to order into Burgundy stoneware pots (Chardonnay, black truffle, whisky and more, about €27–42 a pot) and is closed on Sundays. Pump mustard must be kept in the fridge, so for the flight home the sealed jars, much cheaper at Monoprix, are the practical choice — in the checked bag.',
        'pt-BR': 'A Maille abriu sua primeira loja em Paris em 1747; a butique da Place de la Madeleine serve mostarda fresca na bomba, em potes de grés da Borgonha (Chardonnay, trufa negra, uísque e outros, cerca de €27–42 o pote), e fecha aos domingos. A mostarda da bomba precisa de geladeira, então para o voo de volta os vidros lacrados, bem mais baratos no Monoprix, são a escolha prática — na mala despachada.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Moutarde_Maille_Dijon_0004.jpg/500px-Moutarde_Maille_Dijon_0004.jpg',
        alt: {
          en: 'Jars of flavoured Maille mustard piled in a shop display',
          'pt-BR': 'Vidros de mostarda Maille aromatizada empilhados numa vitrine',
        },
        credit: 'Arnaud 25 / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-maille-madeleine', 'par-monoprix-rivoli'],
    },
    {
      id: 'fleur-de-sel',
      group: 'pantry',
      name: { en: 'Fleur de sel de Guérande', 'pt-BR': 'Flor de sal de Guérande' },
      description: {
        en: 'Delicate salt crystals skimmed by hand from the surface of the Guérande salt pans on the Atlantic coast, protected by an IGP since 2012. A pinch goes on at the end — over tomatoes, steak, butter or chocolate. Light and inexpensive, it is an easy gift; supermarkets sell it too.',
        'pt-BR': 'Cristais delicados colhidos à mão na superfície das salinas de Guérande, na costa atlântica, com IGP desde 2012. Vai uma pitada no fim — no tomate, na carne, na manteiga ou no chocolate. Leve e barata, é presente fácil; o supermercado também vende.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Fleur_de_Sel_de_Gu%C3%A9rande_2026.jpg/500px-Fleur_de_Sel_de_Gu%C3%A9rande_2026.jpg',
        alt: {
          en: 'Bags of fleur de sel de Guérande for sale at a market',
          'pt-BR': 'Saquinhos de flor de sal de Guérande à venda numa feira',
        },
        credit: 'Laliv g / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-monoprix-rivoli', 'par-grande-epicerie-rive-gauche'],
    },
    {
      id: 'jams',
      group: 'pantry',
      name: {
        en: 'Jams (Christine Ferber, La Chambre)',
        'pt-BR': 'Geleias (Christine Ferber, La Chambre)',
      },
      description: {
        en: "Christine Ferber, Alsace's 'fée des confitures', cooks small batches by hand in copper pans; La Grande Épicerie sells her cloth-capped jars. La Chambre (formerly La Chambre aux Confitures), a Paris jam house with more than a hundred flavours, has a shop in the Marais, and Bonne Maman is the supermarket classic. Sealed, labelled jars are allowed into Brazil — wrap them in clothes in the checked bag.",
        'pt-BR': "Christine Ferber, a 'fada das geleias' da Alsácia, cozinha pequenos lotes à mão em tachos de cobre; a Grande Épicerie vende os potes dela com tampa de tecido. A La Chambre (antiga La Chambre aux Confitures), casa parisiense de geleias com mais de cem sabores, tem loja no Marais, e Bonne Maman é o clássico de supermercado. Vidros lacrados e rotulados podem entrar no Brasil — enrole em roupas na mala despachada.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Confiture-rhubarbe-christine-ferber.jpg/500px-Confiture-rhubarbe-christine-ferber.jpg',
        alt: {
          en: 'A jar of Christine Ferber rhubarb jam with a red polka-dot cloth cap',
          'pt-BR': 'Pote de geleia de ruibarbo Christine Ferber com tampa de tecido vermelho de bolinhas',
        },
        credit: 'Gillescharlesmuller / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-grande-epicerie-rive-gauche', 'par-la-chambre-marais', 'par-monoprix-rivoli'],
    },
    {
      id: 'tea',
      group: 'pantry',
      name: {
        en: 'Tea (Mariage Frères, Dammann Frères)',
        'pt-BR': 'Chá (Mariage Frères, Dammann Frères)',
      },
      description: {
        en: 'Mariage Frères, founded in Paris in 1854, sells more than 1,000 teas from its original Marais emporium on Rue du Bourg-Tibourg, which also has a tea room; Marco Polo is its best-known blend. Dammann Frères, under the arcades of Place des Vosges, is the other great Paris tea house. Tea is light and keeps well in its sealed tin.',
        'pt-BR': 'A Mariage Frères, fundada em Paris em 1854, vende mais de mil chás na loja original do Marais, na Rue du Bourg-Tibourg, que também tem salão de chá; o Marco Polo é o blend mais famoso. A Dammann Frères, sob as arcadas da Place des Vosges, é a outra grande casa de chá de Paris. Chá é leve e se conserva bem na lata lacrada.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Mariage_Fr%C3%A8res_.jpg/500px-Mariage_Fr%C3%A8res_.jpg',
        alt: {
          en: 'Wall of black Mariage Frères tea tins at the Madeleine shop',
          'pt-BR': 'Parede de latas pretas de chá Mariage Frères na loja da Madeleine',
        },
        credit: 'Lexane Sirac / Wikimedia Commons (CC BY 4.0)',
      },
      where: ['par-mariage-freres-marais', 'par-dammann-freres-vosges'],
    },
    {
      id: 'angelina-hot-chocolate',
      group: 'pantry',
      name: { en: 'Angelina hot chocolate', 'pt-BR': 'Chocolate quente Angelina' },
      description: {
        en: "Angelina, the Rue de Rivoli tea room founded in 1903, is famous for 'L'Africain', a thick hot chocolate blended from three African cocoas. Its takeaway counter (a separate, faster line) and Lafayette Gourmet sell it in 25 cl and 48 cl bottles: keep it cool, warm it gently in a bain-marie, and drink it within 48 hours once opened. It is a liquid, so it goes in the checked bag.",
        'pt-BR': "O Angelina, salão de chá da Rue de Rivoli fundado em 1903, é famoso pelo 'L'Africain', um chocolate quente espesso feito com três cacaus africanos. O balcão para viagem (fila separada e mais rápida) e a Lafayette Gourmet vendem em garrafas de 25 cl e 48 cl: guarde em lugar fresco, aqueça em banho-maria e, depois de aberto, beba em até 48 horas. É líquido, então vai na mala despachada.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Cafe_Angelina_2197128742_90a6462e94_b.jpg/500px-Cafe_Angelina_2197128742_90a6462e94_b.jpg',
        alt: {
          en: 'A cup of Angelina hot chocolate with the jug and a pastry',
          'pt-BR': 'Xícara de chocolate quente do Angelina, com a jarrinha e um doce',
        },
        credit: 'allypark (Flickr) / Wikimedia Commons (CC BY 2.0)',
      },
      where: ['par-angelina-rivoli', 'par-lafayette-gourmet-haussmann'],
    },
    {
      id: 'champagne',
      group: 'drinks',
      name: { en: 'Champagne', 'pt-BR': 'Champanhe' },
      description: {
        en: 'No specialist needed: supermarkets like Monoprix stock the big houses, while the cellars at Lafayette Gourmet (1st floor) and La Grande Épicerie (basement) have a far wider range and staff to advise. Brazil lets each adult bring up to 12 litres of alcoholic drinks within the US$1,000 allowance. Wrap bottles in clothes or bottle sleeves in the checked bag.',
        'pt-BR': 'Não precisa de loja especializada: supermercados como o Monoprix têm as grandes marcas, e as adegas da Lafayette Gourmet (1º andar) e da Grande Épicerie (subsolo) têm muito mais variedade e gente para indicar. O Brasil permite a cada adulto trazer até 12 litros de bebida alcoólica dentro da cota de US$ 1.000. Enrole as garrafas em roupas ou protetores na mala despachada.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/La_Cave_aux_Galeries_Lafayette_Gourmet.jpg/500px-La_Cave_aux_Galeries_Lafayette_Gourmet.jpg',
        alt: {
          en: 'Champagne bottles in the wine cellar at Lafayette Gourmet',
          'pt-BR': 'Garrafas de champanhe na adega da Lafayette Gourmet',
        },
        credit: 'Thomon / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-lafayette-gourmet-haussmann', 'par-grande-epicerie-rive-gauche', 'par-monoprix-rivoli'],
    },
    {
      id: 'wine-caviste',
      group: 'drinks',
      name: { en: 'Wine from a caviste', 'pt-BR': 'Vinho de caviste' },
      description: {
        en: "A caviste (independent wine shop) will pick a bottle for your taste and budget, from Bordeaux and Burgundy to natural wine — just say what you like and how much you want to spend. Legrand Filles et Fils, founded in 1880, is the historic address in the Galerie Vivienne, and the Nicolas chain has shops all over Paris. Bottles count toward Brazil's 12-litre limit; pack them padded in the checked bag.",
        'pt-BR': 'Um caviste (loja de vinhos independente) escolhe uma garrafa para o seu gosto e orçamento, do Bordeaux e da Borgonha ao vinho natural — é só dizer do que gosta e quanto quer gastar. A Legrand Filles et Fils, fundada em 1880, é o endereço histórico na Galerie Vivienne, e a rede Nicolas tem lojas por toda Paris. As garrafas contam no limite de 12 litros do Brasil; leve bem protegidas na mala despachada.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Paris_wine%2C_July_17%2C_2009.jpg/500px-Paris_wine%2C_July_17%2C_2009.jpg',
        alt: {
          en: 'Wicker baskets of wine bottles with handwritten price cards outside a Paris wine shop',
          'pt-BR': 'Cestos de vime com garrafas de vinho e plaquinhas de preço escritas à mão na porta de uma loja de vinhos em Paris',
        },
        credit: 'Thomas van de Weerd / Wikimedia Commons (CC BY 2.0)',
      },
      where: ['par-legrand-galerie-vivienne', 'par-grande-epicerie-rive-gauche', 'par-monoprix-rivoli'],
    },
    {
      id: 'spirits-liqueurs',
      group: 'drinks',
      name: { en: 'Cognac, Chartreuse and liqueurs', 'pt-BR': 'Cognac, Chartreuse e licores' },
      description: {
        en: "France's classic after-dinner bottles are Cognac and Armagnac (grape brandies), Calvados (Normandy apple brandy) and Chartreuse, the herbal liqueur made by Carthusian monks since 1737 and often scarce since they capped production in 2019. Crème de cassis, for a kir, is the inexpensive aperitif gift. Bottles count toward Brazil's 12-litre limit; the food halls have the widest range.",
        'pt-BR': 'As garrafas clássicas de fim de refeição na França são o Cognac e o Armagnac (destilados de uva), o Calvados (de maçã, da Normandia) e a Chartreuse, licor de ervas feito por monges cartuxos desde 1737 e muitas vezes em falta desde que eles limitaram a produção, em 2019. O crème de cassis, para o kir, é o presente barato de aperitivo. As garrafas contam no limite de 12 litros do Brasil; as lojas gourmet têm a maior variedade.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Chartreuse_bottles.jpg/500px-Chartreuse_bottles.jpg',
        alt: {
          en: 'Bottles of green and yellow Chartreuse on a bar',
          'pt-BR': 'Garrafas de Chartreuse verde e amarela num bar',
        },
        credit: 'Ɱ / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-lafayette-gourmet-haussmann', 'par-grande-epicerie-rive-gauche', 'par-monoprix-rivoli'],
    },
  ],
  food: [
    {
      id: 'croissant-au-beurre',
      group: 'breakfast',
      name: {
        en: 'Butter croissant (croissant au beurre)',
        'pt-BR': 'Croissant de manteiga (croissant au beurre)',
      },
      description: {
        en: "Paris's breakfast pastry: yeasted dough laminated with butter, crisp and flaky outside, airy inside. Every year the Syndicat des Boulangers du Grand Paris names the best butter croissant: Boulangerie du Sentier (2e) won in 2026, with Maison Thevenin (rue de Buci) third, and La Maison d'Isabelle won in 2018. Ask for a 'croissant au beurre' and buy it in the morning, when it is freshest.",
        'pt-BR': "O doce do café da manhã parisiense: massa fermentada e folhada com manteiga, crocante por fora e aerada por dentro. Todo ano o Syndicat des Boulangers du Grand Paris elege o melhor croissant de manteiga: a Boulangerie du Sentier (2e) venceu em 2026, com a Maison Thevenin (rue de Buci) em terceiro, e a La Maison d'Isabelle ganhou em 2018. Peça um 'croissant au beurre' e compre de manhã, quando está mais fresco.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Croissant-Petr_Kratochvil.jpg/500px-Croissant-Petr_Kratochvil.jpg',
        alt: {
          en: 'A golden butter croissant on a white background',
          'pt-BR': 'Um croissant de manteiga dourado em fundo branco',
        },
        credit: 'Petr Kratochvil / Wikimedia Commons (CC0)',
      },
      where: ['par-boulangerie-du-sentier', 'par-maison-thevenin-buci', 'par-maison-isabelle'],
    },
    {
      id: 'pain-au-chocolat',
      group: 'breakfast',
      name: { en: 'Pain au chocolat', 'pt-BR': 'Pain au chocolat' },
      description: {
        en: "Croissant dough rolled around one or two sticks of dark chocolate. In Paris it is always 'pain au chocolat'; 'chocolatine' is the southwestern name. Every bakery sells it; for showpiece versions try Christophe Michalak's bakery on rue Étienne-Marcel or Cédric Grolet Opéra (closed Monday and Tuesday).",
        'pt-BR': "Massa de croissant enrolada em volta de uma ou duas barrinhas de chocolate amargo. Em Paris se diz sempre 'pain au chocolat'; 'chocolatine' é o nome usado no sudoeste da França. Toda padaria vende; para versões de vitrine, vá à boulangerie do Christophe Michalak na rue Étienne-Marcel ou à Cédric Grolet Opéra (fechada segunda e terça).",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Pain_au_chocolat_Luc_Viatour.jpg/500px-Pain_au_chocolat_Luc_Viatour.jpg',
        alt: {
          en: 'A pain au chocolat with the chocolate showing at the end',
          'pt-BR': 'Um pain au chocolat com o chocolate aparecendo na ponta',
        },
        credit: 'Luc Viatour / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-michalak-etienne', 'par-cedric-grolet', 'par-bake-blend'],
    },
    {
      id: 'escargot-pistache-chocolat',
      group: 'breakfast',
      name: { en: 'Pistachio-chocolate escargot', 'pt-BR': 'Escargot de pistache e chocolate' },
      description: {
        en: "A flat spiral ('escargot', snail) of laminated dough, shaped like a pain aux raisins but filled with bright-green pistachio cream and chocolate chips. It is the cult pastry of Du Pain et des Idées, a bakery near the Canal Saint-Martin in a shop that first opened in 1875. Open Monday to Friday only, 7 a.m. to 7:30 p.m.",
        'pt-BR': "Uma espiral achatada ('escargot', caracol) de massa folhada fermentada, no formato do pain aux raisins, mas recheada com creme de pistache verde e gotas de chocolate. É o doce cult da Du Pain et des Idées, padaria perto do Canal Saint-Martin num ponto aberto em 1875. Abre só de segunda a sexta, das 7h às 19h30.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Pain_aux_raisins_02.jpg/500px-Pain_aux_raisins_02.jpg',
        alt: {
          en: 'A pain aux raisins, the same spiral pastry (generic photo; the Du Pain et des Idées escargot is filled with pistachio and chocolate)',
          'pt-BR': 'Um pain aux raisins, a mesma massa em espiral (foto ilustrativa; o escargot da Du Pain et des Idées leva pistache e chocolate)',
        },
        credit: 'Arnaud 25 / Wikimedia Commons (CC0)',
      },
      where: ['par-du-pain-idees'],
    },
    {
      id: 'baguette-tradition',
      group: 'breakfast',
      name: { en: 'Baguette de tradition', 'pt-BR': 'Baguete tradition (baguette de tradition)' },
      description: {
        en: "Ask for 'une tradition': by a 1993 decree this baguette may contain only flour, water, salt and yeast or levain, with no additives and no freezing, and baguette know-how joined UNESCO's intangible heritage list in 2022. Every year the City of Paris crowns the best one: Fournil Didot (14e) won the 2026 Grand Prix and La Parisienne (10e) the 2025 edition; the winner supplies the Élysée Palace for a year.",
        'pt-BR': "Peça 'une tradition': por um decreto de 1993, essa baguete só pode levar farinha, água, sal e fermento ou levain, sem aditivos e sem congelamento, e o saber-fazer da baguete entrou na lista de patrimônio imaterial da UNESCO em 2022. Todo ano a Prefeitura de Paris elege a melhor: a Fournil Didot (14e) venceu o Grand Prix de 2026 e a La Parisienne (10e), o de 2025; o vencedor abastece o Palácio do Eliseu por um ano.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Baguettes_at_the_Edgar_Quinet_market.jpg/500px-Baguettes_at_the_Edgar_Quinet_market.jpg',
        alt: {
          en: 'Baguettes piled on a stall at the Edgar-Quinet market in Paris',
          'pt-BR': 'Baguetes empilhadas numa banca da feira Edgar-Quinet, em Paris',
        },
        credit: 'Paul Asman and Jill Lenoble / Wikimedia Commons (CC BY 2.0)',
      },
      where: ['par-fournil-didot', 'par-la-parisienne-poissonniere'],
    },
    {
      id: 'tartine-cafe-creme',
      group: 'breakfast',
      name: { en: 'Tartine and café crème', 'pt-BR': 'Tartine com café crème' },
      description: {
        en: 'The classic café breakfast: a split length of baguette with butter and jam (tartine beurre-confiture) and a café crème, espresso with steamed milk, to dunk it in. Any corner bistro serves it at the counter or on the terrace; at Café de Flore the 2026 menu lists the tartine with Échiré butter at €4.50, jam at €3 and a café crème at €7.40.',
        'pt-BR': 'O café da manhã clássico de bistrô: um pedaço de baguete aberto com manteiga e geleia (tartine beurre-confiture) e um café crème, espresso com leite vaporizado, para molhar a tartine. Qualquer bistrô de esquina serve, no balcão ou no terraço; no Café de Flore, o cardápio de 2026 cobra €4,50 pela tartine com manteiga Échiré, €3 pela geleia e €7,40 pelo café crème.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Petit_d%C3%A9jeuner_fran%C3%A7ais.jpg/500px-Petit_d%C3%A9jeuner_fran%C3%A7ais.jpg',
        alt: {
          en: 'Buttered tartines with strawberry and apricot jam, a baguette and a bowl of coffee',
          'pt-BR': 'Tartines com manteiga e geleias de morango e damasco, uma baguete e uma tigela de café',
        },
        credit: 'Nat / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-cafe-flore', 'par-deux-magots', 'par-recrutement'],
    },
    {
      id: 'jambon-beurre',
      group: 'lunch',
      name: { en: 'Jambon-beurre', 'pt-BR': 'Jambon-beurre' },
      description: {
        en: "Half a baguette, butter and cooked Paris ham (jambon de Paris), sometimes with cornichons: the city's everyday sandwich, also simply called a 'parisien'. Le Petit Vendôme, between Place Vendôme and the Opéra, carves its ham off the bone and sells sandwiches at the counter from 9:30 (no booking, closed Sundays). In the Marais, Caractère de Cochon makes one to order from dozens of hams — about €15, and there is usually a queue.",
        'pt-BR': "Meia baguete, manteiga e presunto cozido (jambon de Paris), às vezes com cornichons: o sanduíche do dia a dia da cidade, que também atende por 'parisien'. O Le Petit Vendôme, entre a Place Vendôme e a Opéra, corta o presunto direto do osso e vende no balcão a partir das 9h30 (sem reserva, fecha aos domingos). No Marais, o Caractère de Cochon monta o seu na hora com dezenas de presuntos — uns €15, e quase sempre tem fila.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Sandwich_jambon-beurre.jpg/500px-Sandwich_jambon-beurre.jpg',
        alt: {
          en: 'Jambon-beurre baguette with pink ham on a wooden board',
          'pt-BR': 'Baguete jambon-beurre com presunto sobre tábua de madeira',
        },
        credit: 'Boulanger: Nat / Photographer: Nat / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-petit-vendome-capucines', 'par-caractere-de-cochon-charlot'],
    },
    {
      id: 'croque-monsieur',
      group: 'lunch',
      name: { en: 'Croque-monsieur', 'pt-BR': 'Croque-monsieur' },
      description: {
        en: "Toasted bread with ham and cheese, often topped with béchamel and grilled until golden; add a fried egg and it becomes a croque-madame. Paris cafés have served it for more than a century. Fric-Frac in Montmartre is a croque specialist, Café de Flore serves the classic for €14 (the egg-topped one is called 'Le Jockey'), and Arnaud Nicolas's charcuterie on rue Caulaincourt sells a craft version to take away (closed Sun–Mon).",
        'pt-BR': "Pão tostado com presunto e queijo, muitas vezes coberto de béchamel e gratinado até dourar; com um ovo frito por cima vira croque-madame. Os cafés de Paris servem há mais de um século. O Fric-Frac, em Montmartre, é especialista em croques; o Café de Flore serve o clássico por €14 (o com ovo se chama 'Le Jockey'); e a charcutaria do Arnaud Nicolas na rue Caulaincourt vende uma versão artesanal para levar (fecha dom–seg).",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Croque_monsieur.jpg/500px-Croque_monsieur.jpg',
        alt: {
          en: 'Croque-monsieur with melted cheese over ham, in the pan',
          'pt-BR': 'Croque-monsieur com queijo derretido sobre o presunto, na frigideira',
        },
        credit: 'Michael Brewer / Wikimedia Commons (CC BY-SA 2.5)',
      },
      where: ['par-fric-frac', 'par-cafe-flore', 'par-arnaud-nicolas-caulaincourt'],
    },
    {
      id: 'falafel-marais',
      group: 'lunch',
      name: { en: 'Falafel in the Marais', 'pt-BR': 'Falafel no Marais' },
      description: {
        en: "Pita stuffed with falafel, fried eggplant, hummus and salad — the signature of rue des Rosiers, heart of the Marais's historic Jewish quarter, the Pletzl. L'As du Fallafel is the famous address: at lunch the line runs into the street, the takeaway window is the quicker option, and it closes for Shabbat (early on Friday, all day Saturday).",
        'pt-BR': "Pão pita recheado com falafel, berinjela frita, homus e salada — a assinatura da rue des Rosiers, coração do antigo bairro judeu do Marais, o Pletzl. O L'As du Fallafel é o endereço famoso: no almoço a fila chega à rua, a janelinha para viagem é o caminho mais rápido, e ele fecha no Shabat (cedo na sexta, o sábado inteiro).",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Falafel_from_L%27As_Du_Fallafel.JPG/500px-Falafel_from_L%27As_Du_Fallafel.JPG',
        alt: {
          en: "Falafel pita with hot sauce and cabbage, held outside L'As du Fallafel",
          'pt-BR': "Pita de falafel com molho picante e repolho, na mão, em frente ao L'As du Fallafel",
        },
        credit: 'Plot Spoiler / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-as-du-fallafel'],
    },
    {
      id: 'galette-complete-cidre',
      group: 'lunch',
      name: { en: 'Galette complète & cider', 'pt-BR': 'Galette complète e sidra' },
      description: {
        en: "A Breton crêpe made with buckwheat (galette de sarrasin), folded square around ham, cheese and an egg — the 'complète' — with dry cider drunk from a bowl (bolée). Breizh Café, whose original address is in the Marais (with branches at Odéon, rue Cler and Passy), uses organic Breton buckwheat and Bordier butter; Crêperie des Arts, near Saint-Michel, is a family crêperie open since 1973. Have a savoury galette first and a sweet wheat crêpe, such as salted-butter caramel, for dessert.",
        'pt-BR': "Crepe bretão de trigo-sarraceno (galette de sarrasin) dobrado em quadrado com presunto, queijo e ovo — a 'complète' —, acompanhado de sidra seca bebida numa tigelinha (bolée). O Breizh Café, com endereço original no Marais (e filiais em Odéon, rue Cler e Passy), usa sarraceno orgânico da Bretanha e manteiga Bordier; a Crêperie des Arts, perto de Saint-Michel, é uma crêperie de família aberta desde 1973. Peça primeiro uma galette salgada e, de sobremesa, um crepe doce de trigo, como o de caramelo com manteiga salgada.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Galette_de_sarrasin_compl%C3%A8te_bretonne.jpg/500px-Galette_de_sarrasin_compl%C3%A8te_bretonne.jpg',
        alt: {
          en: 'Buckwheat galette complète folded around ham and a fried egg',
          'pt-BR': 'Galette complète de trigo-sarraceno dobrada sobre presunto e ovo frito',
        },
        credit: 'Arnaud 25 / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-breizh-cafe-marais', 'par-creperie-arts'],
    },
    {
      id: 'steak-frites',
      group: 'lunch',
      name: { en: 'Steak frites', 'pt-BR': 'Steak frites (bife com fritas)' },
      description: {
        en: "Steak with fries is the everyday bistro main course. Le Relais de l'Entrecôte serves a single set meal, a formula created in 1959: walnut salad, then sliced sirloin in its secret sauce with thin fries — a second helping follows, and with no reservations it pays to arrive at opening (12:00 or 18:30). Le Bistrot Paul Bert (11e, Tue–Sat, bookings by phone) is famous for its steak au poivre, and Bouillon République does steak frites with pepper sauce for €12.60.",
        'pt-BR': "Bife com fritas é o prato principal de todo dia nos bistrôs. O Le Relais de l'Entrecôte serve um único menu, fórmula criada em 1959: salada com nozes e depois contrafilé fatiado no molho secreto com batata palito fina — vem uma segunda porção, e como não há reserva vale chegar na abertura (12h ou 18h30). O Le Bistrot Paul Bert (11e, ter–sáb, reserva só por telefone) é famoso pelo steak au poivre, e o Bouillon République faz steak frites com molho de pimenta por €12,60.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Steak-frites_-_Le_Relais_de_l%27Entrec%C3%B4te_%28Geneva%29.jpg/500px-Steak-frites_-_Le_Relais_de_l%27Entrec%C3%B4te_%28Geneva%29.jpg',
        alt: {
          en: "Sliced steak in the house sauce with thin fries at Le Relais de l'Entrecôte (Geneva branch)",
          'pt-BR': "Contrafilé fatiado no molho da casa com batata palito no Le Relais de l'Entrecôte (filial de Genebra)",
        },
        credit: 'Dcollard / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-entrecote', 'par-bistrot-paul-bert-faidherbe', 'par-bouillon-republique'],
    },
    {
      id: 'pate-en-croute',
      group: 'lunch',
      name: { en: 'Pâté en croûte', 'pt-BR': 'Pâté en croûte' },
      description: {
        en: "Meat terrine — pork, poultry, often foie gras — baked inside pastry and served in thick slices with pickles: a showpiece of French charcuterie that even has its own world championship. In Paris the name to know is Arnaud Nicolas, a 'Meilleur Ouvrier de France' charcutier: buy slices at his restaurant-boutique on avenue de la Bourdonnais, beside the Champ de Mars, or at the Montmartre shop (both closed Sun–Mon). Le Procope serves a duck version as a starter.",
        'pt-BR': "Terrine de carne — porco, aves, muitas vezes foie gras — assada dentro de uma massa e servida em fatias grossas com picles: uma vitrine da charcutaria francesa, que tem até campeonato mundial. Em Paris, o nome é Arnaud Nicolas, charcutier 'Meilleur Ouvrier de France': compre fatias no restaurante-boutique da avenue de la Bourdonnais, ao lado do Champ de Mars, ou na loja de Montmartre (ambos fecham dom–seg). O Le Procope serve uma versão de pato como entrada.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/P%C3%A2t%C3%A9_en_cro%C3%BBte.JPG/500px-P%C3%A2t%C3%A9_en_cro%C3%BBte.JPG',
        alt: {
          en: 'Slice of pâté en croûte with pickles and pearl onions',
          'pt-BR': 'Fatia de pâté en croûte com picles e cebolinhas',
        },
        credit: 'Arnaud 25 / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-arnaud-nicolas-bourdonnais', 'par-arnaud-nicolas-caulaincourt', 'par-procope'],
    },
    {
      id: 'mont-blanc-chocolat-chaud',
      group: 'afternoon',
      name: {
        en: 'Mont-Blanc and hot chocolate at Angelina',
        'pt-BR': 'Mont-Blanc e chocolate quente da Angelina',
      },
      description: {
        en: "Angelina's two classics since 1903: a thick, old-fashioned hot chocolate and the Mont-Blanc, a meringue base with light whipped cream under strands of chestnut cream. The Belle Époque tea room on rue de Rivoli, facing the Tuileries, counted Proust and Coco Chanel among its regulars. Expect a queue for a table, especially at weekends; takeaway is also available.",
        'pt-BR': 'Os dois clássicos da Angelina desde 1903: um chocolate quente espesso, à moda antiga, e o Mont-Blanc, base de merengue com chantilly leve coberta por fios de creme de castanha. O salão de chá Belle Époque da rue de Rivoli, em frente às Tulherias, teve Proust e Coco Chanel entre os clientes. Espere fila por mesa, principalmente no fim de semana; também dá para levar para viagem.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/%D7%A7%D7%A8%D7%9D_%D7%A2%D7%A8%D7%9E%D7%95%D7%A0%D7%99%D7%9D.jpg/500px-%D7%A7%D7%A8%D7%9D_%D7%A2%D7%A8%D7%9E%D7%95%D7%A0%D7%99%D7%9D.jpg',
        alt: {
          en: 'A Mont-Blanc cut open at Angelina, showing meringue and whipped cream under the chestnut cream',
          'pt-BR': 'Um Mont-Blanc cortado na Angelina, com merengue e chantilly sob o creme de castanha',
        },
        credit: 'כ.אלון / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-angelina-rivoli'],
    },
    {
      id: 'eclair',
      group: 'afternoon',
      name: { en: 'Éclair', 'pt-BR': 'Éclair (bomba)' },
      description: {
        en: "A finger of choux pastry filled with pastry cream and glazed on top; chocolate and coffee are the classics in every pâtisserie. L'Éclair de Génie, founded by pastry chef Christophe Adam in 2012, is the specialist, with a counter at Lafayette Gourmet open until 9 p.m. Monday to Saturday; Paris & Co came second in the 2026 Grand Paris pastry trophy, which judged chocolate éclairs and lemon tarts.",
        'pt-BR': "Um bastão de massa choux recheado com creme de confeiteiro e com cobertura glaçada; chocolate e café são os clássicos de qualquer pâtisserie. A L'Éclair de Génie, criada pelo confeiteiro Christophe Adam em 2012, é a especialista, com balcão na Lafayette Gourmet aberto até 21h de segunda a sábado; a Paris & Co ficou em segundo no troféu de confeitaria do Grand Paris 2026, que julgou éclairs de chocolate e tortas de limão.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Eclairs_with_chocolate_icing_at_Cafe_Blue_Hills.jpg/500px-Eclairs_with_chocolate_icing_at_Cafe_Blue_Hills.jpg',
        alt: {
          en: 'Chocolate-glazed éclairs filled with pastry cream',
          'pt-BR': 'Éclairs com cobertura de chocolate e recheio de creme',
        },
        credit: 'georgie_grd / Wikimedia Commons (CC BY-SA 2.0)',
      },
      where: ['par-eclair-genie', 'par-bakery-gaite'],
    },
    {
      id: 'mille-feuille',
      group: 'afternoon',
      name: { en: 'Mille-feuille', 'pt-BR': 'Mil-folhas (mille-feuille)' },
      description: {
        en: "Three layers of caramelized puff pastry with vanilla pastry cream, often topped with marbled fondant icing. Carl Marletti, former head pastry chef of the Café de la Paix, is known for his, and La Parisienne's pastry chef won the taste prize at the 2025 Master du millefeuille. Carl Marletti is closed on Mondays and open only until 1:30 p.m. on Sundays.",
        'pt-BR': 'Três camadas de massa folhada caramelizada com creme de confeiteiro de baunilha, muitas vezes com cobertura de fondant marmorizado. O de Carl Marletti, ex-chef pâtissier do Café de la Paix, é famoso, e o chef pâtissier da La Parisienne ganhou o prêmio de sabor do Master du millefeuille de 2025. A Carl Marletti fecha às segundas e, no domingo, só abre até 13h30.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Mille-feuille_20100916.jpg/500px-Mille-feuille_20100916.jpg',
        alt: {
          en: 'A slice of mille-feuille with marbled white icing',
          'pt-BR': 'Uma fatia de mil-folhas com cobertura branca marmorizada',
        },
        credit: 'Georges Seguin (Okki) / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-carl-marletti-censier', 'par-la-parisienne-poissonniere'],
    },
    {
      id: 'flan-parisien',
      group: 'afternoon',
      name: { en: 'Flan pâtissier (flan parisien)', 'pt-BR': 'Flan pâtissier (flan parisiense)' },
      description: {
        en: "Paris's everyday bakery treat: a thick vanilla custard baked in a pastry shell and sold by the slice. Paris & Co (15e), named best flan in Île-de-France in 2021, turns into a flan bar on Sundays with flavors beyond vanilla, and Maison Delmontel on rue des Martyrs was the top Paris address in the 2026 Grand Paris flan contest. The jury's rule of thumb: a good flan can be eaten while walking down the street.",
        'pt-BR': 'O doce de padaria do dia a dia em Paris: um creme de baunilha espesso assado numa massa e vendido em fatias. A Paris & Co (15e), eleita melhor flan da Île-de-France em 2021, vira um bar de flans aos domingos com sabores além da baunilha, e a Maison Delmontel, na rue des Martyrs, foi o melhor endereço de Paris no concurso de flan do Grand Paris de 2026. A regra do júri: um bom flan dá para comer andando na rua.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Flan_Parisien%2C_Ludivine_Paris%2C_Los_Angeles_20250625_151737.jpg/500px-Flan_Parisien%2C_Ludivine_Paris%2C_Los_Angeles_20250625_151737.jpg',
        alt: {
          en: 'A slice of flan parisien with a caramelized top',
          'pt-BR': 'Uma fatia de flan parisiense com a superfície caramelizada',
        },
        credit: 'AragonChristopherR17Z / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-bakery-gaite', 'par-maison-delmontel-martyrs'],
    },
    {
      id: 'glace-berthillon',
      group: 'afternoon',
      name: { en: 'Berthillon ice cream', 'pt-BR': 'Sorvete Berthillon' },
      description: {
        en: "Paris's best-known ice cream, made on the Île Saint-Louis since 1954, when Raymond Berthillon took over a small café there and made pure-fruit sorbets at a time when most were made with egg white. Classic flavors include wild strawberry, honey nougat, caramel nougatine and extra-bitter cocoa sorbet. The shop is open Wednesday to Sunday and closes during French school holidays, except at Christmas.",
        'pt-BR': 'O sorvete mais famoso de Paris, feito na Île Saint-Louis desde 1954, quando Raymond Berthillon assumiu um pequeno café na ilha e passou a fazer sorbets só de fruta, numa época em que a maioria levava clara de ovo. Entre os clássicos estão morango silvestre (fraise des bois), nougat de mel, caramelo nougatine e sorbet de cacau extra amargo. A loja abre de quarta a domingo e fecha nas férias escolares francesas, exceto no Natal.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/COUPE_GLAC%C3%89E_-_Flickr_-_marsupilami92.jpg/500px-COUPE_GLAC%C3%89E_-_Flickr_-_marsupilami92.jpg',
        alt: {
          en: 'Scoops of vanilla, strawberry and coffee ice cream in a coupe at a café (generic photo, not Berthillon)',
          'pt-BR': 'Bolas de sorvete de baunilha, morango e café numa taça, num café (foto ilustrativa, não é da Berthillon)',
        },
        credit: 'patrick janicek from Courbevoie, France / Wikimedia Commons (CC BY 4.0)',
      },
      where: ['par-berthillon-ile-saint-louis'],
    },
    {
      id: 'paris-brest',
      group: 'afternoon',
      name: { en: 'Paris-Brest', 'pt-BR': 'Paris-Brest' },
      description: {
        en: "A crisp choux-pastry ring filled with praline mousseline cream and scattered with flaked almonds. The wheel shape honours the Paris–Brest–Paris bicycle race, and the recipe is usually credited to Louis Durand, a pastry chef from Maisons-Laffitte, in the early 1900s. Équilibre (15e) opens Yonder's 2026 selection of the best in Paris; Matthieu Pauline is on rue Cler, near the Eiffel Tower.",
        'pt-BR': 'Anel de massa choux crocante recheado com creme mousseline de praliné e salpicado de amêndoas laminadas. O formato de roda homenageia a corrida de bicicleta Paris–Brest–Paris, e a receita costuma ser atribuída ao confeiteiro Louis Durand, de Maisons-Laffitte, no começo do século 20. A Équilibre (15e) abre a seleção de melhores Paris-Brest da Yonder de 2026; a Matthieu Pauline fica na rue Cler, perto da Torre.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Paris-Brest_IMG_0875.JPG/500px-Paris-Brest_IMG_0875.JPG',
        alt: {
          en: 'A Paris-Brest with almonds and icing sugar on a white plate',
          'pt-BR': 'Um Paris-Brest com amêndoas e açúcar de confeiteiro num prato branco',
        },
        credit: 'Deror_avi / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-equilibre-blomet', 'par-matthieu-pauline-cler'],
    },
    {
      id: 'soupe-oignon-gratinee',
      group: 'dinner',
      name: { en: 'French onion soup (gratinée)', 'pt-BR': 'Sopa de cebola gratinada' },
      description: {
        en: "Onions cooked down in broth until sweet, topped with bread and a lid of melted, browned cheese — the traditional late-night bowl of the old Les Halles market. Au Pied de Cochon, a Les Halles brasserie since 1947, serves it every day from 8 am to 5 am (€11.50 on its menu); Bouillon République has it for €3.90, and Le Procope makes a 'parisienne' version.",
        'pt-BR': "Cebola cozida no caldo até ficar adocicada, coberta com pão e uma tampa de queijo derretido e tostado — a tigela tradicional das madrugadas do antigo mercado de Les Halles. O Au Pied de Cochon, brasserie de Les Halles desde 1947, serve todo dia das 8h às 5h (€11,50 no cardápio); o Bouillon République cobra €3,90, e o Le Procope faz uma versão 'à la parisienne'.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Onion_soup_%40_Le_51_%40_Montparnasse_%40_Paris_%2832579466853%29.jpg/500px-Onion_soup_%40_Le_51_%40_Montparnasse_%40_Paris_%2832579466853%29.jpg',
        alt: {
          en: 'Onion soup gratinée with melted cheese in a Paris brasserie',
          'pt-BR': 'Sopa de cebola gratinada com queijo derretido numa brasserie de Paris',
        },
        credit: 'Guilhem Vellut from Paris, France / Wikimedia Commons (CC BY 2.0)',
      },
      where: ['par-au-pied-de-cochon-halles', 'par-bouillon-republique', 'par-procope'],
    },
    {
      id: 'escargots-bourgogne',
      group: 'dinner',
      name: { en: 'Escargots de Bourgogne', 'pt-BR': 'Escargots de Bourgogne' },
      description: {
        en: "Burgundy snails baked in their shells with garlic-and-parsley butter, ordered by six or twelve and eaten with special tongs and a small fork — save some bread for the butter. L'Escargot Montorgueil has served them since 1832 (open daily, noon–11 pm); Bouillon Chartier has them at bouillon prices, and Le Procope serves Label Rouge snails (€12.50 for six).",
        'pt-BR': "Caracóis da Borgonha assados na casca com manteiga de alho e salsinha, pedidos por meia dúzia ou dúzia e comidos com pinça e garfinho próprios — guarde pão para a manteiga. O L'Escargot Montorgueil serve desde 1832 (aberto todo dia, 12h–23h); o Bouillon Chartier tem a preço de bouillon, e o Le Procope serve escargots Label Rouge (€12,50 os seis).",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Eating_Snails_in_France.jpg/500px-Eating_Snails_in_France.jpg',
        alt: {
          en: 'Six escargots in garlic-parsley butter with tongs, bread and wine at a Paris restaurant',
          'pt-BR': 'Seis escargots na manteiga de alho e salsinha, com pinça, pão e vinho, num restaurante de Paris',
        },
        credit: 'Tom Corser / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-escargot-montorgueil', 'par-bouillon', 'par-procope'],
    },
    {
      id: 'oeuf-mayonnaise',
      group: 'dinner',
      name: { en: 'Œuf mayonnaise', 'pt-BR': 'Œuf mayonnaise (ovo com maionese)' },
      description: {
        en: "Hard-boiled eggs halved and coated in mayonnaise — the humblest bistro starter, taken seriously enough in Paris to have a world championship run by an association for its 'safeguard' (ASOM). The 2025 title went to Au Rêve, a Montmartre café open since 1921; at the bouillons it costs a couple of euros (€2.50 at Bouillon République).",
        'pt-BR': "Ovos cozidos cortados ao meio e cobertos de maionese — a entrada mais simples do bistrô, levada tão a sério em Paris que tem campeonato mundial, organizado por uma associação pela sua 'salvaguarda' (a ASOM). O título de 2025 foi para o Au Rêve, café de Montmartre aberto desde 1921; nos bouillons custa poucos euros (€2,50 no Bouillon République).",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Oeuf_mayonnaise_on_lettuce.jpg/500px-Oeuf_mayonnaise_on_lettuce.jpg',
        alt: {
          en: 'Halved egg coated in mayonnaise on lettuce with chives',
          'pt-BR': 'Ovo cozido coberto de maionese sobre alface, com cebolinha',
        },
        credit: 'Cullen328 / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-au-reve-caulaincourt', 'par-bouillon-republique', 'par-bouillon'],
    },
    {
      id: 'boeuf-bourguignon-coq-au-vin',
      group: 'dinner',
      name: { en: 'Bœuf bourguignon & coq au vin', 'pt-BR': 'Bœuf bourguignon e coq au vin' },
      description: {
        en: 'Two Burgundy classics braised for hours in red wine: beef with lardons, mushrooms and onions, and its cousin coq au vin, made with chicken. Au Bourguignon du Marais makes bourguignon its speciality, with an all-Burgundy wine list (open daily); Le Procope lists a traditional coq au vin among its historic recipes, and Bouillon République serves bourguignon for €12.20.',
        'pt-BR': "Dois clássicos da Borgonha cozidos por horas no vinho tinto: carne com bacon, cogumelos e cebolas, e o primo coq au vin, feito com frango. O Au Bourguignon du Marais tem o bourguignon como especialidade, com carta de vinhos só da Borgonha (abre todo dia); o Le Procope traz um coq au vin tradicional entre as 'receitas históricas', e o Bouillon République serve bourguignon por €12,20.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Beef_bourguignon-01.jpg/500px-Beef_bourguignon-01.jpg',
        alt: {
          en: 'Bœuf bourguignon with mushrooms, pearl onions, carrots and boiled potatoes',
          'pt-BR': 'Bœuf bourguignon com cogumelos, cebolinhas, cenoura e batatas cozidas',
        },
        credit: 'balise42 / Wikimedia Commons (CC BY-SA 2.0)',
      },
      where: ['par-au-bourguignon-du-marais', 'par-procope', 'par-bouillon-republique'],
    },
    {
      id: 'confit-de-canard',
      group: 'dinner',
      name: { en: 'Confit de canard (duck confit)', 'pt-BR': 'Confit de canard (pato confitado)' },
      description: {
        en: 'Duck leg cured and slow-cooked in its own fat, then crisped and served with potatoes — often pommes sarladaises, fried in duck fat. It comes from south-western France but is a Paris bistro staple: La Fontaine de Mars, by the Eiffel Tower, specialises in south-western cooking (house confit €31 on its 2026 menu), while Bouillon République serves it for €12.80 and Chartier has it too.',
        'pt-BR': 'Coxa de pato salgada e cozida lentamente na própria gordura, depois dourada e servida com batatas — muitas vezes as pommes sarladaises, fritas na gordura de pato. Vem do sudoeste da França, mas é presença fixa nos bistrôs de Paris: a La Fontaine de Mars, junto à Torre Eiffel, é especializada na cozinha do sudoeste (o confit da casa sai €31 no cardápio de 2026), o Bouillon République serve por €12,80 e o Chartier também tem.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Confitdecanard.jpg/500px-Confitdecanard.jpg',
        alt: {
          en: 'Crispy duck confit leg with sautéed potatoes and lettuce',
          'pt-BR': 'Coxa de pato confitada e crocante com batatas salteadas e alface',
        },
        credit: 'Roboppy at English Wikipedia / Wikimedia Commons (Public domain)',
      },
      where: ['par-fontaine-de-mars-saint-dominique', 'par-bouillon-republique', 'par-bouillon'],
    },
    {
      id: 'mousse-au-chocolat',
      group: 'dinner',
      name: { en: 'Mousse au chocolat', 'pt-BR': 'Mousse de chocolate' },
      description: {
        en: 'Airy dark-chocolate mousse, the classic bistro dessert. At Chez Janou, a Provençal bistro near Place des Vosges, it is served from a big communal bowl — note that desserts there are only served after a main course; at Bouillon République it costs €3.70.',
        'pt-BR': 'Mousse aerada de chocolate amargo, a sobremesa clássica do bistrô. No Chez Janou, bistrô provençal perto da Place des Vosges, ela é servida de uma tigela enorme para a mesa — lá as sobremesas só saem depois de um prato principal; no Bouillon République custa €3,70.',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mousse_au_chocolat_-_Patisserie_-_003.jpg/500px-Mousse_au_chocolat_-_Patisserie_-_003.jpg',
        alt: {
          en: 'Chocolate mousse in a glass coupe with a spoon',
          'pt-BR': 'Mousse de chocolate numa taça de vidro com colher',
        },
        credit: 'Thesupermat / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-chez-janou', 'par-bouillon-republique', 'par-bouillon'],
    },
    {
      id: 'cafe-comptoir',
      group: 'drinks',
      name: { en: 'Coffee, the Paris way', 'pt-BR': 'Café à parisiense' },
      description: {
        en: "'Un café' is a short espresso; 'une noisette' adds a dash of milk, 'un café crème' is espresso with steamed milk, and 'un allongé' is stretched with hot water. Standing at the counter (au comptoir) is usually cheaper than a table or the terrace, and the famous cafés charge more (espresso €5.50 at Café de Flore, €4.20 at Le Procope on their 2026 menus). Le Procope, open since 1686, says it was the first in Paris to serve coffee at the table; its coffee salon opens weekdays 3:30–5:30 pm without booking.",
        'pt-BR': "'Un café' é um espresso curto; 'une noisette' leva um pingo de leite, 'un café crème' é espresso com leite vaporizado e 'un allongé' é espresso esticado com água quente. Tomar no balcão (au comptoir) costuma ser mais barato do que na mesa ou no terraço, e os cafés famosos cobram mais (espresso a €5,50 no Café de Flore e €4,20 no Le Procope, cardápios de 2026). O Le Procope, aberto desde 1686, diz ter sido o primeiro de Paris a servir café à mesa; seu salão de café abre em dias úteis das 15h30 às 17h30, sem reserva.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Caf%C3%A9_de_Flore_007.jpg/500px-Caf%C3%A9_de_Flore_007.jpg',
        alt: {
          en: 'Espresso in a Café de Flore cup with a sugar packet',
          'pt-BR': 'Espresso na xícara do Café de Flore com sachê de açúcar',
        },
        credit: 'Arnaud 25 / Wikimedia Commons (CC BY-SA 4.0)',
      },
      where: ['par-cafe-flore', 'par-procope', 'par-recrutement'],
    },
    {
      id: 'kir-kir-royal',
      group: 'drinks',
      name: { en: 'Kir & kir royal', 'pt-BR': 'Kir e kir royal' },
      description: {
        en: 'The classic French apéritif: white wine (traditionally Burgundy aligoté) with a splash of blackcurrant liqueur (crème de cassis); made with Champagne it becomes a kir royal. It is named after Félix Kir, the mayor of Dijon who served it at official receptions. Before dinner at a brasserie it costs about €8.50, or €14–14.50 for a kir royal (Le Procope and Au Pied de Cochon, 2026 menus).',
        'pt-BR': 'O aperitivo francês clássico: vinho branco (tradicionalmente aligoté da Borgonha) com um toque de licor de cassis (crème de cassis); com champanhe vira kir royal. O nome homenageia Félix Kir, prefeito de Dijon que o servia em recepções oficiais. Antes do jantar, numa brasserie, sai por cerca de €8,50, ou €14–14,50 o kir royal (Le Procope e Au Pied de Cochon, cardápios de 2026).',
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Kir_et_goug%C3%A8res.JPG/500px-Kir_et_goug%C3%A8res.JPG',
        alt: {
          en: 'Two glasses of kir with gougères (cheese puffs)',
          'pt-BR': 'Duas taças de kir com gougères (bolinhas de queijo)',
        },
        credit: 'Arnaud 25 / Wikimedia Commons (CC BY-SA 3.0)',
      },
      where: ['par-procope', 'par-au-pied-de-cochon-halles', 'par-cafe-flore'],
    },
    {
      id: 'vin-bar-a-vins',
      group: 'drinks',
      name: { en: 'A glass of wine at a bar à vins', 'pt-BR': 'Uma taça de vinho num bar à vins' },
      description: {
        en: "A glass of wine with a board of cheese or charcuterie is the Paris way to start — or replace — dinner, and many bars à vins focus on natural wine ('vin nature'). Le Baron Rouge, by the Aligre market, pours to a standing crowd around its barrels and adds oysters on weekends from mid-September to April (no reservations); L'Avant Comptoir de la Terre in Saint-Germain is a standing-only bar with small plates and glasses from €3.50, open daily.",
        'pt-BR': "Uma taça de vinho com uma tábua de queijos ou frios é o jeito parisiense de começar — ou substituir — o jantar, e muitos bars à vins se dedicam ao vinho natural ('vin nature'). O Le Baron Rouge, ao lado do mercado de Aligre, serve uma clientela em pé em volta dos barris e tem ostras nos fins de semana de meados de setembro a abril (sem reserva); o L'Avant Comptoir de la Terre, em Saint-Germain, é um balcão só em pé com petiscos e taças a partir de €3,50, aberto todo dia.",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Cheese%2C_wine_and_bread_in_a_sidewalk_cafe_in_Paris%2C_June_2015.jpg/500px-Cheese%2C_wine_and_bread_in_a_sidewalk_cafe_in_Paris%2C_June_2015.jpg',
        alt: {
          en: 'Red wine, a carafe, a cheese board and bread on a Paris café terrace',
          'pt-BR': 'Vinho tinto, jarra, tábua de queijos e pão num terraço de café em Paris',
        },
        credit: 'Joe deSousa / Wikimedia Commons (CC0)',
      },
      where: ['par-baron-rouge', 'par-avant-comptoir-odeon'],
    },
    {
      id: 'diabolo-citron-presse',
      group: 'drinks',
      name: { en: 'Diabolo menthe & citron pressé', 'pt-BR': 'Diabolo menthe e citron pressé' },
      description: {
        en: 'Two alcohol-free café classics: the diabolo menthe, clear lemonade with bright-green mint syrup (grenadine and other syrups work too), and the citron pressé, fresh lemon juice brought with water and sugar so you mix it to taste. Almost every café lists them; a citron pressé is €10 at Café de Flore and €6.60 at Au Pied de Cochon (2026 menus).',
        'pt-BR': "Dois clássicos sem álcool dos cafés: o diabolo menthe, 'limonade' (refrigerante incolor de limão, tipo soda) com xarope de menta verde-vivo (também há com grenadine e outros xaropes), e o citron pressé, suco de limão espremido na hora que chega com água e açúcar para você misturar a gosto. Quase todo café tem; o citron pressé custa €10 no Café de Flore e €6,60 no Au Pied de Cochon (cardápios de 2026).",
      },
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Diabolo_menthe_%C3%A0_Montmartre_%287499547216%29.jpg/500px-Diabolo_menthe_%C3%A0_Montmartre_%287499547216%29.jpg',
        alt: {
          en: 'Two bright-green diabolo menthe glasses in a Montmartre café',
          'pt-BR': 'Dois copos verde-vivo de diabolo menthe num café de Montmartre',
        },
        credit: 'Gloria from Cuernavaca, Mexico / Wikimedia Commons (CC BY-SA 2.0)',
      },
      where: ['par-cafe-flore', 'par-au-pied-de-cochon-halles'],
    },
  ],
};
