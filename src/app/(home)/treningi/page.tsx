// src/app/(home)/treningi/page.tsx
import TrainingsList from '../treningi/TrainingsList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <div className="mx-auto mt-10 max-w-6xl px-4">
      <TrainingsList />
    </div>
  );
}
