"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listDepartments, createDepartment, deleteDepartment } from "@/lib/api";
export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    listDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    try {
      await createDepartment({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message || "Failed to create department");
    } finally {
      setCreating(false);
    }
  };
  const handleDelete = async (id: number) => {
    try {
      await deleteDepartment(id);
      load();
    } catch (err: any) {
      alert(err.message || "Failed to delete department");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage organizational departments
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Department"}
        </Button>
      </div>
      {showForm && (
        <Card className="border-gold/30">
          <CardHeader>
            <CardTitle>New Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Department Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all duration-300"
                  placeholder="e.g. Marketing"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all duration-300"
                  placeholder="Department description"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            <div className="mt-4">
              <Button onClick={handleCreate} disabled={creating || !name.trim()}>
                {creating ? "Creating..." : "Create Department"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading departments...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departments.map((dept: any) => (
            <Card key={dept.id} className="group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{dept.name}</CardTitle>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/10 text-green-500 border border-green-500/30">Active</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dept.description && (
                    <p className="text-sm text-muted-foreground">{dept.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">ID: {dept.id}</p>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-card-border">
                  <Button variant="outline" size="sm" className="flex-1" disabled>Edit</Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-destructive" onClick={() => handleDelete(dept.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {departments.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-full">No departments found. Add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}
