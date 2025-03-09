import { OPENAI_API_KEY, OPENAI_MODEL } from "$env/static/private";
import { createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
    apiKey: OPENAI_API_KEY,
    compatibility: 'strict'
});

export const modelOpenAi = openai.chat(OPENAI_MODEL);