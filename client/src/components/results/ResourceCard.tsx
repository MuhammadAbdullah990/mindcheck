import type { Resource } from '../../store/sessionStore';

// Keys match the `ResourceType` enum in the Prisma schema.
const TYPE_ICON: Record<string, string> = {
  HOTLINE: '📞',
  WEBSITE: '🌐',
  APP: '📱',
  ARTICLE: '📄',
  VIDEO: '🎬',
  ORGANIZATION: '🩺',
  SELF_HELP: '📖',
};

const isCrisisResource = (r: Resource) => r.type === 'HOTLINE' || r.category === 'crisis';

export function ResourceCard({ resource }: { resource: Resource }) {
  const icon = TYPE_ICON[resource.type] ?? '🔗';
  const isCrisis = isCrisisResource(resource);

  return (
    <article
      className={`rounded-xl border bg-white p-4 ${
        isCrisis ? 'border-severity-red/40' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{resource.title}</h3>
          {resource.description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{resource.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            {resource.phone && (
              <a
                href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
                className="font-medium text-primary hover:underline"
              >
                📞 {resource.phone}
              </a>
            )}
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Visit site ↗
              </a>
            )}
          </div>

          {resource.country && resource.country !== 'global' && (
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
              {resource.country}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export { isCrisisResource };
