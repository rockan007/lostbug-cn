import Image from 'next/image'

const SOLAR_TERMS_URL = 'https://solar-terms.lostbug.cn'

export default function SolarTermsFeature() {
  return (
    <section
      aria-labelledby="solar-terms-title"
      className="group overflow-hidden rounded-[28px] border border-cyan-950/20 bg-[#03111d] text-white shadow-xl shadow-cyan-950/10"
    >
      <div className="grid min-h-[260px] md:grid-cols-[0.82fr_1.18fr]">
        <div className="relative flex flex-col justify-center overflow-hidden px-6 py-8 sm:px-9">
          <div className="absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-orange-400/15 blur-3xl" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-2 text-xs">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 font-semibold text-cyan-200">本站作品</span>
              <span className="text-slate-400">3D 天文互动体验</span>
            </div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-cyan-300/70">SOLAR CYCLE · 24 NODES</p>
            <h2 id="solar-terms-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">节气星球</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              拨动地球，沿真实低偏心率轨道探索二十四节气、太阳黄经、昼夜变化与四季天气。
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-slate-300">
              {['3D 可交互', '节气天气', '日地距离', '声音反馈'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{item}</span>
              ))}
            </div>
            <a
              href={SOLAR_TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              进入节气星球 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <a
          href={SOLAR_TERMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="打开节气星球二十四节气互动网站"
          className="relative min-h-[230px] overflow-hidden border-t border-white/10 md:border-l md:border-t-0"
        >
          <Image
            src="/images/solar-terms-preview.png"
            alt="节气星球：太阳、地球和二十四节气轨道"
            width={1732}
            height={909}
            sizes="(max-width: 767px) 100vw, 60vw"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03111d]/25 via-transparent to-transparent" />
          <div className="absolute bottom-4 right-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-2 text-xs text-cyan-100 backdrop-blur-md">在线体验</div>
        </a>
      </div>
    </section>
  )
}
