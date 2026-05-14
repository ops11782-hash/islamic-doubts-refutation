import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminCreateDoubt() {
  const { user, loading } = useAuth();
  const params = useParams();
  const doubtId = params.id ? parseInt(params.id as string) : null;

  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if not admin (after auth is loaded)
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setIsRedirecting(true);
      window.location.href = '/';
    }
  }, [user, loading]);

  // Show loading state while auth is being checked
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center" dir="rtl">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  const { data: categories } = trpc.categories.list.useQuery();
  const createMutation = trpc.doubts.create.useMutation({
    onSuccess: () => {
      window.location.href = '/admin';
    },
  });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    categoryId: '',
    refutation: '',
    status: 'draft' as const,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.content || !formData.categoryId || !formData.refutation) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    await createMutation.mutateAsync({
      ...formData,
      categoryId: parseInt(formData.categoryId),
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <a href="/admin" className="text-primary hover:underline mb-4 inline-flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            العودة لوحة التحكم
          </a>
          <h1 className="text-3xl font-bold">إضافة شبهة جديدة</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">عنوان الشبهة *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="أدخل عنوان الشبهة"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">الرابط الدائم (Slug) *</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="يتم توليده تلقائياً من العنوان"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">التصنيف *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doubt Content */}
            <div>
              <Label htmlFor="content">نص الشبهة *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="أدخل نص الشبهة بالتفصيل"
                rows={6}
                required
              />
            </div>

            {/* Refutation */}
            <div>
              <Label htmlFor="refutation">الرد القاطع *</Label>
              <Textarea
                id="refutation"
                name="refutation"
                value={formData.refutation}
                onChange={handleChange}
                placeholder="أدخل الرد القاطع على الشبهة"
                rows={6}
                required
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">حالة النشر</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">منشورة</SelectItem>
                  <SelectItem value="archived">مؤرشفة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                حفظ الشبهة
              </Button>
              <a href="/admin">
                <Button type="button" variant="outline">إلغاء</Button>
              </a>
            </div>

            {createMutation.error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                حدث خطأ: {createMutation.error.message}
              </div>
            )}
          </form>
        </Card>
      </main>
    </div>
  );
}
