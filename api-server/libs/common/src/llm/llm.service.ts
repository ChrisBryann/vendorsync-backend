import { Inject, Injectable } from '@nestjs/common';
import { LLM_PROVIDER } from '../constants/llm.constant';
import { LlmModuleOptions } from './llm.module';
import { RunnableSequence } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';

@Injectable()
export class LlmService {
  constructor(
    @Inject(LLM_PROVIDER) private readonly llmAgent: RunnableSequence,
    @Inject('LLM_OPTIONS') private readonly llmOptions: LlmModuleOptions,
  ) {}

  async invoke<K = any>(
    message: string,
    structured: boolean,
  ): Promise<K | AIMessage> {
    const result = await this.llmAgent.invoke({ query: message });
    return structured ? (result as K) : (result as AIMessage);
  }
}
