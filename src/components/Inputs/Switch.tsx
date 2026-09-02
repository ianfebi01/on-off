import { Switch as ShadcnSwitch } from '@/components/ui/switch'

interface Props {
    enabled: boolean
    disabled: boolean
    setEnabled: ( value: boolean ) => void
}
export default function Switch( { enabled, disabled, setEnabled }: Props ) {

  return (
    <ShadcnSwitch
      checked={enabled}
      disabled={disabled}
      onCheckedChange={setEnabled}
    />
  )
}
