import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, BookOpen, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: recentDoubts, isLoading: doubtsLoading } = trpc.doubts.list.useQuery({ limit: 6 });
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: stats } = trpc.stats.get.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/doubts?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-primary">الحجة والبرهان</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-foreground hover:text-primary transition-colors">الرئيسية</a>
            <a href="/doubts" className="text-foreground hover:text-primary transition-colors">الشبهات</a>
          </nav>

          <div></div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-transparent py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
              الحجة والبرهان على الشبهات
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              موقع إسلامي متخصص في الرد على الشبهات المثارة حول الإسلام بأدلة من القرآن والسنة وكلام العلماء والواقع
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="ابحث عن شبهة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="lg">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </form>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Card className="p-4">
                  <div className="text-2xl font-bold text-primary">{stats.totalDoubts}</div>
                  <div className="text-sm text-muted-foreground">شبهة</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-primary">{stats.totalViews}</div>
                  <div className="text-sm text-muted-foreground">مشاهدة</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-primary">{stats.totalVisitors}</div>
                  <div className="text-sm text-muted-foreground">زائر</div>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <section className="py-12 bg-card/50">
            <div className="container mx-auto px-4">
              <h3 className="text-2xl font-bold mb-8 text-center">التصنيفات</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <a key={cat.id} href={`/doubts?category=${cat.id}`} className="block p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-center">
                    <div className="text-2xl mb-2">{cat.icon || '📖'}</div>
                    <div className="font-semibold text-sm">{cat.name}</div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Doubts Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">أحدث الشبهات والردود</h3>
              <a href="/doubts" className="text-primary hover:underline flex items-center gap-2">
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </a>
            </div>

            {doubtsLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : recentDoubts && recentDoubts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentDoubts.map((doubt) => (
                  <a key={doubt.id} href={`/doubt/${doubt.slug}`} className="block">
                    <Card className="p-6 h-full hover:shadow-lg hover:border-primary transition-all cursor-pointer">
                      <h4 className="text-lg font-semibold mb-2 line-clamp-2">{doubt.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{doubt.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{doubt.views} مشاهدة</span>
                        <span>{new Date(doubt.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </Card>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">لا توجد شبهات حالياً</div>
            )}
          </div>
        </section>

        {/* External Resources Section */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold mb-8 text-center">موارد إضافية</h3>
            <Card className="p-8 max-w-4xl mx-auto">
              <p className="text-center mb-6 text-muted-foreground">
                إذا لم تجد جواباً لشبهتك أو لم يكن الجواب مقنعاً فتصفح المواقع أدناه وستجد ما تريده إن شاء الله
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <a href="https://osoulcontent.org.sa/ar/projects" target="_blank" rel="noopener noreferrer" className="p-4 border border-primary rounded-lg hover:bg-primary/5 transition-colors text-center">
                  <div className="font-semibold text-primary mb-1">أصول</div>
                  <div className="text-sm text-muted-foreground">osoulcontent.org.sa</div>
                </a>
                <a href="https://omankind.org/index.html" target="_blank" rel="noopener noreferrer" className="p-4 border border-primary rounded-lg hover:bg-primary/5 transition-colors text-center">
                  <div className="font-semibold text-primary mb-1">أومانكايند</div>
                  <div className="text-sm text-muted-foreground">omankind.org</div>
                </a>
                <a href="https://bayenat.net/ar" target="_blank" rel="noopener noreferrer" className="p-4 border border-primary rounded-lg hover:bg-primary/5 transition-colors text-center">
                  <div className="font-semibold text-primary mb-1">بيّنات</div>
                  <div className="text-sm text-muted-foreground">bayenat.net</div>
                </a>
                <a href="https://almohaweron.co" target="_blank" rel="noopener noreferrer" className="p-4 border border-primary rounded-lg hover:bg-primary/5 transition-colors text-center">
                  <div className="font-semibold text-primary mb-1">المحاورون</div>
                  <div className="text-sm text-muted-foreground">almohaweron.co</div>
                </a>
                <a href="https://hurras.org" target="_blank" rel="noopener noreferrer" className="p-4 border border-primary rounded-lg hover:bg-primary/5 transition-colors text-center">
                  <div className="font-semibold text-primary mb-1">حرّاس</div>
                  <div className="text-sm text-muted-foreground">hurras.org</div>
                </a>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                إذا لم تجد جواباً لشبهتك أو لم يكن الجواب مقنعاً فتصفح المواقع أعلاه وستجد ما تريده إن شاء الله، وإذا لم تجد ما تريده فراسلني على هذا الإيميل 👈 <a href="mailto:ops11782@gmail.com" className="text-primary hover:underline">ops11782@gmail.com</a> وسأجيبك بإذن الله تعالى.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2026 الحجة والبرهان على الشبهات المثارة حول الإسلام</p>
          <p className="text-sm opacity-75">موقع إسلامي متخصص في الرد على الشبهات بأدلة من القرآن والسنة</p>
        </div>
      </footer>
    </div>
  );
}
