import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { Chart, Empty } from './UI.jsx';
import { CATEGORIES } from '../data/seed.js';
import { occupied } from '../services/platform.js';

const palette = ['#3569e8', '#73a3f4', '#67baab', '#f2b969', '#a396d4'];
export function CategoryChart() {
  const { data } = useApp();
  const values = useMemo(() => CATEGORIES.map((name, i) => ({ name, value: data.events.filter(e => !e.deleted && e.category === name).length, itemStyle: { color: palette[i] } })), [data.events]);
  const total = values.reduce((sum, item) => sum + item.value, 0);
  const option = useMemo(() => ({ tooltip: { trigger: 'item', confine: true }, title: { text: String(total), subtext: '活动总数', left: 'center', top: '35%', textStyle: { fontSize: 32, color: '#1e2c46', fontWeight: 600 }, subtextStyle: { color: '#8992a5', fontSize: 12 } }, series: [{ type: 'pie', radius: ['60%', '80%'], center: ['50%', '49%'], avoidLabelOverlap: true, label: { show: false }, itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 4 }, data: values }] }), [values, total]);
  return <div className="category-chart">{total ? <><Chart option={option} height={230} label={`活动分类分布：${values.map(v => `${v.name} ${v.value} 场`).join('，')}`} /><div className="chart-legend">{values.map((item, i) => <div key={item.name}><i style={{ background: palette[i] }} /><span>{item.name}</span><strong>{item.value}</strong><small>{Math.round(item.value / total * 100)}%</small></div>)}</div></> : <Empty title="发布活动后将显示分类分布" />}</div>;
}
export function TrendChart({ days = 7 }) {
  const { data, now } = useApp();
  const option = useMemo(() => {
    const dates = Array.from({ length: days }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - days + i + 1); d.setHours(0, 0, 0, 0); return d; });
    const counts = dates.map(d => { const end = new Date(d); end.setDate(end.getDate() + 1); return data.registrations.filter(r => Date.parse(r.applyTime) >= d.getTime() && Date.parse(r.applyTime) < end.getTime()).length; });
    return { tooltip: { trigger: 'axis', confine: true }, grid: { left: 35, right: 20, top: 24, bottom: 30 }, xAxis: { type: 'category', data: dates.map(d => `${d.getMonth() + 1}/${d.getDate()}`), boundaryGap: false, axisLine: { lineStyle: { color: '#e9edf4' } }, axisTick: { show: false }, axisLabel: { margin: 15, color: '#8b95a7' } }, yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#edf1f6', type: 'dashed' } }, axisLabel: { color: '#8b95a7' } }, series: [{ name: '报名记录', type: 'line', smooth: true, data: counts, symbolSize: 7, showSymbol: false, lineStyle: { color: '#386be5', width: 3 }, itemStyle: { color: '#386be5' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#dce7ff' }, { offset: 1, color: '#ffffff' }] } } }] };
  }, [data.registrations, days, now]);
  return <Chart option={option} height={280} label={`最近 ${days} 天的报名记录趋势；包含全部状态的报名记录`} />;
}
export function Ranking({ chart = false }) {
  const { data } = useApp();
  const ranking = useMemo(() => data.events.filter(e => !e.deleted && e.status !== 'draft').map(e => ({ ...e, count: occupied(e.id, data.registrations) })).sort((a, b) => b.count - a.count).slice(0, 5), [data]);
  const option = useMemo(() => ({ tooltip: { trigger: 'axis', confine: true, axisPointer: { type: 'shadow' } }, grid: { left: 120, top: 15, right: 35, bottom: 30 }, xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#edf1f6', type: 'dashed' } } }, yAxis: { type: 'category', inverse: true, data: ranking.map(e => e.title), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { width: 105, overflow: 'truncate', color: '#62708a' } }, series: [{ type: 'bar', name: '有效报名人数', data: ranking.map(e => e.count), barWidth: 14, itemStyle: { color: '#5684e9', borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', color: '#62708a' } }] }), [ranking]);
  if (!ranking.length) return <Empty title="还没有活动数据" />;
  if (chart) return <Chart option={option} label="热门活动排行，按待审核与已通过报名人数合计排序" height={280} />;
  return <div className="ranking-list">{ranking.map((event, i) => <Link to={`/events/${event.id}`} key={event.id}><span className={`rank-number rank-${i}`}>{String(i + 1).padStart(2, '0')}</span><div><strong>{event.title}</strong><small>{event.category}</small></div><span>{event.count}<small> 人报名</small></span><ArrowRight size={16} /></Link>)}</div>;
}
