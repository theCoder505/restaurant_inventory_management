import ErrorPage from '@/pages/error';

export default function HttpVersionNotSupportedPage() {
    return <ErrorPage status={505} />;
}
