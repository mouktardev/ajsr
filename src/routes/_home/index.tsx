import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_home/")({ 
  component: HomePage ,
});

function HomePage() {
  const router = useRouter();

  const tools = [
    {
      id: "report",
      title: "مولد التقارير",
      titleEn: "Report Generator",
      description: "استيراد وإدارة بيانات المخطوطات والمراجعات لإنشاء تقارير محرري AJSR",
      descriptionEn: "Import and manage manuscript and review data to generate AJSR editor reports",
      path: "/report",
      icon: "📊",
    },
    {
      id: "certificate",
      title: "مولد الشهادات",
      titleEn: "Certificate Generator",
      description: "إنشاء وإدارة شهادات المشاركة والاعتراف للباحثين والمساهمين",
      descriptionEn: "Create and manage participation and recognition certificates for researchers and contributors",
      path: "/certificate",
      icon: "🎓",
    },
  ];

  return (
    <section className="container mx-auto flex flex-1 flex-col gap-5 p-3 md:p-5">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-foreground mb-4">مولدات AJSR</h1>
        <p className="text-xl text-muted-foreground mb-2">
          أدوات لمحررو مجلة البحث العلمي العربية - أجسر
        </p>
        <p className="text-muted-foreground">
          مجلة علمية محكّمة تصدر باللغة العربية عن منظمة المجتمع العلمي العربي
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tools.map((tool) => (
          <Card key={tool.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-1">{tool.title}</CardTitle>
                  <CardDescription className="text-sm">{tool.titleEn}</CardDescription>
                </div>
                <span className="text-4xl">{tool.icon}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-foreground mb-2">{tool.description}</p>
              <p className="text-muted-foreground text-sm mb-6">{tool.descriptionEn}</p>
              <Button
                onClick={() => router.navigate({ to: tool.path })}
                className="mt-auto w-full"
              >
                فتح الأداة
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-16 p-8 bg-card rounded-lg border border-border">
        <h2 className="text-2xl font-semibold text-foreground mb-4">عن AJSR</h2>
        <p className="text-foreground mb-3">
          المجلة العربية للبحث العلمي (أجسر) - مجلة علمية محكّمة تصدر باللغة العربية عن منظمة المجتمع العلمي العربي.
        </p>
        <p className="text-muted-foreground">
          تسعى "أجسر" لجسر الهوة بين الواقع الذي يُهمل فيه استخدام اللغة العربية في الكتابة العلمية الرصينة وبين مستقبل مشرق يتمكن فيه الباحث العربي أن يكتب ويقرأ ويفكر ويتعلم بلغته الوطنية كما ينبغي، مع رفع مستوى الكتابة العلمية شكلا ومضموناً.
        </p>
      </div>
    </section>
  );
}
