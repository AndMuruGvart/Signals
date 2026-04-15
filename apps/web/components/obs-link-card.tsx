import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ObsLinkCardProps = {
  title: string;
  description: string;
  href: string;
  eyebrow: string;
};

export function ObsLinkCard({
  title,
  description,
  href,
  eyebrow,
}: ObsLinkCardProps) {
  return (
    <Card className="signal-surface h-full">
      <CardHeader>
        <div className="text-xs font-mono uppercase tracking-[0.28em] text-muted-foreground">
          {eyebrow}
        </div>
        <CardTitle className="flex items-center justify-between text-xl">
          <span>{title}</span>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a
          className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm transition hover:border-primary hover:text-primary"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          Open
        </a>
      </CardContent>
    </Card>
  );
}
