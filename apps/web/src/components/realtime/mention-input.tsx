'use client'

import { useCallback, forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

export interface MentionUser {
  id: string
  name: string
  nameEn?: string | null
}

interface MentionListRef {
  onKeyDown: (p: SuggestionKeyDownProps) => boolean
}

type MentionListProps = SuggestionProps & { items: MentionUser[] }

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const isAr = typeof document !== 'undefined' ? document.documentElement.lang === 'ar' : true

  const selectItem = useCallback(
    (index: number) => {
      const item = props.items[index]
      if (item) props.command({ id: item.id, label: isAr ? item.name : (item.nameEn ?? item.name) })
    },
    [props, isAr],
  )

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i + props.items.length - 1) % props.items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % props.items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  if (!props.items.length) return null

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111]/95 shadow-xl backdrop-blur-xl">
      {props.items.map((item: MentionUser, index: number) => (
        <button
          key={item.id}
          onClick={() => selectItem(index)}
          className={cn(
            'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
            index === selectedIndex
              ? 'bg-purple-500/20 text-white'
              : 'text-white/70 hover:bg-white/[0.05]',
          )}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-300">
            {(isAr ? item.name : (item.nameEn ?? item.name)).slice(0, 2)}
          </span>
          {isAr ? item.name : (item.nameEn ?? item.name)}
        </button>
      ))}
    </div>
  )
})
MentionList.displayName = 'MentionList'

interface Props {
  users: MentionUser[]
  placeholder?: string
  onSubmit?: (text: string, mentionedIds: string[]) => void
  className?: string
}

export function MentionInput({ users, placeholder, onSubmit, className }: Props) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false }),
      Mention.configure({
        HTMLAttributes: { class: 'mention-chip' },
        suggestion: {
          items: ({ query }: { query: string }) =>
            users.filter(
              (u) =>
                u.name.includes(query) ||
                (u.nameEn?.toLowerCase().includes(query.toLowerCase()) ?? false),
            ),
          render: () => {
            let component: ReactRenderer<MentionListRef>
            let popup: TippyInstance[]

            return {
              onStart: (props: SuggestionProps) => {
                component = new ReactRenderer(MentionList, {
                  props: { ...props, items: props.items as MentionUser[] },
                  editor: props.editor,
                })
                if (!props.clientRect) return
                const instances = tippy(document.body, {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
                popup = Array.isArray(instances) ? instances : [instances]
              },
              onUpdate: (props: SuggestionProps) => {
                component.updateProps({ ...props, items: props.items as MentionUser[] })
                if (!props.clientRect) return
                popup[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect })
              },
              onKeyDown: (props: SuggestionKeyDownProps) =>
                component.ref?.onKeyDown(props) ?? false,
              onExit: () => {
                popup[0]?.destroy()
                component.destroy()
              },
            }
          },
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'outline-none text-sm text-white min-h-[36px] max-h-[120px] overflow-y-auto',
        dir: isAr ? 'rtl' : 'ltr',
      },
    },
  })

  const handleSubmit = useCallback(() => {
    if (!editor) return
    const text = editor.getText()
    if (!text.trim()) return

    const mentionedIds: string[] = []
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'mention') {
        mentionedIds.push(node.attrs['id'] as string)
      }
    })

    onSubmit?.(text, mentionedIds)
    editor.commands.clearContent()
  }, [editor, onSubmit])

  return (
    <div
      className={cn('rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5', className)}
    >
      <EditorContent
        editor={editor}
        placeholder={
          placeholder ?? (isAr ? 'اكتب تعليقاً... @ للذكر' : 'Write a comment... @ to mention')
        }
      />
      {editor && !editor.isEmpty && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/30"
          >
            {isAr ? 'إرسال' : 'Send'}
          </button>
        </div>
      )}
      <style>{`
        .mention-chip {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          border-radius: 0.375rem;
          padding: 0 0.25rem;
          font-weight: 600;
        }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255,255,255,0.25);
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}
