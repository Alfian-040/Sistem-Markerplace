function Field({ label, name, form, errors, onChange, type = "text", hint, area = false }) {
  const Input = area ? "textarea" : "input";
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <Input
        id={name}
        name={name}
        type={area ? undefined : type}
        value={form[name]}
        onChange={onChange}
        aria-invalid={errors[name] ? "true" : "false"}
      />
      {hint && !errors[name] && <span className="field-hint">{hint}</span>}
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );
}

export default Field;
