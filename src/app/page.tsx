import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, Target, TrendingUp, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Skill Mapping",
    description:
      "Visualize your skills with interactive radar charts. Track proficiency from Beginner to Expert across every domain.",
  },
  {
    icon: Brain,
    title: "AI Gap Analysis",
    description:
      "Claude AI compares your project requirements to your team's capabilities and pinpoints exactly what's missing.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Kanban boards with skill-tagged tasks. Assign work to the right people based on their verified skills.",
  },
  {
    icon: TrendingUp,
    title: "Learning Paths",
    description:
      "Get personalized, AI-generated learning paths to close skill gaps with curated resources and milestones.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Nexus</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="text-center max-w-3xl">
          <Badge className="mb-4" variant="secondary">
            Powered by Claude AI
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Map skills. Close gaps.
            <br />
            <span className="text-primary">Build better teams.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Nexus uses AI to help teams visualize their collective
            capabilities, identify skill gaps for any project, and generate
            personalized learning paths — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Start for free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40 py-24 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything your team needs
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            From skill declaration to AI-powered insights — Nexus covers
            the full lifecycle of team capability management.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-background p-6 space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Ready to unlock your team&apos;s full potential?
          </h2>
          <p className="text-muted-foreground mb-8">
            Make smarter hiring, training, and project assignment decisions.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Get started free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© 2026 Nexus. All rights reserved.</p>
      </footer>
    </div>
  );
}
