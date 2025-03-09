import { anthropic } from '@ai-sdk/anthropic';
import { createAnthropic } from '@ai-sdk/anthropic';
import { ANTHROPIC_API_KEY, ANTHROPIC_MODEL } from "$env/static/private";

export const anthropicSdk = createAnthropic({
    apiKey: ANTHROPIC_API_KEY,
});

export const modelAnthropic = anthropicSdk(ANTHROPIC_MODEL);