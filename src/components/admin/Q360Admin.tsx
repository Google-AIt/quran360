import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listQ360Programs,
  saveQ360Program,
  addQ360Competency,
  addQ360Item,
  updateQ360Item,
  deleteQ360Node,
  exportQ360Csv,
} from "@/lib/q360-admin.functions";

export function Q360Admin() {
  const listFn = useServerFn(listQ360Programs);
  const saveFn = useServerFn(saveQ360Program);
  const addComp = useServerFn(addQ360Competency);
  const addItem = useServerFn(addQ360Item);
  const editItem = useServerFn(updateQ360Item);
  const delNode = useServerFn(deleteQ360Node);
  const exportFn = useServerFn(exportQ360Csv);

  const q = useQuery({ queryKey: ["admin-q360"], queryFn: () => listFn() });
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  if (q.isLoading) return <p className="py-10 text-center text-muted-foreground">جارٍ التحميل…</p>;
  const rows = q.data ?? [];

  const totals = rows.reduce(
    (acc, r) => ({
      participants: acc.participants + r.stats.participants,
      pre: acc.pre + r.stats.preCount,
      post: acc.post + r.stats.postCount,
      followup: acc.followup + r.stats.followupCount,
      invites: acc.invites + r.stats.invitesSent,
      answered: acc.answered + r.stats.invitesAnswered,
    }),
    { participants: 0, pre: 0, post: 0, followup: 0, invites: 0, answered: 0 },
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Metric label="المشاركون في Q360" value={totals.participants} />
        <Metric label="القياسات القبلية" value={totals.pre} />
        <Metric label="القياسات البعدية" value={totals.post} />
        <Metric label="قياسات المتابعة" value={totals.followup} />
        <Metric label="دعوات المقيمين" value={totals.invites} />
        <Metric
          label="نسبة استجابة المقيمين"
          value={totals.invites ? `${Math.round((totals.answered / totals.invites) * 100)}%` : "—"}
        />
      </div>

      {rows.map((r) => {
        const p = r.program;
        const isOpen = open === r.course.id;
        return (
          <div key={r.course.id} className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{r.course.title}</p>
                <p className="text-sm text-muted-foreground">
                  {p ? (p.enabled ? "Q360 مفعّل" : "Q360 معطّل") : "لا يوجد برنامج Q360"} — مشاركون{" "}
                  {r.stats.participants} · قبلي {r.stats.preCount} · بعدي {r.stats.postCount} · نسبة الإكمال{" "}
                  {r.stats.completion}% · متوسط التحسن {r.stats.improvement != null ? `${r.stats.improvement}%` : "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={p?.enabled ? "secondary" : "default"}
                  onClick={async () => {
                    const res = await saveFn({
                      data: {
                        courseId: r.course.id,
                        title: p?.title ?? `Q360 — ${r.course.title}`,
                        intro: p?.intro ?? undefined,
                        enabled: !p?.enabled,
                        followupDays: p?.followup_days,
                        minGroupRaters: p?.min_group_raters,
                        inviteValidDays: p?.invite_valid_days,
                      },
                    });
                    if (res.ok) {
                      toast.success("تم التحديث");
                      q.refetch();
                    } else toast.error(res.error);
                  }}
                >
                  {p?.enabled ? "تعطيل" : p ? "تفعيل" : "إنشاء وتفعيل"}
                </Button>
                {p && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setOpen(isOpen ? null : r.course.id)}>
                      {isOpen ? "إغلاق" : "المحاور والأسئلة"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const res = await exportFn({ data: { programId: p.id } });
                        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = `q360-${r.course.slug}.csv`;
                        a.click();
                      }}
                    >
                      تصدير CSV
                    </Button>
                  </>
                )}
              </div>
            </div>

            {p && isOpen && (
              <div className="mt-5 space-y-5 border-t pt-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <NumField
                    label="مدة المتابعة (يوم)"
                    def={p.followup_days}
                    onSave={(v) =>
                      saveFn({ data: { courseId: r.course.id, title: p.title, enabled: p.enabled, followupDays: v, minGroupRaters: p.min_group_raters, inviteValidDays: p.invite_valid_days } }).then(() => q.refetch())
                    }
                  />
                  <NumField
                    label="الحد الأدنى لظهور فئة"
                    def={p.min_group_raters}
                    onSave={(v) =>
                      saveFn({ data: { courseId: r.course.id, title: p.title, enabled: p.enabled, followupDays: p.followup_days, minGroupRaters: v, inviteValidDays: p.invite_valid_days } }).then(() => q.refetch())
                    }
                  />
                  <NumField
                    label="صلاحية الدعوة (يوم)"
                    def={p.invite_valid_days}
                    onSave={(v) =>
                      saveFn({ data: { courseId: r.course.id, title: p.title, enabled: p.enabled, followupDays: p.followup_days, minGroupRaters: p.min_group_raters, inviteValidDays: v } }).then(() => q.refetch())
                    }
                  />
                </div>

                {r.competencies.map((c) => (
                  <div key={c.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{c.title}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await delNode({ data: { kind: "competency", id: c.id } });
                          q.refetch();
                        }}
                      >
                        حذف المحور
                      </Button>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {c.items.map((it) => (
                        <li key={it.id} className="flex flex-wrap items-center gap-2">
                          <Input
                            defaultValue={it.text}
                            onBlur={async (e) => {
                              if (e.target.value !== it.text) {
                                await editItem({ data: { itemId: it.id, text: e.target.value } });
                                toast.success("تم تعديل السؤال");
                              }
                            }}
                            className="flex-1 min-w-60"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              await delNode({ data: { kind: "item", id: it.id } });
                              q.refetch();
                            }}
                          >
                            حذف
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Input
                        placeholder="سؤال سلوكي جديد"
                        value={draft[c.id] ?? ""}
                        onChange={(e) => setDraft({ ...draft, [c.id]: e.target.value })}
                        className="flex-1 min-w-60"
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          const text = (draft[c.id] ?? "").trim();
                          if (!text) return;
                          await addItem({ data: { competencyId: c.id, text, sortOrder: c.items.length + 1 } });
                          setDraft({ ...draft, [c.id]: "" });
                          q.refetch();
                        }}
                      >
                        إضافة سؤال
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2">
                  <Input
                    placeholder="محور / مهارة جديدة"
                    value={draft[p.id] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [p.id]: e.target.value })}
                    className="flex-1 min-w-60"
                  />
                  <Button
                    onClick={async () => {
                      const title = (draft[p.id] ?? "").trim();
                      if (!title) return;
                      await addComp({
                        data: { programId: p.id, title, sortOrder: r.competencies.length + 1 },
                      });
                      setDraft({ ...draft, [p.id]: "" });
                      q.refetch();
                    }}
                  >
                    إضافة محور
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function NumField({ label, def, onSave }: { label: string; def: number; onSave: (v: number) => void }) {
  const [v, setV] = useState(String(def));
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="mt-1 flex gap-2">
        <Input value={v} onChange={(e) => setV(e.target.value)} inputMode="numeric" />
        <Button size="sm" variant="outline" onClick={() => onSave(Number(v) || def)}>
          حفظ
        </Button>
      </div>
    </label>
  );
}
