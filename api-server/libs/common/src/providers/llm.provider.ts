import { Provider } from '@nestjs/common';
import { LLM_PROVIDER } from '../constants/llm.constant';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { LlmModuleOptions } from '../llm/llm.module';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { Runnable, RunnableLambda } from '@langchain/core/runnables';

export const LlmProvider: Provider = {
  provide: LLM_PROVIDER,
  useFactory: async (
    configService: ConfigService,
    {
      enableStructuredOutput,
      structuredOutputSchema,
      humanTemplate,
      systemTemplate,
    }: LlmModuleOptions,
  ): Promise<Runnable> => {
    const llm = new ChatGroq({
      apiKey: configService.getOrThrow<string>('LLM_API_KEY'),
      model: 'openai/gpt-oss-120b',
      temperature: 0.0,
    });
    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(systemTemplate);
    const userPrompt = HumanMessagePromptTemplate.fromTemplate(humanTemplate);
    const extractQuery = RunnableLambda.from((input: { query: string }) => ({
      query: input.query,
    }));
    const prompt = await ChatPromptTemplate.fromMessages([
      systemPrompt,
      userPrompt,
    ]);
    const promptChain = extractQuery.pipe(prompt);
    if (enableStructuredOutput) {
      const parser = new JsonOutputParser(structuredOutputSchema);
      // MAKE SURE A SAMPLE JSON OUTPUT IS ALREADY PROVIDED
      // IN THE SYSTEM PROMPT
      return promptChain.pipe(llm).pipe(parser);
    } else {
      return promptChain.pipe(llm);
    }
  },
  inject: [ConfigService, 'LLM_OPTIONS'],
};
