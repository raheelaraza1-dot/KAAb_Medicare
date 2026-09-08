import { ShoppingBag, Tag, TrendingUp } from 'lucide-react'
import { MonthlyMetricSidebar } from './MonthlyMetricSidebar.jsx'

export function MonthlyProfitSidebar() {
  return (
    <>
      <MonthlyMetricSidebar
        label="Monthly Profit"
        title="Monthly Profit"
        metricKey="totalProfit"
        icon={TrendingUp}
        accent="emerald"
      />
      <MonthlyMetricSidebar
        label="Monthly Trading Prices"
        title="Monthly Trading Prices"
        metricKey="totalTradePrice"
        icon={ShoppingBag}
        accent="blue"
      />
      <MonthlyMetricSidebar
        label="Monthly Selling Prices"
        title="Monthly Selling Prices"
        metricKey="totalSellingPrice"
        icon={Tag}
        accent="violet"
      />
    </>
  )
}
