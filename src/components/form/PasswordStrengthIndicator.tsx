import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  checkPasswordLength: (password: string) => boolean;
  checkPasswordHasLetter: (password: string) => boolean;
  checkPasswordHasNumber: (password: string) => boolean;
  checkPasswordHasSpecial: (password: string) => boolean;
}

interface PasswordCondition {
  label: string;
  check: () => boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  checkPasswordLength,
  checkPasswordHasLetter,
  checkPasswordHasNumber,
  checkPasswordHasSpecial,
}) => {
  if (!password) return null;

  const conditions: PasswordCondition[] = [
    {
      label: '8자 이상',
      check: () => checkPasswordLength(password),
    },
    {
      label: '영문 포함',
      check: () => checkPasswordHasLetter(password),
    },
    {
      label: '숫자 포함',
      check: () => checkPasswordHasNumber(password),
    },
    {
      label: '특수문자 포함 (@$!%*#?&)',
      check: () => checkPasswordHasSpecial(password),
    },
  ];

  return (
    <div className="mt-2 space-y-1">
      {conditions.map((condition, index) => {
        const isMet = condition.check();
        return (
          <div
            key={index}
            className={`flex items-center text-xs ${isMet ? 'text-primary-300' : 'text-text-300'}`}
          >
            <span
              className={`mr-2 h-1.5 w-1.5 rounded-full ${
                isMet ? 'bg-primary-300' : 'bg-text-300'
              }`}
            ></span>
            {condition.label}
          </div>
        );
      })}
    </div>
  );
};
