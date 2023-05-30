import { registerServiceWorker } from "lib/registerSw"
import { createSignal, onMount } from "solid-js"
import Backdrop, { Description } from "@Components/Backdrop"
import { buttonSounds } from "@Common/Audio/AudioSource"
import TextButton from "@Components/Primitive/TextButton"

function ServiceWorker() {
  const [pwa, setPwa] = createSignal({
    needsRefresh: false,
    refreshCb: null as () => void,
  })

  onMount(() => {
    registerServiceWorker({
      onNeedRefresh: updateSw => {
        setPwa({ needsRefresh: true, refreshCb: updateSw })
      },
    })
  })

  function Dismiss() {
    buttonSounds.onClick()
    setPwa(prev => ({ ...prev, needsRefresh: false }))
  }

  function UpdateServiceWorker() {
    buttonSounds.onClick()
    pwa().refreshCb()
  }

  return (
    <Backdrop
      when={pwa().needsRefresh}
      onBackgroundClick={Dismiss}
      title="Update Found"
      description={
        <Description>
          An update was found click Update to get the newest version
        </Description>
      }
    >
      <TextButton onClick={Dismiss}>Close</TextButton>
      <TextButton onClick={UpdateServiceWorker}>Update</TextButton>
    </Backdrop>
  )
}

export default ServiceWorker
