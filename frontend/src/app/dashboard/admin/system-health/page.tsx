"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Service {
  name: string;
  status: "up" | "down" | "warning";
  port: number;
  type: "service" | "infra";
}

const services: Service[] = [
  { name: "API Gateway", status: "up", port: 8082, type: "service" },
  { name: "Auth Service", status: "up", port: 8081, type: "service" },
  { name: "User Service", status: "down", port: 8090, type: "service" },
  { name: "Procurement Service", status: "up", port: 8088, type: "service" },
  { name: "RFQ Service", status: "up", port: 8083, type: "service" },
  { name: "Quotation Service", status: "up", port: 8084, type: "service" },
  { name: "Supplier Service", status: "up", port: 8085, type: "service" },
  { name: "Invoice Service", status: "up", port: 8086, type: "service" },
  { name: "Notification Service", status: "up", port: 8087, type: "service" },
  { name: "OCR Service", status: "up", port: 8091, type: "service" },
  { name: "PostgreSQL", status: "up", port: 5432, type: "infra" },
  { name: "RabbitMQ", status: "up", port: 5672, type: "infra" },
];

export default function SystemHealthPage() {
  const [statuses, setStatuses] = useState<Record<string, "up" | "down" | "warning">>({});

  useEffect(() => {
    const initial: Record<string, "up" | "down" | "warning"> = {};
    services.forEach(s => { initial[s.name] = s.status; });
    setStatuses(initial);

    services.forEach(s => {
      if (s.type !== "service") return;
      fetch(`http://localhost:${s.port}/actuator/health`, { signal: AbortSignal.timeout(5000) })
        .then(r => r.ok ? "up" as const : "down" as const)
        .catch(() => "down" as const)
        .then(st => setStatuses(prev => ({ ...prev, [s.name]: st })));
    });
  }, []);

  const upCount = Object.values(statuses).filter(s => s === "up").length;
  const downCount = Object.values(statuses).filter(s => s === "down").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Health</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor microservice and infrastructure status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-green-500" /><div><div className="text-2xl font-bold text-foreground">{upCount}</div><div className="text-sm text-muted-foreground">Services Running</div></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500" /><div><div className="text-2xl font-bold text-foreground">{downCount}</div><div className="text-sm text-muted-foreground">Services Down</div></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-gold" /><div><div className="text-2xl font-bold text-foreground">{services.length}</div><div className="text-sm text-muted-foreground">Total Services</div></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => {
          const st = statuses[s.name] || "warning";
          return (
            <Card key={s.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${st === "up" ? "bg-green-500" : st === "down" ? "bg-red-500" : "bg-yellow-500"}`} />
                    <div>
                      <div className="font-medium text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">Port {s.port} · {s.type === "infra" ? "Infrastructure" : "Microservice"}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st === "up" ? "bg-green-500/10 text-green-500" : st === "down" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                    {st === "up" ? "Running" : st === "down" ? "Down" : "Warning"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
