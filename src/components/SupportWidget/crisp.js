/**
 * Crisp, the support chat the DHS apps actually use.
 *
 * The service provider app does the same thing in
 * `dhs_sp_ui_ext/src/components/SupportFAB/index.tsx`: load the client, keep
 * Crisp's own bubble hidden, and drive it from the app's own button. This is
 * the knowledge base's smaller half of that, with no logged-in user to
 * identify and no AI panel beside it.
 *
 * The website id defaults to the one the SP app uses, so a conversation started
 * here lands in the same inbox. `session:segments` is what tells the two apart
 * on the agent's side.
 */

const DEFAULT_WEBSITE_ID = '984b49c7-e6df-46b0-86d9-b858e3ad8d56';
const SCRIPT_ID = 'crisp-chat-script';

export const CRISP_WEBSITE_ID =
  process.env.REACT_APP_CRISP_WEBSITE_ID || DEFAULT_WEBSITE_ID;

const queue = () => {
  window.$crisp = window.$crisp || [];
  return window.$crisp;
};

/** Injects the client once and keeps its own bubble out of the way. */
export function loadCrisp() {
  const $crisp = queue();
  window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;
  $crisp.push(['safe', true]);
  $crisp.push(['set', 'session:segments', [['knowledge_base']]]);
  // Crisp's own launcher stays hidden: the page has one support button and it
  // is ours. Without this, both are on screen at once.
  $crisp.push(['do', 'chat:hide']);

  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);
  }
}

/**
 * What the reader was looking at when they asked. This is the part the SP app
 * cannot provide, and it is the reason an agent can answer without first asking
 * "which page are you on?".
 */
export function setSupportContext({ articleId, language, audience }) {
  queue().push([
    'set',
    'session:data',
    [[
      ['portal', 'knowledge_base'],
      ['page', articleId || 'home'],
      ['language', language || 'en'],
      ...(audience ? [['audience', audience]] : [])
    ]]
  ]);
}

/** Shows the widget and opens it. Used by the button and by the hero nav. */
export function openSupportChat() {
  const $crisp = queue();
  $crisp.push(['do', 'chat:show']);
  $crisp.push(['do', 'chat:open']);
}

/**
 * Crisp's availability, for the dot on the button. Returns an unsubscribe.
 * `onChange` is called with true, false, or null while it is still unknown.
 */
export function watchAvailability(onChange) {
  const $crisp = queue();
  const handle = (isAvailable) => onChange(isAvailable);

  $crisp.push(['on', 'website:availability:changed', handle]);

  const previousReadyTrigger = window.CRISP_READY_TRIGGER;
  const onReady = () => {
    previousReadyTrigger?.();
    const isAvailable = window.$crisp?.is?.('website:available');
    if (typeof isAvailable === 'boolean') onChange(isAvailable);
  };
  window.CRISP_READY_TRIGGER = onReady;

  return () => {
    window.$crisp?.push(['off', 'website:availability:changed']);
    if (window.CRISP_READY_TRIGGER === onReady) {
      window.CRISP_READY_TRIGGER = previousReadyTrigger;
    }
  };
}

/**
 * Follows the chat between open and closed, and keeps the two launchers from
 * ever being on screen together.
 *
 * While the chat is open Crisp shows its own control, the X, in the same corner
 * as our button, so the caller hides ours. When the visitor closes the chat we
 * hide Crisp's launcher again and ours comes back.
 *
 * The handlers read `window.$crisp` when they run rather than closing over the
 * queue: `l.js` replaces the array they were queued on, and a captured
 * reference silently stops working the moment the client finishes loading.
 */
export function watchChatOpenState(onOpenChange) {
  const onOpened = () => onOpenChange(true);
  const onClosed = () => {
    window.$crisp?.push(['do', 'chat:hide']);
    onOpenChange(false);
  };

  const $crisp = queue();
  $crisp.push(['on', 'chat:opened', onOpened]);
  $crisp.push(['on', 'chat:closed', onClosed]);

  return () => {
    window.$crisp?.push(['off', 'chat:opened']);
    window.$crisp?.push(['off', 'chat:closed']);
  };
}
