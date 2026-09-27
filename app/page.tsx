"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  Copy,
  Headphones,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  Truck,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";

type ScenarioId = "delayed" | "not-received" | "pending" | "on-track" | "error";
type SheetId = "orders" | "details" | "support" | "report" | null;
type Tone = "amber" | "green" | "blue" | "rose";

type TimelineItem = {
  title: string;
  description: string;
  time?: string;
};

type Scenario = {
  label: string;
  sidebarDescription: string;
  icon: LucideIcon;
  tone: Tone;
  eyebrow: string;
  title: string;
  description: string;
  etaLabel: string;
  etaValue: string;
  etaNote: string;
  updated: string;
  currentStep: number;
  timeline: [TimelineItem, TimelineItem, TimelineItem, TimelineItem];
};

const scenarios: Record<Exclude<ScenarioId, "error">, Scenario> = {
  delayed: {
    label: "Delayed order",
    sidebarDescription: "Missed the promised window",
    icon: Clock3,
    tone: "amber",
    eyebrow: "DELIVERY UPDATE",
    title: "Your order is running late",
    description: "It missed yesterday’s delivery window. We’re checking in with the courier and will keep you posted.",
    etaLabel: "New estimated delivery",
    etaValue: "Tomorrow, 2:00–5:00 PM",
    etaNote: "Originally expected yesterday by 8:00 PM",
    updated: "Updated 12 minutes ago",
    currentStep: 2,
    timeline: [
      { title: "Processing", description: "Order confirmed and prepared", time: "2 days ago · 10:18 AM" },
      { title: "Shipped", description: "In transit · taking longer than expected", time: "Yesterday · 8:45 AM" },
      { title: "Out for delivery", description: "We’ll alert you when it’s with your driver" },
      { title: "Delivered", description: "Your package arrives" },
    ],
  },
  "not-received": {
    label: "Delivered, not received",
    sidebarDescription: "Marked delivered, package missing",
    icon: PackageSearch,
    tone: "rose",
    eyebrow: "DELIVERY ISSUE",
    title: "Marked delivered, but not there?",
    description: "The courier marked this order delivered. If you can’t find it, we’ll help you look into it.",
    etaLabel: "Delivery window",
    etaValue: "Today, 2:00–5:00 PM",
    etaNote: "Marked delivered today at 3:42 PM",
    updated: "Delivered today at 3:42 PM",
    currentStep: 4,
    timeline: [
      { title: "Processing", description: "Order confirmed and prepared", time: "2 days ago · 10:18 AM" },
      { title: "Shipped", description: "Courier picked up your package", time: "Yesterday · 8:45 AM" },
      { title: "Out for delivery", description: "Your driver was on the way", time: "Today · 9:12 AM" },
      { title: "Delivered", description: "Marked delivered by the courier", time: "Today · 3:42 PM" },
    ],
  },
  pending: {
    label: "Tracking not available",
    sidebarDescription: "Order placed, awaiting first scan",
    icon: Package,
    tone: "blue",
    eyebrow: "ORDER CONFIRMED",
    title: "Tracking is on its way",
    description: "Your order is being prepared. Tracking details will appear as soon as the courier scans your package.",
    etaLabel: "Estimated delivery",
    etaValue: "In 3 days, 9:00 AM–6:00 PM",
    etaNote: "We’ll update this when the courier checks in",
    updated: "Order confirmed today",
    currentStep: 1,
    timeline: [
      { title: "Processing", description: "Order confirmed · preparing your items", time: "Today · 9:30 AM" },
      { title: "Shipped", description: "Waiting for the courier’s first scan" },
      { title: "Out for delivery", description: "We’ll let you know when it’s with your driver" },
      { title: "Delivered", description: "Your package arrives" },
    ],
  },
  "on-track": {
    label: "On the way",
    sidebarDescription: "Out for delivery today",
    icon: Truck,
    tone: "green",
    eyebrow: "OUT FOR DELIVERY",
    title: "Almost at your door",
    description: "Your package is with the driver. We’ll let you know once it’s been delivered.",
    etaLabel: "Estimated delivery",
    etaValue: "Today, 2:00–5:00 PM",
    etaNote: "Your driver is on the way",
    updated: "Updated 8 minutes ago",
    currentStep: 3,
    timeline: [
      { title: "Processing", description: "Order confirmed and prepared", time: "2 days ago · 10:18 AM" },
      { title: "Shipped", description: "Courier picked up your package", time: "Yesterday · 8:45 AM" },
      { title: "Out for delivery", description: "With your driver now", time: "Today · 9:12 AM" },
      { title: "Delivered", description: "Your package arrives" },
    ],
  },
};

