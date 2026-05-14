import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

export default function DoubtsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialSearch = params.get('search') || '';
  const initialCategory = params.get('category') ? parseInt(params.get('category')!) : null;

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: doubts, isLoading } = trpc.doubts.list.useQuery({ 
    limit: 12, 
    offset: page * 12 
  });

  const filteredDoubts = useMemo(() => {
    if (!doubts) return [];
    
    let filtered = doubts;
    
    if (initialSearch) {
      filtered = filtered.filter(d => 
        d.title.includes(initialSearch) || 
        d.content.includes(initialSearch)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(d => d.categoryId === selectedCategory);
    }
    
    return filtered;
  }, [doubts, initialSearch, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <a href="/" className="text-primary hover:underline mb-4 inline-flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            العودة للرئيسية
          </a>
          <h1 className="text-3xl font-bold mb-4">الشبهات والردود</h1>
          
          {/* Search */}
          <div className="max-w-2xl">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="ابحث عن شبهة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button>
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-bold text-lg mb-4">التصنيفات</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  الكل
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">جاري التحميل...</div>
            ) : filteredDoubts.length > 0 ? (
              <div className="space-y-4">
                {filteredDoubts.map((doubt) => (
                  <a key={doubt.id} href={`/doubt/${doubt.slug}`} className="block">
                    <Card className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer">
                      <h3 className="text-xl font-semibold mb-2 text-primary">{doubt.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{doubt.content}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{doubt.views} مشاهدة</span>
                        <span>{new Date(doubt.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </Card>
                  </a>
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
                    disabled={filteredDoubts.length < 12}
                    onClick={() => setPage(p => p + 1)}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد شبهات تطابق البحث
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
