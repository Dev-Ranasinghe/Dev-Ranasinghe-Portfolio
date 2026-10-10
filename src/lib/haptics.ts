// Time-machine haptics. Android browsers get full patterns through the Vibration API.
// Pulses never go below ~30ms: most phone motors need that long to spin up enough to feel.
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
    buzz(35);
  },

  /** One clock tick while charging; Android only, iOS would rattle the system haptic. */
  tick(strength: number) {
    if (canVibrate()) navigator.vibrate(Math.round(28 + strength * 22));
  },

  /**
   * Lift-off: a strong kick, then a rumble whose pulses get shorter and closer
   * together, fading out as the years blur past.
   */
  launch() {
    if (!canVibrate()) return iosTap();
    const pattern = [110, 60, 220];
    let on = 60;
    let off = 110;
    while (on > 30) {
      pattern.push(off, on);
      off = Math.max(40, off * 0.9);
      on *= 0.97;
    }
    navigator.vibrate(pattern.map(Math.round));
  },

  /** Touchdown: a soft double tap. */
  land() {
    buzz([45, 90, 70]);
  },

  /** Let go early, or stayed: stop whatever is running. */
  stop() {
    if (canVibrate()) navigator.vibrate(0);
  },
};