const previewOrder: ScenarioId[] = ["delayed", "not-received", "pending", "on-track", "error"];

const toneClasses: Record<Tone, {
  hero: string;
  icon: string;
  pill: string;
  action: string;
  activeStep: string;
}> = {
  amber: {
    hero: "bg-[#fff4e7] border-[#f3dfc4]",
    icon: "bg-[#ffe2bd] text-[#a75c22]",
    pill: "bg-[#ffead0] text-[#9c5724]",
    action: "bg-[#9c5528] hover:bg-[#85441d]",
    activeStep: "bg-[#b97038] text-white",
  },
  green: {
    hero: "bg-[#e9f4ed] border-[#cfe7d7]",
    icon: "bg-[#d1e8d9] text-[#21604a]",
    pill: "bg-[#d8ecdf] text-[#21604a]",
    action: "bg-[#245b49] hover:bg-[#194a3a]",
    activeStep: "bg-[#2b7257] text-white",
  },
  blue: {
    hero: "bg-[#edf4f7] border-[#d9e7eb]",
    icon: "bg-[#dbeaf0] text-[#3e7080]",
    pill: "bg-[#e0edf2] text-[#416d7a]",
    action: "bg-[#365f6a] hover:bg-[#274e58]",
    activeStep: "bg-[#4b8290] text-white",
  },
  rose: {
    hero: "bg-[#fbf0ed] border-[#f0dcd5]",
    icon: "bg-[#f5ded6] text-[#a45440]",
    pill: "bg-[#f8e3dc] text-[#9a4b38]",
    action: "bg-[#9b4c3b] hover:bg-[#813a2b]",
    activeStep: "bg-[#af654f] text-white",
  },
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="Morrow home">
      <span className={`${compact ? "h-8 w-8 rounded-[11px]" : "h-10 w-10 rounded-[13px]"} relative inline-flex items-center justify-center bg-[#255f4b] text-white`}>
        <span className="absolute left-[9px] top-[9px] h-[11px] w-[11px] rounded-full bg-[#bfe2bb]" />
        <span className="absolute bottom-[9px] right-[9px] h-[11px] w-[11px] rounded-full bg-white" />
      </span>
      <span className={`${compact ? "text-[18px]" : "text-[21px]"} font-bold tracking-[-0.07em]`}>morrow<span className="text-[#8fad95]">.</span></span>
    </div>
  );
}

