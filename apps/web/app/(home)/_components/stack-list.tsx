import { Badge } from "@/components/ui/badge";

const stackLayers = [
  {
    layer: "Frontend",
    items: ["Next.js 16", "React 19", "Tailwind v4", "shadcn/ui"],
  },
  {
    layer: "Backend",
    items: ["NestJS 12", "Fastify", "CQRS"],
  },
  {
    layer: "Data",
    items: ["Prisma 8", "PostgreSQL"],
  },
  {
    layer: "Shared",
    items: ["Zod", "TypeScript"],
  },
];

export function StackList() {
  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {stackLayers.map(({ layer, items }) => (
        <div key={layer} className="flex flex-col gap-2">
          <dt className="text-sm font-medium text-foreground">{layer}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <Badge key={item} variant="outline" className="font-mono">
                {item}
              </Badge>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
