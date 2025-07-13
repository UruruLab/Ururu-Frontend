import { useCallback } from 'react';

interface PostcodeResult {
  zonecode: string;
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  apartment: string;
  jibunAddress: string;
  roadAddress: string;
  sigunguCode: string;
}

interface UsePostcodeProps {
  onComplete: (data: PostcodeResult) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    daum: {
      Postcode: new (options: any) => any;
    };
  }
}

export const usePostcode = ({ onComplete, onClose }: UsePostcodeProps) => {
  const createPostcode = useCallback(() => {
    if (!window.daum?.Postcode) return;

    new window.daum.Postcode({
      oncomplete: (data: PostcodeResult) => {
        onComplete(data);
      },
      onclose: () => {
        onClose?.();
      },
      width: '100%',
      height: '100%',
    }).open();
  }, [onComplete, onClose]);

  const openPostcode = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Daum 우편번호 스크립트가 로드되지 않은 경우 로드
    if (!window.daum) {
      // 이미 로딩 중인 스크립트가 있는지 확인
      const existingScript = document.querySelector('script[src*="postcode.v2.js"]');
      if (existingScript) return;

      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => {
        createPostcode();
      };
      script.onerror = () => {
        console.error('Daum 우편번호 스크립트 로딩에 실패했습니다.');
      };
      document.head.appendChild(script);
    } else {
      createPostcode();
    }
  }, [createPostcode]);

  return { openPostcode };
};
