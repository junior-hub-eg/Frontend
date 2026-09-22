import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TRACKS } from "@/lib/constants";

export default function CoursesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">الكورسات</h1>
        <p className="mt-1 text-muted-foreground">فيديوهات جاهزة (يوتيوب ومصادر خارجية) لكل مسار — PRD §4.1</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRACKS.map((track) => (
          <Link key={track} href={`/learner/courses/${track.toLowerCase().replace(/\W+/g, "-")}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{track}</CardTitle>
                <CardDescription>سلسلة موديولات + كويز بعد كل فيديو</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
