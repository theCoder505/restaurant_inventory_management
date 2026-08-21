export default function HeadingSmall({ title, description }: { title: string; description?: string }) {
    return (
        <header>
            <h3 className="font-display mb-0.5 text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
            {description && <p className="text-muted-foreground text-sm font-sans">{description}</p>}
        </header>
    );
}
