import { DynamicModule, Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmProvider } from '../providers/llm.provider';

interface LlmModuleDefaultOptions {
  systemTemplate: string;
  humanTemplate: string;
}

interface LlmModuleOptionsEnabled extends LlmModuleDefaultOptions {
  enableStructuredOutput: true;
  structuredOutputSchema: Record<string, any>;
}

interface LlmModuleOptionsDisabled extends LlmModuleDefaultOptions {
  enableStructuredOutput: true;
  structuredOutputSchema: Record<string, any>;
}

export type LlmModuleOptions =
  | LlmModuleOptionsEnabled
  | LlmModuleOptionsDisabled;

@Module({
  providers: [LlmService, LlmProvider],
  exports: [LlmService],
})
export class LlmModule {
  static register(options: LlmModuleOptions): DynamicModule {
    return {
      module: LlmModule,
      providers: [
        LlmService,
        LlmProvider,
        {
          provide: 'LLM_OPTIONS',
          useValue: options,
        },
      ],
      exports: [LlmService],
    };
  }
}
