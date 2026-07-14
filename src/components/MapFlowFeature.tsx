import Image from 'next/image'

const features = [
  '省 / 市 / 区县多级切换',
  '辐射路径与流光动效',
  '边界、标注与背景精细调节',
  '实时预览，一键导出',
]

export default function MapFlowFeature() {
  return (
    <section
      aria-labelledby="mapflow-title"
      className="relative isolate overflow-hidden rounded-[28px] border border-slate-700/70 bg-[#080d1d] text-white shadow-2xl shadow-blue-950/20"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(79,124,255,0.24),transparent_34%),radial-gradient(circle_at_88%_76%,rgba(78,227,255,0.13),transparent_30%)]" />
      <div className="grid min-h-[390px] lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-center px-6 py-8 sm:px-9 lg:px-10 lg:py-10">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-200">
              本站工具
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.9)]" />
              新上线
            </span>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/30 to-cyan-400/10 shadow-inner">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-cyan-200" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m3.5 6.5 5-3 7 3 5-3v14l-5 3-7-3-5 3z" />
                <path d="M8.5 3.5v14m7-11v14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-200">MapFlow</p>
              <p className="text-xs text-slate-500">行政区划地图设计器</p>
            </div>
          </div>

          <h1 id="mapflow-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            让行政区地图
            <span className="bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">动起来</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-[15px]">
            面向汇报、演示与数据大屏的在线地图设计工具。选择中国省市区县，添加跨区域辐射路径，自由调整配色、边界、标注和动效，即时生成有表现力的行政区可视化。
          </p>

          <ul className="mt-6 grid gap-x-5 gap-y-2.5 text-xs text-slate-300 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-cyan-300" fill="currentColor">
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.25 7.25a1 1 0 0 1-1.4 0L3.3 9.2a1 1 0 1 1 1.4-1.4l4.05 4.04 6.55-6.54a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href="https://mapflow.lostbug.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:from-blue-400 hover:to-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
            >
              打开 MapFlow
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 10h11m-4-4 4 4-4 4" />
              </svg>
            </a>
            <span className="text-xs text-slate-500">在线使用 · 无需安装</span>
          </div>
        </div>

        <a
          href="https://mapflow.lostbug.cn"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="打开 MapFlow 行政区划地图设计器"
          className="group relative min-h-[270px] overflow-hidden border-t border-white/10 bg-[#060a14] lg:min-h-full lg:border-l lg:border-t-0"
        >
          <Image
            src="/images/mapflow-preview.jpg"
            alt="MapFlow 编辑器界面，正在设计浙江省行政区辐射网络"
            width={1440}
            height={900}
            preload
            sizes="(max-width: 1023px) 100vw, 60vw"
            className="absolute inset-0 h-full w-full object-cover object-left transition duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080d1d]/40 via-transparent to-transparent lg:from-[#080d1d]/30" />
          <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/75 px-3 py-2 text-xs font-medium text-slate-100 shadow-xl backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_9px_rgba(103,232,249,0.9)]" />
            查看在线编辑器
          </div>
        </a>
      </div>
    </section>
  )
}
