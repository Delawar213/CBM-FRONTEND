'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, ArrowRight, BarChart3 } from 'lucide-react';

const reports = [
  { title: 'Financial Report', description: 'Revenue, expenses, and profit analysis', tag: 'Finance' },
  { title: 'Invoice Report', description: 'Outstanding, paid, and overdue invoices', tag: 'Billing' },
  { title: 'Expense Report', description: 'Category breakdown and approval status', tag: 'Finance' },
  { title: 'Project Report', description: 'Budget vs actual cost by project', tag: 'Operations' },
  { title: 'Customer Report', description: 'Activity and revenue by customer', tag: 'CRM' },
];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Generate and export business intelligence reports for stakeholders.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.title}
              className="group data-table-shell flex flex-col p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {report.tag}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <h3 className="text-sm font-semibold">{report.title}</h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{report.description}</p>
              <Button variant="ghost" size="sm" className="mt-4 w-fit px-0 text-primary hover:bg-transparent">
                Generate report <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
