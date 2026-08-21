export default function Heading({ title, description }: { title: string; description?: string }) {
    return (
        <>
            <div className="mb-8 space-y-0.5">
                <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
                {description && <p className="text-muted-foreground text-sm font-sans">{description}</p>}
            </div>
        </>
    );
}
