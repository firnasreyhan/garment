function FormRow({ label, children, color, labelMinWidth = '120px' }) {
  const bg = color === 'primary' ? '#295B5B' : '#E87722';
  const text = 'text-white';
  return (
    <div className="flex items-center mb-4 rounded-xl overflow-hidden" style={{background: bg}}>
      <span className={`px-4 py-2 font-bold text-base flex items-center justify-center ${text}`} style={{minWidth: labelMinWidth}}>{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default FormRow; 