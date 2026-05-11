import type { PromptTemplate } from './types'

const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    toolType: 'big_idea_generator',
    systemPrompt:
      'You are a creative strategist for a marketing agency. Generate big ideas for content.',
    userPromptTemplate:
      'Client brand: {brandName}\nObjective: {objective}\nPillar: {pillar}\nGenerate {count} creative content ideas.',
    model: 'claude-sonnet-4-6',
    temperature: 0.8,
    maxTokens: 2000,
  },
  {
    toolType: 'hook_generator',
    systemPrompt: 'You are a copywriting expert specializing in hooks that stop the scroll.',
    userPromptTemplate:
      'Content topic: {topic}\nTone: {tone}\nPlatform: {platform}\nGenerate {count} attention-grabbing hooks.',
    model: 'claude-sonnet-4-6',
    temperature: 0.7,
    maxTokens: 1000,
  },
  {
    toolType: 'script_writer',
    systemPrompt: 'You are a professional scriptwriter for short-form video content.',
    userPromptTemplate:
      'Topic: {topic}\nDuration: {duration} seconds\nTone: {tone}\nHook: {hook}\nWrite a complete script with scenes.',
    model: 'claude-sonnet-4-6',
    temperature: 0.6,
    maxTokens: 3000,
  },
  {
    toolType: 'caption_writer',
    systemPrompt: 'You are a social media copywriter who writes engaging captions.',
    userPromptTemplate:
      'Topic: {topic}\nTone: {tone}\nPlatform: {platform}\nCTA: {cta}\nWrite {count} caption options with hashtags.',
    model: 'claude-sonnet-4-6',
    temperature: 0.7,
    maxTokens: 1000,
  },
  {
    toolType: 'brand_voice_builder',
    systemPrompt:
      'You are a brand strategist. Help define a brand voice based on provided information.',
    userPromptTemplate:
      'Brand name: {brandName}\nIndustry: {industry}\nTarget audience: {audience}\nBrand personality keywords: {keywords}\nGenerate a comprehensive brand voice guide.',
    model: 'claude-sonnet-4-6',
    temperature: 0.5,
    maxTokens: 2000,
  },
  {
    toolType: 'image_prompt_generator',
    systemPrompt:
      'You are a visual creative director. Generate detailed image prompts for AI image generation.',
    userPromptTemplate:
      'Concept: {concept}\nStyle: {style}\nMood: {mood}\nGenerate an optimized English prompt for Midjourney.',
    model: 'claude-sonnet-4-6',
    temperature: 0.7,
    maxTokens: 500,
  },
  {
    toolType: 'video_prompt_generator',
    systemPrompt:
      'You generate bilingual JSON prompts for AI video generation according to Seedance 2.0 spec.',
    userPromptTemplate:
      'Scene description: {description}\nDuration: {duration} seconds\nStyle: {style}\nGenerate JSON with EN description and ZH translation.',
    model: 'claude-sonnet-4-6',
    temperature: 0.5,
    maxTokens: 1000,
  },
]

export class PromptRegistry {
  private prompts = new Map<string, PromptTemplate>()

  constructor() {
    for (const p of DEFAULT_PROMPTS) {
      this.prompts.set(p.toolType, p)
    }
  }

  get(toolType: string): PromptTemplate | undefined {
    return this.prompts.get(toolType)
  }

  set(toolType: string, template: PromptTemplate): void {
    this.prompts.set(toolType, template)
  }

  getAll(): PromptTemplate[] {
    return Array.from(this.prompts.values())
  }

  has(toolType: string): boolean {
    return this.prompts.has(toolType)
  }
}
