import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ShortcutRow {
  keys: string[]
  descriptionKey: string
}

const SHORTCUT_ROWS: ShortcutRow[] = [
  { keys: ['↑', '↓', '←', '→'], descriptionKey: 'organizer.shortcuts.swipe' },
  { keys: ['Space'], descriptionKey: 'organizer.shortcuts.playPause' },
  { keys: ['1-5'], descriptionKey: 'organizer.shortcuts.speed' },
  { keys: ['Z', 'Cmd/Ctrl+Z'], descriptionKey: 'organizer.shortcuts.undo' },
  { keys: ['?'], descriptionKey: 'organizer.shortcuts.toggleHelp' },
]

export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
}: KeyboardShortcutsHelpProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('organizer.shortcuts.title')}</DialogTitle>
          <DialogDescription>
            {t('organizer.shortcuts.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {SHORTCUT_ROWS.map(row => (
            <div
              key={row.descriptionKey}
              className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2"
            >
              <KbdGroup>
                {row.keys.map(key => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </KbdGroup>
              <span className="text-sm text-muted-foreground">
                {t(row.descriptionKey)}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
