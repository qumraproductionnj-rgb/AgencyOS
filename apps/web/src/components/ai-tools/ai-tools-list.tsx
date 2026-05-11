'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { BrandVoiceBuilder } from './brand-voice-builder'
import { AudiencePersonaBuilder } from './audience-persona-builder'
import { ContentPillarsDesigner } from './content-pillars-designer'
import { BigIdeaGenerator } from './big-idea-generator'
import { HookLab } from './hook-lab'
import { HeadlineTester } from './headline-tester'
import { ScriptWriter } from './script-writer'
import { StoryboardBuilder } from './storyboard-builder'
import { VoiceoverPolisher } from './voiceover-polisher'
import { MusicMoodSuggester } from './music-mood-suggester'
import { BRollPlanner } from './b-roll-planner'
import { ThumbnailConceptGenerator } from './thumbnail-concept-generator'
import { VideoPromptGenerator } from './video-prompt-generator'
import { VisualDirectionGenerator } from './visual-direction-generator'
import { ColorPaletteGenerator } from './color-palette-generator'
import { TypographyPairSuggester } from './typography-pair-suggester'
import { ImagePromptGenerator } from './image-prompt-generator'
import { StorySequenceBuilder } from './story-sequence-builder'
import { CarouselOutliner } from './carousel-outliner'
import { CaptionWriter } from './caption-writer'
import { HashtagResearcher } from './hashtag-researcher'
import { CtaGenerator } from './cta-generator'
import { ToneChecker } from './tone-checker'
import { CulturalSensitivityCheck } from './cultural-sensitivity-check'

const TOOLS = [
  { key: 'brand_voice_builder', icon: '🎙️' },
  { key: 'audience_persona_builder', icon: '👤' },
  { key: 'content_pillars_designer', icon: '📊' },
  { key: 'big_idea_generator', icon: '💡' },
  { key: 'hook_lab', icon: '🪝' },
  { key: 'headline_tester', icon: '📝' },
  { key: 'script_writer', icon: '📜' },
  { key: 'storyboard_builder', icon: '🎬' },
  { key: 'voiceover_polisher', icon: '🎤' },
  { key: 'music_mood_suggester', icon: '🎵' },
  { key: 'b_roll_planner', icon: '🎥' },
  { key: 'thumbnail_concept_generator', icon: '🖼️' },
  { key: 'video_prompt_generator', icon: '🤖' },
  { key: 'visual_direction_generator', icon: '🎨' },
  { key: 'color_palette_generator', icon: '🌈' },
  { key: 'typography_pair_suggester', icon: '🔤' },
  { key: 'image_prompt_generator', icon: '🖌️' },
  { key: 'story_sequence_builder', icon: '📖' },
  { key: 'carousel_outliner', icon: '🔄' },
  { key: 'caption_writer', icon: '✍️' },
  { key: 'hashtag_researcher', icon: '#️⃣' },
  { key: 'cta_generator', icon: '🎯' },
  { key: 'tone_checker', icon: '📐' },
  { key: 'cultural_sensitivity_check', icon: '🌍' },
] as const

export function AiToolsList() {
  const t = useTranslations('aiTools')
  const [activeTool, setActiveTool] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('description')}</p>
      </div>

      {!activeTool && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <button
              key={tool.key}
              onClick={() => setActiveTool(tool.key)}
              className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="mb-2 text-2xl">{tool.icon}</div>
              <div className="text-sm font-semibold text-gray-800">{t(`tool_${tool.key}`)}</div>
              <div className="mt-1 text-xs text-gray-500">{t(`desc_${tool.key}`)}</div>
            </button>
          ))}
        </div>
      )}

      {activeTool && (
        <div className="space-y-4">
          <button
            onClick={() => setActiveTool(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            &larr; {t('backToTools')}
          </button>

          {activeTool === 'brand_voice_builder' && <BrandVoiceBuilder t={t} />}
          {activeTool === 'audience_persona_builder' && <AudiencePersonaBuilder t={t} />}
          {activeTool === 'content_pillars_designer' && <ContentPillarsDesigner t={t} />}
          {activeTool === 'big_idea_generator' && <BigIdeaGenerator t={t} />}
          {activeTool === 'hook_lab' && <HookLab t={t} />}
          {activeTool === 'headline_tester' && <HeadlineTester t={t} />}
          {activeTool === 'script_writer' && <ScriptWriter t={t} />}
          {activeTool === 'storyboard_builder' && <StoryboardBuilder t={t} />}
          {activeTool === 'voiceover_polisher' && <VoiceoverPolisher t={t} />}
          {activeTool === 'music_mood_suggester' && <MusicMoodSuggester t={t} />}
          {activeTool === 'b_roll_planner' && <BRollPlanner t={t} />}
          {activeTool === 'thumbnail_concept_generator' && <ThumbnailConceptGenerator t={t} />}
          {activeTool === 'video_prompt_generator' && <VideoPromptGenerator t={t} />}
          {activeTool === 'visual_direction_generator' && <VisualDirectionGenerator t={t} />}
          {activeTool === 'color_palette_generator' && <ColorPaletteGenerator t={t} />}
          {activeTool === 'typography_pair_suggester' && <TypographyPairSuggester t={t} />}
          {activeTool === 'image_prompt_generator' && <ImagePromptGenerator t={t} />}
          {activeTool === 'story_sequence_builder' && <StorySequenceBuilder t={t} />}
          {activeTool === 'carousel_outliner' && <CarouselOutliner t={t} />}
          {activeTool === 'caption_writer' && <CaptionWriter t={t} />}
          {activeTool === 'hashtag_researcher' && <HashtagResearcher t={t} />}
          {activeTool === 'cta_generator' && <CtaGenerator t={t} />}
          {activeTool === 'tone_checker' && <ToneChecker t={t} />}
          {activeTool === 'cultural_sensitivity_check' && <CulturalSensitivityCheck t={t} />}
        </div>
      )}
    </div>
  )
}
