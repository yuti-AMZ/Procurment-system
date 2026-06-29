"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api";

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString();
}
export default function SupplierNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();
  const userId = user.id || user.email || "";
  const fetchData = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const [notifs, count] = await Promise.all([
        listNotifications(userId),
        getUnreadCount(userId),
      ]);
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setUnreadCount(typeof count === "number" ? count : count?.count ?? 0);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { fetchData(); }, [fetchData]);
  async function handleMarkRead(id: number) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }
  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
      setUnreadCount(0);
    } catch {}
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading..." : unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {!loading && unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>Mark All as Read</Button>
        )}
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No notifications yet</p>
          ) : notifications.map((n: any) => (
            <div key={n.id} className={`flex items-start gap-4 px-6 py-4 border-b border-card-border/50 transition-colors ${n.status !== "READ" ? "bg-gold/[0.02]" : ""}`}>
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.status !== "READ" ? "bg-gold" : "bg-muted-foreground/30"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.status !== "READ" ? "text-foreground font-medium" : "text-muted-foreground"}`}>{n.title || n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground/60">{timeAgo(n.createdAt)}</span>
                  {n.status !== "READ" && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleMarkRead(n.id)}>Mark Read</Button>}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
