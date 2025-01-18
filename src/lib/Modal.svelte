<script generics="ButtonLabel extends string | undefined" lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade, scale } from "svelte/transition";

  const dispatch = createEventDispatcher();

  type ButtonType = "primary" | "hm-system";
  type $$Props = {
    btnType?: ButtonType;
    btnIcon?: string;
    btnLabel?: ButtonLabel;
    disabled?: boolean;
    message?: string;
    helper?: string;
    spinner?: boolean;
    percent?: number;
    done?: boolean;
  } & (ButtonLabel extends string ? { spinner: boolean }
  : { spinner?: boolean });

  export let btnLabel: string | undefined = undefined;
  export let disabled = false;
  export let message = "";
  export let spinner = false;
</script>

<div class="frame no-print" transition:fade={{ duration: 300 }}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="container medium"
    role="dialog"
    on:click|stopPropagation
    transition:scale={{
      start: 0.85,
      duration: 300,
    }}
  >
    <div class="close">
      <button disabled={spinner} on:click={() => dispatch("close")}
        >Close</button
      >
    </div>
    <div class="overflow">
      <div class="content">
        <slot />
        {#if message}
          <p>{message}</p>
        {/if}
        {#if btnLabel}
          <div class="grid fr-max mt">
            <div class="grid max-fr">
              <button {disabled} on:click={() => dispatch("action")}>
                {btnLabel}
              </button>
              <button disabled={spinner} on:click={() => dispatch("close")}>
                Cancel
              </button>
            </div>
            <div>
              <slot name="button" />
            </div>
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
</style>
