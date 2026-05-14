import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState(0);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center" dir="rtl">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center" dir="rtl">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">غير مصرح</h2>
          <p className="text-muted-foreground mb-6">أنت لا تملك صلاحيات الوصول إلى لوحة التحكم</p>
          <a href="/">
            <Button>العودة للرئيسية</Button>
          </a>
        </Card>
      </div>
    );
  }

  const { data: doubts, isLoading, refetch } = trpc.doubts.adminList.useQuery({ 
    limit: 10, 
    offset: page * 10 
  });
  const deleteDoubts = trpc.doubts.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الشبهة؟')) {
      await deleteDoubts.mutateAsync({ id });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <a href="/" className="text-primary hover:underline mb-4 inline-flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            العودة للرئيسية
          </a>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <a href="/admin/create">
              <Button>
                <Plus className="w-5 h-5 ml-2" />
                شبهة جديدة
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : doubts && doubts.length > 0 ? (
          <div className="space-y-4">
            {doubts.map((doubt) => (
              <Card key={doubt.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{doubt.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{doubt.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>الحالة: 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                          doubt.status === 'published' ? 'bg-green-100 text-green-800' :
                          doubt.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {doubt.status === 'published' ? 'منشورة' :
                           doubt.status === 'draft' ? 'مسودة' : 'مؤرشفة'}
                        </span>
                      </span>
                      <span>{doubt.views} مشاهدة</span>
                      <span>{new Date(doubt.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/admin/edit/${doubt.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </a>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(doubt.id)}
                      disabled={deleteDoubts.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                disabled={doubts.length < 10}
                onClick={() => setPage(p => p + 1)}
              >
                التالي
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">لا توجد شبهات حتى الآن</p>
            <a href="/admin/create">
              <Button>
                <Plus className="w-5 h-5 ml-2" />
                إضافة شبهة جديدة
              </Button>
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
