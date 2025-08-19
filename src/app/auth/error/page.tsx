'use client';

import { useRouter } from 'next/navigation';
import { CustomLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthErrorPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.replace('/login');
  };

  return (
    <CustomLayout showTopBar={false} showSearchBar={false} showMainNav={false} showFooter={false}>
      <div className="flex min-h-screen items-center justify-center bg-bg-100">
        <div className="text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="mb-2 text-xl font-semibold text-text-100">로그인 실패</h1>
          <p className="mb-6 text-text-200">로그인 중 문제가 발생했습니다.</p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              다시 시도하기
            </Button>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CustomLayout>
  );
}
