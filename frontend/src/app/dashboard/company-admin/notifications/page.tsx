"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from "@/lib/api";
function getLocalUserId() { try { return JSON.parse(localStorage.getItem("user") || "{}").userId; } catch { return null; } }
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
export default function CompanyAdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const userId = getLocalUserId();
  const load = () => {
    if (!userId) return;
    Promise.all([listNotifications(String(userId)), getUnreadCount(String(userId))]).then(([notifs, count]) => {
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setUnreadCount(typeof count === "number" ? count : count?.count || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [userId]);
  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    load();
  };
  const handleMarkAllRead = async () => {
    if (!userId) return;
    await markAllNotificationsRead(String(userId));
    load();
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>Mark all as read</Button>}
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No notifications</div>
          ) : (
            <div className="divide-y divide-card-border">
              {notifications.map((n: any) => (
                <div key={n.id} className={`flex items-start gap-4 p-4 ${n.status !== "READ" ? "bg-gold/5" : ""}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.status !== "READ" ? "bg-gold" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title || n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  {n.status !== "READ" && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>Mark read</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}