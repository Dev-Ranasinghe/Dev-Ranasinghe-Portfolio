// The one door between eras. Anything that travels (the year switcher, in-page
// "GO TO 19XX" buttons) asks for a jump; the TimeMachine in the root layout runs it.

export type JumpRequest = { href: string; x: number; y: number; opener: HTMLElement | null };

export const JUMP_EVENT = "timemachine:jump";

/** Year an era path belongs to: "/2036" -> 2036. */
export function yearOf(path: string): number {
  const m = /^\/(\d{4})(?:\/|$)/.exec(path);
  return m ? Number(m[1]) : 1996;
}

/**
 * Ask for a jump to `href`. `origin` is the control that was pressed: the portal
 * opens from it, so the jump reads as a consequence of that click.
 */
export function requestJump(href: string, origin?: Element | null) {
  const el = origin ?? (typeof document !== "undefined" ? document.activeElement : null);
  const r = el && el !== document.body ? el.getBoundingClientRect() : null;
  const detail: JumpRequest = {
    href,
    opener: el instanceof HTMLElement ? el : null,
    x: r ? r.left + r.width / 2 : window.innerWidth / 2,
    y: r ? r.top + r.height / 2 : window.innerHeight / 2,
  };
  window.dispatchEvent(new CustomEvent<JumpRequest>(JUMP_EVENT, { detail }));
}
