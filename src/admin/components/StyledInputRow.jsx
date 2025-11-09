import React from 'react';

function StyledInputRow({ label, value, onChange, color, readonly = false, type = 'text', labelMinWidth = '120px', inputProps = {} }) {
  const bg = color === 'primary' ? '#295B5B' : '#E87722';
  const borderColor = color === 'primary' ? '#295B5B' : '#E87722';
  const textColor = color === 'primary' ? '#295B5B' : '#E87722';
  return (
    <div className="flex items-center mb-4 rounded-xl overflow-hidden">
      <span
        className="px-6 py-3 font-bold text-base flex items-center justify-center text-white rounded-l-xl"
        style={{ background: bg, minWidth: labelMinWidth, height: '48px' }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readonly}
        className="w-full px-6 py-3 border rounded-r-xl focus:outline-none text-right font-bold"
        style={{
          borderColor,
          color: textColor,
          background: readonly ? '#F7F7F7' : '#fff',
          height: '48px',
          fontSize: '1.1rem',
        }}
        {...inputProps}
      />
    </div>
  );
}

export default StyledInputRow; 