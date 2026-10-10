// Time-machine haptics. Android browsers get full patterns through the Vibration API.
// iOS Safari has no Vibration API, but iOS 18 plays a system haptic when a switch-style
// checkbox toggles, so single taps there go through a hidden one (patterns degrade to
// their first beat). Everywhere else this is a silent no-op.

let iosSwitch: HTMLLabelElement | null = null;

function canVibrate() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function iosTap() {
  if (typeof document === "undefined") return;
  if (!iosSwitch) {
    const label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9px;top:-9px";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    iosSwitch = label;
  }
  iosSwitch.click();
}

function buzz(pattern: number | number[]) {
  if (canVibrate()) navigator.vibrate(pattern);
  else iosTap();
}

export const haptics = {
  /** Finger lands on the ring. */
  press() {
    buzz(12);
  },

  /** One clock tick while charging; Android only, iOS would rattle the system haptic. */
  tick(strength: number) {
    if (canVibrate()) navigator.vibrate(Math.round(6 + strength * 10));
  },

  /**
   * Lift-off: a strong kick, then a rumble whose pulses get shorter and closer
   * together, fading out as the years blur past.
   */
  launch() {
    if (!canVibrate()) return iosTap();
    const pattern = [70, 40, 120];
    let on = 34;
    let off = 70;
    while (on > 6) {
      pattern.push(off, on);
      off = Math.max(18, off * 0.9);
      on *= 0.955;
    }
    navigator.vibrate(pattern.map(Math.round));
  },

  /** Touchdown: a soft double tap. */
  land() {
    buzz([18, 60, 30]);
  },

  /** Let go early, or stayed: stop whatever is running. */
  stop() {
    if (canVibrate()) navigator.vibrate(0);
  },
};
