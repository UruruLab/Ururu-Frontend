// 폼 관련 공통 스타일 상수
export const FORM_STYLES = {
  // 입력 필드 기본 스타일
  input: {
    base: 'h-12 rounded-lg border-bg-300 bg-bg-100 px-4 py-3 text-sm text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-300',
    focus:
      'focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-0',
  },

  // 라벨 스타일
  label: {
    base: 'mb-2 block text-sm font-medium text-text-100',
    required: 'text-primary-300',
  },

  // 버튼 스타일
  button: {
    pinkOutline:
      'h-10 px-4 rounded-lg border border-primary-300 bg-bg-100 text-primary-300 text-sm font-medium hover:bg-primary-100 transition',
    refundButton:
      'h-10 px-4 rounded-lg border border-primary-200 bg-bg-100 text-primary-200 text-sm font-medium hover:bg-primary-100 transition shadow-none',
    deliveryButton:
      'h-10 px-4 rounded-lg border border-primary-300 bg-primary-300 text-text-on text-sm font-medium hover:opacity-80 transition-opacity shadow-none',
    submit:
      'h-12 w-full rounded-lg border border-primary-300 bg-bg-100 text-primary-300 transition-colors hover:bg-primary-100 disabled:border-bg-300 disabled:text-text-300 disabled:hover:bg-bg-100',
    // 프로필 카드 버튼 스타일
    profileCard:
      'h-10 w-full rounded-lg border-bg-300 bg-bg-100 px-1 text-sm font-medium text-text-300 hover:border-primary-300 hover:text-primary-300 md:rounded-xl md:px-2',
    // 배송지 추가 버튼 스타일
    addressAdd:
      'h-12 w-full rounded-lg border border-bg-300 bg-bg-100 text-text-300 transition-colors hover:border-primary-300 hover:text-primary-300 hover:bg-bg-100 disabled:border-bg-300 disabled:text-text-300 disabled:hover:bg-bg-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-300 [&:hover]:border-primary-300 [&:hover]:text-primary-300',
    // 선택형 버튼 스타일
    selectable: {
      base: 'h-12 rounded-lg border text-sm font-medium transition',
      selected: 'border-primary-300 bg-primary-100 text-primary-300',
      unselected: 'border-bg-300 bg-bg-100 text-text-300 hover:bg-bg-200',
    },
    // 다이얼로그 버튼 스타일
    dialog:
      'border border-primary-300 bg-primary-300 text-text-on text-sm font-medium hover:opacity-80 transition-opacity shadow-none',
  },

  // 헬퍼 텍스트 스타일
  helperText: {
    base: 'text-xs text-text-300',
    success: 'text-xs text-primary-300',
    error: 'text-xs text-primary-200',
  },

  // 우편번호 입력 필드 스타일
  zonecode: {
    display:
      'flex h-12 min-w-0 flex-1 items-center rounded-lg border border-bg-300 bg-bg-200 px-4 text-sm text-text-300',
  },

  // 체크박스 스타일
  checkbox: {
    base: 'custom-checkbox mt-0.5',
    // 체크박스 컨테이너 스타일 (체크박스 + 라벨)
    container: 'flex items-start gap-3',
    // 체크박스 라벨 스타일
    label: 'text-sm text-text-200 leading-relaxed',
  },

  // textarea 스타일
  textarea: {
    base: 'h-12 rounded-lg border border-bg-300 bg-bg-100 px-4 py-3 text-sm text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:ring-1 focus:ring-primary-300',
    focus:
      'focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300 focus:ring-offset-0',
  },

  // 카드 스타일
  card: {
    base: 'w-full rounded-2xl border-0 bg-bg-100 py-6 shadow-none lg:px-8',
    content: 'p-0',
    seller: 'border-bg-300 bg-bg-100',
    option: 'w-full rounded-2xl border border-bg-300 bg-bg-100 p-6',
  },

  // 호버 스타일
  hover: {
    bg200: 'hover:bg-bg-200',
    bg100: 'hover:bg-bg-100',
    primary100: 'hover:bg-primary-100',
  },
} as const;
