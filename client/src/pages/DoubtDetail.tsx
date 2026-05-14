import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { ChevronRight, BookOpen, Quote } from "lucide-react";
import { Streamdown } from 'streamdown';

export default function DoubtDetail() {
  const params = useParams();
  const slug = params.slug as string;

  const { data, isLoading, error } = trpc.doubts.withEvidences.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center" dir="rtl">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <a href="/doubts" className="text-primary hover:underline mb-4 inline-flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            العودة للشبهات
          </a>
          <div className="text-center py-12 text-muted-foreground">
            لم يتم العثور على الشبهة المطلوبة
          </div>
        </div>
      </div>
    );
  }

  const { doubt, evidences } = data;

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <a href="/doubts" className="text-primary hover:underline mb-4 inline-flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            العودة للشبهات
          </a>
          <h1 className="text-4xl font-bold mb-2">{doubt.title}</h1>
          <div className="text-sm text-muted-foreground">
            {new Date(doubt.createdAt).toLocaleDateString('ar-SA')} • {doubt.views} مشاهدة
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Doubt Content */}
          <Card className="p-8 border-2 border-primary/20">
            <div className="flex gap-4 mb-4">
              <Quote className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold mb-2">الشبهة</h2>
                <Streamdown>{doubt.content}</Streamdown>
              </div>
            </div>
          </Card>

          {/* Refutation */}
          <Card className="p-8 bg-primary/5 border-2 border-primary">
            <h2 className="text-2xl font-bold mb-4 text-primary">الرد القاطع</h2>
            <Streamdown>{doubt.refutation}</Streamdown>
          </Card>

          {/* Quranic Evidences */}
          {evidences.quranic.length > 0 && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                الأدلة القرآنية
              </h2>
              <div className="space-y-6">
                {evidences.quranic.map((evidence, idx) => (
                  <div key={evidence.id} className="border-r-4 border-primary pr-4">
                    <h3 className="font-semibold text-lg mb-2">
                      سورة {evidence.surah} - الآية {evidence.ayahStart}
                      {evidence.ayahEnd && evidence.ayahEnd !== evidence.ayahStart && ` إلى ${evidence.ayahEnd}`}
                    </h3>
                    <p className="text-lg leading-relaxed mb-3 text-primary/80 italic">
                      "{evidence.text}"
                    </p>
                    {evidence.explanation && (
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm"><strong>التفسير:</strong></p>
                        <Streamdown>{evidence.explanation}</Streamdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Hadith Evidences */}
          {evidences.hadith.length > 0 && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">الأحاديث النبوية</h2>
              <div className="space-y-6">
                {evidences.hadith.map((hadith) => (
                  <div key={hadith.id} className="border-r-4 border-accent pr-4">
                    <p className="text-lg leading-relaxed mb-3 italic text-accent/80">
                      "{hadith.text}"
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>المصدر:</strong> {hadith.source}</p>
                      {hadith.grading && <p><strong>التصحيح:</strong> {hadith.grading}</p>}
                    </div>
                    {hadith.explanation && (
                      <div className="bg-muted p-4 rounded-lg mt-3">
                        <p className="text-sm"><strong>الشرح:</strong></p>
                        <Streamdown>{hadith.explanation}</Streamdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Scholar Statements */}
          {evidences.scholars.length > 0 && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">أقوال العلماء</h2>
              <div className="space-y-6">
                {evidences.scholars.map((scholar) => (
                  <div key={scholar.id} className="border-r-4 border-secondary pr-4">
                    <p className="text-lg leading-relaxed mb-3 italic">
                      "{scholar.statement}"
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>العالم:</strong> {scholar.scholarName}</p>
                      {scholar.era && <p><strong>العصر:</strong> {scholar.era}</p>}
                      {scholar.source && <p><strong>المصدر:</strong> {scholar.source}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Reality Refutations */}
          {evidences.reality.length > 0 && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">الرد من الواقع</h2>
              <div className="space-y-6">
                {evidences.reality.map((reality) => (
                  <div key={reality.id} className="border-r-4 border-destructive pr-4">
                    <h3 className="font-semibold text-lg mb-2">{reality.title}</h3>
                    <Streamdown>{reality.content}</Streamdown>
                    {reality.evidence && (
                      <div className="bg-muted p-4 rounded-lg mt-3">
                        <p className="text-sm"><strong>الأدلة:</strong></p>
                        <Streamdown>{reality.evidence}</Streamdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* No Evidence Message */}
          {evidences.quranic.length === 0 && 
           evidences.hadith.length === 0 && 
           evidences.scholars.length === 0 && 
           evidences.reality.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              لم يتم إضافة أدلة لهذه الشبهة حتى الآن
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-4 pt-8">
            <a href="/doubts">
              <Button variant="outline">عودة للشبهات</Button>
            </a>
            <a href="/">
              <Button variant="outline">الرئيسية</Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
