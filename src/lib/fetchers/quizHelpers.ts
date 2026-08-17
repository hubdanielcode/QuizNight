/* - Embaralhando as alternativas para evitar que a resposta correta fique sempre na mesma posição - */

const shuffleArray = <Type>(fetchedArray: Type[]) => {
  const newArray = [...fetchedArray].sort(() => Math.random() - 0.5);

  return newArray;
};

/* - Buscando as alternativas para cada pergunta (1 correta e 3 erradas) - */

const getAlternatives = <Type>(fetchedArray: Type[], options: number, rightAnswer: Type) => {
  const possibleAnswers = new Set(fetchedArray);
  possibleAnswers.delete(rightAnswer);

  if (possibleAnswers.size < options) {
    throw new Error("Pool insuficiente para gerar as alternativas");
  }

  const wrongAnswers = shuffleArray([...possibleAnswers]).slice(0, options);

  return shuffleArray([...wrongAnswers, rightAnswer]);
};

/* - Escolhendo um ou mais item(s) aleatório(s) de um array, usado tanto pra sortear a categoria quanto o tipo de pergunta - */

const pickRandomItem = <Type>(item: Type[]) => {
  const selectedItem = item[Math.floor(Math.random() * item.length)];

  return selectedItem;
};

/* - Limpando metadados extras (feat, remix, single, etc.) que a API devolve junto ao título - */

const cleanTitle = (title: string) => {
  return title.replace(/\s*[\(\[].*?[\)\]]/g, "").trim();
};

export { shuffleArray, getAlternatives, pickRandomItem, cleanTitle };