function PreviewSelector({ scenario, onChange }: { scenario: ScenarioId; onChange: (value: ScenarioId) => void }) {
  return (
    <>
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[430px] lg:shrink-0 lg:flex-col lg:justify-between lg:py-13">
        <div>
          <Brand />
          <div className="mt-21 max-w-[375px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cadacf] bg-white/65 px-3 py-2 text-[10px] font-bold tracking-[0.19em] text-[#4c7861]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4f9b72]" /> ORDER EXPERIENCE
            </div>
            <h1 className="text-[58px] leading-[1.04] font-bold tracking-[-0.073em] text-[#19392d]">Clarity for every delivery.</h1>
            <p className="mt-6 max-w-[330px] text-[15px] leading-7 text-[#667b6e]">A more reassuring way to follow an order, understand what changed, and know what to do next.</p>
          </div>
          <div className="mt-10 w-[370px] rounded-[24px] border border-[#e1e9df] bg-white/80 p-2.5 shadow-[0_12px_35px_rgba(50,85,57,.05)]">
            <p className="px-3.5 pb-2 pt-2 text-[10px] font-bold tracking-[0.17em] text-[#829589]">PREVIEW A SCENARIO</p>
            {previewOrder.map((id) => {
              const item = id === "error" ? { label: "Connection error", sidebarDescription: "Could not load updates", icon: WifiOff } : scenarios[id];
              const Icon = item.icon;
              const selected = scenario === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange(id)}
                  aria-pressed={selected}
                  className={`flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 text-left transition-colors ${selected ? "bg-[#e9f1e9]" : "hover:bg-[#f6f8f4]"}`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-white text-[#2a6a4e]" : "bg-[#f1f5ef] text-[#758d79]"}`}><Icon size={17} strokeWidth={1.9} /></span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[13px] font-bold ${selected ? "text-[#1e4e37]" : "text-[#334a3b]"}`}>{item.label}</span>
                    <span className="mt-0.5 block text-[11px] text-[#8b9a8e]">{item.sidebarDescription}</span>
                  </span>
                  {selected && <ArrowRight size={15} className="text-[#467d5c]" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#87998c]"><span className="h-8 w-8 rounded-full border border-[#d5e2d7] bg-[#e9f0e6] flex items-center justify-center"><ArrowDownRight size={16} /></span> Designed for the moments that matter.</div>
      </aside>

      <div className="border-b border-[#e3eae3] bg-[#f2f5f0] px-5 py-3 lg:hidden">
        <div className="mx-auto flex max-w-[440px] items-center justify-between gap-3">
          <span className="text-[10px] font-bold tracking-[0.15em] text-[#728976]">PREVIEW STATE</span>
          <div className="relative min-w-0">
            <select
              aria-label="Preview order state"
              value={scenario}
              onChange={(event) => onChange(event.target.value as ScenarioId)}
              className="w-full max-w-[230px] appearance-none rounded-xl border border-[#d8e3d9] bg-white py-2 pl-3 pr-8 text-[12px] font-bold text-[#2b5b41]"
            >
              <option value="delayed">Delayed order</option>
              <option value="not-received">Delivered, not received</option>
              <option value="pending">Tracking not available</option>
              <option value="on-track">On the way</option>
              <option value="error">Connection error</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#567462]" />
          </div>
        </div>
      </div>
    </>
  );
}

function StatusCard({ scenario, reported, notifications, onPrimary }: {
  scenario: Scenario;
  reported: boolean;
  notifications: boolean;
  onPrimary: () => void;
}) {
  const Icon = scenario.icon;
  const tone = toneClasses[scenario.tone];
  const isReported = scenario.label === "Delivered, not received" && reported;
  const isPending = scenario.label === "Tracking not available";
  const isDelayed = scenario.label === "Delayed order";
  const buttonLabel = isReported ? "View your report" : isPending ? (notifications ? "Updates are on" : "Notify me when it ships") : isDelayed ? "Get help with this delay" : scenario.label === "On the way" ? "See delivery progress" : "Report a missing package";

  return (
    <section aria-label="Current delivery status" className={`relative overflow-hidden rounded-[25px] border p-5 pb-4 ${tone.hero}`}>
      <span aria-hidden="true" className="status-pattern absolute -right-15 -top-14 h-43 w-43 rounded-full opacity-[0.055]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold tracking-[0.15em] ${tone.pill}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{isReported ? "REPORT SAVED" : scenario.eyebrow}</span>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}><Icon size={22} strokeWidth={1.8} /></span>
        </div>
        <h2 className="mt-5 max-w-[290px] text-[26px] leading-[1.12] font-bold tracking-[-0.052em] text-[#19332b]">{isReported ? "We’ve saved your report" : scenario.title}</h2>
        <p className="mt-2.5 max-w-[330px] text-[13px] leading-[1.55] text-[#536860]">{isReported ? "Your missing package report is saved on this device. You can review it or reach out to support for next steps." : scenario.description}</p>
        <div className="mt-5 rounded-[18px] border border-white/85 bg-white/75 px-4 py-3.5 shadow-[0_4px_14px_rgba(33,73,48,.035)]">
          <div className="flex items-center gap-2 text-[#65786c]"><Clock3 size={14} strokeWidth={2} /><span className="text-[10px] font-bold tracking-[0.08em] uppercase">{scenario.etaLabel}</span></div>
          <p className="mt-1.5 text-[16px] font-bold tracking-[-0.035em] text-[#203b30]">{scenario.etaValue}</p>
          <p className="mt-1 text-[11px] leading-4 text-[#7f8b80]">{scenario.etaNote}</p>
        </div>
        <button type="button" onClick={onPrimary} className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[13px] px-4 py-2.5 text-[13px] font-bold text-white transition-colors ${tone.action}`}>
          {isPending ? <Bell size={16} /> : isReported ? <ClipboardList size={16} /> : scenario.label === "On the way" ? <Truck size={16} /> : <MessageCircle size={16} />}
          {buttonLabel}
          {!isPending && <ArrowRight size={15} />}
        </button>
      </div>
    </section>
  );
}

function Timeline({ scenario, reported }: { scenario: Scenario; reported: boolean }) {
  const tone = toneClasses[scenario.tone];
  const activeIndex = scenario.currentStep - 1;
  return (
    <section id="progress" aria-labelledby="progress-heading" className="rounded-[24px] border border-[#e6ece7] bg-white px-5 pb-5 pt-5 shadow-[0_3px_16px_rgba(38,66,49,.035)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="progress-heading" className="text-[16px] font-bold tracking-[-0.035em] text-[#20372b]">Delivery progress</h2>
          <p className="mt-0.5 text-[11px] text-[#8a998d]">Follow each step of your order</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#f0f4ef] px-2.5 py-1.5 text-[10px] font-bold text-[#5c7865]">{scenario.currentStep} of 4</span>
      </div>
      <ol className="relative">
        {scenario.timeline.map((step, index) => {
          const complete = index < activeIndex || (scenario.currentStep === 4 && index === 3);
          const active = index === activeIndex && !complete;
          const upcoming = !complete && !active;
          return (
            <li key={step.title} className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3.5 pb-5 last:pb-0">
              {index < 3 && <span aria-hidden="true" className={`absolute left-[15px] top-8 h-[calc(100%-30px)] w-[2px] ${complete ? "bg-[#b6d9c3]" : "bg-[#e4eae4]"}`} />}
              <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${complete ? "bg-[#2d7256] text-white" : active ? tone.activeStep : "border border-[#e4e9e4] bg-[#f5f7f4] text-[#aebbb0]"}`}>
                {complete ? <Check size={16} strokeWidth={2.6} /> : index === 0 ? <Package size={15} /> : index === 1 ? <Truck size={15} /> : index === 2 ? <MapPin size={15} /> : <PackageCheck size={15} />}
              </span>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className={`text-[13px] font-bold ${upcoming ? "text-[#87958a]" : "text-[#253e30]"}`}>{step.title}</h3>
                  {active && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${tone.pill}`}>CURRENT</span>}
                </div>
                <p className={`mt-1 text-[11px] leading-[1.4] ${upcoming ? "text-[#a6b1a6]" : "text-[#708173]"}`}>{step.description}</p>
                {step.time && <p className="mt-1.5 text-[10px] text-[#9aa89c]">{step.time}</p>}
                {index === 3 && reported && <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#fae8e1] px-2 py-1 text-[10px] font-bold text-[#a4513d]"><CircleHelp size={11} /> Missing package reported</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ProductSummary({ onDetails }: { onDetails: () => void }) {
  return (
    <section aria-labelledby="order-summary-heading" className="rounded-[24px] border border-[#e6ece7] bg-white p-5 shadow-[0_3px_16px_rgba(38,66,49,.035)]">
      <div className="flex items-center justify-between gap-2">
        <h2 id="order-summary-heading" className="text-[16px] font-bold tracking-[-0.035em] text-[#20372b]">Your order</h2>
        <button type="button" onClick={onDetails} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2a7153] hover:underline">View details <ChevronRight size={13} /></button>
      </div>
      <div className="mt-4 flex gap-3.5">
        <div className="flex h-22 w-22 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#f2f3eb]"><Image src="/runner.svg" width={110} height={90} alt="Sage and cream Cloudline Runner shoe" /></div>
        <div className="min-w-0 flex-1 py-1">
          <p className="text-[12px] font-bold leading-4 text-[#2b4234]">Cloudline Runner</p>
          <p className="mt-1.5 text-[11px] text-[#8a998e]">Sage / Cream · Size 8</p>
          <div className="mt-4 flex items-center justify-between gap-2 text-[11px]"><span className="text-[#89998c]">Qty 1</span><span className="font-bold text-[#273d30]">$128.00</span></div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#edf0eb] pt-3.5 text-[11px]"><span className="text-[#879789]">Order #MR-2048</span><span className="font-bold text-[#2b4333]">Total $128.00</span></div>
    </section>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKeyDown); previouslyFocused?.focus(); };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="sheet-backdrop absolute inset-0 bg-[#10281e]/45" />
      <section ref={panelRef} role="dialog" aria-modal="true" aria-label={title} className="sheet-panel relative z-10 max-h-[92vh] w-full max-w-[440px] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-7 pt-3 shadow-2xl sm:rounded-[28px] sm:px-6">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#dbe4dc] sm:hidden" />
        <div className="flex items-center justify-between gap-3 border-b border-[#edf0eb] pb-4">
          <h2 className="text-[21px] font-bold tracking-[-0.05em] text-[#203b2c]">{title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f5f0] text-[#4d6655] hover:bg-[#e6ede6]"><X size={18} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 py-2.5 text-[12px]"><span className="text-[#86968a]">{label}</span><span className="text-right font-bold text-[#2d4635]">{value}</span></div>;
}

export default function Page() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("delayed");
  const [sheet, setSheet] = useState<SheetId>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reported, setReported] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [supportTopic, setSupportTopic] = useState("Delivery delay");
  const [supportMessage, setSupportMessage] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setReported(window.localStorage.getItem("morrow-missing-report") === "true");
    setNotifications(window.localStorage.getItem("morrow-notifications") === "true");
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }

  function changeScenario(value: ScenarioId) {
    setScenarioId(value);
    setRefreshing(false);
    setSheet(null);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }

  function refreshUpdates() {
    if (refreshing) return;
    setRefreshing(true);
    refreshTimer.current = setTimeout(() => {
      setRefreshing(false);
      if (scenarioId === "error") {
        setScenarioId("on-track");
        showToast("Latest updates loaded");
      } else {
        showToast("You’re all caught up");
      }
    }, 950);
  }

  function handlePrimary() {
    if (scenarioId === "delayed") { setSupportTopic("Delivery delay"); setSheet("support"); }
    if (scenarioId === "not-received") setSheet("report");
    if (scenarioId === "pending") {
      const next = !notifications;
      setNotifications(next);
      window.localStorage.setItem("morrow-notifications", String(next));
      showToast(next ? "Shipment updates turned on" : "Shipment updates turned off");
    }
    if (scenarioId === "on-track") document.getElementById("progress")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function submitSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSent(true);
  }

  function saveReport() {
    setReported(true);
    window.localStorage.setItem("morrow-missing-report", "true");
    setSheet(null);
    showToast("Missing package report saved on this device");
  }

  async function copyOrderNumber() {
    try {
      await navigator.clipboard.writeText("MR-2048");
      showToast("Order number copied");
    } catch {
      showToast("Order number: MR-2048");
    }
  }

  const scenario = scenarioId === "error" ? null : scenarios[scenarioId];

  return (
    <div className="min-h-screen lg:bg-[radial-gradient(circle_at_75%_20%,#e4eee5_0%,#f2f5f0_46%,#f6f7f3_100%)]">
      <div className="mx-auto lg:flex lg:max-w-[1170px] lg:items-start lg:justify-between lg:gap-15 lg:px-8">
        <PreviewSelector scenario={scenarioId} onChange={changeScenario} />
        <div className="mx-auto min-h-screen w-full max-w-[440px] bg-[#fbfcfa] lg:my-10 lg:min-h-0 lg:overflow-hidden lg:rounded-[34px] lg:border lg:border-[#e5ebe3] lg:phone-shadow">
          <main className="px-5 pb-9 pt-5 sm:px-6 lg:pt-6">
            <header>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setSheet("orders")} aria-label="View your orders" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5ebe4] bg-white text-[#42604b] hover:bg-[#f1f5ef]"><ChevronLeft size={20} /></button>
                <Brand compact />
                <button type="button" onClick={() => { setSupportTopic("General question"); setSheet("support"); }} aria-label="Contact support" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5ebe4] bg-white text-[#42604b] hover:bg-[#f1f5ef]"><CircleHelp size={18} /></button>
              </div>
              <div className="mt-7 mb-5">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.11em] text-[#94a398]"><span>YOUR ORDERS</span><ChevronRight size={12} /><span className="text-[#607a66]">MR-2048</span></div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div>
                    <h1 className="text-[27px] leading-tight font-bold tracking-[-0.055em] text-[#1e392b]">Track your order</h1>
                    <p className="mt-1.5 text-[11px] text-[#8b9a8e]">Order #MR-2048 · 1 item</p>
                  </div>
                  <button type="button" onClick={() => setSheet("details")} className="mb-1 shrink-0 text-[11px] font-bold text-[#347255] hover:underline">Details</button>
                </div>
              </div>
            </header>

            <div aria-busy={refreshing} className="space-y-4">
              {refreshing ? (
                <>
                  <div role="status" aria-label="Loading tracking updates" className="animate-pulse rounded-[25px] border border-[#e6ece7] bg-[#eef3ec] p-5">
                    <div className="h-6 w-29 rounded-full bg-[#dce8dc]" /><div className="mt-9 h-7 w-57 rounded-lg bg-[#dce8dc]" /><div className="mt-3 h-4 w-64 max-w-full rounded bg-[#dce8dc]" /><div className="mt-2 h-4 w-48 rounded bg-[#dce8dc]" /><div className="mt-6 h-22 rounded-2xl bg-white/80" /><div className="mt-4 h-11 rounded-xl bg-[#dce8dc]" />
                    <span className="sr-only">Loading tracking updates</span>
                  </div>
                  <div className="animate-pulse rounded-[24px] border border-[#e6ece7] bg-white p-5"><div className="h-5 w-35 rounded bg-[#eef1ed]" /><div className="mt-7 space-y-5"><div className="h-8 rounded bg-[#f1f3ef]" /><div className="h-8 rounded bg-[#f1f3ef]" /><div className="h-8 rounded bg-[#f1f3ef]" /></div></div>
                </>
              ) : scenario ? (
                <>
                  <StatusCard scenario={scenario} reported={reported} notifications={notifications} onPrimary={handlePrimary} />
                  <div className="flex items-center justify-between px-0.5 text-[10px] text-[#91a093]"><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#77b58a]" />{scenario.updated}</span><button type="button" onClick={refreshUpdates} className="inline-flex items-center gap-1.5 font-bold text-[#5f8067] hover:text-[#2b6a48]"><RefreshCw size={12} /> Refresh</button></div>
                  <Timeline scenario={scenario} reported={reported && scenarioId === "not-received"} />
                </>
              ) : (
                <>
                  <section aria-label="Tracking update error" className="rounded-[25px] border border-[#e7dcd6] bg-[#fbf2ee] p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4dfd5] text-[#a55d46]"><WifiOff size={22} /></span>
                    <p className="mt-5 text-[10px] font-bold tracking-[0.14em] text-[#aa6953]">CONNECTION ISSUE</p>
                    <h2 className="mt-2 text-[25px] leading-[1.13] font-bold tracking-[-0.05em] text-[#25382e]">We couldn’t load the latest update</h2>
                    <p className="mt-2.5 text-[13px] leading-[1.55] text-[#68746b]">Your order is still here. Try again to see the newest tracking details, or contact us if this keeps happening.</p>
                    <button type="button" onClick={refreshUpdates} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-[#255e49] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#194b39]"><RefreshCw size={16} /> Try again</button>
                  </section>
                  <div className="flex items-center justify-between rounded-[18px] border border-[#e4eae4] bg-white px-4 py-3"><div className="flex items-center gap-2 text-[#638270]"><ShieldCheck size={17} /><span className="text-[11px] font-bold">Your order details are safe</span></div><button type="button" onClick={() => setSheet("support")} className="text-[11px] font-bold text-[#2c7653]">Get help</button></div>
                </>
              )}

              <ProductSummary onDetails={() => setSheet("details")} />

              <section className="flex items-center gap-3.5 rounded-[22px] bg-[#eaf2e9] p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#46785c]"><Headphones size={20} strokeWidth={1.8} /></span>
                <div className="min-w-0 flex-1"><h2 className="text-[12px] font-bold text-[#2b4d38]">Need a hand?</h2><p className="mt-1 text-[11px] leading-[1.35] text-[#77907d]">We’re here to help with your delivery.</p></div>
                <button type="button" onClick={() => { setSupportTopic(scenarioId === "delayed" ? "Delivery delay" : "General question"); setSheet("support"); }} aria-label="Contact support about your delivery" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2b6b50] text-white hover:bg-[#1d533d]"><ArrowRight size={17} /></button>
              </section>
            </div>
            <p className="mt-7 text-center text-[10px] text-[#a3afa4]">A little more peace of mind, from checkout to doorstep.</p>
          </main>
        </div>
      </div>

      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[60] w-[calc(100%-32px)] max-w-[380px] -translate-x-1/2 rounded-[14px] bg-[#203c2c] px-4 py-3 text-center text-[12px] font-bold text-white shadow-xl">{toast}</div>}

      {sheet === "orders" && <Sheet title="Your orders" onClose={() => setSheet(null)}>
        <p className="pt-5 text-[12px] leading-5 text-[#758778]">Your recent order is ready to track.</p>
        <button type="button" onClick={() => setSheet(null)} className="mt-4 flex w-full items-center gap-3 rounded-[18px] border border-[#e3ebe2] p-3 text-left hover:bg-[#f6f8f4]"><span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f2f3eb]"><Image src="/runner.svg" width={64} height={53} alt="Cloudline Runner" /></span><span className="flex-1"><span className="block text-[13px] font-bold text-[#2a4334]">Order #MR-2048</span><span className="mt-1 block text-[11px] text-[#8a9a8b]">Cloudline Runner · $128.00</span></span><ChevronRight size={17} className="text-[#6b8a73]" /></button>
      </Sheet>}

      {sheet === "details" && <Sheet title="Order details" onClose={() => setSheet(null)}>
        <div className="mt-5 flex items-center gap-3 rounded-[18px] bg-[#f4f6f0] p-3"><div className="flex h-17 w-17 items-center justify-center rounded-xl bg-[#ebeee5]"><Image src="/runner.svg" width={75} height={61} alt="Cloudline Runner" /></div><div><p className="text-[13px] font-bold text-[#294133]">Cloudline Runner</p><p className="mt-1 text-[11px] text-[#88978b]">Sage / Cream · Size 8 · Qty 1</p><p className="mt-2 text-[12px] font-bold text-[#2f4a38]">$128.00</p></div></div>
        <div className="mt-5 border-b border-[#edf0eb] pb-1"><div className="flex items-center justify-between"><h3 className="text-[12px] font-bold text-[#2d4535]">Order information</h3><button type="button" onClick={copyOrderNumber} aria-label="Copy order number" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#327653]"><Copy size={13} /> Copy ID</button></div><DetailRow label="Order number" value="MR-2048" /><DetailRow label="Placed" value="2 days ago · 10:18 AM" /><DetailRow label="Payment" value="Visa ending in 4242" /></div>
        <div className="mt-4 border-b border-[#edf0eb] pb-1"><h3 className="mb-1 text-[12px] font-bold text-[#2d4535]">Delivery address</h3><p className="py-2 text-[12px] leading-5 text-[#728575]">Alex Morgan<br />120 Willow Street, Apt 4B<br />Portland, OR 97205</p></div>
        <DetailRow label="Subtotal" value="$128.00" /><DetailRow label="Shipping" value="Free" /><div className="border-t border-[#edf0eb]"><DetailRow label="Total" value="$128.00" /></div>
        <p className="mt-3 text-[10px] leading-4 text-[#9caa9e]">Sample order details for this interface preview.</p>
      </Sheet>}

      {sheet === "support" && <Sheet title="Contact support" onClose={() => setSheet(null)}>
        {supportSent ? <div className="py-7 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f3e8] text-[#2e7654]"><CheckCircle2 size={28} /></span><h3 className="mt-4 text-[19px] font-bold tracking-[-0.04em] text-[#294532]">Message saved</h3><p className="mx-auto mt-2 max-w-[285px] text-[12px] leading-5 text-[#778b7a]">Your message is saved in this interface preview. No message was sent to a support team.</p><button type="button" onClick={() => { setSupportSent(false); setSupportMessage(""); setSheet(null); }} className="mt-6 w-full rounded-[13px] bg-[#255d48] px-4 py-3 text-[12px] font-bold text-white">Done</button></div> : <form onSubmit={submitSupport} className="pt-5"><p className="text-[12px] leading-5 text-[#718577]">Tell us what’s going on with order #MR-2048. We’ll help you choose the next step.</p><label htmlFor="support-topic" className="mt-5 block text-[11px] font-bold text-[#334e3a]">What do you need help with?</label><select id="support-topic" value={supportTopic} onChange={(event) => setSupportTopic(event.target.value)} className="mt-2 w-full rounded-[12px] border border-[#dce5dc] bg-white px-3 py-3 text-[12px] text-[#2b4835]"><option>Delivery delay</option><option>Missing package</option><option>Tracking information</option><option>General question</option></select><label htmlFor="support-message" className="mt-5 block text-[11px] font-bold text-[#334e3a]">Your message</label><textarea id="support-message" required rows={5} value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} placeholder="Tell us a little more..." className="mt-2 w-full resize-none rounded-[12px] border border-[#dce5dc] bg-white px-3 py-3 text-[12px] leading-5 text-[#2b4835] placeholder:text-[#a2b0a2]" /><button type="submit" className="mt-4 w-full rounded-[13px] bg-[#255d48] px-4 py-3 text-[12px] font-bold text-white hover:bg-[#194b38]">Save message <ArrowRight size={14} className="ml-1 inline" /></button><p className="mt-3 text-center text-[10px] text-[#9bab9d]">Preview only · messages are saved in this session, not sent.</p></form>}
      </Sheet>}

      {sheet === "report" && <Sheet title={reported ? "Your delivery report" : "Can’t find your package?"} onClose={() => setSheet(null)}>
        {reported ? <div className="py-7 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fae9e1] text-[#a55b41]"><ClipboardList size={26} /></span><h3 className="mt-4 text-[19px] font-bold tracking-[-0.04em] text-[#294532]">Report saved on this device</h3><p className="mx-auto mt-2 max-w-[295px] text-[12px] leading-5 text-[#778b7a]">You marked order #MR-2048 as not received. This preview does not send a claim to a support team.</p><button type="button" onClick={() => { setSupportTopic("Missing package"); setSheet("support"); }} className="mt-6 w-full rounded-[13px] bg-[#255d48] px-4 py-3 text-[12px] font-bold text-white">Contact support <ArrowRight size={14} className="ml-1 inline" /></button></div> : <div className="pt-5"><p className="text-[12px] leading-5 text-[#718577]">Before reporting, please check a few common drop-off spots. The courier marked this package delivered today at 3:42 PM.</p><div className="mt-5 space-y-3 rounded-[18px] bg-[#f5f7f2] p-4">{["Your porch, mailbox, or side door", "Building reception or parcel room", "A household member or nearby neighbor"].map((item) => <div key={item} className="flex items-start gap-2.5 text-[12px] leading-5 text-[#536e5b]"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#5c9d73]" />{item}</div>)}</div><button type="button" onClick={saveReport} className="mt-5 w-full rounded-[13px] bg-[#99513f] px-4 py-3 text-[12px] font-bold text-white hover:bg-[#803c2d]">I still can’t find it <ArrowRight size={14} className="ml-1 inline" /></button><p className="mt-3 text-center text-[10px] leading-4 text-[#9bab9d]">Preview only · this report is saved on your device, not sent.</p></div>}
      </Sheet>}
    </div>
  );
}
