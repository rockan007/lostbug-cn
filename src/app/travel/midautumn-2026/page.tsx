import type { Metadata } from 'next'
import AccessGate from './AccessGate'
import styles from './page.module.css'
import { isMidautumnRideAuthenticated } from '@/lib/midautumn-ride-auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '2026 中秋骑行｜济南—博山—池上',
  description: '济南奥体中心出发的中秋三天骑游安排。',
}

const externalSources = [
  {
    label: '2026 年中秋放假安排',
    href: 'https://www.beijing.gov.cn/cs/gncs/zcwj/202603/t20260327_4568275.html',
  },
  {
    label: '山东旅游交通网与博山—淄川山区道路资料',
    href: 'https://jtt.shandong.gov.cn/module/download/downfile.jsp?classid=0&filename=8c482f43ba7c4a749ed138df035aa57f.pdf',
  },
  {
    label: '中郝峪村文旅与民宿信息',
    href: 'https://wh.zibo.gov.cn/gongkai/channel_c_5f9fa491ab327f36e4c13060_n_1605682629.6877/doc_6376edd31ea126b6b8541164.html',
  },
  {
    label: '汉庭酒店（淄博博山特信商城店）',
    href: 'https://hotels.ctrip.com/hotels/7086880.html',
  },
]

function DayCard({
  day,
  date,
  title,
  distance,
  children,
}: {
  day: string
  date: string
  title: string
  distance: string
  children: React.ReactNode
}) {
  return (
    <article className={styles.dayCard}>
      <div className={styles.dayNumber}>{day}</div>
      <div className={styles.dayBody}>
        <p className={styles.dayDate}>{date}</p>
        <h3>{title}</h3>
        <p className={styles.distance}>{distance}</p>
        {children}
      </div>
    </article>
  )
}

