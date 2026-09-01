import { Switch } from '@headlessui/react'

interface Props {
    enabled: boolean
    disabled: boolean
    setEnabled: ( value: boolean ) => void
}
export default function Example( { enabled, disabled, setEnabled }: Props ) {

  return (
    <Switch
      checked={enabled}
      disabled={disabled}
      onChange={setEnabled}
      className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-navy/20 p-1 transition-colors duration-200 ease-in-out focus:not-data-focus:outline-none data-checked:bg-navy data-focus:outline data-focus:outline-navy"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-7"
      />
    </Switch>
  )
}
