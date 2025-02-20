<script lang="ts">
  import Button from "./Button.svelte";

  import { fade, scale } from "svelte/transition";

  interface Props {
    btnLabel?: string | undefined;
    disabled?: boolean;
    message?: string;
    spinner?: boolean;
    onclick?: () => any;
    onaction?: () => any;
    onclose?: () => any;
    children?: import("svelte").Snippet;
    button?: import("svelte").Snippet;
  }

  const {
    btnLabel = undefined,
    disabled = false,
    message = "",
    spinner = false,
    onclick,
    onaction,
    onclose,
    children,
    button,
  }: Props = $props();
</script>

<div class="frame no-print" transition:fade={{ duration: 300 }}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="container medium"
    onclick={event => {
      event.stopPropagation();
      onclick?.();
    }}
    role="dialog"
    transition:scale={{
      start: 0.85,
      duration: 300,
    }}
  >
    <div class="close">
      <Button disabled={spinner} onclick={onclose}>Close</Button>
    </div>
    <div class="overflow">
      <div class="content">
        {@render children?.()}
        {#if message}
          <p>{message}</p>
        {/if}
        {#if btnLabel}
          <div class="flex mt">
            <Button {disabled} onclick={onaction}>
              {btnLabel}
            </Button>
            {@render button?.()}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .frame {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--modal-frame);
    z-index: 10;
  }
  .medium {
    width: 640px;
    margin: 20px auto 45px auto;
    border-radius: 5px;
    max-height: 90%;
  }
  .container {
    display: grid;
    grid-template-rows: max-content 1fr;
    background-color: var(--modal-surface);
    box-shadow: 0px 0px 6px var(--shadow-header);
  }
  .close {
    justify-self: end;
    padding: 8px;
  }
  .overflow {
    overflow: auto;
  }
  .content {
    margin: 6px 36px 36px 36px;
  }
  .flex {
    display: flex;
    gap: 8px;
  }
  .mt {
    margin-top: 12px;
  }
</style>