function RidePlan() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>MID-AUTUMN RIDE · 2026</p>
          <h1>济南—博山—池上</h1>
          <p className={styles.heroLead}>三天骑游，把行李留在博山，把山路留给白天。</p>
          <div className={styles.heroMeta}>
            <span>9 月 25 日（周五）— 9 月 27 日（周日）</span>
            <span>济南市高新区奥体中心地铁站往返</span>
          </div>
        </div>
        <div className={styles.routeMark} aria-hidden="true">
          <span>JN</span><i /> <span>BS</span><i /> <span>CS</span>
        </div>
      </section>

      <section className={styles.summary} aria-label="行程概览">
        <div><strong>270–315 km</strong><span>预计总里程</span></div>
        <div><strong>2 晚</strong><span>博山城区住宿</span></div>
        <div><strong>轻装往返</strong><span>池上山地日</span></div>
        <div><strong>不夜骑</strong><span>安全优先</span></div>
      </section>

      <section className={styles.notice}>
        <strong>执行提示</strong>
        <p>此安排沿用原三天骑游计划。每天出发前同时复核天气雷达、预警、道路施工与骑行导航；出现连续降雨、浓雾、雷电、山洪或无法排除的机械问题，缩短或取消当日行程。</p>
      </section>

      <section className={styles.section} aria-labelledby="itinerary-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>THE RIDE</p>
          <h2 id="itinerary-title">每日安排</h2>
        </div>
        <div className={styles.dayList}>
          <DayCard day="D1" date="9 月 25 日 · 周五" title="奥体中心 → 章丘南部 → 博山城区" distance="95–115 km · 建议 06:30 前出发，最迟 07:00">
            <p>奥体中心 → 圣井／章丘大学城一带 → 朱家峪外围 → 文祖／垛庄一带 → 博山城区。</p>
            <ul>
              <li>前 35 公里轻踩，不抢速度；章丘与文祖／垛庄各补一次水和主食。</li>
              <li>下午预留 2 小时应对山地起伏、逆风和修车；17:30 前抵达城区。</li>
              <li><strong>当日底线：</strong>14:30 前未过文祖／垛庄，停止向博山推进，改住附近合规住宿或联络救援，绝不为赶酒店夜骑。</li>
            </ul>
          </DayCard>

          <DayCard day="D2" date="9 月 26 日 · 周六" title="博山城区 → 池上／中郝峪 → 博山城区" distance="75–90 km · 07:30 轻装出发">
            <p>博山城区 → 池上镇 → 中郝峪村；午后按原路回博山。只选一个徒步或村落片区，不追求均速。</p>
            <ul>
              <li>换洗衣物和大部分行李留在酒店，只带补给、工具和必要防雨用品。</li>
              <li>不晚于 14:00 从中郝峪／池上返程；午餐可选农家乐，先确认营业和补水。</li>
              <li><strong>山地安全：</strong>下坡不并排、不压弯、不戴耳机；遇降雨、浓雾、雷电或山洪／地质预警，取消池上方向，改在博山城区休整。</li>
            </ul>
          </DayCard>

          <DayCard day="D3" date="9 月 27 日 · 周日" title="博山城区 → 章丘南部 → 奥体中心" distance="95–115 km · 06:30–07:00 出发">
            <p>博山城区 → 垛庄／文祖一带 → 朱家峪外围 → 圣井／章丘大学城一带 → 奥体中心。</p>
            <ul>
              <li>退房前装满水；前半程保守，午餐后再判断停留时间，18:00 前回到奥体。</li>
              <li>优先复用 D1 已验证的安全路段，不为更短距离钻陌生山村路。</li>
              <li>连续降雨、强侧风、身体不适或机械故障时不强行骑完；未逐班确认携车资格的公共交通不能预设为撤退保障。</li>
            </ul>
          </DayCard>
        </div>
      </section>

      <section className={styles.sectionGrid}>
        <article className={styles.infoCard}>
          <p className={styles.eyebrow}>STAY</p>
          <h2>两晚住在博山</h2>
          <p>池上当天轻装往返，不搬行李，也让山区路段始终留在白天。</p>
          <dl>
            <div><dt>建议住宿</dt><dd>汉庭酒店（淄博博山特信商城店）</dd></div>
            <div><dt>地址</dt><dd>博山区大街 2 号</dd></div>
            <div><dt>入住／退房</dt><dd>9 月 25 日入住，9 月 27 日退房</dd></div>
          </dl>
          <p className={styles.muted}>预订时确认自行车能否停在前台指定监控区域，选择安静房和可免费取消房型。本计划未下单、未付款。</p>
        </article>

        <article className={styles.infoCard}>
          <p className={styles.eyebrow}>FUEL</p>
          <h2>吃喝与补给</h2>
          <ul className={styles.checkList}>
            <li>每 45–60 分钟少量进食；每天至少 2–3 L 饮水，爬坡和炎热时加电解质。</li>
            <li>出发带面包／贝果、香蕉、饭团或独立包装饼干，水 1.5–2 L。</li>
            <li>后袋备能量胶或软糖、果干、咸饼干、牛肉干或坚果。</li>
            <li>D2 额外带饭团与电解质；骑后 1 小时内补碳水和蛋白质。</li>
          </ul>
        </article>
      </section>

      <section className={styles.sectionGrid}>
        <article className={styles.infoCard}>
          <p className={styles.eyebrow}>PACK</p>
          <h2>出发前装车</h2>
          <ul className={styles.checkList}>
            <li>头盔、前后灯、反光背心／反光条；前灯可在黄昏连续使用。</li>
            <li>2 条内胎、补胎片、撬胎棒、打气筒／气瓶、多功能工具、快扣与链条油。</li>
            <li>雨衣、防水手机袋、充电宝、身份证、少量现金和必要药品。</li>
            <li>下载离线地图；收藏酒店、最近医院及同伴／紧急联系人。</li>
          </ul>
        </article>

        <article className={styles.infoCard}>
          <p className={styles.eyebrow}>CHECK</p>
          <h2>出发前最后确认</h2>
          <ol className={styles.numberList}>
            <li>检查外胎磨损、刹车片、链条与变速；确认胎压、灯和补胎工具。</li>
            <li>用高德与另一款骑行导航各生成一次路线，选共同的非高速、非快速路方案。</li>
            <li>避开施工、长下坡碎石、连续重卡路段；关闭“高速优先／快速路优先”。</li>
            <li>核实酒店自行车停放、中郝峪午餐及补水点；出发前查看最新天气雷达与预警。</li>
          </ol>
        </article>
      </section>

      <section className={styles.section} aria-labelledby="sources-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>REFERENCE</p>
          <h2 id="sources-title">来源与变化说明</h2>
        </div>
        <div className={styles.sources}>
          {externalSources.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
              <span>{source.label}</span><span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <p className={styles.disclaimer}>交通、酒店价格、道路施工、景区／农家乐营业与天气均可能变化。页面为出发安排，不包含下单、付款或不可逆预订。</p>
      </section>

      <footer className={styles.footer}>骑行与旅行计划 · 2026 中秋</footer>
    </main>
  )
}

export default async function MidautumnRidePage() {
  const authenticated = await isMidautumnRideAuthenticated()
  return authenticated ? <RidePlan /> : <AccessGate />
}
