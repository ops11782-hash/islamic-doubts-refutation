import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(0);

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
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">لوحة تحكم المدير</h1>
          <a href="/">
            <Button variant="outline">العودة للرئيسية</Button>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Add New Doubt Button */}
        <div className="mb-8">
          <Button 
            onClick={() => setLocation('/admin/create')}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة شبهة جديدة
          </Button>
        </div>

        {/* Doubts List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">الشبهات المضافة</h2>

          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : doubts && doubts.length > 0 ? (
            <div className="space-y-4">
              {doubts.map((doubt) => (
                <div key={doubt.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold">{doubt.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{doubt.content.substring(0, 100)}...</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{doubt.views} مشاهدة</span>
                      <span>{new Date(doubt.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setLocation(`/admin/edit/${doubt.id}`)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(doubt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">لا توجد شبهات حالياً</div>
          )}

          {/* Pagination */}
          {doubts && doubts.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <Button 
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                السابق
              </Button>
              <span className="text-sm text-muted-foreground">الصفحة {page + 1}</span>
              <Button 
                variant="outline"
                onClick={() => setPage(page + 1)}
              >
                التالي
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
