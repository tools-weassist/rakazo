const MARK = "/landing/wea-mark-light.svg";
const SCREENS = ["bot-list", "chat-draft-yes", "team-view"] as const;
const CAPS = [
  "All your bots and team chats in one list",
  "A draft that waits for your yes",
  "Your whole team in one chat",
] as const;
const STATIC = { web: 0, desktop: 1, phone: 2 } as const;
const SIZES = {
  web: { w: 1440, h: 900 },
  desktop: { w: 1280, h: 800 },
  phone: { w: 720, h: 1600 },
} as const;

const LockIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3 5.5V4a3 3 0 0 1 6 0v1.5M2.5 5.5h7v5h-7z" />
  </svg>
);

function ScreenSet({ dev }: { dev: keyof typeof SIZES }) {
  const { w, h } = SIZES[dev];
  return (
    <>
      {SCREENS.map((name, index) => (
        <img
          key={name}
          className={index === STATIC[dev] ? "is-on" : undefined}
          src={`/landing/screens/${dev}-${name}.webp`}
          alt=""
          width={w}
          height={h}
          loading="lazy"
          decoding="async"
          data-screen={index}
        />
      ))}
    </>
  );
}

/** Real app screens in simple device frames. Motion is mounted by WeaDevices. */
export function DevicesShowcase() {
  return (
    <div className="dv" data-devices="" data-caps={CAPS.join("|")} data-reveal="">
      <div className="dv-tabs" role="tablist" aria-label="Platforms">
        {(
          [
            ["web", "Web"],
            ["desktop", "Desktop"],
            ["phone", "Phone"],
          ] as const
        ).map(([id, label], index) => (
          <button
            key={id}
            className="dv-tab"
            type="button"
            role="tab"
            aria-selected={index === 0}
            tabIndex={index === 0 ? 0 : -1}
            data-device={id}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="dv-stage">
        <figure
          className="dv-dev dv-laptop is-active"
          data-device-frame="web"
          role="img"
          aria-label="Wea in a browser on a laptop"
        >
          <div data-parallax="0.03">
            <div className="dv-float">
              <div className="dv-lid">
                <div className="dv-browser">
                  <div className="dv-bar" aria-hidden="true">
                    <span className="dv-btab">
                      <img src={MARK} alt="" width={16} height={16} />
                      Wea
                    </span>
                    <span className="dv-url">
                      <LockIcon />
                      Wea
                    </span>
                  </div>
                  <div className="dv-screen">
                    <ScreenSet dev="web" />
                  </div>
                </div>
              </div>
              <div className="dv-base" aria-hidden="true" />
            </div>
          </div>
        </figure>
        <figure
          className="dv-dev dv-win"
          data-device-frame="desktop"
          role="img"
          aria-label="Wea in a browser window on a desktop computer"
        >
          <div data-parallax="0.06">
            <div className="dv-float">
              <div className="dv-window">
                <div className="dv-title" aria-hidden="true">
                  <span className="dv-btab">
                    <img src={MARK} alt="" width={16} height={16} />
                    Wea
                  </span>
                  <span className="dv-url">
                    <LockIcon />
                    Wea
                  </span>
                  <span className="dv-ctl">
                    <i className="m" />
                    <i className="x" />
                    <i className="c" />
                  </span>
                </div>
                <div className="dv-screen">
                  <ScreenSet dev="desktop" />
                </div>
              </div>
            </div>
          </div>
        </figure>
        <figure
          className="dv-dev dv-phone"
          data-device-frame="phone"
          role="img"
          aria-label="Wea in a phone browser"
        >
          <div data-parallax="0.09">
            <div className="dv-float">
              <div className="dv-handset">
                <div className="dv-status" aria-hidden="true">
                  <span>10:24</span>
                  <span className="dv-cam" />
                  <span className="dv-sig">
                    <i />
                    <i />
                    <i />
                    <b />
                  </span>
                </div>
                <div className="dv-purl" aria-hidden="true">
                  <span>
                    <LockIcon />
                    Wea
                  </span>
                </div>
                <div className="dv-screen">
                  <ScreenSet dev="phone" />
                </div>
                <div className="dv-nav" aria-hidden="true">
                  <i />
                </div>
              </div>
            </div>
          </div>
        </figure>
      </div>
      <p className="dv-cap" aria-live="off">
        <span data-dv-cap="">Your bots, a draft that waits for your yes, and a team chat</span>
      </p>
      <noscript>
        <img
          className="dv-fallback"
          src="/landing/wea-devices@1x.png"
          alt="Wea in a browser on a laptop, a desktop computer and a phone"
        />
      </noscript>
    </div>
  );
}
