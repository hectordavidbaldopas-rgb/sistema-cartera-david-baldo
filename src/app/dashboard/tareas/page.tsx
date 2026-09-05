import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { previewAutomaticTasks } from "@/lib/auto-tasks";
import { cardClass } from "@/lib/ui";
import { formatDate } from "@/lib/dates";
import { labelFor, TASK_TYPE, PRIORITY } from "@/lib/crm-fields";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import TaskStatusButtons from "./task-status-buttons";
import NewTaskForm from "./new-task-form";
import AutoGenerateBox from "./auto-generate-box";
import type { Task } from "@prisma/client";

export default async function TareasPage() {
  const session = await requireStaff();
  const admin = isAdmin(session.user.role);
  const sellerFilter = admin ? {} : { sellerId: session.user.sellerId ?? "__none__" };

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [overdue, today, upcoming, completed, sellers, clients, autoCandidates] = await Promise.all([
    prisma.task.findMany({
      where: { ...sellerFilter, status: { in: ["pending", "in_progress"] }, dueDate: { lt: new Date(new Date().setHours(0, 0, 0, 0)) } },
      include: { client: true, seller: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      where: {
        ...sellerFilter,
        status: { in: ["pending", "in_progress"] },
        dueDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lte: todayEnd },
      },
      include: { client: true, seller: true },
      orderBy: { priority: "desc" },
    }),
    prisma.task.findMany({
      where: { ...sellerFilter, status: { in: ["pending", "in_progress"] }, OR: [{ dueDate: null }, { dueDate: { gt: todayEnd } }] },
      include: { client: true, seller: true },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.task.findMany({
      where: { ...sellerFilter, status: { in: ["completed", "cancelled"] } },
      include: { client: true, seller: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    admin ? prisma.seller.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } }) : Promise.resolve([]),
    prisma.client.findMany({
      where: admin ? {} : { policies: { some: { sellerId: session.user.sellerId ?? "__none__" } } },
      orderBy: { fullNameNormalized: "asc" },
      take: 500,
      select: { id: true, fullNameNormalized: true },
    }),
    previewAutomaticTasks(admin ? null : (session.user.sellerId ?? null)),
  ]);

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
            ← Volver
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <h1 className="text-lg font-semibold text-gold-300">Centro de tareas</h1>
      </header>
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-8">
        <AutoGenerateBox candidates={autoCandidates} />

        <div className={cardClass}>
          <p className="mb-3 text-sm font-semibold text-white/90">Nueva tarea manual</p>
          <NewTaskForm sellers={sellers} clients={clients} isAdmin={admin} />
        </div>

        <TaskSection title={`Vencidas (${overdue.length})`} tasks={overdue} admin={admin} tone="red" />
        <TaskSection title={`Hoy (${today.length})`} tasks={today} admin={admin} tone="amber" />
        <TaskSection title={`Próximas (${upcoming.length})`} tasks={upcoming} admin={admin} tone="slate" />
        <TaskSection title={`Completadas / canceladas (${completed.length})`} tasks={completed} admin={admin} tone="green" collapsedByDefault />
      </main>
    </div>
  );
}

type TaskWithRelations = Task & { client: { fullNameNormalized: string } | null; seller: { displayName: string } };

function TaskSection({
  title,
  tasks,
  admin,
  tone,
}: {
  title: string;
  tasks: TaskWithRelations[];
  admin: boolean;
  tone: "red" | "amber" | "slate" | "green";
  collapsedByDefault?: boolean;
}) {
  const toneClass = {
    red: "text-red-700",
    amber: "text-amber-700",
    slate: "text-white/90",
    green: "text-white/70",
  }[tone];

  return (
    <div>
      <h2 className={`mb-3 text-sm font-semibold ${toneClass}`}>{title}</h2>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gold-300">{t.title}</p>
                <p className="text-sm text-white/70">
                  {labelFor(TASK_TYPE, t.taskType)}
                  {t.client ? ` · ${t.client.fullNameNormalized}` : ""}
                  {admin ? ` · ${t.seller.displayName}` : ""}
                  {t.dueDate ? ` · ${formatDate(t.dueDate)}` : ""}
                  {" · "}
                  {labelFor(PRIORITY, t.priority)}
                </p>
                {t.description && <p className="mt-1 text-sm text-white/80">{t.description}</p>}
              </div>
              <TaskStatusButtons taskId={t.id} status={t.status} />
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-sm text-white/50">Nada acá.</p>}
      </div>
    </div>
  );
}
