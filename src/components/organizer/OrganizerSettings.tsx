import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { OrganizerConfig, SwipeAction } from '@/lib/tauri-bindings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DEFAULT_ORGANIZER_CONFIG,
  type SwipeDirection,
} from './organizer-config'

interface OrganizerSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: OrganizerConfig
  onSave: (config: OrganizerConfig) => Promise<void> | void
}

const SWIPE_DIRECTIONS: SwipeDirection[] = ['up', 'down', 'left', 'right']

type ActionType = 'Move' | 'Delete' | 'Skip'


export function OrganizerSettings({
  open,
  onOpenChange,
  config,
  onSave,
}: OrganizerSettingsProps) {
  const { t } = useTranslation()
  const [draftConfig, setDraftConfig] = useState<OrganizerConfig>(config)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setDraftConfig(config)
    }
  }, [config, open])

  const handleTypeChange = (
    direction: SwipeDirection,
    type: ActionType
  ) => {
    setDraftConfig(prev => {
      const currentAction = prev.swipe[direction]
      let newAction: SwipeAction

      if (type === 'Move') {
        // preserve target if already move, else default
        newAction = { 
          type: 'Move', 
          target: currentAction.type === 'Move' ? currentAction.target : 'New Folder' 
        }
      } else {
        newAction = { type }
      }

      return {
        swipe: {
          ...prev.swipe,
          [direction]: newAction,
        },
      }
    })
  }

  const handleTargetChange = (
    direction: SwipeDirection,
    target: string
  ) => {
    setDraftConfig(prev => ({
      swipe: {
        ...prev.swipe,
        [direction]: { type: 'Move', target },
      },
    }))
  }



  const handleResetDefaults = () => {
    setDraftConfig(DEFAULT_ORGANIZER_CONFIG)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(draftConfig)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('organizer.settings.title')}</DialogTitle>
          <DialogDescription>
            {t('organizer.settings.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {SWIPE_DIRECTIONS.map(direction => {
            const action = draftConfig.swipe[direction]
            return (
              <div key={direction} className="grid gap-2 p-4 border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`swipe-${direction}`} className="font-semibold capitalize">
                    {t(`organizer.settings.directions.${direction}`)}
                  </Label>
                  <Select
                    value={action.type}
                    onValueChange={value =>
                      handleTypeChange(direction, value as ActionType)
                    }
                  >
                    <SelectTrigger id={`swipe-${direction}`} className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Move">{t('organizer.actions.move')}</SelectItem>
                      <SelectItem value="Delete">{t('organizer.actions.delete')}</SelectItem>
                      <SelectItem value="Skip">{t('organizer.actions.skip')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {action.type === 'Move' && (
                  <div className="grid gap-1.5">
                    <Label htmlFor={`target-${direction}`} className="text-xs text-muted-foreground">
                      {t('organizer.settings.targetFolder')}
                    </Label>
                    <div className="flex gap-2">
                       <input
                        id={`target-${direction}`}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={action.target}
                        onChange={(e) => handleTargetChange(direction, e.target.value)}
                        placeholder="e.g. A-Roll"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetDefaults}
            disabled={isSaving}
          >
            {t('organizer.settings.resetDefaults')}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t('organizer.settings.cancel')}
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? t('organizer.settings.saving')
                : t('organizer.settings.save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
