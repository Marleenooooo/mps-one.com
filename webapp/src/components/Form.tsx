import React from 'react';

type FormProps = React.FormHTMLAttributes<HTMLFormElement> & { className?: string };
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options?: { value: string; label: string }[] };
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };

const BaseForm: React.FC<FormProps> = ({ children, ...props }) => <form {...props}>{children}</form>;

export const Form = Object.assign(BaseForm, {
  Input: ({ label, ...props }: InputProps) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input className="input" {...props} />
    </div>
  ),
  Select: ({ label, options = [], ...props }: SelectProps) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select className="input" {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  ),
  Textarea: ({ label, ...props }: TextareaProps) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea className="input" {...props} />
    </div>
  ),
});

export default Form;
