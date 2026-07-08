"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listTickets, updateTicketStatus } from "@/lib/api";

interface Ticket {
  id: number;
  companyName?: string;
  subject: string;
  priority: string;
  status: string;
  createdAt: string;
  assignee?: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const load = () => {
    setLoading(true);
    listTickets().then(setTickets).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filters = ["All", "OPEN", "IN_PROGRESS", "RESOLVED"];
  const filtered = filter === "All" ? tickets : tickets.filter(t => t.status === filter);

  const handleStatusChange = async (id: number, status: string) => {
    try { await updateTicketStatus(id, status); load(); } catch {}
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Customer support tickets, account recovery & troubleshooting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">{tickets.filter(t => t.status !== "RESOLVED").length}</div><div className="text-sm text-muted-foreground">Open Tickets</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">{tickets.filter(t => t.priority === "HIGH").length}</div><div className="text-sm text-muted-foreground">High Priority</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">{tickets.length > 0 ? Math.round(tickets.filter(t => t.status === "RESOLVED").length / tickets.length * 100) : 0}%</div><div className="text-sm text-muted-foreground">Resolution Rate</div></CardContent></Card>
      </div>

      <div className="flex gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === f ? "bg-gold text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{f.replace("_", " ")}</button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.map((ticket, idx) => (
            <div key={ticket.id} className={`p-4 ${idx < filtered.length - 1 ? "border-b border-card-border" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{ticket.subject}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ticket.priority === "HIGH" ? "bg-red-500/10 text-red-500" : ticket.priority === "MEDIUM" ? "bg-yellow-500/10 text-yellow-500" : "bg-gray-500/10 text-gray-500"}`}>{ticket.priority}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ticket.status === "OPEN" ? "bg-blue-500/10 text-blue-500" : ticket.status === "IN_PROGRESS" ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"}`}>{ticket.status}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {ticket.companyName ?? "Unknown"} · Created {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "N/A"} · Assigned to: {ticket.assignee ?? "Unassigned"}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  {ticket.status === "OPEN" && <Button size="sm" variant="secondary" onClick={() => handleStatusChange(ticket.id, "IN_PROGRESS")}>Accept</Button>}
                  {ticket.status !== "RESOLVED" && <Button size="sm" variant="secondary" onClick={() => handleStatusChange(ticket.id, "RESOLVED")}>Resolve</Button>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No tickets found</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Quick Account Recovery</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Reset passwords or unlock accounts for organization admins.</p>
          <div className="flex gap-2">
            <Input type="email" placeholder="Enter organization admin email..." value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} className="max-w-sm" />
            <Button variant="secondary">Reset Password</Button>
            <Button variant="secondary" className="text-destructive border-destructive/30 hover:bg-destructive/10">Lock Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
