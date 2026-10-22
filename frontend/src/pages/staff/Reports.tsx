import { useState } from 'react'
import { StaffHeader, StaffLayout } from '../../components/StaffLayout'
import { report } from '../../data/staff'

/** E7 · Reports — KPIs, revenue by day, best sellers and most requested changes (sample numbers). */
export function Reports() {
  const [period, setPeriod] = useState<(typeof report.periods)[number]>('Last 7 days')
  const maxDay = Math.max(...report.revenueByDay.map((d) => d.value))
  const busiest = report.revenueByDay.find((d) => d.value === maxDay)!

  const exportCsv = () => {
    const rows = [['Day', 'Revenue'], ...report.revenueByDay.map((d) => [d.day, String(d.value)])]
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'burger-lab-revenue.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <StaffLayout active="reports">
      <StaffHeader title="Reports">
        <div className="filters" role="group" aria-label="Period">
          {report.periods.map((p) => (
            <button key={p} type="button" className="filter filter--sm" aria-pressed={period === p} onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn--secondary btn--sm" onClick={exportCsv}>
          Export CSV
        </button>
      </StaffHeader>

      <div className="kpis">
        {report.kpis.map((k) => (
          <div key={k.label} className="card kpi">
            <p className="eyebrow">{k.label}</p>
            <p className="display kpi__value">{k.value}</p>
            <p className={`kpi__delta${k.good ? ' ok' : ' muted'}`}>{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="charts">
        <section className="card pad-20 chart">
          <h2 className="display h-17">Revenue by day</h2>
          <p className="muted small">{busiest.day === 'Mon' ? 'Monday' : busiest.day} was the busiest day this week.</p>
          <div className="bars" role="img" aria-label="Revenue by day bar chart">
            {report.revenueByDay.map((d) => (
              <div key={d.day} className="bars__col">
                <span className="mono bars__value">${d.value.toLocaleString()}</span>
                <span
                  className={`bars__bar${d.value === maxDay ? ' bars__bar--top' : ''}`}
                  style={{ height: `${(d.value / maxDay) * 156}px` }}
                />
              </div>
            ))}
          </div>
          <div className="bars__axis">
            {report.revenueByDay.map((d) => (
              <span key={d.day} className="mono">
                {d.day}
              </span>
            ))}
          </div>
        </section>

        <section className="card pad-20 stack-10 best">
          <h2 className="display h-17">Best sellers</h2>
          <HBars rows={report.bestSellers} />
          <hr className="divider" />
          <h2 className="display h-17">Most requested changes</h2>
          <HBars rows={report.topChanges} />
        </section>
      </div>
      <p className="muted small">Sample numbers for the prototype — these will come from the ORDER tables once the backend exists.</p>
    </StaffLayout>
  )
}

function HBars({ rows }: { rows: { name: string; count: number }[] }) {
  const max = Math.max(...rows.map((r) => r.count))
  return (
    <>
      {rows.map((r) => (
        <div key={r.name} className="hbar">
          <span className="hbar__name">{r.name}</span>
          <span className="hbar__track">
            <span className="hbar__fill" style={{ width: `${(r.count / max) * 100}%` }} />
          </span>
          <span className="mono strong hbar__count">{r.count}</span>
        </div>
      ))}
    </>
  )
}
