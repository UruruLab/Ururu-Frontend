// 배송지 관련 타입 정의
export interface AddressData {
  id: number;
  addressName: string;
  isDefault: boolean;
  phone: string;
  zonecode: string;
  address1: string;
  address2: string;
  addressDetail: string;
}

// 배송지 목록 mock 데이터
export const addressListData: AddressData[] = [
  {
    id: 1,
    addressName: '아파트',
    isDefault: true,
    zonecode: '06627',
    address1: '서울특별시 서초구 강남대로 327, 2층 (서초동, 대륭서초타워)',
    address2: '서울특별시 서초구 서초동 1337-20, 대륭서초타워 2층',
    phone: '010-0000-0000',
    addressDetail: '',
  },
  {
    id: 2,
    addressName: '회사',
    isDefault: false,
    zonecode: '06123',
    address1: '서울특별시 강남구 테헤란로 501, 3층 (삼성동, 브이플렉스)',
    address2: '서울특별시 강남구 삼성동 159-1, 브이플렉스 3층',
    phone: '010-1234-5678',
    addressDetail: '개발팀',
  },
  {
    id: 3,
    addressName: '우리집',
    isDefault: false,
    zonecode: '13529',
    address1: '경기도 성남시 분당구 판교로 242, 판교디지털센터 A동 3층',
    address2: '경기도 성남시 분당구 삼평동 681, 판교디지털센터 A3층',
    phone: '010-9876-5432',
    addressDetail: '',
  },
];

// 배송지 수정용 mock 데이터 (ID별)
export const mockAddressData: Record<number, AddressData> = {
  1: {
    id: 1,
    addressName: '아파트',
    isDefault: true,
    phone: '010-0000-0000',
    zonecode: '06627',
    address1: '서울특별시 서초구 강남대로 327, 2층 (서초동, 대륭서초타워)',
    address2: '서울특별시 서초구 서초동 1337-20, 대륭서초타워 2층',
    addressDetail: '',
  },
  2: {
    id: 2,
    addressName: '회사',
    isDefault: false,
    phone: '010-1234-5678',
    zonecode: '06123',
    address1: '서울특별시 강남구 테헤란로 501, 3층 (삼성동, 브이플렉스)',
    address2: '서울특별시 강남구 삼성동 159-1, 브이플렉스 3층',
    addressDetail: '개발팀',
  },
  3: {
    id: 3,
    addressName: '우리집',
    isDefault: false,
    phone: '010-9876-5432',
    zonecode: '13529',
    address1: '경기도 성남시 분당구 판교로 242, 판교디지털센터 A동 3층',
    address2: '경기도 성남시 분당구 삼평동 681, 판교디지털센터 A3층',
    addressDetail: '',
  },
};
