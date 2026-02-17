import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { OrganizerConfig } from '@/lib/tauri-bindings'
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
  actionToOptionId,
  optionIdToAction,
  type SwipeActionOptionId,
  type SwipeDirection,
} from './organizer-config'

interface OrganizerSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: OrganizerConfig
  onSave: (config: OrganizerConfig) => Promise<void> | void
}

const SWIPE_DIRECTIONS: SwipeDirection[] = ['up', 'down', 'left', 'right']
const ACTION_OPTIONS: SwipeActionOptionId[] = [
  'ARoll',
  'BRoll',
  'Delete',
  'Skip',
  'Custom1',
  'Custom2',
  'Custom3',
  'Custom4',
]

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

  const actionOptionLabels = useMemo(
    () => ({
      ARoll: t('organizer.settings.actions.aRoll'),
      BRoll: t('organizer.settings.actions.bRoll'),
      Delete: t('organizer.settings.actions.delete'),
      Skip: t('organizer.settings.actions.skip'),
      Custom1: t('organizer.settings.actions.customFolder1'),
      Custom2: t('organizer.settings.actions.customFolder2'),
      Custom3: t('organizer.settings.actions.customFolder3'),
      Custom4: t('organizer.settings.actions.customFolder4'),
    }),
    [t]
  )

  const handleActionChange = (
    direction: SwipeDirection,
    actionId: SwipeActionOptionId
  ) => {
    setDraftConfig(prev => ({
      swipe: {
        ...prev.swipe,
        [direction]: optionIdToAction(actionId),
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

        <div className="grid gap-4 py-2">
          {SWIPE_DIRECTIONS.map(direction => (
            <div key={direction} className="grid gap-2">
              <Label htmlFor={`swipe-${direction}`}>
                {t(`organizer.settings.directions.${direction}`)}
              </Label>
              <Select
                value={actionToOptionId(draftConfig.swipe[direction])}
                onValueChange={value =>
                  handleActionChange(direction, value as SwipeActionOptionId)
                }
              >
                <SelectTrigger id={`swipe-${direction}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>
                      {actionOptionLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
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
