import { test, expect } from "vitest";
import { questionSchema, sessionSchema, answerSchema } from "@/lib/validations/quiz";

const validQuestion = {
  questionId: "question-1",
  questionCategory: "jogos",
  questionType: "aboutGameName",
  title: "Qual é o jogo?",
  possibleAnswers: ["A", "B", "C", "D"],
  rightAnswer: "A",
  sessionId: "session-1",
};

/* - Testando questionSchema: aceita um payload válido e completo - */

test("should accept a fully valid question", () => {
  const result = questionSchema.safeParse(validQuestion);

  expect(result.success).toBe(true);
});

/* - Testando os campos opcionais (imageUrl e selectedAnswer podem faltar) - */

test("should accept a question without the optional imageUrl and selectedAnswer", () => {
  const result = questionSchema.safeParse(validQuestion);

  expect(result.success).toBe(true);
});

test("should accept a question with imageUrl and selectedAnswer provided", () => {
  const result = questionSchema.safeParse({
    ...validQuestion,
    imageUrl: "https://example.com/image.jpg",
    selectedAnswer: "A",
  });

  expect(result.success).toBe(true);
});

/* - Testando a rejeição de uma categoria fora do enum permitido - */

test("should reject a question with an invalid category", () => {
  const result = questionSchema.safeParse({ ...validQuestion, questionCategory: "esportes" });

  expect(result.success).toBe(false);
});

/* - Testando a rejeição de um tipo de pergunta fora do enum permitido - */

test("should reject a question with an invalid question type", () => {
  const result = questionSchema.safeParse({ ...validQuestion, questionType: "aboutSomethingElse" });

  expect(result.success).toBe(false);
});

/* - Testando a exigência de pelo menos 4 alternativas - */

test("should reject a question with fewer than 4 possible answers", () => {
  const result = questionSchema.safeParse({ ...validQuestion, possibleAnswers: ["A", "B", "C"] });

  expect(result.success).toBe(false);
});

test("should accept a question with more than 4 possible answers", () => {
  const result = questionSchema.safeParse({
    ...validQuestion,
    possibleAnswers: ["A", "B", "C", "D", "E"],
  });

  expect(result.success).toBe(true);
});

/* - Testando a rejeição de campos obrigatórios ausentes - */

test("should reject a question missing a required field", () => {
  const { title: _title, ...questionWithoutTitle } = validQuestion;

  const result = questionSchema.safeParse(questionWithoutTitle);

  expect(result.success).toBe(false);
});

/* - Testando sessionSchema: aceita uma sessão válida e aplica os valores padrão (score começa em 0, sessionStatus começa "active") - */

test("should accept a valid session and apply default values", () => {
  const result = sessionSchema.safeParse({
    sessionId: "session-1",
    questions: [validQuestion],
  });

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.score).toBe(0);
    expect(result.data.sessionStatus).toBe("active");
  }
});

test("should accept an explicit score and sessionStatus, overriding the defaults", () => {
  const result = sessionSchema.safeParse({
    sessionId: "session-1",
    questions: [validQuestion],
    score: 5,
    sessionStatus: "finished",
    reasonWhyGameEnded: "wrongAnswer",
  });

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.score).toBe(5);
    expect(result.data.sessionStatus).toBe("finished");
  }
});

/* - Testando a rejeição de uma sessão com uma pergunta inválida dentro da lista - */

test("should reject a session containing an invalid question", () => {
  const result = sessionSchema.safeParse({
    sessionId: "session-1",
    questions: [{ ...validQuestion, questionCategory: "esportes" }],
  });

  expect(result.success).toBe(false);
});

/* - Testando a rejeição de um motivo de fim de jogo fora do enum permitido - */

test("should reject a session with an invalid reasonWhyGameEnded", () => {
  const result = sessionSchema.safeParse({
    sessionId: "session-1",
    questions: [],
    reasonWhyGameEnded: "playerQuit",
  });

  expect(result.success).toBe(false);
});

/* - Testando answerSchema: só exige questionId e selectedAnswer, e ambos passam a ser obrigatórios (mesmo sendo opcionais no questionSchema original) - */

test("should accept a valid answer payload", () => {
  const result = answerSchema.safeParse({ questionId: "question-1", selectedAnswer: "A" });

  expect(result.success).toBe(true);
});

test("should reject an answer payload missing selectedAnswer", () => {
  const result = answerSchema.safeParse({ questionId: "question-1" });

  expect(result.success).toBe(false);
});

test("should reject an answer payload with extra unrelated question fields ignored as invalid shape", () => {
  const result = answerSchema.safeParse({ questionId: "question-1", selectedAnswer: undefined });

  expect(result.success).toBe(false);
});
