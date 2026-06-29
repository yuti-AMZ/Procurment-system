"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  listNotifications,
  getUnreadCount,
  markAllNotificationsRead,
} from "@/lib/api";
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString();
}
function getNotificationHref(type: string): string {
  if (type === "PENDING_APPROVAL" || type === "PR_CREATED") return "/dashboard/manager/approvals";
  if (type === "PR_APPROVED" || type === "PR_REJECTED") return "/dashboard/manager/approvals/history";
  if (type === "ESCALATED") return "/dashboard/manager/approvals/escalated";
  return "/dashboard/manager";
}
function getTypeClass(type: string): string {
  if (type === "PENDING_APPROVAL") return "bg-yellow-500/10 text-yellow-500";
  if (type === "PR_APPROVED") return "bg-green-500/10 text-green-500";
  if (type === "PR_REJECTED") return "bg-destructive/10 text-destructive";
  if (type === "ESCALATED") return "bg-destructive/10 text-destructive";
  return "bg-gold/10 text-gold";
}
function getIconPath(type: string): string {
  if (type === "PENDING_APPROVAL") return "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
  if (type === "PR_APPROVED") return "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
  if (type === "PR_REJECTED") return "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z";
  if (type === "ESCALATED") return "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
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
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  useEffect(() => { fetchData(); }, [fetchData]);
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
            {loading ? "Loading..." : `${unreadCount} unread notifications`}
          </p>
        </div>
        {!loading && unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="">Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((n: any, i: number) => (
                <div key={n.id}>
                  <Link
                    href={getNotificationHref(n.notificationType || "")}
                    className="flex items-start gap-4 py-3 group transition-colors"
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <div className={`rounded-lg p-2 ${getTypeClass(n.notificationType || "")}`}>
                        <svg
                          className={`w-4 h-4 ${n.status !== "READ" ? "" : "opacity-60"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={getIconPath(n.notificationType || "")}
                          />
                        </svg>
                      </div>
                      {n.status !== "READ" && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${n.status === "READ" ? "text-muted-foreground" : "text-foreground font-medium"}`}
                      >
                        {n.message || n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {n.status !== "READ" && (
                      <span className="w-2 h-2 rounded-full bg-gold shrink-0 mt-2" />
                    )}
                  </Link>
                  {i < notifications.length - 1 && <Separator />}
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No notifications yet
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
