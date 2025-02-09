<script lang="ts">
  import Icon from "../Icon.svelte";

  interface Props {
    icon?: string | undefined;
    color?: string;
    label: string;
    descriptionIcon?: string | undefined;
    description?: string;
    disabled?: boolean;
    onclick?: () => any;
    children?: import("svelte").Snippet;
  }

  const {
    icon = undefined,
    color = "text",
    label,
    descriptionIcon = undefined,
    description = "",
    disabled = false,
    onclick,
    children,
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="li" class:disabled class:icon {onclick} role="listitem">
  <div class="icon-container">
    {#if icon}
      <div style:background-color="var(--accent)" class="icon-content">
        <Icon {color} type={icon} />
      </div>
    {/if}
  </div>
  <div style:padding={description ? "9px 12px" : "13px"} class="content">
    <p>{label}</p>
    {#if description}
      <div
        style:grid-template-columns="{descriptionIcon ? 'max-content' : ''} 1fr"
        class="description"
      >
        {#if descriptionIcon}
          <div class="icon">
            <Icon size={14} strokeWidth={2} type={descriptionIcon} />
          </div>
        {/if}
        <small>{description}</small>
      </div>
    {/if}
  </div>
  <div class="end">
    {@render children?.()}
  </div>
</div>

<style>
  .li {
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    align-items: center;
    background-color: var(--item);
    padding-right: 10px;
    transition: background-color, 0.2s;
  }
  .li:hover:not(.disabled) {
    cursor: pointer;
    background-color: var(--item-hover);
  }
  .li:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  .li:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .li:last-child .content {
    padding-top: 16px;
  }
  .li:not(:last-child) {
    border-bottom: 0.5px solid var(--border-light);
  }
  .icon-container {
    height: 100%;
    width: 100%;
  }
  .icon-content {
    display: grid;
    align-items: center;
    justify-items: center;
    height: 100%;
    padding: 0 14px;
  }
  .content {
    display: grid;
    row-gap: 2px;
  }
  .description {
    display: grid;
    column-gap: 5px;
    align-items: start;
  }
  .description .icon {
    padding-top: 1px;
  }
  .end {
    justify-self: end;
    display: flex;
    gap: 8px;
  }
  @media screen and (max-width: 500px) {
    .li {
      padding-right: 3px;
    }
    .icon-content {
      padding: 0 10px;
    }
  }
</style>
