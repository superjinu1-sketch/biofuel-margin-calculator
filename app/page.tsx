"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExtraItem {
  id: string;
  name: string;
  amount: number;
}

interface ModeAInputs {
  fobPrice: number;
  volume: number;
  freight: number;
  insurance: number;
  customs: number;
  inland: number;
  exchangeRate: number;
  targetMargin: number;
  extras: ExtraItem[];
}

interface ModeBInputs {
  sellingPriceUSD: number;
  sellingPriceKRW: number;
  useKRW: boolean;
  volume: number;
  freight: number;
  insurance: number;
  customs: number;
  inland: number;
  exchangeRate: number;
  targetMargin: number;
  extras: ExtraItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number, decimals = 0) =>
  n.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const fmtKRW = (n: number) => fmt(Math.round(n)) + "원";
const fmtUSD = (n: number, d = 2) => "$" + fmt(n, d);

function uid() {
  return Math.random().toString(36).slice(2);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 sm:p-4 ${
        highlight
          ? "bg-emerald-500 dark:bg-emerald-600 text-white"
          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
      }`}
    >
      <p
        className={`text-xs font-medium mb-1 ${
          highlight ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm sm:text-base font-bold break-all ${
          highlight ? "text-white" : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  sub = false,
  total = false,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: boolean;
  total?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-baseline gap-2 py-2 ${
        total
          ? "border-t-2 border-slate-300 dark:border-slate-600 mt-1 pt-3"
          : "border-b border-slate-100 dark:border-slate-700/50"
      } ${sub ? "pl-3 sm:pl-4" : ""}`}
    >
      <span
        className={`text-xs sm:text-sm min-w-0 flex-shrink ${
          highlight
            ? "font-bold text-emerald-600 dark:text-emerald-400"
            : total
            ? "font-semibold text-slate-800 dark:text-slate-200"
            : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-xs sm:text-sm font-mono flex-shrink-0 text-right ${
          highlight
            ? "font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base"
            : total
            ? "font-semibold text-slate-800 dark:text-slate-200"
            : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-1">
        {prefix && (
          <span className="text-sm text-slate-500 dark:text-slate-400 select-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-base font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
        />
        {suffix && (
          <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ExtraItems({
  items,
  onChange,
}: {
  items: ExtraItem[];
  onChange: (items: ExtraItem[]) => void;
}) {
  const add = () =>
    onChange([...items, { id: uid(), name: "", amount: 0 }]);

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const update = (id: string, field: "name" | "amount", val: string | number) =>
    onChange(
      items.map((i) => (i.id === id ? { ...i, [field]: val } : i))
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
          기타 비용
        </label>
        <button
          onClick={add}
          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md transition"
        >
          + 항목 추가
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          항목 없음
        </p>
      )}
      {items.map((item) => (
        <div key={item.id} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="항목명"
            value={item.name}
            onChange={(e) => update(item.id, "name", e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-base text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="$/MT"
            value={item.amount}
            min={0}
            onChange={(e) =>
              update(item.id, "amount", parseFloat(e.target.value) || 0)
            }
            className="w-20 sm:w-24 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 sm:px-3 py-2 text-base font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={() => remove(item.id)}
            className="text-slate-400 hover:text-red-500 transition text-xl leading-none px-1 flex-shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Mode A ──────────────────────────────────────────────────────────────────

function ModeA() {
  const [inputs, setInputs] = useState<ModeAInputs>({
    fobPrice: 780,
    volume: 100,
    freight: 45,
    insurance: 5,
    customs: 15,
    inland: 10,
    exchangeRate: 1380,
    targetMargin: 10,
    extras: [],
  });

  const set = useCallback(
    (field: keyof Omit<ModeAInputs, "extras">) => (v: number) =>
      setInputs((p) => ({ ...p, [field]: v })),
    []
  );

  const extrasTotal = inputs.extras.reduce((s, e) => s + e.amount, 0);
  const cif = inputs.fobPrice + inputs.freight + inputs.insurance;
  const totalCostUSD =
    cif + inputs.customs + inputs.inland + extrasTotal;
  const totalCostKRW = totalCostUSD * inputs.exchangeRate;
  const sellingPriceUSD = totalCostUSD * (1 + inputs.targetMargin / 100);
  const sellingPriceKRW = sellingPriceUSD * inputs.exchangeRate;
  const marginPerMT = sellingPriceUSD - totalCostUSD;
  const monthlyMarginUSD = marginPerMT * inputs.volume;
  const monthlySalesUSD = sellingPriceUSD * inputs.volume;
  const monthlySalesKRW = monthlySalesUSD * inputs.exchangeRate;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 입력 패널 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-3">
          입력 값
        </h2>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-4">
          <NumberInput
            label="FOB 구매가"
            value={inputs.fobPrice}
            onChange={set("fobPrice")}
            prefix="$"
            suffix="/MT"
          />
          <NumberInput
            label="월 구매량"
            value={inputs.volume}
            onChange={set("volume")}
            suffix="MT"
          />
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-1">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
            물류비 ($/MT)
          </p>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-4">
            <NumberInput
              label="해상운임"
              value={inputs.freight}
              onChange={set("freight")}
              prefix="$"
              suffix="/MT"
            />
            <NumberInput
              label="보험료"
              value={inputs.insurance}
              onChange={set("insurance")}
              prefix="$"
              suffix="/MT"
            />
            <NumberInput
              label="통관·하역"
              value={inputs.customs}
              onChange={set("customs")}
              prefix="$"
              suffix="/MT"
            />
            <NumberInput
              label="내륙운송"
              value={inputs.inland}
              onChange={set("inland")}
              prefix="$"
              suffix="/MT"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
          <ExtraItems
            items={inputs.extras}
            onChange={(extras) => setInputs((p) => ({ ...p, extras }))}
          />
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-4">
          <NumberInput
            label="환율 (USD/KRW)"
            value={inputs.exchangeRate}
            onChange={set("exchangeRate")}
            suffix="원"
          />
          <NumberInput
            label="목표 마진"
            value={inputs.targetMargin}
            onChange={set("targetMargin")}
            suffix="%"
            step={0.5}
          />
        </div>
      </div>

      {/* 결과 패널 */}
      <div className="space-y-4">
        {/* 원가 Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
            원가 구조 (MT당)
          </h2>
          <BreakdownRow label="FOB 구매가" value={fmtUSD(inputs.fobPrice)} />
          <BreakdownRow
            label="+ 해상운임"
            value={fmtUSD(inputs.freight)}
            sub
          />
          <BreakdownRow
            label="+ 보험료"
            value={fmtUSD(inputs.insurance)}
            sub
          />
          <BreakdownRow
            label="= CIF 부산"
            value={fmtUSD(cif)}
            total
          />
          <BreakdownRow
            label="+ 통관·하역"
            value={fmtUSD(inputs.customs)}
            sub
          />
          <BreakdownRow
            label="+ 내륙운송"
            value={fmtUSD(inputs.inland)}
            sub
          />
          {inputs.extras.map((e) => (
            <BreakdownRow
              key={e.id}
              label={`+ ${e.name || "기타"}`}
              value={fmtUSD(e.amount)}
              sub
            />
          ))}
          <BreakdownRow
            label="= 총 원가 (USD)"
            value={fmtUSD(totalCostUSD)}
            total
          />
          <BreakdownRow
            label="= 총 원가 (KRW)"
            value={fmtKRW(totalCostKRW)}
            total
          />

          {/* 판매 단가 강조 */}
          <div className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-4">
            <p className="text-xs font-medium text-blue-500 dark:text-blue-400 mb-1">
              권장 판매 단가 ({inputs.targetMargin}% 마진 적용)
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {fmtUSD(sellingPriceUSD)} /MT
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {fmtKRW(sellingPriceKRW)} /MT
            </p>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            label="MT당 마진"
            value={fmtUSD(marginPerMT)}
            highlight
          />
          <SummaryCard
            label="월 총 마진"
            value={fmtUSD(monthlyMarginUSD)}
            highlight
          />
          <SummaryCard label="월 매출 (USD)" value={fmtUSD(monthlySalesUSD)} />
          <SummaryCard
            label="월 매출 (KRW)"
            value={fmtKRW(monthlySalesKRW)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Mode B ──────────────────────────────────────────────────────────────────

function ModeB() {
  const [inputs, setInputs] = useState<ModeBInputs>({
    sellingPriceUSD: 950,
    sellingPriceKRW: 950 * 1380,
    useKRW: false,
    volume: 100,
    freight: 45,
    insurance: 5,
    customs: 15,
    inland: 10,
    exchangeRate: 1380,
    targetMargin: 10,
    extras: [],
  });

  const set = useCallback(
    (field: keyof Omit<ModeBInputs, "extras" | "useKRW">) =>
      (v: number) => {
        setInputs((p) => {
          const next = { ...p, [field]: v };
          // keep USD & KRW in sync
          if (field === "sellingPriceUSD") {
            next.sellingPriceKRW = v * p.exchangeRate;
          } else if (field === "sellingPriceKRW") {
            next.sellingPriceUSD = v / p.exchangeRate;
          } else if (field === "exchangeRate") {
            if (p.useKRW) {
              next.sellingPriceUSD = p.sellingPriceKRW / v;
            } else {
              next.sellingPriceKRW = p.sellingPriceUSD * v;
            }
          }
          return next;
        });
      },
    []
  );

  const extrasTotal = inputs.extras.reduce((s, e) => s + e.amount, 0);
  const effectiveSellingUSD = inputs.sellingPriceUSD;
  const allowedTotalCost =
    effectiveSellingUSD / (1 + inputs.targetMargin / 100);
  const maxFOB =
    allowedTotalCost -
    inputs.customs -
    inputs.inland -
    inputs.insurance -
    inputs.freight -
    extrasTotal;
  const marginPerMT = effectiveSellingUSD - allowedTotalCost;
  const monthlyMarginUSD = marginPerMT * inputs.volume;
  const monthlySalesUSD = effectiveSellingUSD * inputs.volume;
  const monthlySalesKRW = monthlySalesUSD * inputs.exchangeRate;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 입력 패널 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-3">
          입력 값
        </h2>

        {/* 판매 단가 입력 모드 전환 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              고객 판매 단가 입력 방식
            </label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 text-xs">
              <button
                onClick={() => setInputs((p) => ({ ...p, useKRW: false }))}
                className={`px-3 py-1.5 transition ${
                  !inputs.useKRW
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setInputs((p) => ({ ...p, useKRW: true }))}
                className={`px-3 py-1.5 transition ${
                  inputs.useKRW
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                원화
              </button>
            </div>
          </div>

          {!inputs.useKRW ? (
            <NumberInput
              label="판매 단가 (USD)"
              value={inputs.sellingPriceUSD}
              onChange={set("sellingPriceUSD")}
              prefix="$"
              suffix="/MT"
              step={10}
            />
          ) : (
            <NumberInput
              label="판매 단가 (원화)"
              value={inputs.sellingPriceKRW}
              onChange={set("sellingPriceKRW")}
              suffix="원/MT"
              step={10000}
            />
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500">
            환산:{" "}
            {!inputs.useKRW
              ? fmtKRW(inputs.sellingPriceKRW) + " /MT"
              : fmtUSD(inputs.sellingPriceUSD) + " /MT"}
          </p>
        </div>

        <NumberInput
          label="월 판매량"
          value={inputs.volume}
          onChange={set("volume")}
          suffix="MT"
        />

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-1">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
            물류비 ($/MT)
          </p>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-4">
            <NumberInput
              label="해상운임"
              value={inputs.freight}
              onChange={set("freight")}
              prefix="$"
              suffix="/MT"
            />
            <NumberInput
              label="보험료"
              value={inputs.insurance}
              onChange={set("insurance")}
              prefix="$"
              suffix="/MT"
            />
            <NumberInput
              label="통관·하역"
              value={inputs.customs}
              onChange={set("customs")}
              prefix="$"
              suffix="/MT"
            />
            <NumberInput
              label="내륙운송"
              value={inputs.inland}
              onChange={set("inland")}
              prefix="$"
              suffix="/MT"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
          <ExtraItems
            items={inputs.extras}
            onChange={(extras) => setInputs((p) => ({ ...p, extras }))}
          />
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-4">
          <NumberInput
            label="환율 (USD/KRW)"
            value={inputs.exchangeRate}
            onChange={set("exchangeRate")}
            suffix="원"
          />
          <NumberInput
            label="목표 마진"
            value={inputs.targetMargin}
            onChange={set("targetMargin")}
            suffix="%"
            step={0.5}
          />
        </div>
      </div>

      {/* 결과 패널 */}
      <div className="space-y-4">
        {/* 역산 Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
            역산 구조 (MT당)
          </h2>
          <BreakdownRow
            label="판매 단가"
            value={fmtUSD(effectiveSellingUSD)}
          />
          <BreakdownRow
            label={`÷ (1 + ${inputs.targetMargin}%)`}
            value="마진 차감"
            sub
          />
          <BreakdownRow
            label="= 허용 총 원가"
            value={fmtUSD(allowedTotalCost)}
            total
          />
          <BreakdownRow
            label="- 내륙운송"
            value={fmtUSD(inputs.inland)}
            sub
          />
          <BreakdownRow
            label="- 통관·하역"
            value={fmtUSD(inputs.customs)}
            sub
          />
          <BreakdownRow
            label="- 보험료"
            value={fmtUSD(inputs.insurance)}
            sub
          />
          <BreakdownRow
            label="- 해상운임"
            value={fmtUSD(inputs.freight)}
            sub
          />
          {inputs.extras.map((e) => (
            <BreakdownRow
              key={e.id}
              label={`- ${e.name || "기타"}`}
              value={fmtUSD(e.amount)}
              sub
            />
          ))}

          {/* 최대 FOB 강조 */}
          <div
            className={`mt-4 rounded-xl p-4 border ${
              maxFOB > 0
                ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700"
                : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700"
            }`}
          >
            <p
              className={`text-xs font-medium mb-1 ${
                maxFOB > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              최대 FOB 구매가{" "}
              {maxFOB <= 0 && "⚠️ (마진 확보 불가)"}
            </p>
            <p
              className={`text-2xl font-bold ${
                maxFOB > 0
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {fmtUSD(maxFOB)} /MT
            </p>
            <p
              className={`text-sm mt-1 ${
                maxFOB > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {fmtKRW(maxFOB * inputs.exchangeRate)} /MT
            </p>
            {maxFOB > 0 && (
              <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-1">
                이 금액 이하로 구매해야 목표 마진 확보 가능
              </p>
            )}
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            label="MT당 마진"
            value={fmtUSD(marginPerMT)}
            highlight={marginPerMT > 0}
          />
          <SummaryCard
            label="월 총 마진"
            value={fmtUSD(monthlyMarginUSD)}
            highlight={monthlyMarginUSD > 0}
          />
          <SummaryCard label="월 매출 (USD)" value={fmtUSD(monthlySalesUSD)} />
          <SummaryCard
            label="월 매출 (KRW)"
            value={fmtKRW(monthlySalesKRW)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              바이오연료 원료 마진 계산기
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
              한국-말레이시아 팜유 부산물 (POME/PAO) 트레이딩
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("A")}
            className={`flex-shrink-0 px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === "A"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <span className="sm:hidden">모드 A — 구매가→판매가</span>
            <span className="hidden sm:inline">모드 A — 구매가 기준 → 판매가 산출</span>
          </button>
          <button
            onClick={() => setActiveTab("B")}
            className={`flex-shrink-0 px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === "B"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <span className="sm:hidden">모드 B — 판매가→구매가</span>
            <span className="hidden sm:inline">모드 B — 판매가 기준 → 구매가 역산</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {activeTab === "A" ? <ModeA /> : <ModeB />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        바이오연료 원료 마진 계산기 · 모든 계산은 클라이언트에서 처리됩니다 · 실시간 환율 미반영
      </footer>
    </div>
  );
}
