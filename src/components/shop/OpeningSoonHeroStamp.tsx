/**
 * Hero “Opening Soon” stamp — layout/CSS from OpeningSoon_v2.html (content only).
 * Red stamp colours match the reference; hero chrome uses site tokens elsewhere.
 */
export function OpeningSoonHeroStamp() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"
      aria-hidden
    >
      <span
        className="inline-block rotate-[-16deg] whitespace-nowrap rounded-[20px] border-[5px] border-[rgba(214,31,38,0.30)] px-4 py-0.5 text-[clamp(40px,7.2vw,100px)] font-black uppercase leading-[1.05] tracking-[0.05em] sm:px-7"
        style={{
          color: "rgba(214,31,38,0.17)",
          WebkitTextFillColor: "rgba(214,31,38,0.17)",
          WebkitTextStroke: "2px rgba(214,31,38,0.42)",
        }}
      >
        Opening Soon
      </span>
    </div>
  );
}
