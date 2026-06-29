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
function getIconPath(notificationType: string): string {
  if (notificationType === "PENDING_APPROVAL" || notificationType === "PR_CREATED") return "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
  if (notificationType === "PR_APPROVED") return "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
  if (notificationType === "PR_REJECTED") return "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z";
  if (notificationType === "PO_GENERATED") return "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1";
  return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
}
export default function NotificationsPage() {
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
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>Clear All</Button>
        )}
      </div>
      <Card>
        <CardContent className="p-0 divide-y divide-card-border">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No notifications yet</p>
          ) : notifications.map((n: any) => (
            <div key={n.id} className={`flex items-start gap-4 p-4 transition-colors ${n.status !== "READ" ? "bg-gold/[0.02]" : ""}`}>
              <div className={`rounded-lg p-2 shrink-0 ${n.status !== "READ" ? "bg-gold/10" : "bg-muted"}`}>
                <svg className={`w-4 h-4 ${n.status !== "READ" ? "text-gold" : "text-muted-foreground"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={getIconPath(n.notificationType || "")} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.status !== "READ" ? "text-foreground font-medium" : "text-muted-foreground"}`}>{n.title || n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground/60">{timeAgo(n.createdAt)}</span>
                  {n.status !== "READ" && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleMarkRead(n.id)}>Mark Read</Button>}
                </div>
              </div>
              {n.status !== "READ" && <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-2" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
